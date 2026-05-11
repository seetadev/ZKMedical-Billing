import crypto from "crypto";

/**
 * Transform a raw EMTTR record into ZK circuit witness inputs.
 *
 * EMTTR field → circuit input mapping:
 *   patient_id    "PAT-987654321"  → patient_id     BigInt  (strip prefix, hash if alphanumeric)
 *   billed_amount "2500.00" INR    → invoice_amount BigInt  (× 100 → paise/cents)
 *   service_code  "99213"          → service_code   BigInt  (direct, validated 1000–9999)
 *   provider_npi  "1234567890"     → provider_id    BigInt  (direct)
 *   service_date  "2025-05-10"     → date_unix      BigInt  (ISO → Unix seconds)
 *   —                              → salt           BigInt  (fresh random 31 bytes)
 *   coverage_limit "5000.00" INR   → coverage_limit BigInt  (× 100, PUBLIC input)
 */
export function mapRecordToWitness(emttrRecord, coveragePolicy) {
    const rawPatientId  = emttrRecord.patient_id.replace(/^PAT-/i, "");
    const patientId     = encodeId(rawPatientId);

    const invoiceAmount = currencyToSmallestUnit(
        emttrRecord.billed_amount,
        emttrRecord.currency
    );

    const serviceCode = BigInt(emttrRecord.service_code);
    if (serviceCode < 1000n || serviceCode > 99999n) {
        throw new Error(
            `Invalid CPT code: ${emttrRecord.service_code}. Must be 1000–99999.`
        );
    }

    const providerId = BigInt(emttrRecord.provider_npi);
    const dateUnix   = BigInt(
        Math.floor(new Date(emttrRecord.service_date).getTime() / 1000)
    );
    const salt = BigInt("0x" + crypto.randomBytes(31).toString("hex"));

    const coverageLimit = currencyToSmallestUnit(
        coveragePolicy.limit_amount,
        coveragePolicy.currency
    );

    if (invoiceAmount > coverageLimit) {
        throw new Error(
            `Invoice amount ${invoiceAmount} exceeds coverage limit ${coverageLimit} ` +
            `for record ${emttrRecord.id}`
        );
    }
    if (invoiceAmount <= 0n) {
        throw new Error(`Invoice amount must be > 0 for record ${emttrRecord.id}`);
    }
    if (providerId === 0n) {
        throw new Error(`Provider NPI cannot be zero for record ${emttrRecord.id}`);
    }

    return {
        patient_id:     patientId,
        invoice_amount: invoiceAmount,
        service_code:   serviceCode,
        provider_id:    providerId,
        date_unix:      dateUnix,
        salt,
        coverage_limit: coverageLimit,

        // Stripped before sending to circuit — used for logging and write-back only
        _meta: {
            emttrRecordId:  emttrRecord.id,
            trialId:        emttrRecord.trial_id,
            originalAmount: emttrRecord.billed_amount,
            currency:       emttrRecord.currency,
        },
    };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function currencyToSmallestUnit(amountStr, currency) {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount < 0) {
        throw new Error(`Invalid amount: ${amountStr}`);
    }
    const multipliers = { INR: 100, USD: 100, EUR: 100, GBP: 100 };
    const multiplier  = multipliers[currency] ?? 100;
    return BigInt(Math.round(amount * multiplier));
}

// Pure-numeric IDs convert directly; alphanumeric IDs are SHA-256 hashed
// to a 248-bit number that fits safely in Circom's BN254 field (~254 bits).
function encodeId(rawId) {
    if (/^\d+$/.test(rawId)) return BigInt(rawId);
    const hash = crypto.createHash("sha256").update(rawId).digest("hex");
    return BigInt("0x" + hash.slice(0, 62));
}

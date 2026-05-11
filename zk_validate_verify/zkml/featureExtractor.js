/**
 * Extract the 5 fraud detection features from a ZK witness.
 * The witness comes from fieldMapper.mapRecordToWitness().
 *
 * Must match exactly what train_model.py used during training:
 *   1. amount_normalised    — invoice amount / coverage_limit (0.0–1.0)
 *   2. service_code_bucket  — CPT code range bucket (0–9)
 *   3. provider_frequency   — normalised submission count (0.0–1.0)
 *   4. day_of_week          — 0=Monday … 6=Sunday
 *   5. amount_zscore        — z-score vs provider history (clamped -3 to 3)
 */
export function extractFraudFeatures(witness, providerStats) {
    const amount        = Number(witness.invoice_amount);
    const coverageLimit = Number(witness.coverage_limit);
    const serviceCode   = Number(witness.service_code);
    const dateUnix      = Number(witness.date_unix);
    const providerId    = witness.provider_id.toString();

    const amountNormalised  = Math.min(amount / coverageLimit, 1.0);
    const serviceCodeBucket = Math.min(Math.floor((serviceCode - 1000) / 1000), 9);
    const providerFrequency = providerStats.frequency[providerId] ?? 0.01;
    const dayOfWeek         = new Date(Number(dateUnix) * 1000).getDay();

    const provMean     = providerStats.means[providerId] ?? amount;
    const provStd      = providerStats.stds[providerId]  ?? 1;
    const amountZscore = Math.max(-3, Math.min(3, (amount - provMean) / provStd));

    return {
        amountNormalised:   parseFloat(amountNormalised.toFixed(4)),
        serviceCodeBucket:  serviceCodeBucket,
        providerFrequency:  parseFloat(providerFrequency.toFixed(4)),
        dayOfWeek:          dayOfWeek,
        amountZscore:       parseFloat(amountZscore.toFixed(4)),
    };
}

/**
 * Build provider stats from a batch of EMTTR records.
 * Call once per batch run and cache the result for the whole batch.
 *
 * @param {Array} records - raw EMTTR records (provider_npi, billed_amount)
 * @returns {{ frequency, means, stds }}
 */
export function buildProviderStats(records) {
    const byProvider = {};

    for (const r of records) {
        const npi = r.provider_npi;
        if (!byProvider[npi]) byProvider[npi] = [];
        byProvider[npi].push(parseFloat(r.billed_amount));
    }

    const total     = records.length;
    const frequency = {};
    const means     = {};
    const stds      = {};

    for (const [npi, amounts] of Object.entries(byProvider)) {
        frequency[npi] = amounts.length / total;
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const std  = Math.sqrt(
            amounts.reduce((a, b) => a + (b - mean) ** 2, 0) / amounts.length
        ) || 1;
        means[npi] = mean;
        stds[npi]  = std;
    }

    return { frequency, means, stds };
}

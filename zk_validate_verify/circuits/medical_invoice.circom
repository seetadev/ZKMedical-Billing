pragma circom 2.0.0;

include "lib/range_check.circom";
include "lib/service_validator.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

/*
 * MedicalInvoiceProof
 *
 * Proves ALL of the following WITHOUT revealing private data:
 *  1. invoice_amount is within [1, coverage_limit]
 *  2. service_code is a valid CPT code [1000..99999]
 *  3. invoice_amount does not exceed coverage_limit
 *  4. provider_id is non-zero (licensed provider)
 *  5. Outputs a Poseidon commitment of all private inputs
 *
 * Public inputs  : coverage_limit
 * Private inputs : patient_id, invoice_amount, service_code,
 *                  provider_id, date_unix, salt
 * Public outputs : invoice_commitment, is_valid
 */
template MedicalInvoiceProof() {

    // ── Private inputs (never revealed on-chain) ──
    signal input patient_id;
    signal input invoice_amount;   // in smallest unit (e.g. paise/cents)
    signal input service_code;
    signal input provider_id;
    signal input date_unix;
    signal input salt;             // random blinding factor

    // ── Public inputs (known to verifier) ──
    signal input coverage_limit;   // max reimbursable amount

    // ── Public outputs ──
    signal output invoice_commitment;  // Poseidon(all private inputs)
    signal output is_valid;            // 1 if all checks pass

    // ── Constraint 1: Amount is positive and within coverage ──
    component amount_check = RangeCheck(32);
    amount_check.value   <== invoice_amount;
    amount_check.min_val <== 1;
    amount_check.max_val <== coverage_limit;

    // ── Constraint 2: Service code is a valid CPT code ──
    component svc_check = ServiceCodeValidator();
    svc_check.service_code <== service_code;

    // ── Constraint 3: Provider ID is non-zero (licensed provider) ──
    component provider_nonzero = IsZero();
    provider_nonzero.in <== provider_id;
    // out must be 0, meaning provider_id != 0
    provider_nonzero.out === 0;

    // ── Constraint 4: Invoice amount <= coverage_limit ──
    component lte = LessEqThan(32);
    lte.in[0] <== invoice_amount;
    lte.in[1] <== coverage_limit;
    lte.out === 1;

    // ── Output: Poseidon hash commitment ──
    // Poseidon is ZK-friendly (cheap to prove), unlike SHA256
    component hasher = Poseidon(6);
    hasher.inputs[0] <== patient_id;
    hasher.inputs[1] <== invoice_amount;
    hasher.inputs[2] <== service_code;
    hasher.inputs[3] <== provider_id;
    hasher.inputs[4] <== date_unix;
    hasher.inputs[5] <== salt;

    invoice_commitment <== hasher.out;

    // All checks passed → is_valid = 1
    is_valid <== amount_check.is_valid * svc_check.is_valid;
}

component main {public [coverage_limit]} = MedicalInvoiceProof();

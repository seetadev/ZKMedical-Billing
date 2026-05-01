pragma circom 2.1.3;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// MedicalInvoiceValidator
// ────────────────────────────────────────────────────────────────────────────
// Validates a medical billing claim without revealing individual line-item
// costs or the insurance/patient split on-chain.
//
// All monetary values must be expressed in the smallest currency unit (e.g.
// cents for USD), so arithmetic stays in the integer domain.
//
// Parameters
//   N    – number of line items (default: 5)
//   BITS – bit-width for range checks; 27 bits covers amounts up to
//          $1,342,177.27 per item (134,217,727 cents)
//
// Private inputs (never revealed to the on-chain verifier)
//   itemCosts[N]         – cost of each line item
//   treatmentTotal       – total billed amount (must equal sum of itemCosts)
//   insuranceCoverage    – portion of the bill covered by insurance
//   patientContribution  – portion owed directly by the patient
//
// Public output
//   claimedTotal         – equals treatmentTotal; the verifier sees only the
//                          aggregate claim, not the item breakdown or split
//
// Constraints enforced
//   1. Each itemCosts[i] is in [0, 2^BITS)  (Num2Bits range check)
//   2. sum(itemCosts) == treatmentTotal      (line-item sum integrity)
//   3. insuranceCoverage + patientContribution == treatmentTotal
//      (the bill is fully accounted for — no gaps, no double-paying)
//   4. insuranceCoverage is in [0, 2^BITS)
//   5. patientContribution is in [0, 2^BITS)

template MedicalInvoiceValidator(N, BITS) {

    // ── Private inputs ────────────────────────────────────────────────────────
    signal input itemCosts[N];
    signal input treatmentTotal;
    signal input insuranceCoverage;
    signal input patientContribution;

    // ── Public output ─────────────────────────────────────────────────────────
    signal output claimedTotal;

    // ── Constraint 1: each line-item cost fits in BITS bits (≥ 0, < 2^BITS) ──
    // Num2Bits(BITS) decomposes the input into BITS binary signals and
    // constrains the input to be representable in BITS bits.  Any value
    // outside [0, 2^BITS) will cause the constraint to fail.
    component itemBits[N];

    signal rollingSum[N + 1];
    rollingSum[0] <== 0;

    for (var i = 0; i < N; i++) {
        itemBits[i] = Num2Bits(BITS);
        itemBits[i].in <== itemCosts[i];

        rollingSum[i + 1] <== rollingSum[i] + itemCosts[i];
    }

    // ── Constraint 2: sum of line items equals the claimed total ──────────────
    rollingSum[N] === treatmentTotal;

    // ── Constraint 3: coverage + patient share accounts for the full bill ─────
    // This prevents under-reporting (insurer pays less than agreed) and
    // over-reporting (fraudulent double-billing).
    insuranceCoverage + patientContribution === treatmentTotal;

    // ── Constraints 4–5: range checks on the two coverage components ──────────
    component covBits = Num2Bits(BITS);
    covBits.in <== insuranceCoverage;

    component patBits = Num2Bits(BITS);
    patBits.in <== patientContribution;

    // ── Public output: expose only the aggregate claim amount ─────────────────
    claimedTotal <== treatmentTotal;
}

// Instantiate with 5 line items and 27-bit amounts.
// To support more items or larger amounts, increase N or BITS respectively.
component main = MedicalInvoiceValidator(5, 27);

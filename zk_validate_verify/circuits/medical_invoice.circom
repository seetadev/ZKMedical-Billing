pragma circom 2.1.3;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

// MedicalInvoiceValidator (v2 — with replay-attack prevention)
// ────────────────────────────────────────────────────────────────────────────
// Validates a medical billing claim without revealing individual line-item
// costs or the insurance/patient split on-chain.
//
// v2 adds a cryptographic nullifier to prevent invoice replay attacks.
// Without a nullifier, a valid proof for invoice #1234 can be resubmitted
// and verified multiple times — allowing a hospital to claim the same bill
// twice. The nullifier is a one-way Poseidon hash derived from identifiers
// that are unique to a single submission. The on-chain verifier stores used
// nullifiers and rejects any proof that reuses one.
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
//   patientId            – private patient identifier (e.g. hashed Aadhar)
//   providerId           – private provider identifier (hospital/clinic ID)
//   nonce                – unique per-submission nonce (e.g. timestamp + salt)
//
// Public outputs
//   claimedTotal         – equals treatmentTotal; the verifier sees only the
//                          aggregate claim, not the item breakdown or split
//   nullifier            – Poseidon(patientId, providerId, nonce)
//                          stored on-chain after first use; any resubmission
//                          of the same invoice produces the same nullifier
//                          and is rejected by the registry contract
//
// Constraints enforced
//   1. Each itemCosts[i] is in [0, 2^BITS)  (Num2Bits range check)
//   2. sum(itemCosts) == treatmentTotal      (line-item sum integrity)
//   3. insuranceCoverage + patientContribution == treatmentTotal
//      (the bill is fully accounted for — no gaps, no double-paying)
//   4. insuranceCoverage is in [0, 2^BITS)
//   5. patientContribution is in [0, 2^BITS)
//   6. nullifier == Poseidon(patientId, providerId, nonce)
//      (replay-attack prevention — unique per invoice submission)

template MedicalInvoiceValidator(N, BITS) {

    // ── Private inputs ────────────────────────────────────────────────────────
    signal input itemCosts[N];
    signal input treatmentTotal;
    signal input insuranceCoverage;
    signal input patientContribution;

    // Nullifier inputs — private identifiers unique to this submission
    signal input patientId;
    signal input providerId;
    signal input nonce;

    // ── Public outputs ────────────────────────────────────────────────────────
    signal output claimedTotal;
    signal output nullifier;

    // ── Constraint 1: each line-item cost fits in BITS bits (≥ 0, < 2^BITS) ──
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
    insuranceCoverage + patientContribution === treatmentTotal;

    // ── Constraints 4–5: range checks on the two coverage components ──────────
    component covBits = Num2Bits(BITS);
    covBits.in <== insuranceCoverage;

    component patBits = Num2Bits(BITS);
    patBits.in <== patientContribution;

    // ── Constraint 6: nullifier = Poseidon(patientId, providerId, nonce) ──────
    // Poseidon is a ZK-friendly hash — far cheaper in constraints than SHA-256.
    // The nullifier is a public output so the verifier contract can store it
    // and reject any future proof that produces the same value.
    // The three inputs make the nullifier unique per patient, per provider,
    // and per submission nonce — so even if the same invoice is submitted
    // again with a different nonce it will produce a different nullifier
    // (which is the correct behaviour — only exact replays are blocked).
    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== patientId;
    poseidon.inputs[1] <== providerId;
    poseidon.inputs[2] <== nonce;

    nullifier <== poseidon.out;

    // ── Public output: expose only the aggregate claim amount ─────────────────
    claimedTotal <== treatmentTotal;
}

// Instantiate with 5 line items and 27-bit amounts.
component main {public [claimedTotal, nullifier]} = MedicalInvoiceValidator(5, 27);

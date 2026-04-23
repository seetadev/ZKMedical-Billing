pragma circom 2.1.3;

include "../node_modules/circomlib/circuits/comparators.circom";

template SimpleMultiplier() {
    // Private input signals
    signal input in[2];

    // Output signal (public)
    signal output out;
    
  // Interpret inputs:
  // in[0] = treatment_cost
  // in[1] = insurance_limit

// Constraint: treatment_cost <= insurance_limit

component lte_check = LessEqThan(8);
lte_check.in[0] <== in[0];
lte_check.in[1] <== in[1];

// Enforce constraint
lte_check.out === 1;

// Output can simply reflect treatment_cost
out <== in[0];
}

component main = SimpleMultiplier();

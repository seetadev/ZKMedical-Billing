#!/bin/bash
set -e

CIRCUIT="medical_invoice"
BUILD_DIR="circuits/build"
CIRCUIT_DIR="circuits"

mkdir -p $BUILD_DIR outputs

echo "Step 1: Compile circuit to R1CS..."
circom $CIRCUIT_DIR/$CIRCUIT.circom \
  --r1cs --wasm --sym \
  -o $BUILD_DIR/

echo "Step 2: View constraint count..."
snarkjs r1cs info $BUILD_DIR/$CIRCUIT.r1cs

echo "Step 3: Download Powers of Tau (Phase 1 trusted setup)..."
if [ ! -f "$BUILD_DIR/pot15_final.ptau" ]; then
  wget -q https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau \
    -O $BUILD_DIR/pot15_final.ptau
  echo "Downloaded pot15_final.ptau"
else
  echo "pot15_final.ptau already exists, skipping download"
fi

echo "Step 4: Circuit-specific setup (Phase 2)..."
snarkjs groth16 setup \
  $BUILD_DIR/$CIRCUIT.r1cs \
  $BUILD_DIR/pot15_final.ptau \
  $BUILD_DIR/${CIRCUIT}_0000.zkey

echo "Step 5: Contribute entropy..."
snarkjs zkey contribute \
  $BUILD_DIR/${CIRCUIT}_0000.zkey \
  $BUILD_DIR/${CIRCUIT}_final.zkey \
  --name="OP Medicine contributor" \
  -v -e="zkmedicine random entropy $(date)"

echo "Step 6: Export verification key..."
snarkjs zkey export verificationkey \
  $BUILD_DIR/${CIRCUIT}_final.zkey \
  $BUILD_DIR/verification_key.json

echo "Step 7: Export Solidity verifier contract..."
snarkjs zkey export solidityverifier \
  $BUILD_DIR/${CIRCUIT}_final.zkey \
  contracts/src/MedicalInvoiceVerifier.sol

echo ""
echo "Done!"
echo "  Verifier contract : contracts/src/MedicalInvoiceVerifier.sol"
echo "  Verification key  : $BUILD_DIR/verification_key.json"
echo "  Proving key       : $BUILD_DIR/${CIRCUIT}_final.zkey"

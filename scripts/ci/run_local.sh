#!/bin/bash
# Run all CI checks locally before pushing — mirrors what GitHub Actions will run.
set -e

ROOT=$(git rev-parse --show-toplevel)
ZK="$ROOT/zk_validate_verify"

echo "============================================"
echo " OP Medicine — Local CI checks"
echo "============================================"

# ── 1. ZK Circuits ──────────────────────────────
echo ""
echo "[1/4] ZK circuits: compile + witness generation"
cd "$ZK"

if ! command -v circom &>/dev/null; then
    echo "  SKIP: circom not found — install from https://docs.circom.io/getting-started/installation/"
else
    mkdir -p build outputs
    circom circuits/medical_invoice.circom --r1cs --wasm --sym -o build/ 2>/dev/null
    echo "  Compiled: OK"

    if [ -f build/medical_invoice_final.zkey ]; then
        node build/medical_invoice_js/generate_witness.js \
            build/medical_invoice_js/medical_invoice.wasm \
            inputs/invoice_sample.json \
            build/witness.wtns 2>/dev/null
        npx snarkjs groth16 prove \
            build/medical_invoice_final.zkey \
            build/witness.wtns \
            outputs/proof.json \
            outputs/public.json 2>/dev/null
        npx snarkjs groth16 verify \
            build/verification_key.json \
            outputs/public.json \
            outputs/proof.json 2>/dev/null
        echo "  Proof: OK"
    else
        echo "  SKIP proof: trusted setup not run yet (run scripts/compile.sh first)"
    fi
fi

# ── 2. Hardhat contract tests ────────────────────
echo ""
echo "[2/4] Smart contracts: Hardhat unit tests"
cd "$ZK/fvm-contracts"

if [ ! -d node_modules ]; then
    echo "  Installing contract dependencies..."
    npm ci --silent
fi

npx hardhat compile --quiet
npx hardhat test --network hardhat
echo "  Contracts: PASS"

# ── 3. API tests ─────────────────────────────────
echo ""
echo "[3/4] API: Jest endpoint tests"
cd "$ZK/api"

if [ ! -d node_modules ]; then
    echo "  Installing API dependencies..."
    npm ci --silent
fi

API_KEY_SECRET=test_key_for_ci npm test -- --forceExit --silent 2>/dev/null
echo "  API: PASS"

# ── 4. Frontend build ─────────────────────────────
echo ""
echo "[4/4] Dashboard: TypeScript check + production build"
cd "$ZK/dashboard"

if [ ! -d node_modules ]; then
    echo "  Installing dashboard dependencies..."
    npm ci --silent
fi

npx tsc --noEmit
npm run build --silent 2>/dev/null
echo "  Frontend: PASS"

echo ""
echo "============================================"
echo " All local CI checks passed. Safe to push."
echo "============================================"

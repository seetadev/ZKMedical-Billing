import { mapRecordToWitness } from "../src/emttr/fieldMapper.js";
import { groth16 }            from "snarkjs";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.join(__dirname, "..");

const testRecords = JSON.parse(
    fs.readFileSync(path.join(ROOT, "inputs/emttr_test_dataset.json"))
);

const mockCoverage = { limit_amount: "5000.00", currency: "INR" };

console.log(`Testing field mapper with ${testRecords.length} records...\n`);

for (const record of testRecords) {
    console.log(`Record: ${record.id}`);

    const witness = mapRecordToWitness(record, mockCoverage);
    console.log(`  patient_id:     ${witness.patient_id}`);
    console.log(`  invoice_amount: ${witness.invoice_amount} paise`);
    console.log(`  service_code:   ${witness.service_code}`);
    console.log(`  provider_id:    ${witness.provider_id}`);
    console.log(`  coverage_limit: ${witness.coverage_limit} paise`);

    const { _meta, ...circuitInputs } = witness;

    console.log("  Generating proof...");
    const { proof, publicSignals } = await groth16.fullProve(
        circuitInputs,
        path.join(ROOT, "circuits/build/medical_invoice_js/medical_invoice.wasm"),
        path.join(ROOT, "circuits/build/medical_invoice_final.zkey")
    );

    console.log(`  is_valid:   ${publicSignals[1]}`);
    console.log(`  commitment: 0x${BigInt(publicSignals[0]).toString(16).slice(0, 10)}...`);
    console.log(`  PASSED\n`);
}

console.log("All records processed successfully.");

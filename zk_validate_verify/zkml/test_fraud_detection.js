import { SindriService } from "./sindriService.js";
import "dotenv/config";

const sindri = new SindriService();

const normalFeatures = {
    amountNormalised:  0.5,
    serviceCodeBucket: 2,
    providerFrequency: 0.15,
    dayOfWeek:         1,
    amountZscore:      0.3,
};

// High amount, rare CPT bucket, unknown provider, weekend, extreme z-score
const suspiciousFeatures = {
    amountNormalised:  0.99,
    serviceCodeBucket: 9,
    providerFrequency: 0.001,
    dayOfWeek:         6,
    amountZscore:      2.8,
};

console.log("Testing normal invoice...");
const normalResult = await sindri.generateFraudProof(normalFeatures);
console.log(`Score: ${normalResult.fraudScore}/100 — ${normalResult.isSafe ? "SAFE" : "BLOCKED"}\n`);

console.log("Testing suspicious invoice...");
const suspResult = await sindri.generateFraudProof(suspiciousFeatures);
console.log(`Score: ${suspResult.fraudScore}/100 — ${suspResult.isSafe ? "SAFE" : "BLOCKED"}`);

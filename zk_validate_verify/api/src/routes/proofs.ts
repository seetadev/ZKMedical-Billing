import { Router }               from "express";
import { body, validationResult } from "express-validator";
import { ProofService }          from "../services/proofService";

export const proofRouter = Router();
const proofService = new ProofService();

/**
 * POST /v1/proofs/generate
 *
 * Generate a Groth16 ZK proof for an invoice without submitting to FVM.
 */
proofRouter.post(
    "/generate",
    [
        body("patientId").isString().notEmpty(),
        body("amountCents").isInt({ min: 1 }),
        body("cptCode").isInt({ min: 1000, max: 9999 }),
        body("providerId").isString().notEmpty(),
        body("coverageLimitCents").isInt({ min: 1 }),
    ],
    async (req: any, res: any, next: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed", errors: errors.array() });
            return;
        }
        try {
            const result = await proofService.generateProof(req.body);
            res.json({
                success:     true,
                commitment:  result.commitment,
                isValid:     result.isValid,
                calldata:    result.calldata,
                proofTimeMs: result.proofTimeMs,
            });
        } catch (err) { next(err); }
    }
);

/** POST /v1/proofs/verify-local */
proofRouter.post("/verify-local", async (req: any, res: any, next: any) => {
    try {
        const { proof, publicSignals } = req.body;
        const valid = await proofService.verifyLocally(proof, publicSignals);
        res.json({ valid });
    } catch (err) { next(err); }
});

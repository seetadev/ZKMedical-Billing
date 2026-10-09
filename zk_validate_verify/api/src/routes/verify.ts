import { Router }        from "express";
import { VerifyService } from "../services/verifyService";

export const verifyRouter = Router();
const verifyService = new VerifyService();

/**
 * GET /v1/verify/:commitment
 *
 * Check if an invoice commitment is verified on FVM.
 * Primary endpoint for insurers to validate claims.
 */
verifyRouter.get("/:commitment", async (req: any, res: any, next: any) => {
    try {
        const result = await verifyService.verifyCommitment(req.params.commitment);
        res.json(result);
    } catch (err) { next(err); }
});

/**
 * POST /v1/verify/batch
 * Verify up to 50 commitments in one call.
 */
verifyRouter.post("/batch", async (req: any, res: any, next: any) => {
    try {
        const { commitments } = req.body;
        if (!Array.isArray(commitments) || commitments.length === 0 || commitments.length > 50) {
            res.status(400).json({ error: "Provide an array of up to 50 commitments" });
            return;
        }
        const results = await verifyService.verifyBatch(commitments);
        res.json({ results });
    } catch (err) { next(err); }
});

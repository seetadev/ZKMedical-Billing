import { Router }               from "express";
import { body, validationResult } from "express-validator";
import { InvoiceService }        from "../services/invoiceService";

export const invoiceRouter = Router();
const invoiceService = new InvoiceService();

/**
 * POST /v1/invoices/submit
 *
 * Full pipeline: validate → fraud check → ZK proof → IPFS → FVM submit
 */
invoiceRouter.post(
    "/submit",
    [
        body("patientId").isString().notEmpty(),
        body("amountCents").isInt({ min: 1 }),
        body("cptCode").isInt({ min: 1000, max: 9999 }),
        body("providerId").isString().notEmpty(),
        body("coverageLimitCents").isInt({ min: 1 }),
        body("providerWallet").isEthereumAddress(),
    ],
    async (req: any, res: any, next: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ error: "Validation failed", errors: errors.array() });
            return;
        }
        try {
            const result = await invoiceService.submitInvoice(req.body);
            res.status(201).json({
                success:    true,
                commitment: result.commitment,
                ipfsCID:    result.ipfsCID,
                txHash:     result.txHash,
                fraudScore: result.fraudScore,
                message:    "Invoice verified and stored on Filecoin FVM",
            });
        } catch (err) { next(err); }
    }
);

/** GET /v1/invoices/:commitment */
invoiceRouter.get("/:commitment", async (req: any, res: any, next: any) => {
    try {
        const record = await invoiceService.getInvoice(req.params.commitment);
        if (!record) { res.status(404).json({ error: "Invoice not found" }); return; }
        res.json(record);
    } catch (err) { next(err); }
});

/** GET /v1/invoices/provider/:address */
invoiceRouter.get("/provider/:address", async (req: any, res: any, next: any) => {
    try {
        const invoices = await invoiceService.getProviderInvoices(req.params.address);
        res.json({ invoices, count: invoices.length });
    } catch (err) { next(err); }
});

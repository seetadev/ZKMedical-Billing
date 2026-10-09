import { Router }         from "express";
import { BillingService } from "../services/billingService";

export const billingRouter = Router();
const billingService = new BillingService();

/** GET /v1/billing/history?provider=0x...&page=1&limit=20 */
billingRouter.get("/history", async (req: any, res: any, next: any) => {
    try {
        const { provider, page = "1", limit = "20" } = req.query;
        const history = await billingService.getHistory(
            provider as string,
            parseInt(page as string),
            parseInt(limit as string)
        );
        res.json(history);
    } catch (err) { next(err); }
});

/** GET /v1/billing/stats?provider=0x... */
billingRouter.get("/stats", async (req: any, res: any, next: any) => {
    try {
        const stats = await billingService.getStats(req.query.provider as string);
        res.json(stats);
    } catch (err) { next(err); }
});

import express    from "express";
import cors       from "cors";
import helmet     from "helmet";
import morgan     from "morgan";
import rateLimit  from "express-rate-limit";
import { config } from "dotenv";

import { invoiceRouter } from "./routes/invoices";
import { proofRouter }   from "./routes/proofs";
import { verifyRouter }  from "./routes/verify";
import { billingRouter } from "./routes/billing";
import { healthRouter }  from "./routes/health";
import { errorHandler }  from "./middleware/errorHandler";
import { apiKeyAuth }    from "./middleware/apiKeyAuth";

config({ path: "../fvm-contracts/.env" });

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") ?? "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      100,
    message:  { error: "Too many requests — try again in 15 minutes" },
}));

app.use("/health",     healthRouter);
app.use("/v1/invoices", apiKeyAuth, invoiceRouter);
app.use("/v1/proofs",   apiKeyAuth, proofRouter);
app.use("/v1/verify",   apiKeyAuth, verifyRouter);
app.use("/v1/billing",  apiKeyAuth, billingRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`OP Medicine Billing API running on port ${PORT}`);
    console.log(`Health: http://localhost:${PORT}/health`);
});

export default app;

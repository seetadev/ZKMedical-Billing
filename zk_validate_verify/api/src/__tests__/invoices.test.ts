import request from "supertest";

// Set env before importing app so services instantiate without crashing
process.env.API_KEY_SECRET  = "test_key_for_ci";
process.env.NODE_ENV        = "test";
// Hardhat account #0 — safe to use in tests, never holds real funds
process.env.PRIVATE_KEY     = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
process.env.CALIBRATION_RPC = "http://127.0.0.1:8545";
process.env.PPT_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000006";
process.env.OP_RPC          = "http://127.0.0.1:8546";

import app from "../server";

const API_KEY = "test_key_for_ci";

describe("GET /health", () => {
    it("returns 200 with status ok (no auth required)", async () => {
        const res = await request(app).get("/health");
        expect(res.status).toBe(200);
        expect(res.body.status).toBe("ok");
    });
});

describe("Auth middleware", () => {
    it("returns 401 on /v1/invoices without API key", async () => {
        const res = await request(app).post("/v1/invoices/submit").send({});
        expect(res.status).toBe(401);
    });

    it("returns 401 on /v1/verify without API key", async () => {
        const res = await request(app).get("/v1/verify/0xabc");
        expect(res.status).toBe(401);
    });

    it("returns 401 on /v1/billing without API key", async () => {
        const res = await request(app).get("/v1/billing/history");
        expect(res.status).toBe(401);
    });
});

describe("POST /v1/invoices/submit — validation", () => {
    it("returns 400 for empty body", async () => {
        const res = await request(app)
            .post("/v1/invoices/submit")
            .set("X-Api-Key", API_KEY)
            .send({});
        expect(res.status).toBe(400);
        expect(res.body.errors ?? res.body.error).toBeDefined();
    });

    it("returns 400 for missing required fields", async () => {
        const res = await request(app)
            .post("/v1/invoices/submit")
            .set("X-Api-Key", API_KEY)
            .send({ patientId: "PAT-001" });
        expect(res.status).toBe(400);
    });

    it("returns 400 for invalid CPT code (out of range)", async () => {
        const res = await request(app)
            .post("/v1/invoices/submit")
            .set("X-Api-Key", API_KEY)
            .send({
                patientId:          "PAT-001",
                amountCents:        250000,
                cptCode:            999,
                providerId:         "1234567890",
                coverageLimitCents: 500000,
                providerWallet:     "0x742d35Cc6634C0532925a3b8D4C9b6e9F8d6E532",
            });
        expect(res.status).toBe(400);
    });

    it("returns 400 for negative amount", async () => {
        const res = await request(app)
            .post("/v1/invoices/submit")
            .set("X-Api-Key", API_KEY)
            .send({
                patientId:          "PAT-001",
                amountCents:        -100,
                cptCode:            99213,
                providerId:         "1234567890",
                coverageLimitCents: 500000,
                providerWallet:     "0x742d35Cc6634C0532925a3b8D4C9b6e9F8d6E532",
            });
        expect(res.status).toBe(400);
    });
});

describe("GET /v1/verify/:commitment", () => {
    it("returns 401 without API key", async () => {
        const res = await request(app).get("/v1/verify/0x123abc");
        expect(res.status).toBe(401);
    });

    it("returns 4xx for unknown commitment with auth", async () => {
        const unknownCommitment =
            "0x0000000000000000000000000000000000000000000000000000000000000001";
        const res = await request(app)
            .get(`/v1/verify/${unknownCommitment}`)
            .set("X-Api-Key", API_KEY);
        expect(res.status).toBeGreaterThanOrEqual(400);
    });
});

describe("POST /v1/verify/batch", () => {
    it("returns 400 for empty commitments array", async () => {
        const res = await request(app)
            .post("/v1/verify/batch")
            .set("X-Api-Key", API_KEY)
            .send({ commitments: [] });
        expect(res.status).toBe(400);
    });

    it("returns 400 when commitments array exceeds 50", async () => {
        const commitments = Array.from({ length: 51 }, (_, i) =>
            `0x${i.toString().padStart(64, "0")}`
        );
        const res = await request(app)
            .post("/v1/verify/batch")
            .set("X-Api-Key", API_KEY)
            .send({ commitments });
        expect(res.status).toBe(400);
    });
});

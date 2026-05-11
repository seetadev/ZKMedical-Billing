import axios, { AxiosInstance } from "axios";

export interface InvoiceSubmitParams {
    patientId:          string;
    amountCents:        number;
    cptCode:            number;
    providerId:         string;
    coverageLimitCents: number;
    providerWallet:     string;
}

export interface InvoiceSubmitResult {
    success:    boolean;
    commitment: string;
    ipfsCID:    string;
    txHash:     string;
    fraudScore: number;
    message:    string;
}

export interface VerifyResult {
    verified:     boolean;
    commitment:   string;
    ipfsCID:      string;
    provider:     string;
    submittedAt:  string;
    fraudScore:   number;
    anchoredOnOP: boolean;
}

export interface ProofResult {
    success:     boolean;
    commitment:  string;
    isValid:     boolean;
    calldata:    string;
    proofTimeMs: number;
}

export interface BillingHistory {
    invoices: Array<{
        commitment:  string;
        ipfsCID:     string;
        submittedAt: string;
        disputed:    boolean;
    }>;
    count:      number;
    page:       number;
    limit:      number;
    totalPages: number;
}

export interface BillingStats {
    providerAddress: string;
    totalInvoices:   number;
    disputed:        number;
    verified:        number;
    oldestAt:        string | null;
}

/**
 * OP Medicine Billing SDK
 *
 * @example
 * import { BillingClient } from "@op-medicine/billing-sdk";
 *
 * const client = new BillingClient({
 *   apiUrl: "https://api.op-medicine.dev",
 *   apiKey: "your_api_key",
 * });
 *
 * const result = await client.invoices.submit({ ... });
 * const status = await client.verify(result.commitment);
 */
export class BillingClient {
    private http: AxiosInstance;

    constructor(config: { apiUrl: string; apiKey: string }) {
        this.http = axios.create({
            baseURL: `${config.apiUrl}/v1`,
            headers: {
                "X-Api-Key":    config.apiKey,
                "Content-Type": "application/json",
            },
            timeout: 120000,   // 2 min — proof generation takes time
        });

        this.http.interceptors.response.use(
            res => res,
            err => {
                const msg  = err.response?.data?.error ?? err.message;
                const code = err.response?.data?.code  ?? "UNKNOWN";
                throw Object.assign(new Error(msg), { code, status: err.response?.status });
            }
        );
    }

    // ── Invoices ──────────────────────────────────────────────────────────────

    invoices = {
        /**
         * Submit an invoice through the full ZK pipeline.
         * Handles fraud check, proof generation, IPFS upload, and FVM submission.
         */
        submit: async (params: InvoiceSubmitParams): Promise<InvoiceSubmitResult> => {
            const { data } = await this.http.post("/invoices/submit", params);
            return data;
        },

        /** Fetch a stored invoice by commitment hash. */
        get: async (commitment: string) => {
            const { data } = await this.http.get(`/invoices/${commitment}`);
            return data;
        },

        /** List all invoices for a provider wallet address. */
        listByProvider: async (address: string) => {
            const { data } = await this.http.get(`/invoices/provider/${address}`);
            return data;
        },
    };

    // ── Proofs ────────────────────────────────────────────────────────────────

    proofs = {
        /**
         * Generate a ZK proof without submitting to chain.
         * Use to pre-validate before calling invoices.submit().
         */
        generate: async (
            params: Omit<InvoiceSubmitParams, "providerWallet">
        ): Promise<ProofResult> => {
            const { data } = await this.http.post("/proofs/generate", params);
            return data;
        },

        /** Verify a proof locally without touching the chain. */
        verifyLocally: async (proof: object, publicSignals: string[]) => {
            const { data } = await this.http.post("/proofs/verify-local",
                { proof, publicSignals });
            return data;
        },
    };

    // ── Verification ──────────────────────────────────────────────────────────

    /**
     * Verify an invoice commitment on-chain.
     * Primary method for insurers to validate a claim.
     */
    async verify(commitment: string): Promise<VerifyResult> {
        const { data } = await this.http.get(`/verify/${commitment}`);
        return data;
    }

    /** Verify multiple commitments in one call (max 50). */
    async verifyBatch(commitments: string[]) {
        const { data } = await this.http.post("/verify/batch", { commitments });
        return data;
    }

    // ── Billing history ───────────────────────────────────────────────────────

    billing = {
        history: async (
            provider: string, page = 1, limit = 20
        ): Promise<BillingHistory> => {
            const { data } = await this.http.get("/billing/history",
                { params: { provider, page, limit } });
            return data;
        },

        stats: async (provider: string): Promise<BillingStats> => {
            const { data } = await this.http.get("/billing/stats",
                { params: { provider } });
            return data;
        },
    };
}

export default BillingClient;

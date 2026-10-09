import axios, { AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";
const API_KEY  = import.meta.env.VITE_API_KEY  ?? "";

const http: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/v1`,
    headers: { "X-Api-Key": API_KEY, "Content-Type": "application/json" },
    timeout: 120000,
});

http.interceptors.response.use(
    res => res,
    err => {
        const msg  = err.response?.data?.error ?? err.message;
        const code = err.response?.data?.code  ?? "UNKNOWN";
        throw Object.assign(new Error(msg), { code, status: err.response?.status });
    }
);

export const apiClient = {
    invoices: {
        submit:         (body: object)  => http.post("/invoices/submit", body).then(r => r.data),
        get:            (id: string)    => http.get(`/invoices/${id}`).then(r => r.data),
        listByProvider: (addr: string)  => http.get(`/invoices/provider/${addr}`).then(r => r.data),
    },
    proofs: {
        generate:     (body: object)                       => http.post("/proofs/generate", body).then(r => r.data),
        verifyLocally:(proof: object, signals: string[])   => http.post("/proofs/verify-local", { proof, publicSignals: signals }).then(r => r.data),
    },
    verify: {
        one:   (commitment: string)   => http.get(`/verify/${commitment}`).then(r => r.data),
        batch: (commitments: string[]) => http.post("/verify/batch", { commitments }).then(r => r.data),
    },
    billing: {
        history: (provider: string, page = 1, limit = 20) =>
            http.get("/billing/history", { params: { provider, page, limit } }).then(r => r.data),
        stats: (provider: string) =>
            http.get("/billing/stats", { params: { provider } }).then(r => r.data),
    },
};

import { useState, useCallback } from "react";
import { apiClient }             from "../services/apiClient";

export interface VerifyResult {
    verified:     boolean;
    commitment:   string;
    ipfsCID:      string;
    provider:     string;
    submittedAt:  string;
    fraudScore:   number;
    anchoredOnOP: boolean;
}

export function useVerify() {
    const [loading, setLoading] = useState(false);
    const [result,  setResult]  = useState<VerifyResult | null>(null);
    const [error,   setError]   = useState<string | null>(null);

    const verify = useCallback(async (commitment: string) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await apiClient.verify.one(commitment);
            setResult(data);
        } catch (err: any) {
            setError(err.message ?? "Verification failed");
        } finally {
            setLoading(false);
        }
    }, []);

    return { verify, result, loading, error };
}

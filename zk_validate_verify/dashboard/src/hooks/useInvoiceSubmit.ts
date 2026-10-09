import { useState, useCallback } from "react";
import { useAccount }            from "wagmi";
import { apiClient }             from "../services/apiClient";

export type PipelineStep =
    "idle" | "fraud" | "proof" | "ipfs" | "ppt" | "fvm" | "done" | "error";

export interface SubmitResult {
    commitment:  string;
    ipfsCID:     string;
    txHash:      string;
    fraudScore:  number;
    proofTimeMs: number;
}

export interface InvoiceFormData {
    patientId:          string;
    amountCents:        number;
    cptCode:            number;
    providerId:         string;
    coverageLimitCents: number;
}

// Map API progress events to pipeline steps
const STEP_MAP: Record<string, PipelineStep> = {
    fraud: "fraud", proof: "proof", ipfs: "ipfs", ppt: "ppt", fvm: "fvm",
};

export function useInvoiceSubmit() {
    const { address }                   = useAccount();
    const [step,   setStep]   = useState<PipelineStep>("idle");
    const [result, setResult] = useState<SubmitResult | null>(null);
    const [error,  setError]  = useState<string | null>(null);

    const submit = useCallback(async (formData: InvoiceFormData) => {
        if (!address) { setError("Connect your wallet first"); return; }

        setStep("fraud");
        setError(null);
        setResult(null);

        // Simulate step progression while API processes
        const steps: PipelineStep[] = ["fraud", "proof", "ipfs", "ppt", "fvm"];
        let stepIdx = 0;

        const ticker = setInterval(() => {
            stepIdx = Math.min(stepIdx + 1, steps.length - 1);
            setStep(steps[stepIdx]);
        }, 1800);

        try {
            const response = await apiClient.invoices.submit({
                ...formData,
                providerWallet: address,
            });
            clearInterval(ticker);
            setResult(response as SubmitResult);
            setStep("done");
        } catch (err: any) {
            clearInterval(ticker);
            setStep("error");
            setError(err.message ?? "Submission failed");
        }
    }, [address]);

    const reset = useCallback(() => {
        setStep("idle");
        setResult(null);
        setError(null);
    }, []);

    return { submit, step, result, error, reset };
}

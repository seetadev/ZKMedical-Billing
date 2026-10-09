import { PipelineStep, SubmitResult } from "../../hooks/useInvoiceSubmit";

const STEPS: { key: PipelineStep; label: string; description: string }[] = [
    { key: "fraud", label: "Fraud check",  description: "Sindri ZKML anomaly detection" },
    { key: "proof", label: "ZK proof",     description: "Groth16 proof generation" },
    { key: "ipfs",  label: "IPFS upload",  description: "Lighthouse encrypted upload" },
    { key: "ppt",   label: "PPT fee",      description: "10 PPT approve + collect" },
    { key: "fvm",   label: "FVM submit",   description: "On-chain verification" },
];

const ORDER = STEPS.map(s => s.key);

interface Props {
    currentStep: PipelineStep;
    result:      SubmitResult | null;
}

export function PipelineProgress({ currentStep, result }: Props) {
    const currentIdx = ORDER.indexOf(currentStep);

    return (
        <div>
            <div style={{ display: "flex", marginBottom: 20 }}>
                {STEPS.map((s, i) => {
                    const isDone   = currentStep === "done" || i < currentIdx;
                    const isActive = s.key === currentStep;
                    return (
                        <div key={s.key} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                            {i < STEPS.length - 1 && (
                                <div style={{
                                    position: "absolute", top: 12,
                                    left: "calc(50% + 12px)", right: "calc(-50% + 12px)",
                                    height: "0.5px",
                                    background: isDone ? "#0F6E56" : "#e5e5e4",
                                }} />
                            )}
                            <div style={{
                                width: 24, height: 24, borderRadius: "50%",
                                margin: "0 auto 6px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 500,
                                background: isDone ? "#E1F5EE" : isActive ? "#0F6E56" : "#f5f4ed",
                                border: `0.5px solid ${isDone || isActive ? "#0F6E56" : "#d0cfca"}`,
                                color: isDone ? "#085041" : isActive ? "#fff" : "#999",
                                position: "relative", zIndex: 1,
                            }}>
                                {isDone ? "✓" : isActive ? "●" : i + 1}
                            </div>
                            <div style={{
                                fontSize: 11,
                                color: isActive ? "#1a1a1a" : "#999",
                                fontWeight: isActive ? 500 : 400,
                            }}>
                                {s.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!result && (
                <p style={{ fontSize: 13, color: "#73726c", textAlign: "center" }}>
                    {STEPS.find(s => s.key === currentStep)?.description ?? "Processing..."}
                </p>
            )}

            {result && (
                <div style={{
                    padding: "14px 16px", borderRadius: 8,
                    border: "0.5px solid #0F6E56", background: "#E1F5EE",
                }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#085041", marginBottom: 10 }}>
                        Invoice verified and stored on Filecoin FVM
                    </p>
                    {([
                        ["Commitment",  result.commitment.slice(0, 20) + "..."],
                        ["IPFS CID",    result.ipfsCID?.slice(0, 22) + "..."],
                        ["Tx hash",     result.txHash?.slice(0, 20) + "..."],
                        ["Fraud score", `${result.fraudScore}/100`],
                    ] as [string, string][]).map(([k, v]) => (
                        <div key={k} style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 12, padding: "4px 0",
                            borderBottom: "0.5px solid rgba(15,110,86,0.2)",
                        }}>
                            <span style={{ color: "#085041" }}>{k}</span>
                            <span style={{ fontFamily: "monospace", fontSize: 11 }}>{v}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

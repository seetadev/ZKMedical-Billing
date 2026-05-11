import { useState } from "react";
import { useVerify } from "../../hooks/useVerify";

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", fontSize: 13,
    border: "0.5px solid #d0cfca", borderRadius: 8,
    background: "#fff", outline: "none", boxSizing: "border-box",
    fontFamily: "monospace",
};

export function VerifyPanel() {
    const [commitment, setCommitment] = useState("");
    const { verify, result, loading, error } = useVerify();

    return (
        <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                    style={{ ...inputStyle, flex: 1 }}
                    value={commitment}
                    onChange={e => setCommitment(e.target.value)}
                    placeholder="0x commitment hash..."
                />
                <button
                    onClick={() => verify(commitment)}
                    disabled={loading || !commitment}
                    style={{
                        padding: "10px 18px", borderRadius: 8, fontSize: 13,
                        border: "0.5px solid #d0cfca", background: "#fff",
                        cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap",
                    }}
                >
                    {loading ? "Checking..." : "Verify claim"}
                </button>
            </div>

            {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}

            {result && (
                <div style={{
                    padding: "14px 16px", borderRadius: 8,
                    border: `0.5px solid ${result.verified ? "#0F6E56" : "#c0392b"}`,
                    background: result.verified ? "#E1F5EE" : "#fdf2f2",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{
                            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                            background: result.verified ? "#0F6E56" : "#c0392b",
                            color: "#fff",
                        }}>
                            {result.verified ? "Verified" : "Not verified"}
                        </span>
                        {result.anchoredOnOP && (
                            <span style={{
                                padding: "3px 10px", borderRadius: 20, fontSize: 12,
                                background: "#EEE8FE", color: "#534AB7",
                            }}>
                                Anchored on Optimism
                            </span>
                        )}
                    </div>

                    {([
                        ["Provider",     result.provider   ? `${result.provider.slice(0,10)}...`  : "—"],
                        ["Submitted",    result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : "—"],
                        ["IPFS CID",     result.ipfsCID    ? `${result.ipfsCID.slice(0,20)}...`   : "—"],
                        ["Fraud score",  `${result.fraudScore}/100`],
                    ] as [string, string][]).map(([k, v]) => (
                        <div key={k} style={{
                            display: "flex", justifyContent: "space-between",
                            fontSize: 12, padding: "4px 0",
                            borderBottom: "0.5px solid rgba(0,0,0,0.08)",
                        }}>
                            <span style={{ color: "#73726c" }}>{k}</span>
                            <span style={{ fontFamily: "monospace" }}>{v}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

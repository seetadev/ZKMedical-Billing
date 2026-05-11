import { useState }            from "react";
import { useBillingHistory }   from "../../hooks/useBillingHistory";

export function BillingHistory() {
    const [page, setPage] = useState(1);
    const { invoices, total, loading, error } = useBillingHistory(page, 10);
    const totalPages = Math.ceil(total / 10);

    if (loading) return <p style={{ fontSize: 13, color: "#73726c" }}>Loading history...</p>;
    if (error)   return <p style={{ fontSize: 13, color: "#c0392b" }}>{error}</p>;
    if (!invoices.length) return (
        <p style={{ fontSize: 13, color: "#73726c" }}>No invoices found. Submit your first invoice above.</p>
    );

    return (
        <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                    <tr style={{ borderBottom: "0.5px solid #e5e5e4" }}>
                        {["Commitment", "IPFS CID", "Submitted", "Status"].map(h => (
                            <th key={h} style={{
                                textAlign: "left", padding: "8px 12px",
                                color: "#73726c", fontWeight: 500,
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.commitment} style={{ borderBottom: "0.5px solid #f0efea" }}>
                            <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>
                                {inv.commitment.slice(0, 12)}...
                            </td>
                            <td style={{ padding: "10px 12px", fontFamily: "monospace" }}>
                                {inv.ipfsCID ? inv.ipfsCID.slice(0, 14) + "..." : "—"}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                                {new Date(inv.submittedAt).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "10px 12px" }}>
                                <span style={{
                                    padding: "2px 8px", borderRadius: 20, fontSize: 11,
                                    background: inv.disputed ? "#fdf2f2" : "#E1F5EE",
                                    color: inv.disputed ? "#c0392b" : "#085041",
                                }}>
                                    {inv.disputed ? "Disputed" : "Verified"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        style={{ padding: "4px 12px", borderRadius: 6, border: "0.5px solid #d0cfca",
                            background: "#fff", cursor: "pointer", fontSize: 12 }}>
                        Previous
                    </button>
                    <span style={{ fontSize: 12, color: "#73726c", lineHeight: "26px" }}>
                        {page} / {totalPages}
                    </span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        style={{ padding: "4px 12px", borderRadius: 6, border: "0.5px solid #d0cfca",
                            background: "#fff", cursor: "pointer", fontSize: 12 }}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

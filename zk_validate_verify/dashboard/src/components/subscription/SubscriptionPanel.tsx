const PLANS = [
    {
        name:     "Basic",
        price:    "100 PPT/month",
        features: ["Up to 50 invoices/month", "IPFS storage", "ZK proof generation"],
        plan:     1,
    },
    {
        name:     "Pro",
        price:    "500 PPT/month",
        features: ["Unlimited invoices", "Priority processing", "Insurer access grants", "Dispute resolution"],
        plan:     2,
    },
    {
        name:     "Enterprise",
        price:    "2000 PPT/month",
        features: ["Everything in Pro", "Batch submissions", "API access", "Dedicated support"],
        plan:     3,
    },
];

export function SubscriptionPanel() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {PLANS.map(plan => (
                <div key={plan.name} style={{
                    border: "0.5px solid #e5e5e4", borderRadius: 10,
                    padding: "18px 20px",
                }}>
                    <p style={{ fontWeight: 600, fontSize: 15, margin: 0, marginBottom: 4 }}>{plan.name}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F6E56", marginBottom: 12 }}>
                        {plan.price}
                    </p>
                    <div style={{ marginBottom: 16 }}>
                        {plan.features.map(f => (
                            <p key={f} style={{ fontSize: 12, color: "#73726c", margin: "4px 0" }}>✓ {f}</p>
                        ))}
                    </div>
                    <button style={{
                        width: "100%", padding: "8px", borderRadius: 8,
                        border: "0.5px solid #d0cfca", background: "#fff",
                        cursor: "pointer", fontSize: 13,
                    }}>
                        Subscribe
                    </button>
                </div>
            ))}
        </div>
    );
}

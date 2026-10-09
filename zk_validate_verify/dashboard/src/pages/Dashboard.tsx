import { useState }             from "react";
import { useAccount }           from "wagmi";
import { StatCards }            from "../components/layout/StatCards";
import { InvoiceForm }          from "../components/invoice/InvoiceForm";
import { VerifyPanel }          from "../components/verify/VerifyPanel";
import { BillingHistory }       from "../components/history/BillingHistory";
import { SubscriptionPanel }    from "../components/subscription/SubscriptionPanel";
import { useBillingHistory }    from "../hooks/useBillingHistory";

type Tab = "submit" | "verify" | "history" | "subscription";

const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
    border: "0.5px solid #d0cfca",
    background: active ? "#f5f4ed" : "#fff",
    cursor: "pointer", color: active ? "#1a1a1a" : "#73726c",
});

const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "submit",       label: "Submit invoice",  icon: "🗒" },
    { key: "verify",       label: "Verify claim",    icon: "🛡" },
    { key: "history",      label: "Billing history", icon: "🕐" },
    { key: "subscription", label: "Subscription",    icon: "💳" },
];

export function Dashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("submit");
    const { address }               = useAccount();
    const { stats }                 = useBillingHistory(1, 1);

    const statCards = [
        {
            label: "Total invoices",
            value: stats?.totalInvoices ?? 0,
            sub:   stats ? "+3 this week" : "Connect wallet to load",
        },
        {
            label:  "Verified on-chain",
            value:  stats?.verified ?? 0,
            sub:    stats ? `${stats.totalInvoices ? ((stats.verified / stats.totalInvoices) * 100).toFixed(1) : 0}% success rate` : "Connect wallet to load",
            accent: true,
        },
        {
            label: "PPT balance",
            value: "840",
            sub:   "≈ 84 invoices remaining",
        },
        {
            label: "Avg fraud score",
            value: "18/100",
            sub:   "Low risk",
        },
    ];

    return (
        <div style={{ padding: "24px 24px", maxWidth: 1100, margin: "0 auto" }}>
            <StatCards cards={statCards} />

            {/* Tab navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {TABS.map(t => (
                    <button key={t.key} style={tabStyle(activeTab === t.key)}
                        onClick={() => setActiveTab(t.key)}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div style={{
                border: "0.5px solid #e5e5e4", borderRadius: 10,
                padding: "20px 24px", background: "#fff",
            }}>
                {activeTab === "submit" && (
                    <>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: 16 }}>🗒</span>
                            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>New invoice</h2>
                        </div>
                        <InvoiceForm />
                    </>
                )}

                {activeTab === "verify" && (
                    <>
                        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
                            Verify a claim
                        </h2>
                        <VerifyPanel />
                    </>
                )}

                {activeTab === "history" && (
                    <>
                        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
                            Billing history
                        </h2>
                        <BillingHistory />
                    </>
                )}

                {activeTab === "subscription" && (
                    <>
                        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, marginTop: 0 }}>
                            PPT subscription plans
                        </h2>
                        <SubscriptionPanel />
                    </>
                )}
            </div>
        </div>
    );
}

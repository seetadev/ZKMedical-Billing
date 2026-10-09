import useData from "../hooks/useData";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";

const STATUS_COLORS = {
    paid: "#17c964",
    pending: "#f5a524",
    draft: "#f31260",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function KpiCard({ label, value, sub }) {
    return (
        <div className="bg-[#37373f] rounded-xl p-6 flex flex-col gap-1 flex-1 min-w-[160px]">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-2xl font-bold">{value}</span>
            {sub && <span className="text-xs text-gray-500">{sub}</span>}
        </div>
    );
}

export default function Analytics() {
    const data = useData();

    if (!data) {
        return (
            <div className="flex items-center justify-center w-full h-64 text-gray-400">
                Loading analytics…
            </div>
        );
    }

    const invoices = data.invoices ?? [];
    const symbol = data.currencySymbol ?? "";

    // ── KPIs ──────────────────────────────────────────────────────────────────
    const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.invoiceTotal ?? 0), 0);

    const pendingAmount = invoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + (inv.invoiceTotal ?? 0), 0);

    const paidCount = invoices.filter((inv) => inv.status === "paid").length;
    const pendingCount = invoices.filter((inv) => inv.status === "pending").length;
    const draftCount = invoices.filter((inv) => inv.status === "draft").length;

    // ── Monthly revenue (current year) ────────────────────────────────────────
    const currentYear = new Date().getFullYear();
    const monthlyTotals = Array(12).fill(0);

    invoices.forEach((inv) => {
        if (!inv.createdAt) return;
        const date = new Date(inv.createdAt.seconds * 1000);
        if (date.getFullYear() === currentYear) {
            monthlyTotals[date.getMonth()] += inv.invoiceTotal ?? 0;
        }
    });

    const monthlyData = MONTH_LABELS.map((month, i) => ({
        month,
        amount: parseFloat(monthlyTotals[i].toFixed(2)),
    }));

    // ── Status breakdown ──────────────────────────────────────────────────────
    const statusData = [
        { name: "Paid", value: paidCount, color: STATUS_COLORS.paid },
        { name: "Pending", value: pendingCount, color: STATUS_COLORS.pending },
        { name: "Draft", value: draftCount, color: STATUS_COLORS.draft },
    ].filter((d) => d.value > 0);

    // ── Top clients by revenue ────────────────────────────────────────────────
    const clientMap = {};
    invoices.forEach((inv) => {
        const name = inv.clientName ?? "Unknown";
        clientMap[name] = (clientMap[name] ?? 0) + (inv.invoiceTotal ?? 0);
    });

    const topClients = Object.entries(clientMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, total]) => ({ name, total: parseFloat(total.toFixed(2)) }));

    return (
        <div className="flex flex-col gap-8 w-full px-6 py-10">
            <h2 className="text-2xl font-bold">Analytics</h2>

            {/* ── KPI Cards ── */}
            <div className="flex flex-wrap gap-4">
                <KpiCard
                    label="Total Revenue"
                    value={`${symbol}${totalRevenue.toFixed(2)}`}
                    sub={`${paidCount} paid invoice${paidCount !== 1 ? "s" : ""}`}
                />
                <KpiCard
                    label="Pending"
                    value={`${symbol}${pendingAmount.toFixed(2)}`}
                    sub={`${pendingCount} awaiting payment`}
                />
                <KpiCard
                    label="Total Invoices"
                    value={invoices.length}
                    sub={`${draftCount} draft${draftCount !== 1 ? "s" : ""}`}
                />
                <KpiCard
                    label="Collection Rate"
                    value={
                        invoices.length > 0
                            ? `${Math.round((paidCount / invoices.length) * 100)}%`
                            : "—"
                    }
                    sub="paid / total"
                />
            </div>

            {/* ── Charts row ── */}
            <div className="flex flex-wrap gap-6">
                {/* Monthly revenue */}
                <div className="bg-[#37373f] rounded-xl p-6 flex-1 min-w-[300px]">
                    <h3 className="text-lg font-semibold mb-4">
                        Monthly Revenue {currentYear}
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#55555c" />
                            <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                            <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: "#27272a", border: "none", borderRadius: 8 }}
                                formatter={(val) => [`${symbol}${val}`, "Revenue"]}
                            />
                            <Bar dataKey="amount" fill="#0070f0" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Status pie */}
                <div className="bg-[#37373f] rounded-xl p-6 flex flex-col items-center min-w-[260px]">
                    <h3 className="text-lg font-semibold mb-4 self-start">Invoice Status</h3>
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {statusData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip
                                    contentStyle={{
                                        background: "#27272a",
                                        border: "none",
                                        borderRadius: 8,
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm mt-8">No invoices yet.</p>
                    )}
                </div>
            </div>

            {/* ── Top Clients ── */}
            {topClients.length > 0 && (
                <div className="bg-[#37373f] rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Clients by Revenue</h3>
                    <div className="flex flex-col gap-3">
                        {topClients.map((client, idx) => {
                            const pct =
                                totalRevenue > 0
                                    ? Math.round((client.total / totalRevenue) * 100)
                                    : 0;
                            return (
                                <div key={client.name} className="flex items-center gap-4">
                                    <span className="text-gray-400 text-sm w-4">{idx + 1}</span>
                                    <span className="flex-1 truncate text-sm">{client.name}</span>
                                    <div className="flex-1 bg-[#27272a] rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-[#0070f0]"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium w-24 text-right">
                                        {symbol}
                                        {client.total.toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

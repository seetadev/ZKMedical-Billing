import { useState, useEffect } from "react";
import { useAccount }          from "wagmi";
import { apiClient }           from "../services/apiClient";

export interface HistoryRecord {
    commitment:  string;
    ipfsCID:     string;
    submittedAt: string;
    disputed:    boolean;
}

export interface HistoryStats {
    totalInvoices:  number;
    verified:       number;
    disputed:       number;
    pptBalance:     string;
    avgFraudScore:  number;
}

export function useBillingHistory(page = 1, limit = 10) {
    const { address }               = useAccount();
    const [invoices, setInvoices]   = useState<HistoryRecord[]>([]);
    const [stats,    setStats]      = useState<HistoryStats | null>(null);
    const [total,    setTotal]      = useState(0);
    const [loading,  setLoading]    = useState(false);
    const [error,    setError]      = useState<string | null>(null);

    useEffect(() => {
        if (!address) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const [history, statsData] = await Promise.all([
                    apiClient.billing.history(address!, page, limit),
                    apiClient.billing.stats(address!),
                ]);
                if (!cancelled) {
                    setInvoices(history.invoices ?? []);
                    setTotal(history.count ?? 0);
                    setStats({
                        totalInvoices: statsData.totalInvoices ?? 0,
                        verified:      statsData.verified      ?? 0,
                        disputed:      statsData.disputed      ?? 0,
                        pptBalance:    "—",
                        avgFraudScore: 0,
                    });
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [address, page, limit]);

    return { invoices, stats, total, loading, error };
}

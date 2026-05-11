import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useAccount, useProvider, useSigner } from "wagmi";
import { PPTService, PLANS } from "../ppt/pptService";

const PPT_ADDRESS              = process.env.NEXT_PUBLIC_PPT_TOKEN_ADDRESS;
const PAYMENT_CONTROLLER_ADDR  = process.env.NEXT_PUBLIC_PAYMENT_CONTROLLER_ADDRESS;

function buildService(signer) {
    if (!signer || !PPT_ADDRESS || !PAYMENT_CONTROLLER_ADDR) return null;
    return new PPTService(signer, PPT_ADDRESS, PAYMENT_CONTROLLER_ADDR);
}

export function usePPT() {
    const { address, isConnected } = useAccount();
    const { data: signer }         = useSigner();

    const [balance,    setBalance]    = useState(null);
    const [fee,        setFee]        = useState(null);
    const [hasAccess,  setHasAccess]  = useState(false);
    const [preflight,  setPreflight]  = useState(null);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState(null);

    const refresh = useCallback(async () => {
        if (!isConnected || !address || !signer) return;

        const service = buildService(signer);
        if (!service) return;

        setLoading(true);
        setError(null);

        try {
            const [bal, invoiceFee, access, pre] = await Promise.all([
                service.getBalance(address),
                service.getInvoiceFee(),
                service.hasActiveAccess(address),
                service.preflightCheck(address, PAYMENT_CONTROLLER_ADDR),
            ]);

            setBalance(bal);
            setFee(invoiceFee);
            setHasAccess(access);
            setPreflight(pre);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [address, isConnected, signer]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { balance, fee, hasAccess, preflight, loading, error, refresh };
}

export function useSubscribe() {
    const { address, isConnected } = useAccount();
    const { data: signer }         = useSigner();

    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);
    const [txHash,  setTxHash]  = useState(null);

    const subscribe = useCallback(async (plan) => {
        if (!isConnected || !signer) {
            setError("Wallet not connected");
            return;
        }

        const service = buildService(signer);
        if (!service) {
            setError("Contract addresses not configured");
            return;
        }

        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            // Approve PPT for subscription cost before purchasing
            const planFees = {
                [PLANS.BASIC]:      "100",
                [PLANS.PRO]:        "500",
                [PLANS.ENTERPRISE]: "2000",
            };
            const fee = planFees[plan];
            if (!fee) throw new Error(`Unknown plan: ${plan}`);

            await service.approvePPT(PAYMENT_CONTROLLER_ADDR, fee);
            const receipt = await service.purchaseSubscription(plan);
            setTxHash(receipt.transactionHash);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isConnected, signer]);

    return { subscribe, loading, error, txHash };
}

export function useApprovePPT() {
    const { data: signer } = useSigner();

    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState(null);

    const approve = useCallback(async (numInvoices = 1) => {
        const service = buildService(signer);
        if (!service) {
            setError("Contract addresses not configured");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await service.approveForInvoices(PAYMENT_CONTROLLER_ADDR, numInvoices);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [signer]);

    return { approve, loading, error };
}

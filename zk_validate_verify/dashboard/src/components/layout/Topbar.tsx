import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount }    from "wagmi";

export function Topbar() {
    const { address, chain } = useAccount();

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 24px",
            borderBottom: "0.5px solid var(--color-border-secondary, #e5e5e4)",
            background: "var(--color-background-primary, #fff)",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#1D9E75", display: "inline-block",
                }} />
                <span style={{ fontWeight: 600, fontSize: 15 }}>OP Medicine — ZK Billing</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {address && (
                    <span style={{
                        fontSize: 12, fontFamily: "monospace",
                        padding: "4px 10px", borderRadius: 20,
                        border: "0.5px solid var(--color-border-secondary, #e5e5e4)",
                        color: "var(--color-text-secondary, #73726c)",
                    }}>
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                )}
                {chain && (
                    <span style={{
                        fontSize: 11, padding: "4px 10px", borderRadius: 20,
                        background: "#E1F5EE", color: "#085041", fontWeight: 500,
                    }}>
                        {chain.name}
                    </span>
                )}
                <ConnectButton accountStatus="avatar" chainStatus="none" showBalance={false} />
            </div>
        </div>
    );
}

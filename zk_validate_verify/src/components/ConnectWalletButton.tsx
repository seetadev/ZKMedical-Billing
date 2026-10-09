import { Button } from "@mantine/core"
import { disconnect } from "@wagmi/core";
import { useAccount, useConnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { useEffect, useState } from 'react'

export const ConnectWalletButton = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }

  const renderConnectText = () => {
    if (isConnected && address) {
      const start = address.slice(0, 6);
      const end = address.slice(-4);
      return `${start}...${end}`;
    }
    return "Connect Wallet";
  }

  if (!mounted) {
    return null;
  }
  
  return (
    <Button onClick={handleClick}>
      { renderConnectText() }
    </Button>
  )
}
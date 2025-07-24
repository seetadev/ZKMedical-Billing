/**
 * Wallet connection helper functions for better UX
 */

export const checkWalletInstallation = () => {
  const wallets = {
    argentx: {
      installed: !!(window as any).starknet,
      name: "ArgentX",
      downloadUrl:
        "https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb",
    },
    braavos: {
      installed: !!(window as any).starknet_braavos,
      name: "Braavos",
      downloadUrl:
        "https://chrome.google.com/webstore/detail/braavos-smart-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma",
    },
  };

  const anyInstalled = Object.values(wallets).some(
    (wallet) => wallet.installed
  );

  return {
    wallets,
    anyInstalled,
    recommendedWallet: wallets.argentx.installed ? "argentx" : "braavos",
  };
};

export const getWalletConnectionTips = () => {
  return [
    "Make sure your wallet extension is installed and enabled",
    "Unlock your wallet before connecting",
    "Check that you're on a secure (HTTPS) connection",
    "Clear browser cache if you're having persistent issues",
    "Try refreshing the page and connecting again",
    "Ensure you have the latest version of your wallet extension",
    "Some wallet features may not work in incognito/private browsing mode",
  ];
};

export const validateWalletConnection = (
  address: string,
  account: any,
  status: string
) => {
  const issues = [];

  if (!address) {
    issues.push("No wallet address detected");
  }

  if (!account) {
    issues.push("Wallet account not ready - please unlock your wallet");
  }

  if (status !== "connected") {
    issues.push(`Connection status is '${status}' instead of 'connected'`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

export const formatWalletAddress = (
  address: string,
  startLength = 6,
  endLength = 4
) => {
  if (!address) return "";
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const getNetworkInfo = () => {
  // This could be expanded to detect which Starknet network we're connected to
  return {
    name: "Starknet Mainnet",
    chainId: "0x534e5f4d41494e", // SN_MAIN in hex
    isTestnet: false,
  };
};

/**
 * Utility functions for debugging wallet connection issues
 */

export const debugWalletConnection = () => {
  console.log("=== Wallet Debug Info ===");

  // Check for wallet extensions
  const hasArgentX = !!(window as any).starknet;
  const hasBraavos = !!(window as any).starknet_braavos;

  console.log("ArgentX detected:", hasArgentX);
  console.log("Braavos detected:", hasBraavos);

  // Check current domain
  console.log("Current domain:", window.location.origin);
  console.log("Current URL:", window.location.href);

  // Check if we're in a secure context
  console.log("Secure context (HTTPS):", window.isSecureContext);

  // Check localStorage for any wallet data
  const walletData = Object.keys(localStorage).filter(
    (key) =>
      key.includes("wallet") ||
      key.includes("starknet") ||
      key.includes("connect")
  );
  console.log("Wallet-related localStorage keys:", walletData);

  return {
    hasArgentX,
    hasBraavos,
    isSecure: window.isSecureContext,
    domain: window.location.origin,
    walletStorageKeys: walletData,
  };
};

export const clearWalletData = () => {
  console.log("Clearing wallet connection data...");

  // Clear any wallet-related data from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (
      key.includes("wallet") ||
      key.includes("starknet") ||
      key.includes("connect")
    ) {
      localStorage.removeItem(key);
      console.log("Removed:", key);
    }
  });

  // Clear sessionStorage as well
  Object.keys(sessionStorage).forEach((key) => {
    if (
      key.includes("wallet") ||
      key.includes("starknet") ||
      key.includes("connect")
    ) {
      sessionStorage.removeItem(key);
      console.log("Removed from session:", key);
    }
  });

  console.log(
    "Wallet data cleared. Please refresh the page and try connecting again."
  );
};

export const requestWalletPermissions = async () => {
  try {
    console.log("Requesting wallet permissions...");

    // Try to request permissions explicitly
    if ((window as any).starknet) {
      const result = await (window as any).starknet.request({
        type: "wallet_requestAccounts",
      });
      console.log("ArgentX permission result:", result);
      return result;
    }

    if ((window as any).starknet_braavos) {
      const result = await (window as any).starknet_braavos.request({
        type: "wallet_requestAccounts",
      });
      console.log("Braavos permission result:", result);
      return result;
    }

    console.log("No wallet extensions found");
    return null;
  } catch (error) {
    console.error("Error requesting wallet permissions:", error);
    throw error;
  }
};

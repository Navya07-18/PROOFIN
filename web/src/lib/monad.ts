/**
 * Monad Testnet Official Configuration
 * Chain ID: 10143 (0x279f)
 * Authoritative source: MONSKILLS
 */

export const MONAD_TESTNET = {
  chainId: 10143,
  chainIdHex: "0x279f",
  chainName: "Monad Testnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: [
    "https://testnet-rpc.monad.xyz",
  ],
  blockExplorerUrls: [
    "https://testnet.monadscan.com",
  ],
};

export const MONAD_MAINNET = {
  chainId: 143,
  chainIdHex: "0x8f",
  chainName: "Monad Mainnet",
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: [
    "https://rpc.monad.xyz",
  ],
  blockExplorerUrls: [
    "https://monadscan.com",
  ],
};

// Gas guidelines from MONSKILLS:
// Monad charges on gas_limit, not gas_used.
// Setting explicit, accurate gas limits avoids overpaying.
export const MONAD_GAS_LIMITS = {
  NATIVE_TRANSFER: 21000n,
  RESERVE_SPOT: 180000n,
  CHECK_IN: 150000n,
  CREATE_EVENT: 350000n,
  PROCESS_NO_SHOW: 120000n,
};

export function getExplorerTxUrl(txHash: string): string {
  return `${MONAD_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${MONAD_TESTNET.blockExplorerUrls[0]}/address/${address}`;
}

export function shortenAddress(address?: string | null): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function shortenTxHash(txHash?: string | null): string {
  if (!txHash) return "";
  return `${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 6)}`;
}

/**
 * Request MetaMask to switch to Monad Testnet, or add it if not configured.
 */
export async function switchToMonadTestnet(): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask or Ethereum wallet not found.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: MONAD_TESTNET.chainIdHex }],
    });
    return true;
  } catch (switchError: any) {
    // 4902 error code indicates the chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: MONAD_TESTNET.chainIdHex,
              chainName: MONAD_TESTNET.chainName,
              nativeCurrency: MONAD_TESTNET.nativeCurrency,
              rpcUrls: MONAD_TESTNET.rpcUrls,
              blockExplorerUrls: MONAD_TESTNET.blockExplorerUrls,
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add Monad Testnet to wallet:", addError);
        throw addError;
      }
    }
    console.error("Failed to switch to Monad Testnet:", switchError);
    throw switchError;
  }
}

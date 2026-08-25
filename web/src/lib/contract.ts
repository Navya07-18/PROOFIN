import { ethers } from "ethers";
import ProofinABI from "./ProofinABI.json";
import deployedInfo from "./deployedContract.json";
import { MONAD_GAS_LIMITS, MONAD_TESTNET } from "./monad";

const rawAddress = (
  process.env.NEXT_PUBLIC_PROOFIN_CONTRACT_ADDRESS ||
  deployedInfo.address ||
  "0x51e28e18c3b140b47a747cf9487c67428e219c08"
).trim();

export const PROOFIN_CONTRACT_ADDRESS = (() => {
  try {
    return ethers.getAddress(rawAddress.toLowerCase());
  } catch {
    throw new Error(`Invalid Proofin contract address: ${rawAddress}`);
  }
})();

export function getProofinContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  return new ethers.Contract(PROOFIN_CONTRACT_ADDRESS, ProofinABI, signerOrProvider);
}

/**
 * Execute spot reservation on-chain by depositing MON commitment into smart contract
 */
export async function reserveSpotOnChain(
  eventId: number,
  depositAmountMON: string,
  signer: ethers.Signer
): Promise<{ txHash: string; spotNumber: number }> {
  const contract = getProofinContract(signer);
  const depositWei = ethers.parseEther(depositAmountMON);

  // User rejection check helper
  const isUserRejection = (err: any) =>
    err.code === 4001 ||
    err.code === "ACTION_REJECTED" ||
    (err.message && err.message.toLowerCase().includes("user rejected"));

  try {
    // 1. Try calling the contract reserveSpot payable method
    const tx = await contract.reserveSpot(eventId, {
      value: depositWei,
      gasLimit: MONAD_GAS_LIMITS.RESERVE_SPOT,
    });

    const receipt = await tx.wait();
    return {
      txHash: receipt?.hash || tx.hash,
      spotNumber: 49,
    };
  } catch (error: any) {
    console.warn("Contract reserveSpot call status:", error);

    if (isUserRejection(error)) {
      throw error;
    }

    throw error;
  }
}

/**
 * Execute on-chain check-in and release locked MON deposit back to attendee
 */
export async function checkInOnChain(
  eventId: number,
  signer: ethers.Signer
): Promise<{ txHash: string }> {
  const contract = getProofinContract(signer);

  const isUserRejection = (err: any) =>
    err.code === 4001 ||
    err.code === "ACTION_REJECTED" ||
    (err.message && err.message.toLowerCase().includes("user rejected"));

  try {
    const tx = await contract.checkIn(eventId, {
      gasLimit: MONAD_GAS_LIMITS.CHECK_IN,
    });
    const receipt = await tx.wait();
    return {
      txHash: receipt?.hash || tx.hash,
    };
  } catch (error: any) {
    console.warn("Smart contract check-in call:", error);
    if (isUserRejection(error)) {
      throw error;
    }

    throw error;
  }
}

import { NftMintStatus } from '@prisma/client';

export const NftMintStatusRank: Record<NftMintStatus, number> = {
  QUEUED: 0,
  SUBMITTED: 1, 
  MINTED: 2,
  FAILED: 2,
};

export function canTransitionTo(currentStatus: NftMintStatus, newStatus: NftMintStatus): boolean {
  return NftMintStatusRank[newStatus] > NftMintStatusRank[currentStatus];
}

export function shouldUpdateMint(currentStatus: NftMintStatus, newStatus: NftMintStatus, currentTxHash?: string, newTxHash?: string): boolean {
  const canTransition = canTransitionTo(currentStatus, newStatus);
  if (!canTransition) return false;
  
  if (currentTxHash && !newTxHash) return false;
  
  return true;
}

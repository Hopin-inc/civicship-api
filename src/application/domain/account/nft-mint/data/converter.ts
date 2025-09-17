import { Prisma } from "@prisma/client";

export function buildMintCreate(p: {
  policyId: string;
  assetName: string;
  receiver: string;
}): Prisma.NftMintCreateInput {
  return {
    policyId: p.policyId,
    assetName: p.assetName,
    receiver: p.receiver,
    status: "QUEUED",
  };
}

export function buildMarkMinted(p: { txHash: string }): Prisma.NftMintUpdateInput {
  return { status: "MINTED", txHash: p.txHash, error: null };
}

export function buildMarkFailed(p: { error: string }): Prisma.NftMintUpdateInput {
  return { status: "FAILED", error: p.error };
}

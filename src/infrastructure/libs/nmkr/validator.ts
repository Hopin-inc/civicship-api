import { MintAndSendSpecificResponse } from "@/infrastructure/libs/nmkr/type";
import {
  NmkrInsufficientCreditsError,
  NmkrMintingError,
  NmkrTokenUnavailableError,
} from "@/errors/graphql";

export function validateMintResponse(resp: MintAndSendSpecificResponse): boolean {
  if (resp.mintAndSendId <= 0) return false;
  return Boolean(resp.sendedNft?.length);
}

export function createValidationError(
  response: MintAndSendSpecificResponse,
  params: { orderId: string; orderItemId: string },
): NmkrMintingError {
  const reasons: string[] = [];

  if (response.mintAndSendId <= 0) {
    reasons.push(`Invalid mintAndSendId: ${response.mintAndSendId}`);
  }
  if (!response.sendedNft?.length) {
    reasons.push("No NFTs in sendedNft array");
  }

  return new NmkrMintingError(
    `NMKR mint validation failed: ${reasons.join(", ")}`,
    params.orderId,
    params.orderItemId,
  );
}

export function classifyNmkrError(error: unknown, params: { nmkrNftUid?: string; mintId: string }): NmkrMintingError {
  if (error instanceof Error && error.message.includes("404")) {
    return new NmkrTokenUnavailableError(params.nmkrNftUid || "", params.mintId, params.mintId);
  } else if (error instanceof Error && error.message.includes("402")) {
    return new NmkrInsufficientCreditsError(params.mintId, params.mintId);
  }
  return new NmkrMintingError("NMKR minting operation failed", params.mintId, params.mintId);
}

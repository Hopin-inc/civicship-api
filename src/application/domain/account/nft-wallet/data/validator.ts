import { NftMetadataItem } from "@/application/domain/account/nft-wallet/service";

export type NftPayloadValidationResult =
  | { valid: true; count: number; items: NftMetadataItem[] }
  | { valid: false; errors: string[] };

const MAX_ERRORS = 10;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateNftPayload(input: unknown): NftPayloadValidationResult {
  if (!Array.isArray(input)) {
    return { valid: false, errors: ["nfts: expected an array"] };
  }

  const errors: string[] = [];
  const items: NftMetadataItem[] = [];

  for (let i = 0; i < input.length; i++) {
    if (errors.length >= MAX_ERRORS) {
      errors.push(`... truncated at ${MAX_ERRORS} errors`);
      break;
    }

    const raw = input[i];
    if (!isPlainObject(raw)) {
      errors.push(`items[${i}]: expected an object`);
      continue;
    }

    if (typeof raw.id !== "string") {
      errors.push(`items[${i}].id: expected a string`);
      continue;
    }

    if (!isPlainObject(raw.token)) {
      errors.push(`items[${i}].token: expected an object`);
      continue;
    }

    const tokenAddress = raw.token.address;
    const tokenAddressHash = raw.token.address_hash;
    if (typeof tokenAddress !== "string" && typeof tokenAddressHash !== "string") {
      errors.push(`items[${i}].token: missing address or address_hash`);
      continue;
    }

    if (raw.metadata !== null && !isPlainObject(raw.metadata)) {
      errors.push(`items[${i}].metadata: expected an object or null`);
      continue;
    }

    items.push(raw as unknown as NftMetadataItem);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, count: items.length, items };
}

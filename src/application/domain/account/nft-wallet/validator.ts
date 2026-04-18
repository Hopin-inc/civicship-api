import { NftMetadataItem } from "@/application/domain/account/nft-wallet/service";

export type NftPayloadValidationResult =
  | { valid: true; count: number; items: NftMetadataItem[] }
  | { valid: false; errors: string[] };

const MAX_ERRORS = 10;
const MAX_ITEMS = 1000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function validateNftPayload(input: unknown): NftPayloadValidationResult {
  if (!Array.isArray(input)) {
    return { valid: false, errors: ["nfts: expected an array"] };
  }

  if (input.length > MAX_ITEMS) {
    return { valid: false, errors: [`nfts: array too large (max ${MAX_ITEMS})`] };
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

    const rawToken = raw.token;
    if (!isPlainObject(rawToken)) {
      errors.push(`items[${i}].token: expected an object`);
      continue;
    }

    const tokenAddress = toOptionalString(rawToken.address);
    const tokenAddressHash = toOptionalString(rawToken.address_hash);
    if (tokenAddress === undefined && tokenAddressHash === undefined) {
      errors.push(`items[${i}].token: missing address or address_hash`);
      continue;
    }

    const rawMetadata = raw.metadata;
    if (rawMetadata !== null && !isPlainObject(rawMetadata)) {
      errors.push(`items[${i}].metadata: expected an object or null`);
      continue;
    }

    const token: NftMetadataItem["token"] = {
      address: tokenAddress,
      address_hash: tokenAddressHash,
      name: toOptionalString(rawToken.name),
      symbol: toOptionalString(rawToken.symbol),
      type: toOptionalString(rawToken.type),
    };

    const metadata: NftMetadataItem["metadata"] = rawMetadata === null
      ? null
      : {
          name: toOptionalString(rawMetadata.name),
          description: toOptionalString(rawMetadata.description),
          image: toOptionalString(rawMetadata.image),
        };

    items.push({ id: raw.id, token, metadata });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, count: items.length, items };
}

import { NftSyncItem } from "@/application/domain/account/nft-wallet/service";

export type NftPayloadValidationResult =
  | { valid: true; count: number; items: NftSyncItem[] }
  | { valid: false; errors: string[] };

const MAX_ERRORS = 10;
const MAX_ITEMS = 1000;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function validateNftPayload(input: unknown): NftPayloadValidationResult {
  if (!Array.isArray(input)) {
    return { valid: false, errors: ["nfts: expected an array"] };
  }

  if (input.length > MAX_ITEMS) {
    return { valid: false, errors: [`nfts: array too large (max ${MAX_ITEMS})`] };
  }

  const errors: string[] = [];
  const items: NftSyncItem[] = [];

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

    const id = toNonEmptyString(raw.id);
    if (id === undefined) {
      errors.push(`items[${i}].id: expected a non-empty string`);
      continue;
    }

    const rawToken = raw.token;
    if (!isPlainObject(rawToken)) {
      errors.push(`items[${i}].token: expected an object`);
      continue;
    }

    const tokenAddress = toNonEmptyString(rawToken.address);
    if (tokenAddress === undefined) {
      errors.push(`items[${i}].token.address: expected a non-empty string`);
      continue;
    }

    const tokenType = toNonEmptyString(rawToken.type);
    if (tokenType === undefined) {
      errors.push(`items[${i}].token.type: expected a non-empty string`);
      continue;
    }

    const rawMetadataInput = raw.metadata;
    let rawMetadata: Record<string, unknown> | null;
    if (rawMetadataInput === undefined || rawMetadataInput === null) {
      rawMetadata = null;
    } else if (isPlainObject(rawMetadataInput)) {
      rawMetadata = rawMetadataInput;
    } else {
      errors.push(`items[${i}].metadata: expected an object, null, or omitted`);
      continue;
    }

    const token: NftSyncItem["token"] = {
      address: tokenAddress,
      type: tokenType,
      name: toOptionalString(rawToken.name),
      symbol: toOptionalString(rawToken.symbol),
    };

    const metadata: NftSyncItem["metadata"] = rawMetadata === null
      ? null
      : {
          name: toOptionalString(rawMetadata.name),
          description: toOptionalString(rawMetadata.description),
          image: toOptionalString(rawMetadata.image),
        };

    items.push({
      id,
      token,
      metadata,
      rawToken,
      rawMetadata,
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, count: items.length, items };
}

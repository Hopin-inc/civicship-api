/**
 * 値が有効な https URL かどうかを判定する。
 * NFT の imageUrl / iconUrl など、UI で直接描画する URL の検証に使う。
 * `http://` や `ipfs://` は LINE アプリ等で直接描画できないため false。
 */
export function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * EVM アドレス形式 (`0x` + 40 桁 hex)。
 * NOTE: これは EVM チェーン (Base / Polygon / Ethereum) 専用。Cardano 等の
 * 非 EVM チェーンはアドレス形式が異なるため、将来サポートするなら chain を
 * 見て検証・正規化を分岐させる必要がある。
 */
export const EVM_ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

/**
 * EVM アドレスを正準形 (小文字) に正規化する。
 * EVM アドレスは case-insensitive で、全小文字と EIP-55 チェックサム表記が
 * 同一アドレスを指す。保存・検索の前に必ず通し、表記揺れによる重複行・
 * lookup ミスを防ぐ。
 */
export function normalizeEvmAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * NFT 連携 API の各フィールド最大長。実用上の値 + α で abuse 防御。
 * 数値文字列 (uint256) の十進最大は 78 桁、URL は典型的なブラウザ上限の 2048。
 */
export const MAX_LENGTHS = {
  NAME: 256,
  SYMBOL: 32,
  TYPE: 32,
  DESCRIPTION: 4096,
  NUMERIC_STRING: 128,
  URL: 2048,
  INSTANCE_ID: 78,
  WALLET_REF: 128,
} as const;

/**
 * `body` の中で `limits` に書かれた最大長を超えるフィールドを 1 件見つけて
 * エラーメッセージを返す。型チェック (isOptionalString 等) を通過済みの前提。
 * 違反なしなら null。
 */
export function findOversizedField(
  body: Record<string, unknown>,
  limits: Record<string, number>,
): string | null {
  for (const [field, maxLen] of Object.entries(limits)) {
    const value = body[field];
    if (typeof value === "string" && value.length > maxLen) {
      return `${field} must be at most ${maxLen} characters`;
    }
  }
  return null;
}

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

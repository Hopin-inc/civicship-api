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

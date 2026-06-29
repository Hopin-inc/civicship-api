import { NftChain } from "@prisma/client";

/**
 * チェーンごとのブロックエクスプローラー (Etherscan 系) のベース URL。
 * Cardano は NFT の addressing が EVM と異なるため対象外 (URL を導出しない)。
 */
const EXPLORER_BASE: Partial<Record<NftChain, string>> = {
  [NftChain.BASE_SEPOLIA]: "https://sepolia.basescan.org",
  [NftChain.BASE_MAINNET]: "https://basescan.org",
  [NftChain.POLYGON_MAINNET]: "https://polygonscan.com",
  [NftChain.POLYGON_AMOY]: "https://amoy.polygonscan.com",
};

/** コントラクトのエクスプローラー URL。導出できない場合は null。 */
export function tokenExplorerUrl(chain: NftChain | null, address: string): string | null {
  const base = chain ? EXPLORER_BASE[chain] : undefined;
  return base ? `${base}/token/${address}` : null;
}

/** 単一 NFT インスタンスのエクスプローラー URL。導出できない場合は null。 */
export function instanceExplorerUrl(
  chain: NftChain | null,
  tokenAddress: string,
  instanceId: string,
): string | null {
  const base = chain ? EXPLORER_BASE[chain] : undefined;
  return base ? `${base}/nft/${tokenAddress}/${instanceId}` : null;
}

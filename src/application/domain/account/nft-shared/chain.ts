import { NftChain, NftVendor, NftWalletType } from "@prisma/client";

/**
 * NftWallet の chain を type から決定する。
 * - INTERNAL: NMKR custodial = Cardano。dev → CARDANO_PREPROD、prd → CARDANO_MAINNET
 * - EXTERNAL: null。EVM の EOA アドレスは Base / Polygon / Ethereum で同一であり、
 *   wallet 単位で単一チェーンを確定できない。どのチェーンの NFT かは
 *   NftToken / NftInstance 側の chain が持つ。
 */
export function deriveChainForWallet(type: NftWalletType): NftChain | null {
  if (type === NftWalletType.INTERNAL) {
    return isProduction() ? NftChain.CARDANO_MAINNET : NftChain.CARDANO_PREPROD;
  }
  return null;
}

/**
 * 業者ごとに許可するチェーンのホワイトリスト。
 * NftToken の vendor PUT 時に検査する。
 * 増やすときはここに値を足すだけ。
 */
export const VENDOR_ALLOWED_CHAINS: Record<NftVendor, ReadonlyArray<NftChain>> = {
  [NftVendor.BORDERLESS]: [NftChain.BASE_SEPOLIA],
  [NftVendor.KIBOTCHA]: [NftChain.POLYGON_MAINNET, NftChain.POLYGON_AMOY],
};

export function isChainAllowedForVendor(vendor: NftVendor, chain: NftChain): boolean {
  return VENDOR_ALLOWED_CHAINS[vendor].includes(chain);
}

function isProduction(): boolean {
  const env = process.env.ENV ?? process.env.NODE_ENV ?? "";
  return env.toLowerCase() === "prd" || env.toLowerCase() === "production";
}

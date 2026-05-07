import { NftChain, NftVendor, NftWalletType } from "@prisma/client";

/**
 * NftWallet の chain を (type, env) から自動決定する。
 * - EXTERNAL: 常に BASE_SEPOLIA (業者がまだ mainnet 移行できていない)
 * - INTERNAL: dev → CARDANO_PREPROD、prd → CARDANO_MAINNET
 */
export function deriveChainForWallet(type: NftWalletType): NftChain {
  if (type === NftWalletType.INTERNAL) {
    return isProduction() ? NftChain.CARDANO_MAINNET : NftChain.CARDANO_PREPROD;
  }
  return NftChain.BASE_SEPOLIA;
}

/**
 * 業者ごとに許可するチェーンのホワイトリスト。
 * NftToken の vendor PUT 時に検査する。
 * 増やすときはここに値を足すだけ。
 */
export const VENDOR_ALLOWED_CHAINS: Record<NftVendor, ReadonlyArray<NftChain>> = {
  [NftVendor.BORDERLESS]: [NftChain.BASE_SEPOLIA],
  [NftVendor.KIBOTCHA]: [NftChain.BASE_SEPOLIA],
};

export function isChainAllowedForVendor(vendor: NftVendor, chain: NftChain): boolean {
  return VENDOR_ALLOWED_CHAINS[vendor].includes(chain);
}

function isProduction(): boolean {
  const env = process.env.ENV ?? process.env.NODE_ENV ?? "";
  return env.toLowerCase() === "prd" || env.toLowerCase() === "production";
}

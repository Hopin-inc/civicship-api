-- AlterEnum
-- NftChain に Polygon (mainnet / Amoy testnet) を追加。
ALTER TYPE "NftChain" ADD VALUE 'POLYGON_MAINNET';
ALTER TYPE "NftChain" ADD VALUE 'POLYGON_AMOY';

-- EXTERNAL wallet の chain を NULL に揃える。
-- EVM の EOA アドレスは Base / Polygon / Ethereum で同一であり、wallet 単位で
-- 単一チェーンを確定できない (どのチェーンの NFT かは NftToken / NftInstance 側の
-- chain が持つ)。20260507010249_add_nft_chain で EXTERNAL を一律 BASE_SEPOLIA に
-- backfill していたが、Polygon 業者 (KIBOTCHA) の登場で実態と食い違うため NULL に戻す。
UPDATE "t_nft_wallets" SET "chain" = NULL WHERE "type" = 'EXTERNAL';

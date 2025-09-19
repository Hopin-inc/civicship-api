import {
  BlockfrostProvider,
  MeshWallet,
  Transaction,
  ForgeScript,
  resolveScriptHash,
  stringToHex,
} from "@meshsdk/core";
import type { Mint } from "@meshsdk/core";

export type NumericLabel = `${number}`;
export type Network = "preprod" | "mainnet";

export type MeshClientConfig = { network: Network; blockfrostProjectId: string } & (
  | { key: { type: "mnemonic"; words: string[] } }
  | { key: { type: "root"; bech32: string } }
  | { key: { type: "cli"; payment: string; stake?: string } }
);

export type MintOneInput = Readonly<{
  receiverAddress: string;
  assetName: string; // UTF-8（内部でHex化してassetUnit生成）
  metadata?: Record<string, unknown>;
  label?: string; // 既定: "721"
  awaitConfirmation?: boolean; // 既定: false
  confirmationTimeoutMs?: number; // 既定: 120_000
}>;

export type MintOneOutput = Readonly<{
  txHash: string;
  policyId: string;
  assetUnit: string; // policyId + assetName(hex)
}>;

export interface IMeshClient {
  mintOne(input: MintOneInput): Promise<MintOneOutput>;
}

export class MeshClient implements IMeshClient {
  private readonly provider: BlockfrostProvider;
  private readonly wallet: MeshWallet;

  constructor(cfg: MeshClientConfig) {
    this.provider = new BlockfrostProvider(cfg.blockfrostProjectId);
    this.wallet = new MeshWallet({
      networkId: cfg.network === "mainnet" ? 1 : 0,
      fetcher: this.provider,
      submitter: this.provider,
      key: cfg.key,
    });
  }

  async mintOne(input: MintOneInput): Promise<MintOneOutput> {
    await this.wallet.init();

    const { label, metadata } = this.normalize(input);
    const changeAddress = await this.wallet.getChangeAddress();

    const script = ForgeScript.withOneSignature(changeAddress);
    const policyId = resolveScriptHash(script);
    const assetUnit = this.buildAssetUnit(policyId, input.assetName);

    const mint: Mint = {
      assetName: input.assetName,
      assetQuantity: "1",
      label,
      recipient: input.receiverAddress,
      metadata,
    };

    const unsigned = await this.buildMintTx(this.wallet, script, mint);
    const signed = await this.wallet.signTx(unsigned, false);
    const txHash = await this.wallet.submitTx(signed);

    if (input.awaitConfirmation) {
      await this.waitForConfirmation(txHash, input.confirmationTimeoutMs);
    }

    return { txHash, policyId, assetUnit };
  }

  // ---------- helpers ----------
  private normalize(input: MintOneInput) {
    const label: NumericLabel = toNumericLabel(input.label, "721");
    const metadata = input.metadata ?? {};
    return { label, metadata };
  }

  private buildAssetUnit(policyId: string, assetNameUtf8: string) {
    return policyId + stringToHex(assetNameUtf8);
  }

  private async buildMintTx(wallet: MeshWallet, script: string, mint: Mint) {
    const tx = new Transaction({ initiator: wallet });
    tx.mintAsset(script, mint);
    return tx.build();
  }

  private async waitForConfirmation(txHash: string, timeoutMs = 120_000) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`onTxConfirmed timeout after ${timeoutMs}ms`)),
        timeoutMs,
      );
      this.provider.onTxConfirmed(txHash, () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
}

function toNumericLabel(value: unknown, fallback: NumericLabel = "721"): NumericLabel {
  const s = String(value ?? "");
  return /^\d+$/.test(s) ? (s as NumericLabel) : fallback;
}

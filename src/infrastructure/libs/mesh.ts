import { injectable } from "tsyringe";
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

export type MintOneInput = Readonly<{
  receiverAddress: string;
  assetName: string;
  metadata?: Record<string, unknown>;
  label?: string;
  network?: Network;
  // ★ 追加: 送信後に L1 確定を待つ（Blockfrost の onTxConfirmed）
  awaitConfirmation?: boolean;
  confirmationTimeoutMs?: number; // 例: 120_000
}>;

export type MintOneOutput = Readonly<{
  txHash: string;
  // ★ 追加: 後続のDB格納/照合に便利
  policyId: string;
  assetUnit: string; // policyId + assetName(hex)
}>;

export interface IMeshClient {
  mintOne(input: MintOneInput): Promise<MintOneOutput>;
}

@injectable()
export class MeshClient implements IMeshClient {
  private providers = new Map<Network, BlockfrostProvider>();
  private wallets = new Map<Network, MeshWallet>();

  private provider(network: Network) {
    let p = this.providers.get(network);
    if (!p) {
      p = new BlockfrostProvider(process.env.BLOCKFROST_KEY!);
      this.providers.set(network, p);
    }
    return p;
  }

  private async wallet(network: Network) {
    let w = this.wallets.get(network);
    if (w) return w;

    const provider = this.provider(network);
    const networkId = network === "mainnet" ? 1 : 0;

    if (process.env.ENV === "LOCAL") {
      w = new MeshWallet({
        networkId,
        fetcher: provider,
        submitter: provider,
        key: { type: "address", address: process.env.LOCAL_TEST_ADDRESS ?? "addr_test1..." },
      });
      await w.init();
      this.wallets.set(network, w);
      return w;
    }

    w = new MeshWallet({
      networkId,
      fetcher: provider,
      submitter: provider,
      key: this.loadIssuerKey(),
    });
    await w.init();
    this.wallets.set(network, w);
    return w;
  }

  private loadIssuerKey():
    | { type: "mnemonic"; words: string[] }
    | { type: "root"; bech32: string }
    | { type: "cli"; payment: string; stake?: string } {
    if (process.env.ISSUER_MNEMONIC) {
      return { type: "mnemonic", words: process.env.ISSUER_MNEMONIC.split(" ") };
    }
    if (process.env.ISSUER_XPRV) {
      return { type: "root", bech32: process.env.ISSUER_XPRV };
    }
    if (process.env.ISSUER_CLI_PAYMENT) {
      return {
        type: "cli",
        payment: process.env.ISSUER_CLI_PAYMENT!,
        stake: process.env.ISSUER_CLI_STAKE,
      };
    }
    throw new Error("Issuer key not configured");
  }

  async mintOne(input: MintOneInput): Promise<MintOneOutput> {
    const network: Network = input.network ?? "preprod";
    const label: NumericLabel = toNumericLabel(input.label, "721");
    const wallet = await this.wallet(network);
    const provider = this.provider(network);

    const changeAddress = await wallet.getChangeAddress();
    const forgingScript = ForgeScript.withOneSignature(changeAddress);
    const policyId = resolveScriptHash(forgingScript); // ★ 追加
    const assetNameHex = stringToHex(input.assetName); // ★ 追加
    const assetUnit = policyId + assetNameHex; // ★ 追加

    // LOCAL は build/sign/submit をスキップして即返却
    if (process.env.ENV === "LOCAL") {
      return { txHash: "LOCAL_DUMMY_TX_HASH", policyId, assetUnit };
    }

    const mint: Mint = {
      assetName: input.assetName,
      assetQuantity: "1",
      label,
      recipient: input.receiverAddress,
      metadata: input.metadata ?? {},
    };

    const tx = new Transaction({ initiator: wallet });
    tx.mintAsset(forgingScript, mint);

    const unsigned = await tx.build();
    const signed = await wallet.signTx(unsigned, false);
    const txHash = await wallet.submitTx(signed);

    // ★ 任意: 確定待ち（onTxConfirmed）
    if (input.awaitConfirmation) {
      const timeoutMs = input.confirmationTimeoutMs ?? 120_000;

      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`onTxConfirmed timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        // BlockfrostProvider の onTxConfirmed は (hash, cb) 形式
        provider.onTxConfirmed(txHash, () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }

    return { txHash, policyId, assetUnit };
  }
}

function toNumericLabel(value: unknown, fallback: NumericLabel = "721"): NumericLabel {
  const s = String(value ?? "");
  return /^\d+$/.test(s) ? (s as NumericLabel) : fallback;
}

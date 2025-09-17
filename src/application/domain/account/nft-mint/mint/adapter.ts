export type MintOneInput = Readonly<{
  policyId: string;
  assetName: string;
  receiver: string;
  metadata?: unknown; // P2でCIP-721予定
}>;
export type MintOneOutput = Readonly<{ txHash: string }>;

export interface IMintAdapter {
  mintOne(input: MintOneInput): Promise<MintOneOutput>;
}

export class MockMintAdapter implements IMintAdapter {
  async mintOne(): Promise<MintOneOutput> {
    return { txHash: "DUMMY_TX_HASH" };
  }
}

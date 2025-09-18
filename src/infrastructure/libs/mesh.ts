import { injectable } from "tsyringe";
import logger from "@/infrastructure/logging";

export type MintOneInput = Readonly<{
  metadata?: unknown;
}>;

export type MintOneOutput = Readonly<{ txHash: string }>;

@injectable()
export class MeshClient {
  async mintOne(input: MintOneInput): Promise<MintOneOutput> {
    logger.debug("[MeshClient] Mock mint request", { input });

    const mockTxHash = "DUMMY_TX_HASH";

    logger.debug("[MeshClient] Mock mint response", { txHash: mockTxHash });
    return { txHash: mockTxHash };
  }
}

import { inject, injectable } from "tsyringe";
import { MeshClient } from "@/infrastructure/libs/mesh";
import { IMintAdapter } from "./adapter";
import type { MintOneInput, MintOneOutput } from "@/infrastructure/libs/mesh";

@injectable()
export class MeshMintAdapter implements IMintAdapter {
  constructor(@inject("MeshClient") private readonly meshClient: MeshClient) {}

  async mintOne(input: MintOneInput): Promise<MintOneOutput> {
    return this.meshClient.mintOne(input);
  }
}

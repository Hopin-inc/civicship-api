import { MintOneInput, MintOneOutput } from "@/infrastructure/libs/mesh";

export interface IMintAdapter {
  mintOne(input: MintOneInput): Promise<MintOneOutput>;
}

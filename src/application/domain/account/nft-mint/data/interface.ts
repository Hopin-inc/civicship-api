import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { NftMintBase } from "./type";

export interface INftMintRepository {
  create(ctx: IContext, data: Prisma.NftMintCreateInput, tx: Prisma.TransactionClient): Promise<NftMintBase>;
  update(ctx: IContext, id: string, data: Prisma.NftMintUpdateInput, tx: Prisma.TransactionClient): Promise<NftMintBase>;
  find(ctx: IContext, id: string): Promise<NftMintBase | null>;
  countByPolicy(ctx: IContext, policyId: string): Promise<number>;
}

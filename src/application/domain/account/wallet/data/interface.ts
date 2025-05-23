import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaWallet, PrismaWalletDetail } from "@/application/domain/account/wallet/data/type";

export interface IWalletRepository {
  query(
    ctx: IContext,
    where: Prisma.WalletWhereInput,
    orderBy: Prisma.WalletOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ): Promise<PrismaWalletDetail[]>;

  find(ctx: IContext, id: string): Promise<PrismaWallet | null>;

  findCommunityWallet(ctx: IContext, communityId: string): Promise<PrismaWalletDetail | null>;

  findFirstExistingMemberWallet(
    ctx: IContext,
    communityId: string,
    userId: string,
  ): Promise<PrismaWallet | null>;

  create(
    ctx: IContext,
    data: Prisma.WalletCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaWallet>;

  delete(ctx: IContext, id: string, tx: Prisma.TransactionClient): Promise<PrismaWalletDetail>;
}

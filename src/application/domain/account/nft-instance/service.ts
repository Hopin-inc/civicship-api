import { NotFoundError } from "@/errors/graphql";
import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import NftInstanceConverter from "@/application/domain/account/nft-instance/data/converter";
import NftInstancePresenter from "@/application/domain/account/nft-instance/presenter";
import { clampFirst } from "@/application/domain/utils";
import { NftInstanceStatus, Prisma } from "@prisma/client";

@injectable()
export default class NftInstanceService {
  constructor(
    @inject("NftInstanceRepository") private readonly repository: INftInstanceRepository,
    @inject("NftInstanceConverter") private readonly converter: NftInstanceConverter,
  ) {}

  async fetchNftInstances(
    filter: GqlNftInstanceFilterInput | undefined,
    sort: GqlNftInstanceSortInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number,
  ) {
    const where = this.converter.filter(filter);
    const orderBy = this.converter.sort(sort);
    const take = clampFirst(first);

    const [nftInstances, totalCount] = await Promise.all([
      this.repository.query(ctx, where, orderBy, take + 1, cursor),
      this.repository.count(ctx, where),
    ]);

    const hasNextPage = nftInstances.length > take;
    const nftInstanceNodes = nftInstances
      .slice(0, take)
      .map((nftInstance) => NftInstancePresenter.get(nftInstance));
    const endCursor =
      nftInstanceNodes.length > 0 ? nftInstanceNodes[nftInstanceNodes.length - 1].id : undefined;

    return NftInstancePresenter.query(nftInstanceNodes, hasNextPage, totalCount, endCursor);
  }

  async getNftInstance(id: string, ctx: IContext) {
    const nftInstance = await this.repository.findById(ctx, id);
    if (!nftInstance) {
      throw new NotFoundError("NftInstance", { id });
    }
    return NftInstancePresenter.get(nftInstance);
  }

  async markAsMinting(
    ctx: IContext,
    nftInstanceId: string,
    mintId: string,
    walletId: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftInstance.update({
      where: { id: nftInstanceId },
      data: {
        nftMintId: mintId,
        nftWalletId: walletId,
        status: NftInstanceStatus.MINTING,
      },
    });
  }

  async findReservedInstancesForProduct(
    ctx: IContext,
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ) {
    return tx.nftInstance.findMany({
      where: {
        productId,
        status: NftInstanceStatus.RESERVED,
        communityId: ctx.communityId,
      },
      take: quantity,
      orderBy: { sequenceNum: "asc" },
    });
  }

  async releaseReservations(
    ctx: IContext,
    instanceIds: string[],
    tx: Prisma.TransactionClient,
  ) {
    for (const instanceId of instanceIds) {
      await this.repository.releaseReservation(ctx, instanceId, tx);
    }
  }

  async findInstanceById(
    ctx: IContext,
    instanceId: string,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.nftInstance.findFirst({
        where: { id: instanceId },
        select: { id: true },
      });
    }
    return ctx.issuer.public(ctx, (prisma) =>
      prisma.nftInstance.findFirst({
        where: { id: instanceId },
        select: { id: true },
      }),
    );
  }
}

import { NotFoundError } from "@/errors/graphql";
import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import NftInstanceConverter from "@/application/domain/account/nft-instance/data/converter";
import NftInstancePresenter from "@/application/domain/account/nft-instance/presenter";
import { clampFirst } from "@/application/domain/utils";
import { Prisma } from "@prisma/client";
import logger from "@/infrastructure/logging";

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
    const nftInstanceNodes = nftInstances.slice(0, take);

    return NftInstancePresenter.query(nftInstanceNodes, hasNextPage, totalCount, cursor);
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
    return this.repository.markAsMinting(ctx, nftInstanceId, mintId, walletId, tx);
  }

  async findReservedInstancesForProduct(
    ctx: IContext,
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient,
  ) {
    return this.repository.findReservedByProduct(ctx, productId, quantity, tx);
  }

  async releaseReservations(ctx: IContext, instanceIds: string[], tx: Prisma.TransactionClient) {
    for (const instanceId of instanceIds) {
      await this.repository.releaseReservation(ctx, instanceId, tx);
      logger.debug("[NftInstanceRepository] Released NFT instance reservation", {
        instanceId,
      });
    }
  }

  async findInstanceById(ctx: IContext, instanceId: string, tx?: Prisma.TransactionClient) {
    return this.repository.findByIdWithTransaction(ctx, instanceId, tx);
  }
}

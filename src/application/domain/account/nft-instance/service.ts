import { NotFoundError } from "@/errors/graphql";
import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import NftTokenRepository from "@/application/domain/account/nft-token/data/repository";
import NFTWalletRepository from "@/application/domain/account/nft-wallet/data/repository";
import NftInstanceConverter from "@/application/domain/account/nft-instance/data/converter";
import NftInstancePresenter from "@/application/domain/account/nft-instance/presenter";
import { clampFirst } from "@/application/domain/utils";
import { Prisma } from "@prisma/client";
import logger from "@/infrastructure/logging";

export type UpsertInstanceInput = {
  ownerWalletAddress: string;
  name?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  metadata?: Record<string, unknown>;
};

@injectable()
export default class NftInstanceService {
  constructor(
    @inject("NftInstanceRepository") private readonly repository: INftInstanceRepository,
    @inject("NftInstanceConverter") private readonly converter: NftInstanceConverter,
    @inject("NftTokenRepository") private readonly nftTokenRepository: NftTokenRepository,
    @inject("NFTWalletRepository") private readonly nftWalletRepository: NFTWalletRepository,
  ) {}

  async findTokenByAddress(ctx: IContext, tokenAddress: string) {
    const nftToken = await this.nftTokenRepository.findByAddress(ctx, tokenAddress);
    if (!nftToken) {
      throw new NotFoundError("NftToken", { address: tokenAddress });
    }
    return nftToken;
  }

  async findWalletByAddress(ctx: IContext, ownerAddress: string) {
    const nftWallet = await this.nftWalletRepository.findByWalletAddress(ctx, ownerAddress);
    if (!nftWallet) {
      throw new NotFoundError("NftWallet", { walletAddress: ownerAddress });
    }
    return nftWallet;
  }

  async findByTokenAddressAndInstanceId(
    ctx: IContext,
    tokenAddress: string,
    instanceId: string,
  ) {
    return this.repository.findByTokenAddressAndInstanceId(ctx, tokenAddress, instanceId);
  }

  async listByTokenAddress(
    ctx: IContext,
    tokenAddress: string,
    limit: number,
    cursor?: string,
  ) {
    return this.repository.findManyByTokenAddress(ctx, tokenAddress, limit, cursor);
  }

  async upsertInstance(
    ctx: IContext,
    params: {
      tokenAddress: string;
      instanceId: string;
      input: UpsertInstanceInput;
      nftToken: { id: string; communityId: string | null };
      nftWallet: { id: string };
    },
    tx: Prisma.TransactionClient,
  ) {
    const { tokenAddress, instanceId, input, nftToken, nftWallet } = params;

    const result = await this.repository.upsert(
      ctx,
      {
        instanceId,
        name: input.name ?? null,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        json: input as unknown as Record<string, unknown>,
        nftWalletId: nftWallet.id,
        nftTokenId: nftToken.id,
        communityId: nftToken.communityId,
      },
      nftToken.id,
      tx,
    );

    logger.debug("✅ NFT instance upserted", {
      tokenAddress,
      instanceId,
      nftWalletId: nftWallet.id,
    });

    return { id: result.id, instanceId, tokenAddress, nftTokenId: nftToken.id };
  }

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

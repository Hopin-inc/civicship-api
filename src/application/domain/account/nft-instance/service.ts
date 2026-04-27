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
import { fetchWithRetry } from "@/utils/retry";
import { BaseSepoliaTokenInstanceResponse } from "@/types/external/baseSepolia";

const INSTANCE_SYNC_MAX_RETRIES = 3;
const INSTANCE_SYNC_RETRY_DELAY = 1000;
const INSTANCE_SYNC_TIMEOUT = 60000;

@injectable()
export default class NftInstanceService {
  constructor(
    @inject("NftInstanceRepository") private readonly repository: INftInstanceRepository,
    @inject("NftInstanceConverter") private readonly converter: NftInstanceConverter,
    @inject("NftTokenRepository") private readonly nftTokenRepository: NftTokenRepository,
    @inject("NFTWalletRepository") private readonly nftWalletRepository: NFTWalletRepository,
  ) {}

  async syncByTokenAddressAndInstanceId(
    ctx: IContext,
    tokenAddress: string,
    instanceId: string,
    tx: Prisma.TransactionClient,
  ) {
    const nftToken = await this.nftTokenRepository.findByAddress(ctx, tokenAddress, tx);
    if (!nftToken) {
      throw new NotFoundError("NftToken", { address: tokenAddress });
    }

    const baseApiUrl =
      process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
    const instanceInfo = await fetchWithRetry<BaseSepoliaTokenInstanceResponse>(
      `${baseApiUrl}/tokens/${tokenAddress}/instances/${instanceId}`,
      INSTANCE_SYNC_MAX_RETRIES,
      INSTANCE_SYNC_RETRY_DELAY,
      INSTANCE_SYNC_TIMEOUT,
    );

    const ownerAddress = instanceInfo.owner?.hash;
    if (!ownerAddress) {
      throw new NotFoundError("NftInstanceOwner", { tokenAddress, instanceId });
    }

    const nftWallet = await this.nftWalletRepository.findByWalletAddress(ctx, ownerAddress);
    if (!nftWallet) {
      throw new NotFoundError("NftWallet", { walletAddress: ownerAddress });
    }

    const result = await this.repository.upsert(
      ctx,
      {
        instanceId,
        name: instanceInfo.metadata?.name ?? null,
        description: instanceInfo.metadata?.description ?? null,
        imageUrl: instanceInfo.metadata?.image ?? null,
        json: instanceInfo as unknown as Record<string, unknown>,
        nftWalletId: nftWallet.id,
        nftTokenId: nftToken.id,
        communityId: null,
      },
      nftToken.id,
      tx,
    );

    logger.debug("✅ NFT instance synced", {
      tokenAddress,
      instanceId,
      walletAddress: ownerAddress,
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

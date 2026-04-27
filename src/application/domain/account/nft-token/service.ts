import { NotFoundError } from "@/errors/graphql";
import { GqlNftTokenFilterInput, GqlNftTokenSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { INftTokenRepository } from "@/application/domain/account/nft-token/data/interface";
import NftTokenConverter from "@/application/domain/account/nft-token/data/converter";
import NftTokenPresenter from "@/application/domain/account/nft-token/presenter";
import { clampFirst } from "@/application/domain/utils";
import { fetchWithRetry } from "@/utils/retry";
import { BaseSepoliaTokenResponse } from "@/types/external/baseSepolia";

const TOKEN_SYNC_MAX_RETRIES = 3;
const TOKEN_SYNC_RETRY_DELAY = 1000;
const TOKEN_SYNC_TIMEOUT = 60000;

@injectable()
export default class NftTokenService {
  constructor(
    @inject("NftTokenRepository") private readonly repository: INftTokenRepository,
    @inject("NftTokenConverter") private readonly converter: NftTokenConverter,
  ) {}

  async syncByAddress(ctx: IContext, address: string, tx: Prisma.TransactionClient) {
    const baseApiUrl =
      process.env.BASE_SEPOLIA_API_URL || "https://base-sepolia.blockscout.com/api/v2";
    const tokenInfo = await fetchWithRetry<BaseSepoliaTokenResponse>(
      `${baseApiUrl}/tokens/${address}`,
      TOKEN_SYNC_MAX_RETRIES,
      TOKEN_SYNC_RETRY_DELAY,
      TOKEN_SYNC_TIMEOUT,
    );

    return this.repository.upsert(
      ctx,
      {
        address,
        name: tokenInfo.name ?? null,
        symbol: tokenInfo.symbol ?? null,
        type: tokenInfo.type || "UNKNOWN",
        json: tokenInfo as unknown as Record<string, unknown>,
      },
      tx,
    );
  }

  async fetchNftTokens(
    filter: GqlNftTokenFilterInput | undefined,
    sort: GqlNftTokenSortInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number,
  ) {
    const where = this.converter.filter(filter);
    const orderBy = this.converter.sort(sort);
    const take = clampFirst(first);

    const [nftTokens, totalCount] = await Promise.all([
      this.repository.query(ctx, where, orderBy, take + 1, cursor),
      this.repository.count(ctx, where),
    ]);

    const hasNextPage = nftTokens.length > take;
    const nodes = nftTokens.slice(0, take);

    return NftTokenPresenter.query(nodes, hasNextPage, totalCount, cursor);
  }

  async getNftToken(id: string, ctx: IContext) {
    const nftToken = await this.repository.findById(ctx, id);
    if (!nftToken) {
      throw new NotFoundError("NftToken", { id });
    }
    return NftTokenPresenter.get(nftToken);
  }
}

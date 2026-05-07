import { AuthorizationError, NotFoundError, ValidationError } from "@/errors/graphql";
import { GqlNftTokenFilterInput, GqlNftTokenSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { NftChain, NftVendor, Prisma } from "@prisma/client";
import { inject, injectable } from "tsyringe";
import { INftTokenRepository } from "@/application/domain/account/nft-token/data/interface";
import NftTokenConverter from "@/application/domain/account/nft-token/data/converter";
import NftTokenPresenter from "@/application/domain/account/nft-token/presenter";
import { clampFirst } from "@/application/domain/utils";
import { isChainAllowedForVendor } from "@/application/domain/account/nft-shared/chain";

export type UpsertTokenInput = {
  type: string;
  chain: NftChain;
  name?: string | null;
  symbol?: string | null;
  decimals?: string;
  totalSupply?: string;
  holders?: string;
  exchangeRate?: string;
  circulatingMarketCap?: string;
  iconUrl?: string;
  metadata?: Record<string, unknown>;
};

@injectable()
export default class NftTokenService {
  constructor(
    @inject("NftTokenRepository") private readonly repository: INftTokenRepository,
    @inject("NftTokenConverter") private readonly converter: NftTokenConverter,
  ) {}

  async findByAddress(ctx: IContext, address: string) {
    return this.repository.findByAddress(ctx, address);
  }

  async upsertToken(
    ctx: IContext,
    address: string,
    input: UpsertTokenInput,
    vendor: NftVendor,
    tx: Prisma.TransactionClient,
  ) {
    if (!isChainAllowedForVendor(vendor, input.chain)) {
      throw new ValidationError(
        `Chain ${input.chain} is not allowed for vendor ${vendor}`,
      );
    }

    const existing = await this.repository.findByAddress(ctx, address, tx);
    if (existing && existing.issuedByVendor && existing.issuedByVendor !== vendor) {
      throw new AuthorizationError(
        `NftToken (address: ${address}) is issued by another vendor`,
      );
    }
    if (existing && existing.chain && existing.chain !== input.chain) {
      throw new ValidationError(
        `NftToken (address: ${address}) is already registered on ${existing.chain}, cannot change to ${input.chain}`,
      );
    }

    return this.repository.upsert(
      ctx,
      {
        address,
        name: input.name ?? null,
        symbol: input.symbol ?? null,
        type: input.type,
        json: input as unknown as Record<string, unknown>,
        issuedByVendor: vendor,
        chain: input.chain,
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

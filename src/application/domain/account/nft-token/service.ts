import { NotFoundError } from "@/errors/graphql";
import { GqlNftTokenFilterInput, GqlNftTokenSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import { INftTokenRepository } from "@/application/domain/account/nft-token/data/interface";
import NftTokenConverter from "@/application/domain/account/nft-token/data/converter";
import NftTokenPresenter from "@/application/domain/account/nft-token/presenter";
import { clampFirst } from "@/application/domain/utils";

@injectable()
export default class NftTokenService {
  constructor(
    @inject("NftTokenRepository") private readonly repository: INftTokenRepository,
    @inject("NftTokenConverter") private readonly converter: NftTokenConverter,
  ) {}

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

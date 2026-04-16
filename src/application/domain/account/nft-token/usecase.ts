import { injectable, inject } from "tsyringe";
import { GqlNftTokenFilterInput, GqlNftTokenSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import NftTokenService from "@/application/domain/account/nft-token/service";

@injectable()
export default class NftTokenUseCase {
  constructor(@inject("NftTokenService") private readonly service: NftTokenService) {}

  async getNftTokens(
    filter: GqlNftTokenFilterInput | undefined,
    sort: GqlNftTokenSortInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number,
  ) {
    return this.service.fetchNftTokens(filter, sort, ctx, cursor, first);
  }

  async getNftToken(id: string, ctx: IContext) {
    return this.service.getNftToken(id, ctx);
  }
}

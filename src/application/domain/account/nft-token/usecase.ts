import { injectable, inject } from "tsyringe";
import { GqlNftTokenFilterInput, GqlNftTokenSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NftTokenService from "@/application/domain/account/nft-token/service";

export type SyncNftTokenResult = {
  id: string;
  address: string;
};

@injectable()
export default class NftTokenUseCase {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
    @inject("NftTokenService") private readonly service: NftTokenService,
  ) {}

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

  async syncByAddress(ctx: IContext, address: string): Promise<SyncNftTokenResult> {
    const result = await this.issuer.internal((tx) =>
      this.service.syncByAddress(ctx, address, tx),
    );
    return { id: result.id, address: result.address };
  }
}

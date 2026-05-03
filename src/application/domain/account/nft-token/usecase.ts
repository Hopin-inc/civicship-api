import { injectable, inject } from "tsyringe";
import { GqlNftTokenFilterInput, GqlNftTokenSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NftTokenService, {
  UpsertTokenInput,
} from "@/application/domain/account/nft-token/service";

export type UpsertNftTokenResult = {
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

  async getByAddress(ctx: IContext, address: string) {
    return this.service.findByAddress(ctx, address);
  }

  async upsertByAddress(
    ctx: IContext,
    address: string,
    input: UpsertTokenInput,
  ): Promise<UpsertNftTokenResult> {
    const result = await this.issuer.internal((tx) =>
      this.service.upsertToken(ctx, address, input, tx),
    );
    return { id: result.id, address: result.address };
  }
}

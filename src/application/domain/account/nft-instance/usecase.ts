import { injectable, inject } from "tsyringe";
import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import NftInstanceService from "@/application/domain/account/nft-instance/service";

export type SyncNftInstanceResult = {
  id: string;
  instanceId: string;
  tokenAddress: string;
  nftTokenId: string;
};

@injectable()
export default class NftInstanceUseCase {
  constructor(
    @inject("PrismaClientIssuer") private readonly issuer: PrismaClientIssuer,
    @inject("NftInstanceService") private readonly service: NftInstanceService,
  ) {}

  async getNftInstances(
    filter: GqlNftInstanceFilterInput | undefined,
    sort: GqlNftInstanceSortInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number
  ) {
    return this.service.fetchNftInstances(filter, sort, ctx, cursor, first);
  }

  async getNftInstance(id: string, ctx: IContext) {
    return this.service.getNftInstance(id, ctx);
  }

  async syncByTokenAddressAndInstanceId(
    ctx: IContext,
    tokenAddress: string,
    instanceId: string,
  ): Promise<SyncNftInstanceResult> {
    return this.issuer.internal((tx) =>
      this.service.syncByTokenAddressAndInstanceId(ctx, tokenAddress, instanceId, tx),
    );
  }
}

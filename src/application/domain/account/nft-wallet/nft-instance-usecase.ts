import { injectable, inject } from "tsyringe";
import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import NftInstanceService from "@/application/domain/account/nft-wallet/nft-instance-service";

@injectable()
export default class NftInstanceUseCase {
  constructor(@inject("NftInstanceService") private readonly service: NftInstanceService) {}

  async getNftInstances(
    filter: GqlNftInstanceFilterInput | undefined,
    sort: GqlNftInstanceSortInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number
  ) {
    return this.service.getNftInstances(filter, sort, ctx, cursor, first);
  }

  async getNftInstance(id: string, ctx: IContext) {
    return this.service.getNftInstance(id, ctx);
  }
}

import { NotFoundError } from "@/errors/graphql";
import { GqlNftInstanceFilterInput, GqlNftInstanceSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import NftInstanceConverter from "@/application/domain/account/nft-instance/data/converter";
import NftInstancePresenter from "@/application/domain/account/nft-instance/presenter";
import { clampFirst } from "@/application/domain/utils";

@injectable()
export default class NftInstanceService {
  constructor(
    @inject("NftInstanceRepository") private readonly repository: INftInstanceRepository,
    @inject("NftInstanceConverter") private readonly converter: NftInstanceConverter,
  ) {}

  async getNftInstances(
    filter: GqlNftInstanceFilterInput | undefined,
    sort: GqlNftInstanceSortInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number
  ) {
    const where = this.converter.nftInstancesFilter(filter);
    const orderBy = this.converter.nftInstancesSort(sort);
    const take = clampFirst(first);
    
    const [nftInstances, totalCount] = await Promise.all([
      this.repository.findNftInstances(ctx, where, orderBy, take + 1, cursor),
      this.repository.countNftInstances(ctx, where)
    ]);
    
    const hasNextPage = nftInstances.length > take;
    const nftInstanceNodes = nftInstances.slice(0, take).map((nftInstance) => 
      NftInstancePresenter.toGraphQL(nftInstance)
    );
    const endCursor = nftInstanceNodes.length > 0 ? nftInstanceNodes[nftInstanceNodes.length - 1].id : undefined;
    
    return NftInstancePresenter.nftInstancesQuery(nftInstanceNodes, hasNextPage, totalCount, endCursor);
  }

  async getNftInstance(id: string, ctx: IContext) {
    const nftInstance = await this.repository.findNftInstanceById(ctx, id);
    if (!nftInstance) {
      throw new NotFoundError("NftInstance", { id });
    }
    return NftInstancePresenter.toGraphQL(nftInstance);
  }
}

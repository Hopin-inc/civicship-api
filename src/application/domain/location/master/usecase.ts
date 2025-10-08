import { injectable, inject } from "tsyringe";
import { GqlCitiesInput, GqlCitiesSortInput, GqlStatesInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import MasterService from "@/application/domain/location/master/service";

@injectable()
export default class MasterUseCase {
  constructor(@inject("MasterService") private readonly service: MasterService) {}

  async getCities(
    filter: GqlCitiesInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number,
    sort?: GqlCitiesSortInput,
  ) {
    return this.service.getCities(filter, ctx, cursor, first, sort);
  }

  async getStates(
    filter: GqlStatesInput | undefined,
    ctx: IContext,
    cursor?: string,
    first?: number,
  ) {
    return this.service.getStates(filter, ctx, cursor, first);
  }
}

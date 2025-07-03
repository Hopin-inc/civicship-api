import { injectable, inject } from "tsyringe";
import { GqlCitiesInput, GqlStatesInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import MasterService from "@/application/domain/location/master/service";

@injectable()
export default class MasterUseCase {
  constructor(@inject("MasterService") private readonly service: MasterService) {}

  async getCities(filter: GqlCitiesInput | undefined, ctx: IContext) {
    return this.service.getCities(filter, ctx);
  }

  async getStates(filter: GqlStatesInput | undefined, ctx: IContext) {
    return this.service.getStates(filter, ctx);
  }
}

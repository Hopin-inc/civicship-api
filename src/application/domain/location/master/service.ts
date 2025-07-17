import { NotFoundError } from "@/errors/graphql";
import { GqlCitiesInput, GqlStatesInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import IMasterRepository from "@/application/domain/location/master/data/interface";
import MasterConverter from "@/application/domain/location/master/data/converter";
import MasterRepository from "@/application/domain/location/master/data/repository";
import MasterPresenter from "@/application/domain/location/master/presenter";
import { clampFirst } from "@/application/domain/utils";

@injectable()
export default class MasterService {
  constructor(
    @inject("MasterRepository") private readonly repository: IMasterRepository,
    @inject("MasterConverter") private readonly converter: MasterConverter,
  ) {}

  async getCities(filter: GqlCitiesInput | undefined, ctx: IContext, cursor?: string, first?: number) {
    const where = this.converter.citiesFilter(filter);
    const orderBy = this.converter.citiesSort();
    const take = clampFirst(first);
    
    const cities = await this.repository.findCities(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = cities.length > take;
    const cityNodes = cities.slice(0, take).map((city) => MasterPresenter.get(city));
    return MasterPresenter.citiesQuery(cityNodes, hasNextPage, cursor);
  }

  async getStates(filter: GqlStatesInput | undefined, ctx: IContext, cursor?: string, first?: number) {
    const where = this.converter.statesFilter(filter);
    const orderBy = this.converter.statesSort();
    const take = clampFirst(first);
    
    const states = await this.repository.findStates(ctx, where, orderBy, take + 1, cursor);
    const hasNextPage = states.length > take;
    const stateNodes = states.slice(0, take).map((state) => this.converter.stateToGraphQL(state));
    return MasterPresenter.statesQuery(stateNodes, hasNextPage, cursor);
  }

  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new NotFoundError("City", { id });
    }
    return city;
  }
}

import { NotFoundError } from "@/errors/graphql";
import { GqlCitiesInput, GqlStatesInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import IMasterRepository from "@/application/domain/location/master/data/interface";
import MasterConverter from "@/application/domain/location/master/data/converter";
import MasterRepository from "@/application/domain/location/master/data/repository";
import MasterPresenter from "@/application/domain/location/master/presenter";

@injectable()
export default class MasterService {
  constructor(
    @inject("MasterRepository") private readonly repository: IMasterRepository,
    @inject("MasterConverter") private readonly converter: MasterConverter,
  ) {}

  async getCities(filter: GqlCitiesInput | undefined, cursor: string | undefined, first: number | undefined, ctx: IContext) {
    const where = this.converter.citiesFilter(filter);
    const orderBy = this.converter.citiesSort();
    
    const take = first || 20;
    const skip = cursor ? 1 : 0;
    
    const cities = await this.repository.findCities(ctx, where, orderBy, take + 1, skip);
    const hasNextPage = cities.length > take;
    const resultCities = hasNextPage ? cities.slice(0, take) : cities;
    
    const cityNodes = resultCities.map((city) => MasterPresenter.get(city));
    return MasterPresenter.citiesQuery(cityNodes, hasNextPage);
  }

  async getStates(filter: GqlStatesInput | undefined, cursor: string | undefined, first: number | undefined, ctx: IContext) {
    const where = this.converter.statesFilter(filter);
    const orderBy = this.converter.statesSort();
    
    const take = first || 20;
    const skip = cursor ? 1 : 0;
    
    const states = await this.repository.findStates(ctx, where, orderBy, take + 1, skip);
    const hasNextPage = states.length > take;
    const resultStates = hasNextPage ? states.slice(0, take) : states;
    
    const stateNodes = resultStates.map((state) => this.converter.stateToGraphQL(state));
    return MasterPresenter.statesQuery(stateNodes, hasNextPage);
  }

  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new NotFoundError("City", { id });
    }
    return city;
  }
}

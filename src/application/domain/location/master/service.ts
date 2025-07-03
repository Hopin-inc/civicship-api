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

  async getCities(filter: GqlCitiesInput | undefined, ctx: IContext) {
    const where = this.converter.citiesFilter(filter);
    const orderBy = this.converter.citiesSort();
    
    const cities = await this.repository.findCities(ctx, where, orderBy);
    const cityNodes = cities.map((city) => MasterPresenter.get(city));
    return MasterPresenter.citiesQuery(cityNodes, false);
  }

  async getStates(filter: GqlStatesInput | undefined, ctx: IContext) {
    const where = this.converter.statesFilter(filter);
    const orderBy = this.converter.statesSort();
    
    const states = await this.repository.findStates(ctx, where, orderBy);
    const stateNodes = states.map((state) => this.converter.stateToGraphQL(state));
    return MasterPresenter.statesQuery(stateNodes, false);
  }

  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new NotFoundError("City", { id });
    }
    return city;
  }
}

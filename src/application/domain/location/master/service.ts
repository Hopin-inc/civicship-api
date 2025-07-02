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

  async getCities(input: GqlCitiesInput | undefined, ctx: IContext) {
    const where = this.converter.citiesFilter(input);
    const orderBy = this.converter.citiesSort();
    
    const cities = await this.repository.findCities(ctx, where, orderBy);
    return cities.map((city) => MasterPresenter.get(city));
  }

  async getStates(input: GqlStatesInput | undefined, ctx: IContext) {
    const where = this.converter.statesFilter(input);
    const orderBy = this.converter.statesSort();
    
    const states = await this.repository.findStates(ctx, where, orderBy);
    return states.map((state) => this.converter.stateToGraphQL(state));
  }

  static async checkIfCityExists(id: string) {
    const city = await MasterRepository.checkCityExists(id);
    if (!city) {
      throw new NotFoundError("City", { id });
    }
    return city;
  }
}

import { injectable } from "tsyringe";
import { GqlCitiesInput, GqlStatesInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import MasterPresenter from "@/application/domain/location/master/presenter";
import { citySelectDetail } from "@/application/domain/location/master/data/type";

@injectable()
export default class MasterUseCase {
  async getCities(input: GqlCitiesInput | undefined, ctx: IContext) {
    const cities = await ctx.issuer.internal(async (tx) => {
      const whereClause = input?.name
        ? { name: { contains: input.name, mode: "insensitive" as const } }
        : {};

      return tx.city.findMany({
        where: whereClause,
        select: citySelectDetail,
        orderBy: { name: "asc" },
      });
    });

    return cities.map((city) => MasterPresenter.get(city));
  }

  async getStates(input: GqlStatesInput | undefined, ctx: IContext) {
    const states = await ctx.issuer.internal(async (tx) => {
      const whereClause = input?.name
        ? { name: { contains: input.name, mode: "insensitive" as const } }
        : {};

      return tx.state.findMany({
        where: whereClause,
        select: {
          code: true,
          name: true,
          countryCode: true,
        },
        orderBy: { name: "asc" },
      });
    });

    return states.map((state) => ({
      __typename: "State",
      code: state.code,
      name: state.name,
      countryCode: state.countryCode,
    }));
  }
}

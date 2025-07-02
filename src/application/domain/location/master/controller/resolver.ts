import { GqlQueryCitiesArgs, GqlQueryStatesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { inject, injectable } from "tsyringe";
import MasterUseCase from "@/application/domain/location/master/usecase";

@injectable()
export default class MasterResolver {
  constructor(@inject("MasterUseCase") private readonly useCase: MasterUseCase) {}

  Query = {
    cities: async (_: unknown, args: GqlQueryCitiesArgs, ctx: IContext) => {
      return this.useCase.getCities(args.filter, args.cursor, args.first, ctx);
    },
    states: async (_: unknown, args: GqlQueryStatesArgs, ctx: IContext) => {
      return this.useCase.getStates(args.filter, args.cursor, args.first, ctx);
    },
  };
}

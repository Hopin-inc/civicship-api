import { injectable } from "tsyringe";
import { GqlQueryCitiesArgs, GqlQueryStatesArgs } from "@/types/graphql";
import { IContext } from "@/types/server";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import MasterPresenter from "@/application/domain/location/master/presenter";
import { citySelectDetail } from "@/application/domain/location/master/data/type";

@injectable()
export default class MasterUseCase {
  async getCities(args: GqlQueryCitiesArgs, _ctx: IContext) {
    const issuer = new PrismaClientIssuer();
    
    const cities = await issuer.internal(async (tx) => {
      const whereClause = args.name 
        ? { name: { contains: args.name, mode: 'insensitive' as const } }
        : {};
        
      return tx.city.findMany({
        where: whereClause,
        select: citySelectDetail,
        orderBy: { name: 'asc' },
      });
    });

    return cities.map(city => MasterPresenter.get(city));
  }

  async getStates(args: GqlQueryStatesArgs, _ctx: IContext) {
    const issuer = new PrismaClientIssuer();
    
    const states = await issuer.internal(async (tx) => {
      const whereClause = args.name 
        ? { name: { contains: args.name, mode: 'insensitive' as const } }
        : {};
        
      return tx.state.findMany({
        where: whereClause,
        select: {
          code: true,
          name: true,
          countryCode: true,
        },
        orderBy: { name: 'asc' },
      });
    });

    return states.map(state => ({
      __typename: "State" as const,
      code: state.code,
      name: state.name,
      countryCode: state.countryCode,
    }));
  }
}

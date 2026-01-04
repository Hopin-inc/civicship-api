import { GqlCitiesInput, GqlCitiesSortInput, GqlStatesInput } from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class MasterConverter {
  citiesFilter(input?: GqlCitiesInput): Prisma.CityWhereInput {
    return input?.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {};
  }

  citiesSort(sort?: GqlCitiesSortInput): Prisma.CityOrderByWithRelationInput[] {
    return [{ code: sort?.code ?? Prisma.SortOrder.desc }];
  }

  statesFilter(input?: GqlStatesInput): Prisma.StateWhereInput {
    return input?.name ? { name: { contains: input.name, mode: "insensitive" as const } } : {};
  }

  statesSort(): Prisma.StateOrderByWithRelationInput[] {
    return [{ code: "asc" }];
  }

  stateToGraphQL(state: { code: string; name: string; countryCode: string }) {
    return {
      __typename: "State" as const,
      code: state.code,
      name: state.name,
      countryCode: state.countryCode,
    };
  }
}

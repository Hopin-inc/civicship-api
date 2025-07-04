import {
  GqlCitiesConnection,
  GqlCity,
  GqlStatesConnection,
  GqlState,
} from "@/types/graphql";
import { PrismaCityDetail } from "@/application/domain/location/master/data/type";

export default class MasterPresenter {
  static citiesQuery(cities: GqlCity[], hasNextPage: boolean): GqlCitiesConnection {
    return {
      __typename: "CitiesConnection",
      totalCount: cities.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: cities[0]?.code,
        endCursor: cities.length ? cities[cities.length - 1].code : undefined,
      },
      edges: cities.map((city) => ({
        cursor: city.code,
        node: city,
      })),
    };
  }

  static statesQuery(states: GqlState[], hasNextPage: boolean): GqlStatesConnection {
    return {
      __typename: "StatesConnection",
      totalCount: states.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: states[0]?.code,
        endCursor: states.length ? states[states.length - 1].code : undefined,
      },
      edges: states.map((state) => ({
        cursor: state.code,
        node: state,
      })),
    };
  }

  static get(r: PrismaCityDetail): GqlCity {
    return {
      __typename: "City",
      ...r,
    };
  }
}

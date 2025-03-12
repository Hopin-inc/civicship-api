import { GqlPlacesConnection, GqlPlace } from "@/types/graphql";
import { PrismaPlace } from "@/application/place/data/type";
import MasterPresenter from "@/application/master/presenter";

export default class PlacePresenter {
  static query(r: GqlPlace[], hasNextPage: boolean): GqlPlacesConnection {
    return {
      totalCount: r.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: r[0]?.id,
        endCursor: r.length ? r[r.length - 1].id : undefined,
      },
      edges: r.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(r: PrismaPlace): GqlPlace {
    const { community, city, latitude, longitude, ...prop } = r;

    return {
      ...prop,
      community,
      city: MasterPresenter.getCity(city),
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    };
  }
}

import {
  GqlPlacesConnection,
  GqlPlace,
  GqlPlaceCreateSuccess,
  GqlPlaceUpdateSuccess,
  GqlPlaceDeleteSuccess,
} from "@/types/graphql";
import { PrismaPlace } from "@/application/domain/location/place/data/type";
import MasterPresenter from "@/application/domain/location/master/presenter";

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
      community: community ? community : null,
      city: MasterPresenter.getCity(city),
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    };
  }

  static create(r: PrismaPlace): GqlPlaceCreateSuccess {
    return {
      __typename: "PlaceCreateSuccess",
      place: this.get(r),
    };
  }

  static update(r: PrismaPlace): GqlPlaceUpdateSuccess {
    return {
      __typename: "PlaceUpdateSuccess",
      place: this.get(r),
    };
  }

  static delete(r: PrismaPlace): GqlPlaceDeleteSuccess {
    return {
      __typename: "PlaceDeleteSuccess",
      id: r.id,
    };
  }
}

import {
  GqlPlacesConnection,
  GqlPlace,
  GqlPlaceCreateSuccess,
  GqlPlaceUpdateSuccess,
  GqlPlaceDeleteSuccess,
} from "@/types/graphql";
import { PrismaPlace, PrismaPlaceDetail } from "@/application/domain/location/place/data/type";

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

  static get(r: PrismaPlaceDetail): GqlPlace {
    return {
      id: r.id,
      name: r.name,
      address: r.address,
      latitude: r.latitude.toString(),
      longitude: r.longitude.toString(),
      isManual: r.isManual,
      googlePlaceId: r.googlePlaceId,
      mapLocation: r.mapLocation,
      createdAt: r.createdAt,
      image: null,
      city: { code: "", name: "", state: { code: "", name: "", countryCode: "" } }, // Placeholder to satisfy non-null constraint
      community: null,
      opportunities: null,
    };
  }

  static create(r: PrismaPlaceDetail): GqlPlaceCreateSuccess {
    return {
      __typename: "PlaceCreateSuccess",
      place: this.get(r),
    };
  }

  static update(r: PrismaPlaceDetail): GqlPlaceUpdateSuccess {
    return {
      __typename: "PlaceUpdateSuccess",
      place: this.get(r),
    };
  }

  static delete(r: PrismaPlaceDetail): GqlPlaceDeleteSuccess {
    return {
      __typename: "PlaceDeleteSuccess",
      id: r.id,
    };
  }
}

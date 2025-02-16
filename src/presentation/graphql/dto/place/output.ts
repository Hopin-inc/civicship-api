import {
  GqlPlacesConnection,
  GqlPlace,
  GqlPlaceCreateSuccess,
  GqlPlaceDeleteSuccess,
  GqlPlaceUpdateSuccess,
} from "@/types/graphql";
import { PlacePayloadWithArgs } from "@/infra/prisma/types/place";

export default class PlaceOutputFormat {
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

  static get(r: PlacePayloadWithArgs): GqlPlace {
    return {
      ...r,
      latitude: r.latitude.toString(),
      longitude: r.longitude.toString(),
    };
  }

  static create(r: PlacePayloadWithArgs): GqlPlaceCreateSuccess {
    return {
      __typename: "PlaceCreateSuccess",
      place: this.get(r),
    };
  }

  static update(r: PlacePayloadWithArgs): GqlPlaceUpdateSuccess {
    return {
      __typename: "PlaceUpdateSuccess",
      place: this.get(r),
    };
  }

  static delete(r: PlacePayloadWithArgs): GqlPlaceDeleteSuccess {
    return {
      __typename: "PlaceDeleteSuccess",
      id: r.id,
    };
  }
}

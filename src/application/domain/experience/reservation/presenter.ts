import {
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreateSuccess,
  GqlReservationSetStatusSuccess,
} from "@/types/graphql";
import { PrismaReservationDetail } from "@/application/domain/experience/reservation/data/type";

export default class ReservationPresenter {
  static query(records: GqlReservation[], hasNextPage: boolean, cursor?: string): GqlReservationsConnection {
    return {
      totalCount: records.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: records[0]?.id,
        endCursor: records.length ? records[records.length - 1].id : undefined,
      },
      edges: records.map((r) => ({
        cursor: r.id,
        node: r,
      })),
    };
  }

  static get(record: PrismaReservationDetail): GqlReservation {
    return {
      __typename: "Reservation",
      ...record,
    };
  }

  static create(record: PrismaReservationDetail): GqlReservationCreateSuccess {
    return {
      __typename: "ReservationCreateSuccess",
      reservation: record,
    };
  }

  static setStatus(record: PrismaReservationDetail): GqlReservationSetStatusSuccess {
    return {
      __typename: "ReservationSetStatusSuccess",
      reservation: record,
    };
  }
}

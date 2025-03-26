import {
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreateSuccess,
  GqlReservationSetStatusSuccess,
} from "@/types/graphql";
import { PrismaReservation } from "@/application/domain/reservation/data/type";

export default class ReservationPresenter {
  static query(records: GqlReservation[], hasNextPage: boolean): GqlReservationsConnection {
    return {
      totalCount: records.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: records[0]?.id,
        endCursor: records.length ? records[records.length - 1].id : undefined,
      },
      edges: records.map((r) => ({
        cursor: r.id,
        node: r,
      })),
    };
  }

  static get(record: PrismaReservation): GqlReservation {
    const { opportunitySlot, participations, createdByUser, ...prop } = record;

    return {
      ...prop,
      opportunitySlot,
      createdByUser,
      participations,
    };
  }

  static create(record: PrismaReservation): GqlReservationCreateSuccess {
    return {
      __typename: "ReservationCreateSuccess",
      reservation: this.get(record),
    };
  }

  static setStatus(record: PrismaReservation): GqlReservationSetStatusSuccess {
    return {
      __typename: "ReservationSetStatusSuccess",
      reservation: this.get(record),
    };
  }
}

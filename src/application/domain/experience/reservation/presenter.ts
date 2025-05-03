import {
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreateSuccess,
  GqlReservationSetStatusSuccess,
} from "@/types/graphql";
import { PrismaReservation, PrismaReservationDetail } from "@/application/domain/experience/reservation/data/type";

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

  static get(record: PrismaReservation | PrismaReservationDetail): GqlReservation {
    return {
      id: record.id,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      opportunitySlot: null,
      createdByUser: null,
      participations: null,
    };
  }

  static create(record: PrismaReservation | PrismaReservationDetail): GqlReservationCreateSuccess {
    return {
      __typename: "ReservationCreateSuccess",
      reservation: this.get(record),
    };
  }

  static setStatus(record: PrismaReservation | PrismaReservationDetail): GqlReservationSetStatusSuccess {
    return {
      __typename: "ReservationSetStatusSuccess",
      reservation: this.get(record),
    };
  }
}

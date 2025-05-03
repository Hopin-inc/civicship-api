import {
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreateSuccess,
  GqlReservationSetStatusSuccess,
} from "@/types/graphql";
import { PrismaReservationDetail } from "@/application/domain/experience/reservation/data/type";

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

  static get(record: PrismaReservationDetail): GqlReservation {
    return record;
  }

  static create(record: PrismaReservationDetail): GqlReservationCreateSuccess {
    return {
      reservation: this.get(record),
    };
  }

  static setStatus(record: PrismaReservationDetail): GqlReservationSetStatusSuccess {
    return {
      reservation: this.get(record),
    };
  }
}

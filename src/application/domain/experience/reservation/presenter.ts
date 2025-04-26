import {
  GqlReservation,
  GqlReservationsConnection,
  GqlReservationCreateSuccess,
  GqlReservationSetStatusSuccess,
} from "@/types/graphql";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import OpportunitySlotPresenter from "@/application/domain/experience/opportunitySlot/presenter";
import ParticipationPresenter from "@/application/domain/experience/participation/presenter";

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
      opportunitySlot: OpportunitySlotPresenter.get(opportunitySlot),
      createdByUser,
      participations: participations.map(ParticipationPresenter.get),
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

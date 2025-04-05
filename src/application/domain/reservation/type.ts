import { ParticipationStatus, ParticipationStatusReason, ReservationStatus } from "@prisma/client";

export type ReservationStatuses = {
  reservationStatus: ReservationStatus;
  participationStatus: ParticipationStatus;
  participationStatusReason: ParticipationStatusReason;
};

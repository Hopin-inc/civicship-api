import { ParticipationStatus, ParticipationStatusReason, ReservationStatus } from "@prisma/client";

//  ------------------------------
//  type for reservation usecase
//  ------------------------------
export type reservationStatuses = {
  reservationStatus: ReservationStatus;
  participationStatus: ParticipationStatus;
  participationStatusReason: ParticipationStatusReason;
};

//  ------------------------------
//  function for reservation usecase
//  ------------------------------

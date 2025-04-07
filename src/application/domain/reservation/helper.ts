import { ParticipationStatus, ParticipationStatusReason, ReservationStatus } from "@prisma/client";

//  ------------------------------
//  type for reservation usecase
//  ------------------------------
export type ReservationStatuses = {
  reservationStatus: ReservationStatus;
  participationStatus: ParticipationStatus;
  participationStatusReason: ParticipationStatusReason;
};

//  ------------------------------
//  function for reservation usecase
//  ------------------------------

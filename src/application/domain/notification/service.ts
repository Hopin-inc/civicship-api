import { PrismaOpportunitySlotWithParticipation } from "@/application/domain/opportunitySlot/data/type";
import { IContext } from "@/types/server";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import { lineClient } from "@/infrastructure/libs/line";
import { buildCancelOpportunitySlotMessage } from "@/application/domain/notification/presenter/cancelOpportunitySlotMessage";
import { PrismaReservation } from "@/application/domain/reservation/data/type";
import { buildReservationAcceptedMessage } from "@/application/domain/notification/presenter/reservation/reservationAcceptedMessage";
import { IdentityPlatform } from "@prisma/client";
import {
  DEFAULT_EVENT_IMAGE_URL,
  DEFAULT_HOST_IMAGE_URL,
  LOCAL_UID,
  REDIRECT_URL,
} from "@/application/domain/notification/const";
import { buildReservationAppliedMessage } from "@/application/domain/notification/presenter/reservation/reservationAppliedMessage";
import { buildReservationCanceledMessage } from "@/application/domain/notification/presenter/reservation/reservationCanceledMessage";

dayjs.locale("ja");
const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

type ParticipationWithUserIdentity = {
  user?: {
    identities?: {
      platform: IdentityPlatform;
      uid: string;
    }[];
  } | null;
};

export default class NotificationService {
  static async pushCancelOpportunitySlotMessage(
    ctx: IContext,
    slot: PrismaOpportunitySlotWithParticipation,
  ) {
    const lineIds =
      process.env.ENV === "LOCAL"
        ? [LOCAL_UID]
        : extractLineIdsFromParticipations(
            slot.reservations?.flatMap((r) => r.participations ?? []) ?? [],
          );

    const { date, time } = formatDateTime(slot.startsAt, slot.endsAt);
    const host = slot.opportunity.createdByUser;

    const message = buildCancelOpportunitySlotMessage({
      title: slot.opportunity.title,
      date,
      time,
      hostName: host.name,
      hostImageUrl: host.image?.url ?? DEFAULT_HOST_IMAGE_URL,
      redirectUrl: REDIRECT_URL,
    });

    await Promise.all(lineIds.map((to) => lineClient.pushMessage({ to, messages: [message] })));
  }

  static async pushReservationAppliedMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineIds =
      process.env.ENV === "LOCAL"
        ? [LOCAL_UID]
        : extractLineIdsFromParticipations(reservation.participations);

    const { date, time } = formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );
    const { opportunitySlot, participations } = reservation;
    const applicant = ctx.currentUser;

    const message = buildReservationAppliedMessage({
      title: opportunitySlot.opportunity.title,
      date,
      time,
      participantCount: `${participations.length}名`,
      applicantName: applicant?.name ?? "申込者",
      redirectUrl: REDIRECT_URL,
    });

    await Promise.all(lineIds.map((to) => lineClient.pushMessage({ to, messages: [message] })));
  }

  static async pushReservationCanceledMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineIds =
      process.env.ENV === "LOCAL"
        ? [LOCAL_UID]
        : extractLineIdsFromParticipations(reservation.participations);

    const { date, time } = formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );
    const { opportunitySlot, participations } = reservation;
    const applicant = ctx.currentUser;

    const message = buildReservationCanceledMessage({
      title: opportunitySlot.opportunity.title,
      date,
      time,
      participantCount: `${participations.length}名`,
      applicantName: applicant?.name ?? "申込者",
      redirectUrl: REDIRECT_URL,
    });

    await Promise.all(lineIds.map((to) => lineClient.pushMessage({ to, messages: [message] })));
  }

  static async pushReservationAcceptedMessage(
    ctx: IContext,
    reservation: PrismaReservation,
  ): Promise<void> {
    const lineIds =
      process.env.ENV === "LOCAL"
        ? [LOCAL_UID]
        : extractLineIdsFromParticipations(reservation.participations);

    const { date, time } = formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );
    const {
      title,
      images: eventImages,
      place,
      feeRequired,
      createdByUser,
    } = reservation.opportunitySlot.opportunity;
    const { name: hostName = "ホスト名未定", image: hostImage } = createdByUser ?? {};

    const message = buildReservationAcceptedMessage({
      title,
      eventImageUrl: eventImages[0].url ?? DEFAULT_EVENT_IMAGE_URL,
      date,
      time,
      place: place?.name ?? "場所未定",
      participantCount: `${reservation.participations.length}人`,
      price: calculateTotalPrice(feeRequired, reservation.participations.length),
      hostName,
      hostImageUrl: hostImage?.url ?? DEFAULT_HOST_IMAGE_URL,
      redirectUrl: REDIRECT_URL,
    });

    await Promise.all(
      lineIds.map((uid) => lineClient.pushMessage({ to: uid, messages: [message] })),
    );
  }
}

function formatDateTime(start: Date, end: Date): { date: string; time: string } {
  const dow = weekdays[dayjs(start).day()];
  const date = `${dayjs(start).format("YYYY年M月D日")}（${dow}）`;
  const time = `${dayjs(start).format("HH:mm")}-${dayjs(end).format("HH:mm")}`;
  return { date, time };
}

function extractLineIdsFromParticipations(
  participations: ParticipationWithUserIdentity[],
): string[] {
  return (
    participations?.flatMap(
      (p) =>
        p.user?.identities?.filter((i) => i.platform === IdentityPlatform.LINE).map((i) => i.uid) ??
        [],
    ) ?? []
  );
}

function calculateTotalPrice(feeRequired: number | null | undefined, count: number): string {
  const fee = feeRequired ?? 0;
  return `${fee * count}円`;
}

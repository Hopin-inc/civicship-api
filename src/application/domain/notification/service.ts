import { IContext } from "@/types/server";
import dayjs from "dayjs";
import "dayjs/locale/ja.js";
import { buildCancelOpportunitySlotMessage } from "@/application/domain/notification/presenter/message/cancelOpportunitySlotMessage";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { buildReservationAcceptedMessage } from "@/application/domain/notification/presenter/message/acceptReservationMessage";
import { buildReservationAppliedMessage } from "@/application/domain/notification/presenter/message/applyReservationMessage";
import { buildReservationCanceledMessage } from "@/application/domain/notification/presenter/message/cancelReservationMessage";
import { IdentityPlatform, Role } from "@prisma/client";
import { LINE_RICHMENU } from "@/application/domain/notification/presenter/richmenu/const";
import { PrismaMembership } from "@/application/domain/account/membership/data/type";
import { injectable } from "tsyringe";
import { safeLinkRichMenuIdToUser, safePushMessage } from "./line";
import { PrismaOpportunitySlotSetHostingStatus } from "@/application/domain/experience/opportunitySlot/data/type";

export const LOCAL_UID = "Uf4a68d8e6d68927a496120aa16842027";
export const DEFAULT_HOST_IMAGE_URL =
  "https://s3-ap-northeast-1.amazonaws.com/seiryu/66b7cbe0421aa90001d53e2f/programs/66b863bb421aa90001d55278/guide1_images/display.jpg?1726810902";
export const DEFAULT_THUMBNAIL =
  "https://s3-ap-northeast-1.amazonaws.com/seiryu/66b7cbe0421aa90001d53e2f/events/carousel_image3s/display.jpg?1729667925";
export const USER_MY_PAGE = "https://liff.line.me/2006078430-XGzG9kqm/users/me";

dayjs.locale("ja");

@injectable()
export default class NotificationService {
  async pushCancelOpportunitySlotMessage(
    ctx: IContext,
    slot: PrismaOpportunitySlotSetHostingStatus,
  ) {
    const lineId =
      process.env.ENV === "LOCAL"
        ? LOCAL_UID
        : ctx.uid
          ? ctx.uid
          : (() => {
              throw new Error("uid is required");
            })();

    const { year, date, time } = this.formatDateTime(slot.startsAt, slot.endsAt);
    const opportunityId = slot.opportunityId;
    const communityId = slot.opportunity.communityId;
    const host = slot.opportunity.createdByUser;

    const redirectUrl = communityId
      ? `https://liff.line.me/2006078430-XGzG9kqm/reservation/select-date?id=${opportunityId}&community_id=${communityId}`
      : `https://liff.line.me/2006078430-XGzG9kqm/activities/${opportunityId}&community_id=${communityId}`;

    const message = buildCancelOpportunitySlotMessage({
      title: slot.opportunity.title,
      year,
      date,
      time,
      hostName: host.name,
      hostImageUrl: host.image?.url ?? DEFAULT_HOST_IMAGE_URL,
      redirectUrl,
    });

    await safePushMessage({ to: lineId, messages: [message] });
  }

  async pushReservationAppliedMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineId =
      process.env.ENV === "LOCAL"
        ? LOCAL_UID
        : ctx.uid
          ? ctx.uid
          : (() => {
              throw new Error("uid is required");
            })();

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const { opportunitySlot, participations, id } = reservation;
    const applicant = ctx.currentUser;
    const redirectUrl = `https://liff.line.me/2006078430-XGzG9kqm/admin/reservations/${id}`;

    const message = buildReservationAppliedMessage({
      title: opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${participations.length}人`,
      applicantName: applicant?.name ?? "申込者不明",
      redirectUrl,
    });

    await safePushMessage({ to: lineId, messages: [message] });
  }

  async pushReservationCanceledMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineId =
      process.env.ENV === "LOCAL"
        ? LOCAL_UID
        : ctx.uid
          ? ctx.uid
          : (() => {
              throw new Error("uid is required");
            })();
    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );
    const { opportunitySlot, participations, id } = reservation;
    const applicant = ctx.currentUser;
    const redirectUrl = `https://liff.line.me/2006078430-XGzG9kqm/admin/reservations/${id}`;

    const message = buildReservationCanceledMessage({
      title: opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${participations.length}人`,
      applicantName: applicant?.name ?? "申込者不明",
      redirectUrl,
    });

    await safePushMessage({ to: lineId, messages: [message] });
  }

  async pushReservationAcceptedMessage(
    ctx: IContext,
    currentUserId: string,
    reservation: PrismaReservation,
  ): Promise<void> {
    const lineId =
      process.env.ENV === "LOCAL"
        ? LOCAL_UID
        : ctx.uid
          ? ctx.uid
          : (() => {
              throw new Error("uid is required");
            })();

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const participation = reservation.participations.find((p) => p.userId === currentUserId);
    const participationId = participation ? participation.id : undefined;

    const redirectUrl = participationId
      ? `https://liff.line.me/2006078430-XGzG9kqm/participations/${participationId}`
      : USER_MY_PAGE;

    const { title, images, place, createdByUser } = reservation.opportunitySlot.opportunity;
    const { name: hostName = "案内人", image: hostImage } = createdByUser ?? {};

    const message = buildReservationAcceptedMessage({
      title,
      thumbnail: images[0].url ?? DEFAULT_THUMBNAIL,
      year,
      date,
      time,
      place: place?.name ?? "",
      participantCount: `${reservation.participations.length}人`,
      hostName,
      hostImageUrl: hostImage?.url ?? DEFAULT_HOST_IMAGE_URL,
      redirectUrl,
    });

    await safePushMessage({ to: lineId, messages: [message] });
  }

  async switchRichMenuByRole(membership: PrismaMembership): Promise<void> {
    let lineUid = membership.user?.identities.find(
      (identity) => identity.platform === IdentityPlatform.LINE,
    )?.uid;

    if (!lineUid) {
      if (process.env.ENV === "LOCAL") {
        lineUid = LOCAL_UID;
      } else {
        return;
      }
    }

    const richMenuId =
      membership.role === Role.OWNER || membership.role === Role.MANAGER
        ? LINE_RICHMENU.ADMIN_MANAGE
        : LINE_RICHMENU.PUBLIC;

    await safeLinkRichMenuIdToUser(lineUid, richMenuId);
  }

  private formatDateTime(start: Date, end: Date): { year: string; date: string; time: string } {
    const year = dayjs(start).format("YYYY年");
    const date = dayjs(start).format("M月D日");
    const time = `${dayjs(start).format("HH:mm")}~${dayjs(end).format("HH:mm")}`;
    return { year, date, time };
  }
}

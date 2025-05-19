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
import * as process from "node:process";

dayjs.locale("ja");

const liffBaseUrl = process.env.LIFF_BASE_URL;

export const DEFAULT_HOST_IMAGE_URL =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/placeholder.jpg";
export const DEFAULT_THUMBNAIL =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/ogp.jpg";

@injectable()
export default class NotificationService {
  async pushCancelOpportunitySlotMessage(
    ctx: IContext,
    slot: PrismaOpportunitySlotSetHostingStatus,
  ) {
    const participantInfos = this.extractLineUidsFromParticipations(
      slot.reservations.flatMap((r) => r.participations),
    );

    if (participantInfos.length === 0) return;

    const { year, date, time } = this.formatDateTime(slot.startsAt, slot.endsAt);
    const { opportunityId } = slot;
    const { communityId, createdByUser, title } = slot.opportunity;

    const redirectUrl = communityId
      ? `${liffBaseUrl}/reservation/select-date?id=${opportunityId}&community_id=${communityId}`
      : `${liffBaseUrl}/activities`;

    const message = buildCancelOpportunitySlotMessage({
      title,
      year,
      date,
      time,
      hostName: createdByUser?.name ?? "NEO88四国祭",
      hostImageUrl: createdByUser?.image?.url ?? DEFAULT_HOST_IMAGE_URL,
      redirectUrl,
    });

    await Promise.all(
      participantInfos.map(({ uid }) => safePushMessage({ to: uid, messages: [message] })),
    );
  }

  async pushReservationAppliedMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineUid = this.extractLineUidFromCreator(
      reservation.opportunitySlot.opportunity.createdByUser,
    );
    if (!lineUid) return;

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const redirectUrl = `${liffBaseUrl}/admin/reservations/${reservation.id}`;
    const message = buildReservationAppliedMessage({
      title: reservation.opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${reservation.participations.length}人`,
      applicantName: ctx.currentUser?.name ?? "要確認",
      redirectUrl,
    });

    await safePushMessage({ to: lineUid, messages: [message] });
  }

  async pushReservationCanceledMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineUid = this.extractLineUidFromCreator(
      reservation.opportunitySlot.opportunity.createdByUser,
    );
    if (!lineUid) return;

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const redirectUrl = `${liffBaseUrl}/admin/reservations/${reservation.id}`;
    const message = buildReservationCanceledMessage({
      title: reservation.opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${reservation.participations.length}人`,
      applicantName: ctx.currentUser?.name ?? "要確認",
      redirectUrl,
    });

    await safePushMessage({ to: lineUid, messages: [message] });
  }

  async pushReservationAcceptedMessage(
    ctx: IContext,
    currentUserId: string,
    reservation: PrismaReservation,
  ) {
    const participantInfos = this.extractLineUidsFromParticipations(reservation.participations);
    if (participantInfos.length === 0) return;

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const { title, images, place, createdByUser } = reservation.opportunitySlot.opportunity;
    const { name: hostName = "案内人", image: hostImage } = createdByUser ?? {};
    const participantCount = `${reservation.participations.length}人`;

    await Promise.all(
      participantInfos.map(({ uid, participationId }) => {
        const redirectUrl = `${liffBaseUrl}/participations/${participationId}`;
        const message = buildReservationAcceptedMessage({
          title,
          thumbnail: images[0]?.url ?? DEFAULT_THUMBNAIL,
          year,
          date,
          time,
          place: place?.name ?? "要問い合わせ",
          participantCount,
          hostName,
          hostImageUrl: hostImage?.url ?? DEFAULT_HOST_IMAGE_URL,
          redirectUrl,
        });
        return safePushMessage({ to: uid, messages: [message] });
      }),
    );
  }

  async switchRichMenuByRole(membership: PrismaMembership): Promise<void> {
    const lineUid = membership.user?.identities.find(
      (identity) => identity.platform === IdentityPlatform.LINE,
    )?.uid;

    if (!lineUid) return;

    const richMenuId =
      membership.role === Role.OWNER || membership.role === Role.MANAGER
        ? LINE_RICHMENU.ADMIN_MANAGE
        : LINE_RICHMENU.PUBLIC;

    await safeLinkRichMenuIdToUser(lineUid, richMenuId);
  }

  // --- 共通化したプライベートユーティリティ ---

  private extractLineUidsFromParticipations(
    participations: {
      id: string;
      user: {
        identities: {
          platform: IdentityPlatform;
          uid: string;
        }[];
      } | null;
    }[],
  ): { uid: string; participationId: string }[] {
    return participations.flatMap((p) => {
      const uid = p.user?.identities.find(
        (identity) => identity.platform === IdentityPlatform.LINE,
      )?.uid;

      return uid ? [{ uid, participationId: p.id }] : [];
    });
  }

  private extractLineUidFromCreator(
    user: { identities?: { platform: IdentityPlatform; uid: string }[] } | null | undefined,
  ): string | undefined {
    return user?.identities?.find((identity) => identity.platform === IdentityPlatform.LINE)?.uid;
  }

  private formatDateTime(start: Date, end: Date): { year: string; date: string; time: string } {
    const year = dayjs(start).format("YYYY年");
    const date = dayjs(start).format("M月D日");
    const time = `${dayjs(start).format("HH:mm")}~${dayjs(end).format("HH:mm")}`;
    return { year, date, time };
  }
}

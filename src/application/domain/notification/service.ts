import { IContext } from "@/types/server";
import { buildCancelOpportunitySlotMessage } from "@/application/domain/notification/presenter/message/cancelOpportunitySlotMessage";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { buildReservationAcceptedMessage } from "@/application/domain/notification/presenter/message/acceptReservationMessage";
import { buildReservationAppliedMessage } from "@/application/domain/notification/presenter/message/applyReservationMessage";
import { buildReservationCanceledMessage } from "@/application/domain/notification/presenter/message/cancelReservationMessage";
import { IdentityPlatform, Role } from "@prisma/client";
import { LINE_RICHMENU } from "@/application/domain/notification/presenter/richmenu/const";
import { PrismaMembership } from "@/application/domain/account/membership/data/type";
import { inject, injectable } from "tsyringe";
import { safeLinkRichMenuIdToUser, safePushMessage } from "./line";
import { PrismaOpportunitySlotSetHostingStatus } from "@/application/domain/experience/opportunitySlot/data/type";
import { buildDeclineOpportunitySlotMessage } from "@/application/domain/notification/presenter/message/rejectReservationMessage";
import { buildAdminGrantedMessage } from "@/application/domain/notification/presenter/message/switchRoleMessage";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import { createLineClient } from "@/infrastructure/libs/line";
import logger from "@/infrastructure/logging";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import "dayjs/locale/ja.js";

dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("ja");
dayjs.tz.setDefault("Asia/Tokyo");

export const DEFAULT_HOST_IMAGE_URL =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/placeholder.jpg";
export const DEFAULT_THUMBNAIL =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/ogp.jpg";

@injectable()
export default class NotificationService {
  constructor(
    @inject("CommunityConfigService")
    private readonly communityConfigService: CommunityConfigService,
  ) {}

  async pushCancelOpportunitySlotMessage(
    ctx: IContext,
    slot: PrismaOpportunitySlotSetHostingStatus,
    comment?: string,
  ) {
    const participantInfos = this.extractLineUidsFromParticipations(
      slot.reservations.flatMap((r) => r.participations),
    );

    if (participantInfos.length === 0) {
      logger.warn("No LINE UID found in participations", {
        context: ctx,
        slotId: slot?.id,
        participations: slot?.reservations?.flatMap((r) => r.participations),
      });
      return;
    }

    const { year, date, time } = this.formatDateTime(slot.startsAt, slot.endsAt);
    const { opportunityId } = slot;
    const { communityId, createdByUser, title } = slot.opportunity;

    const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
    const redirectUrl = communityId
      ? `${liffBaseUrl}/reservation/select-date?id=${opportunityId}&community_id=${communityId}`
      : `${liffBaseUrl}/activities`;

    const client = await createLineClient(ctx.communityId);
    const message = buildCancelOpportunitySlotMessage({
      title,
      year,
      date,
      time,
      hostName: createdByUser?.name ?? "NEO88四国祭",
      hostImageUrl: this.safeImageUrl(createdByUser.image?.url, DEFAULT_HOST_IMAGE_URL),
      redirectUrl,
      comment,
    });

    for (const { uid } of participantInfos) {
      await safePushMessage(client, { to: uid, messages: [message] });
    }
  }

  async pushReservationAppliedMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineUid = this.extractLineUidFromCreator(
      reservation.opportunitySlot.opportunity.createdByUser,
    );
    if (!lineUid) {
      logger.warn("pushReservationAppliedMessage: lineUid is missing", {
        reservationId: reservation.id,
        createdByUser: reservation.opportunitySlot.opportunity.createdByUser,
      });
      return;
    }

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
    const redirectUrl = `${liffBaseUrl}/admin/reservations/${reservation.id}?mode=approval`;

    const client = await createLineClient(ctx.communityId);
    const message = buildReservationAppliedMessage({
      title: reservation.opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${reservation.participations.length}人`,
      applicantName: ctx.currentUser?.name ?? "要確認",
      redirectUrl,
    });

    await safePushMessage(client, { to: lineUid, messages: [message] });
  }

  async pushReservationCanceledMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineUid = this.extractLineUidFromCreator(
      reservation.opportunitySlot.opportunity.createdByUser,
    );
    if (!lineUid) {
      logger.warn("pushReservationAppliedMessage: lineUid is missing", {
        reservationId: reservation.id,
        createdByUser: reservation.opportunitySlot.opportunity.createdByUser,
      });
      return;
    }

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
    const redirectUrl = `${liffBaseUrl}/admin/reservations/${reservation.id}`;

    const client = await createLineClient(ctx.communityId);
    const message = buildReservationCanceledMessage({
      title: reservation.opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${reservation.participations.length}人`,
      applicantName: ctx.currentUser?.name ?? "要確認",
      redirectUrl,
    });

    await safePushMessage(client, { to: lineUid, messages: [message] });
  }

  async pushReservationRejectedMessage(
    ctx: IContext,
    reservation: PrismaReservation,
    comment?: string,
  ) {
    const participantInfos = this.extractLineUidsFromParticipations(reservation.participations);
    if (participantInfos.length === 0) {
      logger.warn("No LINE UID found in participations", {
        context: ctx,
        reservationId: reservation?.id,
        participations: reservation.participations?.flatMap((r) => r),
      });
      return;
    }

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const { title, createdByUser } = reservation.opportunitySlot.opportunity;
    const { name: hostName, image: hostImage } = createdByUser ?? {};

    const client = await createLineClient(ctx.communityId);

    for (const { uid } of participantInfos) {
      const message = buildDeclineOpportunitySlotMessage({
        title,
        year,
        date,
        time,
        hostName: hostName ?? "案内人",
        hostImageUrl: this.safeImageUrl(hostImage?.url, DEFAULT_HOST_IMAGE_URL),
        comment,
      });

      await safePushMessage(client, { to: uid, messages: [message] });
    }
  }

  async pushReservationAcceptedMessage(ctx: IContext, reservation: PrismaReservation) {
    const participantInfos = this.extractLineUidsFromParticipations(reservation.participations);
    if (participantInfos.length === 0) {
      logger.warn("No LINE UID found in participations", {
        context: ctx,
        reservationId: reservation?.id,
        participations: reservation.participations?.flatMap((r) => r),
      });
      return;
    }

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const { title, images, place, createdByUser } = reservation.opportunitySlot.opportunity;
    const { name: hostName, image: hostImage } = createdByUser ?? {};
    const participantCount = `${reservation.participations.length}人`;

    const client = await createLineClient(ctx.communityId);

    const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
    for (const { uid, participationId } of participantInfos) {
      const redirectUrl = `${liffBaseUrl}/participations/${participationId}`;
      const message = buildReservationAcceptedMessage({
        title,
        thumbnail: this.safeImageUrl(images[0]?.url, DEFAULT_THUMBNAIL),
        year,
        date,
        time,
        place: place?.name ?? "要問い合わせ",
        participantCount,
        hostName: hostName ?? "案内人",
        hostImageUrl: this.safeImageUrl(hostImage?.url, DEFAULT_HOST_IMAGE_URL),
        redirectUrl,
      });
      await safePushMessage(client, { to: uid, messages: [message] });
    }
  }

  async switchRichMenuByRole(ctx: IContext, membership: PrismaMembership): Promise<void> {
    const lineUid = membership.user?.identities.find(
      (identity) => identity.platform === IdentityPlatform.LINE,
    )?.uid;

    if (!lineUid) {
      logger.warn("pushReservationAppliedMessage: lineUid is missing", {
        userId: membership.user.id,
        communityId: ctx.communityId,
      });
      return;
    }

    const client = await createLineClient(ctx.communityId);

    const isAdmin = membership.role === Role.OWNER || membership.role === Role.MANAGER;
    const richMenuId = isAdmin ? LINE_RICHMENU.ADMIN_MANAGE : LINE_RICHMENU.PUBLIC;
    const success = await safeLinkRichMenuIdToUser(client, lineUid, richMenuId);

    const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
    const redirectUrl = `${liffBaseUrl}/admin`;

    //TODO feature flagにしては細かすぎる設定
    if (isAdmin && success && membership.communityId !== "neo88") {
      await safePushMessage(client, {
        to: lineUid,
        messages: [buildAdminGrantedMessage(redirectUrl)],
      });
    }
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
    const startJST = dayjs(start).tz();
    const endJST = dayjs(end).tz();

    const year = startJST.format("YYYY年");
    const date = startJST.format("M月D日");
    const time = `${startJST.format("HH:mm")}~${endJST.format("HH:mm")}`;
    return { year, date, time };
  }

  private safeImageUrl(url: string | null | undefined, fallback: string): string {
    // eslint-disable-next-line no-control-regex
    const invalidPattern = new RegExp("[\\u0000-\\u001F\\u007F\\u3000\\s]");

    if (!url || !url.startsWith("https://") || invalidPattern.test(url)) {
      return fallback;
    }

    try {
      const parsed = new URL(url);
      return encodeURI(parsed.toString());
    } catch {
      return fallback;
    }
  }
}

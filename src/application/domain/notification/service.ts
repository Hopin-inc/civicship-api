import { IContext } from "@/types/server";
import { buildCancelOpportunitySlotMessage } from "@/application/domain/notification/presenter/message/cancelOpportunitySlotMessage";
import { PrismaReservation } from "@/application/domain/experience/reservation/data/type";
import { buildReservationAcceptedMessage } from "@/application/domain/notification/presenter/message/acceptReservationMessage";
import { buildReservationAppliedMessage } from "@/application/domain/notification/presenter/message/applyReservationMessage";
import { buildReservationCanceledMessage } from "@/application/domain/notification/presenter/message/cancelReservationMessage";
import { IdentityPlatform, LineRichMenuType, Role } from "@prisma/client";
import { PrismaMembership } from "@/application/domain/account/membership/data/type";
import { inject, injectable } from "tsyringe";
import { safeLinkRichMenuIdToUser, safePushMessage } from "./line";
import { PrismaOpportunitySlotSetHostingStatus } from "@/application/domain/experience/opportunitySlot/data/type";
import { buildDeclineOpportunitySlotMessage } from "@/application/domain/notification/presenter/message/rejectReservationMessage";
import { buildAdminGrantedMessage } from "@/application/domain/notification/presenter/message/switchRoleMessage";
import CommunityConfigService from "@/application/domain/account/community/config/service";
import UserService from "@/application/domain/account/user/service";
import { createLineClient } from "@/infrastructure/libs/line";
import logger from "@/infrastructure/logging";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import "dayjs/locale/ja.js";
import { PrismaEvaluation } from "@/application/domain/experience/evaluation/data/type";
import { buildCertificateIssuedMessage } from "@/application/domain/notification/presenter/message/certificateIssuedMessage";
import { buildPointDonationReceivedMessage } from "@/application/domain/notification/presenter/message/pointDonationReceivedMessage";
import { buildPointGrantReceivedMessage } from "@/application/domain/notification/presenter/message/pointGrantReceivedMessage";
import { buildSignupBonusGrantedMessage } from "@/application/domain/notification/presenter/message/signupBonusGrantedMessage";
import { MessagingApiClient } from "@line/bot-sdk/dist/messaging-api/api";
import { Language } from "@prisma/client";
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
    @inject("UserService")
    private readonly userService: UserService,
  ) { }

  async pushCancelOpportunitySlotMessage(
    ctx: IContext,
    slot: PrismaOpportunitySlotSetHostingStatus,
    comment?: string,
  ) {
    const participantInfos = this.extractLineUidsFromParticipations(
      slot.reservations.flatMap((r) =>
        r.participations.map((p) => ({
          id: p.id,
          user: p.user
            ? {
              identities: p.user.identities.map((identity) => ({
                platform: identity.platform,
                uid: identity.uid,
                communityId: identity.communityId ?? undefined,
              })),
            }
            : null,
        })),
      ),
      ctx.communityId,
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
      reservation.opportunitySlot.opportunity.createdByUser
        ? {
          identities: reservation.opportunitySlot.opportunity.createdByUser.identities.map(
            (identity) => ({
              platform: identity.platform,
              uid: identity.uid,
              communityId: identity.communityId ?? undefined,
            }),
          ),
        }
        : null,
      ctx.communityId,
    );

    if (!lineUid) {
      logger.warn("pushReservationAppliedMessage: lineUid is missing", {
        reservationId: reservation.id,
        communityId: ctx.communityId,
        createdByUserId: reservation.opportunitySlot.opportunity.createdByUser?.id,
        createdByUserIdentities: reservation.opportunitySlot.opportunity.createdByUser?.identities?.map(i => ({
          platform: i.platform,
          communityId: i.communityId,
          hasUid: !!i.uid,
        })),
      });
      return;
    }

    let liffBaseUrl: string;
    let client: MessagingApiClient;

    try {
      const liffConfig = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
      liffBaseUrl = liffConfig.liffBaseUrl;
    } catch (error) {
      logger.error("pushReservationAppliedMessage: failed to get LIFF config", {
        reservationId: reservation.id,
        communityId: ctx.communityId,
        err: error,
      });
      return;
    }

    try {
      client = await createLineClient(ctx.communityId);
    } catch (error) {
      logger.error("pushReservationAppliedMessage: failed to create LINE client", {
        reservationId: reservation.id,
        communityId: ctx.communityId,
        err: error,
      });
      return;
    }

    const { year, date, time } = this.formatDateTime(
      reservation.opportunitySlot.startsAt,
      reservation.opportunitySlot.endsAt,
    );

    const redirectUrl = `${liffBaseUrl}/admin/reservations/${reservation.id}?mode=approval`;

    const message = buildReservationAppliedMessage({
      title: reservation.opportunitySlot.opportunity.title,
      year,
      date,
      time,
      participantCount: `${reservation.participations.length}人`,
      applicantName: ctx.currentUser?.name ?? "要確認",
      redirectUrl,
      requireApproval: reservation.opportunitySlot.opportunity.requireApproval,
    });

    await safePushMessage(client, { to: lineUid, messages: [message] });
  }

  async pushReservationCanceledMessage(ctx: IContext, reservation: PrismaReservation) {
    const lineUid = this.extractLineUidFromCreator(
      reservation.opportunitySlot.opportunity.createdByUser
        ? {
          identities: reservation.opportunitySlot.opportunity.createdByUser.identities.map(
            (identity) => ({
              platform: identity.platform,
              uid: identity.uid,
              communityId: identity.communityId ?? undefined,
            }),
          ),
        }
        : null,
      ctx.communityId,
    );

    if (!lineUid) {
      logger.warn("pushReservationCanceledMessage: lineUid is missing", {
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
    const participantInfos = this.extractLineUidsFromParticipations(
      reservation.participations.map((p) => ({
        id: p.id,
        user: p.user
          ? {
            identities: p.user.identities.map((i) => ({
              platform: i.platform,
              uid: i.uid,
              communityId: i.communityId ?? undefined,
            })),
          }
          : null,
      })),
      ctx.communityId,
    );
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
    const participantInfos = this.extractLineUidsFromParticipations(
      reservation.participations.map((p) => ({
        id: p.id,
        user: p.user
          ? {
            identities: p.user.identities.map((i) => ({
              platform: i.platform,
              uid: i.uid,
              communityId: i.communityId ?? undefined,
            })),
          }
          : null,
      })),
      ctx.communityId,
    );

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

  async pushCertificateIssuedMessage(ctx: IContext, evaluation: PrismaEvaluation) {
    const uid = evaluation.participation.user?.identities.find(
      (identity) =>
        identity.platform === IdentityPlatform.LINE && identity.communityId === ctx.communityId,
    )?.uid;
    if (!uid) return;

    const slot = evaluation.participation.opportunitySlot;
    const opportunity = slot?.opportunity;
    if (!slot || !opportunity) return;

    const { title } = opportunity;

    const { year } = this.formatDateTime(slot.startsAt, slot.endsAt);
    const rawDate = evaluation.issuedAt ?? evaluation.updatedAt;
    const issueDate = rawDate ? dayjs(rawDate).format("YYYY年M月D日") : "日付未定";
    const issuerName = evaluation.evaluator?.name ?? "主催者";

    const client = await createLineClient(ctx.communityId);

    const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
    const redirectUrl = `${liffBaseUrl}/credentials/${evaluation.participationId}`;
    const message = buildCertificateIssuedMessage({
      title,
      year,
      issueDate,
      issuerName,
      redirectUrl,
    });

    await safePushMessage(client, { to: uid, messages: [message] });
  }

  async pushPointDonationReceivedMessage(
    ctx: IContext,
    transactionId: string,
    toPointChange: number,
    comment: string | null,
    fromUserName: string,
    toUserId: string,
  ) {
    const preparedData = await this.prepareLinePush(
      ctx,
      toUserId,
      transactionId,
      "pushPointDonationReceivedMessage",
      { includeLanguage: true },
    );

    if (!preparedData) {
      return;
    }

    const { uid, liffBaseUrl, client, language } = preparedData;
    const redirectUrl = `${liffBaseUrl}/wallets`;

    const message = buildPointDonationReceivedMessage({
      fromUserName,
      transferPoints: toPointChange,
      comment: comment ?? undefined,
      redirectUrl,
      language,
    });

    await safePushMessage(client, { to: uid, messages: [message] });
  }

  async pushPointGrantReceivedMessage(
    ctx: IContext,
    transactionId: string,
    toPointChange: number,
    comment: string | null,
    communityName: string,
    toUserId: string,
  ) {
    const preparedData = await this.prepareLinePush(
      ctx,
      toUserId,
      transactionId,
      "pushPointGrantReceivedMessage",
      { includeLanguage: true },
    );

    if (!preparedData) {
      return;
    }

    const { uid, liffBaseUrl, client, language } = preparedData;
    const redirectUrl = `${liffBaseUrl}/wallets`;

    const message = buildPointGrantReceivedMessage({
      communityName,
      transferPoints: toPointChange,
      comment: comment ?? undefined,
      redirectUrl,
      language,
    });

    await safePushMessage(client, { to: uid, messages: [message] });
  }

  async pushSignupBonusGrantedMessage(
    ctx: IContext,
    transactionId: string,
    toPointChange: number,
    comment: string | null,
    communityName: string,
    toUserId: string,
  ) {
    const preparedData = await this.prepareLinePush(
      ctx,
      toUserId,
      transactionId,
      "pushSignupBonusGrantedMessage",
      { includeLanguage: true },
    );

    if (!preparedData) {
      return;
    }

    const { uid, client, language } = preparedData;

    const message = buildSignupBonusGrantedMessage({
      communityName,
      transferPoints: toPointChange,
      comment,
      language,
    });

    await safePushMessage(client, { to: uid, messages: [message] });
  }

  async switchRichMenuByRole(ctx: IContext, membership: PrismaMembership): Promise<void> {
    const lineUid = membership.user?.identities.find(
      (identity) =>
        identity.platform === IdentityPlatform.LINE && identity.communityId === ctx.communityId,
    )?.uid;

    if (!lineUid) {
      logger.warn("switchRichMenuByRole: lineUid is missing", {
        userId: membership.user.id,
        communityId: ctx.communityId,
      });
      return;
    }

    const client = await createLineClient(ctx.communityId);

    const isAdmin = membership.role === Role.OWNER || membership.role === Role.MANAGER;
    const richMenuType = isAdmin ? LineRichMenuType.ADMIN : LineRichMenuType.PUBLIC;

    const richMenuId = await this.communityConfigService.getLineRichMenuIdByType(
      ctx,
      ctx.communityId,
      richMenuType,
    );

    if (!richMenuId) {
      logger.warn("switchRichMenuByRole: richMenuId is not configured", {
        communityId: ctx.communityId,
        type: richMenuType,
      });
      return;
    }
    const success = await safeLinkRichMenuIdToUser(client, lineUid, richMenuId);

    if (!success) {
      logger.error("switchRichMenuByRole: failed to link rich menu to user", {
        communityId: ctx.communityId,
        userId: membership.user?.id,
        lineUid,
        richMenuId,
        richMenuType,
      });
    }

    let liffBaseUrl: string;
    try {
      const liffConfig = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
      liffBaseUrl = liffConfig.liffBaseUrl;
    } catch (error) {
      logger.error("switchRichMenuByRole: failed to get LIFF config", {
        communityId: ctx.communityId,
        err: error,
      });
      return;
    }
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

  private async prepareLinePush(
    ctx: IContext,
    userId: string,
    transactionId: string,
    logContext: string,
  ): Promise<{ uid: string; liffBaseUrl: string; client: MessagingApiClient } | null>;
  private async prepareLinePush(
    ctx: IContext,
    userId: string,
    transactionId: string,
    logContext: string,
    options: { includeLanguage: true },
  ): Promise<{ uid: string; liffBaseUrl: string; client: MessagingApiClient; language: Language } | null>;
  private async prepareLinePush(
    ctx: IContext,
    userId: string,
    transactionId: string,
    logContext: string,
    options?: { includeLanguage?: boolean },
  ): Promise<{ uid: string; liffBaseUrl: string; client: MessagingApiClient; language?: Language } | null> {
    let uid: string;
    let language: Language | undefined;

    if (options?.includeLanguage) {
      const result = await this.userService.findLineUidAndLanguageForCommunity(
        ctx,
        userId,
        ctx.communityId,
      );
      if (!result) {
        logger.warn(`${logContext}: lineUid is missing`, {
          transactionId,
          userId,
          communityId: ctx.communityId,
        });
        return null;
      }
      uid = result.uid;
      language = result.language;
    } else {
      const foundUid = await this.userService.findLineUidForCommunity(ctx, userId, ctx.communityId);
      if (!foundUid) {
        logger.warn(`${logContext}: lineUid is missing`, {
          transactionId,
          userId,
          communityId: ctx.communityId,
        });
        return null;
      }
      uid = foundUid;
    }

    let liffBaseUrl: string;
    try {
      const liffConfig = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
      liffBaseUrl = liffConfig.liffBaseUrl;
    } catch (error) {
      logger.error(`${logContext}: failed to get LIFF config`, {
        transactionId,
        communityId: ctx.communityId,
        err: error,
      });
      return null;
    }

    const client = await createLineClient(ctx.communityId);

    if (options?.includeLanguage && language) {
      return { uid, liffBaseUrl, client, language };
    }
    return { uid, liffBaseUrl, client };
  }

  private extractLineUidsFromParticipations(
    participations: {
      id: string;
      user: {
        identities: {
          platform: IdentityPlatform;
          uid: string;
          communityId?: string;
        }[];
      } | null;
    }[],
    communityId: string,
  ): { uid: string; participationId: string }[] {
    return participations.flatMap((p) => {
      const uid = p.user?.identities.find(
        (identity) =>
          identity.platform === IdentityPlatform.LINE && identity.communityId === communityId,
      )?.uid;

      return uid ? [{ uid, participationId: p.id }] : [];
    });
  }

  private extractLineUidFromCreator(
    user:
      | {
        identities?: {
          platform: IdentityPlatform;
          uid: string;
          communityId?: string;
        }[];
      }
      | null
      | undefined,
    communityId: string,
  ): string | undefined {
    return user?.identities?.find(
      (identity) =>
        identity.platform === IdentityPlatform.LINE && identity.communityId === communityId,
    )?.uid;
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

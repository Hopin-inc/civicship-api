import { PrismaOpportunitySlotWithParticipation } from "@/application/domain/opportunitySlot/data/type";
import { IContext } from "@/types/server";
import dayjs from "dayjs";
import CancelOpportunitySlotMessage from "@/application/domain/opportunitySlot/line/cancelOpportunitySlotMessage";
import { lineClient } from "@/infrastructure/libs/line";

dayjs.locale("ja");

export default class NotificationService {
  static async pushCancelOpportunitySlotMessage(
    ctx: IContext,
    slot: PrismaOpportunitySlotWithParticipation,
  ) {
    // const lineUids =
    //   slot.reservations?.flatMap(
    //     (r) =>
    //       r.participations?.flatMap(
    //         (p) => p.user?.identities?.filter((i) => i.platform === "LINE").map((i) => i.uid) ?? [],
    //       ) ?? [],
    //   ) ?? [];

    const lineUids = ["Uf4a68d8e6d68927a496120aa16842027"];

    const date = dayjs(slot.startsAt).format("YYYY年M月D日（dd）");
    const time = `${dayjs(slot.startsAt).format("HH:mm")}-${dayjs(slot.endsAt).format("HH:mm")}`;

    const message = CancelOpportunitySlotMessage.create({
      title: slot.opportunity.title,
      date: date,
      time: time,
      hostName: ctx.currentUser?.name ?? "ホスト名未定",
      hostImageUrl: ctx.currentUser?.image ?? "https://your-fallback-image.com/default.png",
      redirectUrl: "https://your-reservation-url.com",
    });

    await Promise.all(lineUids.map((to) => lineClient.pushMessage({ to, messages: [message] })));
  }
}

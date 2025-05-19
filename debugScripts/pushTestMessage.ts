import "reflect-metadata";
import { lineClient } from "../src/infrastructure/libs/line";
import { buildCancelOpportunitySlotMessage } from "../src/application/domain/notification/presenter/message/cancelOpportunitySlotMessage";
import { buildReservationAppliedMessage } from "../src/application/domain/notification/presenter/message/applyReservationMessage";
import { buildReservationAcceptedMessage } from "../src/application/domain/notification/presenter/message/acceptReservationMessage";
import { buildReservationCanceledMessage } from "../src/application/domain/notification/presenter/message/cancelReservationMessage";
import {
  DEFAULT_HOST_IMAGE_URL,
  DEFAULT_THUMBNAIL,
  USER_MY_PAGE,
} from "../src/application/domain/notification/service";

// ===================================
// 🚀 実行コマンド（ローカルテスト送信用）
//
// npx tsx --env-file=.env debugScripts/pushTestMessage.ts

// 🚨 LOCAL_UIDは自分のIDに変更して下さい、今のままなら阪田に届きます
// ===================================

const LOCAL_UID = "Uf4a68d8e6d68927a496120aa16842027";

function resolveLineId(to?: string): string {
  return (
    to ??
    (process.env.ENV === "LOCAL"
      ? LOCAL_UID
      : (() => {
          throw new Error("テスト送信先のLINE UIDが指定されていません");
        })())
  );
}

async function testPushCancelOpportunitySlotMessage(to?: string) {
  const lineId = resolveLineId(to);

  const message = buildCancelOpportunitySlotMessage({
    title: "「好き」を詰め込む！ジッパーバッグ作り",
    year: "2025年",
    date: "5月12日",
    time: "13:00~15:00",
    hostName: "中田 忠志",
    hostImageUrl: DEFAULT_HOST_IMAGE_URL,
    redirectUrl: USER_MY_PAGE,
  });

  await lineClient.pushMessage({ to: lineId, messages: [message] });

  console.log(`✅ CancelOpportunitySlotメッセージを ${lineId} にテスト送信しました`);
}

async function testPushReservationAppliedMessage(to?: string) {
  const lineId = resolveLineId(to);

  const message = buildReservationAppliedMessage({
    title: "「好き」を詰め込む！ジッパーバッグ作り",
    year: "2025年",
    date: "5月12日",
    time: "13:00~15:00",
    participantCount: "3人",
    applicantName: "鈴木 一郎",
    redirectUrl: USER_MY_PAGE,
  });

  await lineClient.pushMessage({ to: lineId, messages: [message] });

  console.log(`✅ ReservationAppliedメッセージを ${lineId} にテスト送信しました`);
}

async function testPushReservationAcceptedMessage(to?: string) {
  const lineId = resolveLineId(to);

  const message = buildReservationAcceptedMessage({
    title: "「好き」を詰め込む！ジッパーバッグ作り",
    thumbnail: DEFAULT_THUMBNAIL,
    year: "2025年",
    date: "5月12日",
    time: "13:00~15:00",
    place: "男木島 猫の家",
    participantCount: "3人",
    hostName: "中田 忠志",
    hostImageUrl: DEFAULT_HOST_IMAGE_URL,
    redirectUrl: USER_MY_PAGE,
  });

  await lineClient.pushMessage({ to: lineId, messages: [message] });

  console.log(`✅ ReservationAcceptedメッセージを ${lineId} にテスト送信しました`);
}

async function testPushReservationCanceledMessage(to?: string) {
  const lineId = resolveLineId(to);

  const message = buildReservationCanceledMessage({
    title: "「好き」を詰め込む！ジッパーバッグ作り",
    year: "2025年",
    date: "5月12日",
    time: "13:00~15:00",
    participantCount: "3人",
    applicantName: "鈴木 一郎",
    redirectUrl: USER_MY_PAGE,
  });

  await lineClient.pushMessage({ to: lineId, messages: [message] });

  console.log(`✅ ReservationCanceledメッセージを ${lineId} にテスト送信しました`);
}

await testPushCancelOpportunitySlotMessage();
await testPushReservationAppliedMessage();
await testPushReservationAcceptedMessage();
await testPushReservationCanceledMessage();

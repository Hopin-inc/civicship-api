/**
 * Preview script for LINE point transfer notification messages.
 *
 * Prints the resulting Flex Message `contents` JSON for several scenarios so
 * you can paste any one of them into the LINE Flex Message Simulator
 * (https://developers.line.biz/flex-simulator/) to see the rendered output.
 *
 * Usage:
 *   pnpm tsx scripts/notification/preview-point-transfer.ts
 *
 * Then copy a single JSON block (between the BEGIN/END markers) and paste
 * into the simulator. IMPORTANT: the simulator expects ONLY the bubble/carousel
 * object (i.e. `FlexMessage.contents`), NOT the full FlexMessage wrapper —
 * this script already strips the wrapper for you.
 */

import { buildPointDonationReceivedMessage } from "@/application/domain/notification/presenter/message/pointDonationReceivedMessage";
import { buildPointGrantReceivedMessage } from "@/application/domain/notification/presenter/message/pointGrantReceivedMessage";
import { RecentTransactionEntry } from "@/application/domain/notification/presenter/message/pointTransferCardMessage";
import { Language } from "@prisma/client";

const SAMPLE_FROM_USER_IMAGE =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/placeholder.jpg";
const SAMPLE_TO_USER_IMAGE =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/placeholder.jpg";
const SAMPLE_COMMUNITY_IMAGE =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/ogp.jpg";
const SAMPLE_ATTACHED_IMAGE =
  "https://storage.googleapis.com/prod-civicship-storage-public/asset/neo88/ogp.jpg";

const recentTransactions: RecentTransactionEntry[] = [
  {
    fromName: "山田太郎",
    fromImageUrl: SAMPLE_FROM_USER_IMAGE,
    toName: "鈴木次郎",
    toImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 300,
    createdAt: new Date("2026-04-14T10:00:00+09:00"),
    kind: "donation",
  },
  {
    fromName: "NEO88四国祭",
    fromImageUrl: SAMPLE_COMMUNITY_IMAGE,
    toName: "高橋三郎",
    toImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 1000,
    createdAt: new Date("2026-04-13T09:00:00+09:00"),
    kind: "grant",
  },
  {
    fromName: "佐々木四郎",
    fromImageUrl: SAMPLE_FROM_USER_IMAGE,
    toName: "田中五郎",
    toImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 150,
    createdAt: new Date("2026-04-12T15:30:00+09:00"),
    kind: "donation",
  },
];

function printScenario(label: string, message: { contents: unknown; altText: string }) {
  console.log("");
  console.log(`========== BEGIN: ${label} ==========`);
  console.log(`// altText: ${message.altText}`);
  console.log(JSON.stringify(message.contents, null, 2));
  console.log(`========== END: ${label} ==========`);
  console.log("");
}

// Scenario 1: Donation, no attached image, no recent transactions
printScenario(
  "donation / single bubble / no image",
  buildPointDonationReceivedMessage({
    fromUserName: "工藤シンク",
    fromUserImageUrl: SAMPLE_FROM_USER_IMAGE,
    toUserName: "MIO",
    toUserImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 555,
    createdAt: new Date("2026-04-15T21:30:00+09:00"),
    redirectUrl: "https://liff.example.com/wallets",
    language: Language.JA,
  }),
);

// Scenario 2: Donation with comment
printScenario(
  "donation / single bubble / with comment",
  buildPointDonationReceivedMessage({
    fromUserName: "工藤シンク",
    fromUserImageUrl: SAMPLE_FROM_USER_IMAGE,
    toUserName: "MIO",
    toUserImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 555,
    comment: "いつもありがとう！",
    createdAt: new Date("2026-04-15T21:30:00+09:00"),
    redirectUrl: "https://liff.example.com/wallets",
    language: Language.JA,
  }),
);

// Scenario 3: Donation with attached image (hero)
printScenario(
  "donation / single bubble / with attached image",
  buildPointDonationReceivedMessage({
    fromUserName: "工藤シンク",
    fromUserImageUrl: SAMPLE_FROM_USER_IMAGE,
    toUserName: "MIO",
    toUserImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 555,
    comment: "記念の1枚",
    attachedImageUrl: SAMPLE_ATTACHED_IMAGE,
    createdAt: new Date("2026-04-15T21:30:00+09:00"),
    redirectUrl: "https://liff.example.com/wallets",
    language: Language.JA,
  }),
);

// Scenario 4: Donation carousel with 3 recent transactions
printScenario(
  "donation / carousel with 3 recent",
  buildPointDonationReceivedMessage({
    fromUserName: "工藤シンク",
    fromUserImageUrl: SAMPLE_FROM_USER_IMAGE,
    toUserName: "MIO",
    toUserImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 555,
    comment: "いつもありがとう！",
    createdAt: new Date("2026-04-15T21:30:00+09:00"),
    redirectUrl: "https://liff.example.com/wallets",
    language: Language.JA,
    recentTransactions,
  }),
);

// Scenario 5: Grant single bubble
printScenario(
  "grant / single bubble / no image",
  buildPointGrantReceivedMessage({
    communityName: "NEO88四国祭",
    communityImageUrl: SAMPLE_COMMUNITY_IMAGE,
    toUserName: "MIO",
    toUserImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 1000,
    createdAt: new Date("2026-04-15T21:30:00+09:00"),
    redirectUrl: "https://liff.example.com/wallets",
    language: Language.JA,
  }),
);

// Scenario 6: Grant carousel
printScenario(
  "grant / carousel with 3 recent",
  buildPointGrantReceivedMessage({
    communityName: "NEO88四国祭",
    communityImageUrl: SAMPLE_COMMUNITY_IMAGE,
    toUserName: "MIO",
    toUserImageUrl: SAMPLE_TO_USER_IMAGE,
    transferPoints: 1000,
    comment: "ボランティア参加ありがとうございます",
    attachedImageUrl: SAMPLE_ATTACHED_IMAGE,
    createdAt: new Date("2026-04-15T21:30:00+09:00"),
    redirectUrl: "https://liff.example.com/wallets",
    language: Language.JA,
    recentTransactions,
  }),
);

console.log("");
console.log("Paste any JSON block (BEGIN..END) into the LINE Flex Message Simulator:");
console.log("  https://developers.line.biz/flex-simulator/");
console.log("");

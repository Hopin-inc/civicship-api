import "reflect-metadata";
import { buildPointDonationToCommunityReceivedMessage } from "@/application/domain/notification/presenter/message/pointDonationToCommunityReceivedMessage";
import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";

describe("buildPointDonationToCommunityReceivedMessage", () => {
  const baseParams = {
    fromUserName: "田中太郎" as string | undefined,
    transferPoints: 100,
    redirectUrl: "https://example.com/admin/wallet",
    language: Language.JA,
  };

  it("should build a valid LINE Flex Message", () => {
    const message = buildPointDonationToCommunityReceivedMessage(baseParams);

    expect(message.type).toBe("flex");
    expect(message.altText).toBe("田中太郎さんからコミュニティに100ポイントが寄付されました🎁");
    expect(message.contents).toHaveProperty("type", "bubble");
  });

  it("should format points with Japanese locale (comma separator)", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      transferPoints: 10000,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointInfo.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("10,000pt");
  });

  it("should display correct sender name with さん suffix in Japanese", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      fromUserName: "佐藤花子",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const senderText = pointInfo.contents[1] as messagingApi.FlexText;

    expect(senderText.text).toBe("寄付者: 佐藤花子さん");
  });

  it("should display correct sender name in English", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      fromUserName: "John Doe",
      language: Language.EN,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const senderText = pointInfo.contents[1] as messagingApi.FlexText;

    expect(senderText.text).toBe("From: John Doe");
  });

  it("should use Japanese fallback name when fromUserName is undefined", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      fromUserName: undefined,
      language: Language.JA,
    });

    expect(message.altText).toBe("ユーザーさんからコミュニティに100ポイントが寄付されました🎁");

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const senderText = pointInfo.contents[1] as messagingApi.FlexText;
    expect(senderText.text).toBe("寄付者: ユーザーさん");
  });

  it("should use English fallback name when fromUserName is undefined", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      fromUserName: undefined,
      language: Language.EN,
    });

    expect(message.altText).toBe("User donated 100 points to the community 🎁");

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const senderText = pointInfo.contents[1] as messagingApi.FlexText;
    expect(senderText.text).toBe("From: User");
  });

  it("should include comment section when comment is provided", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      comment: "コミュニティの活動を応援しています！",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // title, pointInfo, commentSection, explainMessage = 4 items
    expect(body.contents).toHaveLength(4);

    const commentSection = body.contents[2] as messagingApi.FlexBox;
    expect(commentSection.backgroundColor).toBe("#F7F7F7");

    const commentText = commentSection.contents[1] as messagingApi.FlexText;
    expect(commentText.text).toBe("コミュニティの活動を応援しています！");
  });

  it("should exclude comment section when comment is undefined", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      comment: undefined,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // title, pointInfo, explainMessage = 3 items (no comment)
    expect(body.contents).toHaveLength(3);
  });

  it("should exclude comment section when comment is empty string", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      comment: "",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(3);
  });

  it("should exclude comment section when comment is whitespace only", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      comment: "   ",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(3);
  });

  it("should have correct Japanese title text", () => {
    const message = buildPointDonationToCommunityReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const titleText = body.contents[0] as messagingApi.FlexText;

    expect(titleText.text).toBe("コミュニティへのポイント寄付");
    expect(titleText.color).toBe("#1DB446");
  });

  it("should have correct English title text", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      language: Language.EN,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const titleText = body.contents[0] as messagingApi.FlexText;

    expect(titleText.text).toBe("Community Point Donation");
  });

  it("should include wallet button with correct URL", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      redirectUrl: "https://liff.example.com/admin/wallet",
    });

    const footer = (message.contents as messagingApi.FlexBubble).footer as messagingApi.FlexBox;
    const button = footer.contents[0] as messagingApi.FlexButton;

    expect(button.action.type).toBe("uri");
    expect((button.action as messagingApi.URIAction).uri).toBe("https://liff.example.com/admin/wallet");
    expect((button.action as messagingApi.URIAction).label).toBe("ウォレットを見る");
  });

  it("should have correct English button label", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      language: Language.EN,
      redirectUrl: "https://liff.example.com/admin/wallet",
    });

    const footer = (message.contents as messagingApi.FlexBubble).footer as messagingApi.FlexBox;
    const button = footer.contents[0] as messagingApi.FlexButton;

    expect((button.action as messagingApi.URIAction).label).toBe("View Wallet");
  });

  it("should handle large point values", () => {
    const message = buildPointDonationToCommunityReceivedMessage({
      ...baseParams,
      transferPoints: 1000000,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointInfo.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("1,000,000pt");
  });
});

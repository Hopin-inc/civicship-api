import "reflect-metadata";
import { buildPointDonationReceivedMessage } from "@/application/domain/notification/presenter/message/pointDonationReceivedMessage";
import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";

describe("buildPointDonationReceivedMessage", () => {
  const baseParams = {
    fromUserName: "田中太郎",
    fromUserImageUrl: "https://example.com/from.jpg",
    toUserName: "佐藤花子",
    toUserImageUrl: "https://example.com/to.jpg",
    transferPoints: 100,
    redirectUrl: "https://example.com/wallets",
    language: Language.JA,
    createdAt: new Date("2026-04-15T12:30:00Z"),
  };

  it("should build a valid LINE Flex Message", () => {
    const message = buildPointDonationReceivedMessage(baseParams);

    expect(message.type).toBe("flex");
    expect(message.altText).toBe("田中太郎さんから100ポイントが送られました🎁");
    expect(message.contents).toHaveProperty("type", "bubble");
  });

  it("should format points with Japanese locale (comma separator)", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      transferPoints: 10000,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointSection = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("10,000");
  });

  it("should include both sender and receiver avatar/name", () => {
    const message = buildPointDonationReceivedMessage(baseParams);
    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const userRow = body.contents[0] as messagingApi.FlexBox;

    const fromColumn = userRow.contents[0] as messagingApi.FlexBox;
    const arrow = userRow.contents[1] as messagingApi.FlexText;
    const toColumn = userRow.contents[2] as messagingApi.FlexBox;

    expect(arrow.text).toBe("→");
    expect((fromColumn.contents[1] as messagingApi.FlexText).text).toBe("田中太郎");
    expect((toColumn.contents[1] as messagingApi.FlexText).text).toBe("佐藤花子");
  });

  it("should include header image when attachedImageUrl is provided", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      attachedImageUrl: "https://example.com/photo.jpg",
    });
    const bubble = message.contents as messagingApi.FlexBubble;

    expect(bubble.header).toBeDefined();
    const headerImage = (bubble.header as messagingApi.FlexBox)
      .contents[0] as messagingApi.FlexImage;
    expect(headerImage.type).toBe("image");
    expect(headerImage.url).toBe("https://example.com/photo.jpg");
  });

  it("should omit header when attachedImageUrl is undefined", () => {
    const message = buildPointDonationReceivedMessage(baseParams);
    const bubble = message.contents as messagingApi.FlexBubble;

    expect(bubble.header).toBeUndefined();
  });

  it("should not include a title text in the body", () => {
    const message = buildPointDonationReceivedMessage(baseParams);
    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    // First element should be the user transfer row (box), not a title (text)
    expect((body.contents[0] as { type: string }).type).toBe("box");
  });

  it("should include comment as plain quoted text without label or background", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "いつもありがとうございます！",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // userRow, points, comment, dateTime = 4 elements
    expect(body.contents).toHaveLength(4);

    const commentText = body.contents[2] as messagingApi.FlexText;
    expect(commentText.type).toBe("text");
    expect(commentText.text).toBe("「いつもありがとうございます！」");
    // No background color, no label
    expect(
      (commentText as unknown as { backgroundColor?: string }).backgroundColor,
    ).toBeUndefined();
  });

  it("should exclude comment when comment is undefined", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: undefined,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // userRow, points, dateTime = 3 elements (no comment)
    expect(body.contents).toHaveLength(3);
  });

  it("should exclude comment when comment is empty string", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(3);
  });

  it("should exclude comment when comment is whitespace only", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "   ",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(3);
  });

  it("should include date and reason label", () => {
    const message = buildPointDonationReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const dateText = body.contents[2] as messagingApi.FlexText;

    expect(dateText.text).toContain("·");
    expect(dateText.text).toContain("譲渡");
  });

  it("should include wallet button with correct URL", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      redirectUrl: "https://liff.example.com/wallets",
    });

    const footer = (message.contents as messagingApi.FlexBubble).footer as messagingApi.FlexBox;
    const button = footer.contents[0] as messagingApi.FlexButton;

    expect(button.action.type).toBe("uri");
    expect((button.action as messagingApi.URIAction).uri).toBe("https://liff.example.com/wallets");
    expect((button.action as messagingApi.URIAction).label).toBe("ウォレットを見る");
  });

  it("should handle very large point values", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      transferPoints: 1000000,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointSection = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("1,000,000");
  });

  it("should handle single digit point values", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      transferPoints: 5,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointSection = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("5");
  });
});

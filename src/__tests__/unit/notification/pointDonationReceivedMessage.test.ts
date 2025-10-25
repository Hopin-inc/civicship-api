import "reflect-metadata";
import { buildPointDonationReceivedMessage } from "@/application/domain/notification/presenter/message/pointDonationReceivedMessage";
import { messagingApi } from "@line/bot-sdk";

describe("buildPointDonationReceivedMessage", () => {
  const baseParams = {
    fromUserName: "田中太郎",
    transferPoints: 100,
    redirectUrl: "https://example.com/wallets",
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
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointInfo.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("10,000pt");
  });

  it("should display correct sender name with さん suffix", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      fromUserName: "佐藤花子",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const senderText = pointInfo.contents[1] as messagingApi.FlexText;

    expect(senderText.text).toBe("送付者: 佐藤花子さん");
  });

  it("should include comment section when comment is provided", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "いつもありがとうございます！",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // Should have 3 components: title, pointInfo, commentSection
    expect(body.contents).toHaveLength(3);

    const commentSection = body.contents[2] as messagingApi.FlexBox;
    expect(commentSection.backgroundColor).toBe("#F7F7F7");

    const commentText = commentSection.contents[0] as messagingApi.FlexText;
    expect(commentText.text).toBe("いつもありがとうございます！");
  });

  it("should exclude comment section when comment is undefined", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: undefined,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // Should have only 2 components: title, pointInfo (no comment)
    expect(body.contents).toHaveLength(2);
  });

  it("should exclude comment section when comment is empty string", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // Should have only 2 components: title, pointInfo (no comment)
    expect(body.contents).toHaveLength(2);
  });

  it("should exclude comment section when comment is whitespace only", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "   ",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // Should have only 2 components: title, pointInfo (no comment)
    expect(body.contents).toHaveLength(2);
  });

  it("should have correct title text", () => {
    const message = buildPointDonationReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const titleText = body.contents[0] as messagingApi.FlexText;

    expect(titleText.text).toBe("ポイントの受け取り");
    expect(titleText.color).toBe("#1DB446");
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
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointInfo.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("1,000,000pt");
  });

  it("should handle single digit point values", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      transferPoints: 5,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointInfo = body.contents[1] as messagingApi.FlexBox;
    const pointText = pointInfo.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("5pt");
  });
});

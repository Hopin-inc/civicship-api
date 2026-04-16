import "reflect-metadata";
import { buildPointDonationReceivedMessage } from "@/application/domain/notification/presenter/message/pointDonationReceivedMessage";
import { RecentTransactionEntry } from "@/application/domain/notification/presenter/message/pointTransferCardMessage";
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
    const pointSection = body.contents[2] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("10,000");
  });

  it("should include both sender and receiver avatar/name", () => {
    const message = buildPointDonationReceivedMessage(baseParams);
    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const userRow = body.contents[1] as messagingApi.FlexBox;

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

  it("should include comment section when comment is provided", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "いつもありがとうございます！",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // title, userRow, points, dateTime, comment = 5 elements
    expect(body.contents).toHaveLength(5);

    const commentSection = body.contents[4] as messagingApi.FlexBox;
    expect(commentSection.backgroundColor).toBe("#F7F7F7");

    const commentText = commentSection.contents[1] as messagingApi.FlexText;
    expect(commentText.text).toBe("いつもありがとうございます！");
  });

  it("should exclude comment section when comment is undefined", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: undefined,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // title, userRow, points, dateTime = 4 elements (no comment)
    expect(body.contents).toHaveLength(4);
  });

  it("should exclude comment section when comment is empty string", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(4);
  });

  it("should exclude comment section when comment is whitespace only", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      comment: "   ",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(4);
  });

  it("should have correct title text", () => {
    const message = buildPointDonationReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const titleText = body.contents[0] as messagingApi.FlexText;

    expect(titleText.text).toBe("ポイントの受け取り");
    expect(titleText.color).toBe("#1DB446");
  });

  it("should include date and reason label", () => {
    const message = buildPointDonationReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const dateText = body.contents[3] as messagingApi.FlexText;

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
    const pointSection = body.contents[2] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("1,000,000");
  });

  it("should handle single digit point values", () => {
    const message = buildPointDonationReceivedMessage({
      ...baseParams,
      transferPoints: 5,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointSection = body.contents[2] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("5");
  });

  describe("carousel with recent transactions", () => {
    const recentTransactions: RecentTransactionEntry[] = [
      {
        fromName: "山田太郎",
        fromImageUrl: "https://example.com/yamada.jpg",
        toName: "鈴木次郎",
        toImageUrl: "https://example.com/suzuki.jpg",
        transferPoints: 300,
        createdAt: new Date("2026-04-14T10:00:00Z"),
        kind: "donation",
      },
      {
        fromName: "テストコミュニティ",
        fromImageUrl: "https://example.com/community.jpg",
        toName: "高橋三郎",
        toImageUrl: "https://example.com/takahashi.jpg",
        transferPoints: 500,
        createdAt: new Date("2026-04-13T09:00:00Z"),
        kind: "grant",
      },
    ];

    it("should return single bubble when no recent transactions", () => {
      const message = buildPointDonationReceivedMessage(baseParams);
      expect(message.contents).toHaveProperty("type", "bubble");
    });

    it("should return carousel when recent transactions are provided", () => {
      const message = buildPointDonationReceivedMessage({
        ...baseParams,
        recentTransactions,
      });
      expect(message.contents).toHaveProperty("type", "carousel");
    });

    it("should have main bubble + mini bubbles + view-more bubble", () => {
      const message = buildPointDonationReceivedMessage({
        ...baseParams,
        recentTransactions,
      });
      const carousel = message.contents as messagingApi.FlexCarousel;

      // main(1) + recent(2) + viewMore(1) = 4
      expect(carousel.contents).toHaveLength(4);
      expect(carousel.contents[0].type).toBe("bubble");
      expect(carousel.contents[1].size).toBe("micro");
      expect(carousel.contents[2].size).toBe("micro");
      expect(carousel.contents[3].size).toBe("micro");
    });

    it("should show recent transaction points in mini bubbles", () => {
      const message = buildPointDonationReceivedMessage({
        ...baseParams,
        recentTransactions,
      });
      const carousel = message.contents as messagingApi.FlexCarousel;
      const miniBubble = carousel.contents[1] as messagingApi.FlexBubble;
      const body = miniBubble.body as messagingApi.FlexBox;

      const pointBox = body.contents[2] as messagingApi.FlexBox;
      const pointText = pointBox.contents[0] as messagingApi.FlexText;
      expect(pointText.text).toBe("300");
    });

    it("should return empty recent transactions as single bubble", () => {
      const message = buildPointDonationReceivedMessage({
        ...baseParams,
        recentTransactions: [],
      });
      expect(message.contents).toHaveProperty("type", "bubble");
    });
  });
});

import "reflect-metadata";
import { buildPointGrantReceivedMessage } from "@/application/domain/notification/presenter/message/pointGrantReceivedMessage";
import { RecentTransactionEntry } from "@/application/domain/notification/presenter/message/pointTransferCardMessage";
import { messagingApi } from "@line/bot-sdk";
import { Language } from "@prisma/client";

describe("buildPointGrantReceivedMessage", () => {
  const baseParams = {
    communityName: "テストコミュニティ",
    communityImageUrl: "https://example.com/community.jpg",
    toUserName: "佐藤花子",
    toUserImageUrl: "https://example.com/to.jpg",
    transferPoints: 100,
    redirectUrl: "https://example.com/wallets",
    language: Language.JA,
    createdAt: new Date("2026-04-15T12:30:00Z"),
  };

  it("should build a valid LINE Flex Message", () => {
    const message = buildPointGrantReceivedMessage(baseParams);

    expect(message.type).toBe("flex");
    expect(message.altText).toBe("テストコミュニティから100ポイントが付与されました🎁");
    expect(message.contents).toHaveProperty("type", "bubble");
  });

  it("should format points with Japanese locale (comma separator)", () => {
    const message = buildPointGrantReceivedMessage({
      ...baseParams,
      transferPoints: 10000,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointSection = body.contents[2] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("10,000");
  });

  it("should include both community and receiver avatar/name", () => {
    const message = buildPointGrantReceivedMessage(baseParams);
    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const userRow = body.contents[1] as messagingApi.FlexBox;

    const fromColumn = userRow.contents[0] as messagingApi.FlexBox;
    const arrow = userRow.contents[1] as messagingApi.FlexText;
    const toColumn = userRow.contents[2] as messagingApi.FlexBox;

    expect(arrow.text).toBe("→");
    expect((fromColumn.contents[1] as messagingApi.FlexText).text).toBe("テストコミュニティ");
    expect((toColumn.contents[1] as messagingApi.FlexText).text).toBe("佐藤花子");
  });

  it("should include header image when attachedImageUrl is provided", () => {
    const message = buildPointGrantReceivedMessage({
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
    const message = buildPointGrantReceivedMessage(baseParams);
    const bubble = message.contents as messagingApi.FlexBubble;

    expect(bubble.header).toBeUndefined();
  });

  it("should include comment section when comment is provided", () => {
    const message = buildPointGrantReceivedMessage({
      ...baseParams,
      comment: "ボランティア参加ありがとうございます",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;

    // title, userRow, points, dateTime, comment = 5 elements
    expect(body.contents).toHaveLength(5);

    const commentSection = body.contents[4] as messagingApi.FlexBox;
    expect(commentSection.backgroundColor).toBe("#F7F7F7");

    const commentText = commentSection.contents[1] as messagingApi.FlexText;
    expect(commentText.text).toBe("ボランティア参加ありがとうございます");
  });

  it("should exclude comment section when comment is undefined", () => {
    const message = buildPointGrantReceivedMessage({
      ...baseParams,
      comment: undefined,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(4);
  });

  it("should exclude comment section when comment is empty string", () => {
    const message = buildPointGrantReceivedMessage({
      ...baseParams,
      comment: "",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(4);
  });

  it("should exclude comment section when comment is whitespace only", () => {
    const message = buildPointGrantReceivedMessage({
      ...baseParams,
      comment: "   ",
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    expect(body.contents).toHaveLength(4);
  });

  it("should have correct title text", () => {
    const message = buildPointGrantReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const titleText = body.contents[0] as messagingApi.FlexText;

    expect(titleText.text).toBe("ポイントの付与");
    expect(titleText.color).toBe("#1DB446");
  });

  it("should include date and reason label", () => {
    const message = buildPointGrantReceivedMessage(baseParams);

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const dateText = body.contents[3] as messagingApi.FlexText;

    expect(dateText.text).toContain("·");
    expect(dateText.text).toContain("付与");
  });

  it("should include wallet button with correct URL", () => {
    const message = buildPointGrantReceivedMessage({
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
    const message = buildPointGrantReceivedMessage({
      ...baseParams,
      transferPoints: 1000000,
    });

    const body = (message.contents as messagingApi.FlexBubble).body as messagingApi.FlexBox;
    const pointSection = body.contents[2] as messagingApi.FlexBox;
    const pointText = pointSection.contents[0] as messagingApi.FlexText;

    expect(pointText.text).toBe("1,000,000");
  });

  it("should handle single digit point values", () => {
    const message = buildPointGrantReceivedMessage({
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
    ];

    it("should return single bubble when no recent transactions", () => {
      const message = buildPointGrantReceivedMessage(baseParams);
      expect(message.contents).toHaveProperty("type", "bubble");
    });

    it("should return carousel when recent transactions are provided", () => {
      const message = buildPointGrantReceivedMessage({
        ...baseParams,
        recentTransactions,
      });
      expect(message.contents).toHaveProperty("type", "carousel");
    });

    it("should have main bubble + mini bubbles + view-more bubble", () => {
      const message = buildPointGrantReceivedMessage({
        ...baseParams,
        recentTransactions,
      });
      const carousel = message.contents as messagingApi.FlexCarousel;

      // main(1) + recent(1) + viewMore(1) = 3
      expect(carousel.contents).toHaveLength(3);
      expect(carousel.contents[0].type).toBe("bubble");
      expect(carousel.contents[1].size).toBe("micro");
      expect(carousel.contents[2].size).toBe("micro");
    });

    it("should return empty recent transactions as single bubble", () => {
      const message = buildPointGrantReceivedMessage({
        ...baseParams,
        recentTransactions: [],
      });
      expect(message.contents).toHaveProperty("type", "bubble");
    });
  });
});

import { FlexMessage, FlexBubble, FlexBox, FlexImage } from "@line/bot-sdk";

export default class CancelOpportunitySlotMessage {
  private static hero: FlexImage = {
    type: "image",
    url: "https://s3-ap-northeast-1.amazonaws.com/seiryu/66b7cbe0421aa90001d53e2f/programs/66ebc34f421aa900016bdb05/image1s/display.jpg?1728888483",
    size: "full",
    aspectRatio: "20:13",
    aspectMode: "cover",
  };

  private static body: FlexBox = {
    type: "box",
    layout: "vertical",
    contents: [
      {
        type: "text",
        text: "開催が中止されました",
        color: "#2563EB",
        size: "sm",
      },
      {
        type: "text",
        text: "7月25日（土）13:00-15:00",
        weight: "bold",
        size: "lg",
      },
    ],
  };

  private static bubble: FlexBubble = {
    type: "bubble",
    hero: this.hero,
    body: this.body,
  };

  public static get flexMessage(): FlexMessage {
    return {
      type: "flex",
      altText: "中止のお知らせ",
      contents: this.bubble,
    };
  }
}

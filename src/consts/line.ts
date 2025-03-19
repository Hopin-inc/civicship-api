import { FlexBubble } from "@line/bot-sdk";
import { FlexBox, FlexComponent, FlexImage, FlexVideo } from "@line/bot-sdk/lib/types";

export default class LineMessageBuilder {
  private static header: FlexBox = {
    type: "box",
    layout: "baseline",
    contents: [
      {
        type: "text",
        text: "申込完了",
        size: "lg",
        weight: "bold",
        color: "#FFFFFF",
      },
    ],
    backgroundColor: "#00B900",
  };

  private static hero: FlexBox | FlexImage | FlexVideo = {
    type: "image",
    url: "https://cc-v3-demo.vercel.app/images/activities/olive.jpg",
    size: "full",
    aspectRatio: "20:13",
    aspectMode: "cover",
  };

  private static contents: FlexComponent[] = [
    {
      type: "text",
      text: "オリーブ兄弟から学ぶ　オリーブ収穫・テイスティング体験",
      wrap: true,
      weight: "bold",
      gravity: "center",
      size: "xl",
    },
    {
      type: "box",
      layout: "vertical",
      margin: "lg",
      spacing: "sm",
      contents: [
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "日付",
              color: "#aaaaaa",
              size: "sm",
              flex: 1,
            },
            {
              type: "text",
              text: "2025年03月01日(土)",
              wrap: true,
              size: "sm",
              color: "#666666",
              flex: 4,
            },
          ],
        },
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "時間",
              color: "#aaaaaa",
              size: "sm",
              flex: 1,
            },
            {
              type: "text",
              text: "17:00〜18:20",
              wrap: true,
              color: "#666666",
              size: "sm",
              flex: 4,
            },
          ],
        },
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "場所",
              color: "#aaaaaa",
              size: "sm",
              flex: 1,
            },
            {
              type: "text",
              text: "小豆島オリーブ園",
              wrap: true,
              color: "#666666",
              size: "sm",
              flex: 4,
            },
          ],
        },
        {
          type: "box",
          layout: "baseline",
          spacing: "sm",
          contents: [
            {
              type: "text",
              text: "人数",
              color: "#aaaaaa",
              size: "sm",
              flex: 1,
            },
            {
              type: "text",
              text: "3名",
              wrap: true,
              size: "sm",
              color: "#666666",
              flex: 4,
            },
          ],
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "詳細を見る",
            uri: "https://cc-v3-demo.vercel.app/",
          },
          style: "link",
          margin: "xxl",
        },
      ],
    },
  ];

  public static flexBubble: FlexBubble = {
    type: "bubble",
    header: LineMessageBuilder.header,
    hero: LineMessageBuilder.hero,
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: LineMessageBuilder.contents,
    },
  };
}

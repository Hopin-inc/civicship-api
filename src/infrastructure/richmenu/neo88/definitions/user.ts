import { LineRichMenuType } from "@prisma/client";
import { RichMenuDefinition } from "../../types";

export const userMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "ユーザーメニュー",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 2500,
        height: 843,
      },
      action: {
        type: "uri",
        label: "ホームに戻る",
        uri: "${LIFF_BASE_URL}",
      },
    },
    {
      bounds: {
        x: 0,
        y: 843,
        width: 833,
        height: 843,
      },
      action: {
        type: "uri",
        label: "みつける",
        uri: "${LIFF_BASE_URL}/activities",
      },
    },
    {
      bounds: {
        x: 833,
        y: 843,
        width: 833,
        height: 843,
      },
      action: {
        type: "uri",
        label: "拠点",
        uri: "${LIFF_BASE_URL}/places?mode=map",
      },
    },
    {
      bounds: {
        x: 1666,
        y: 843,
        width: 834,
        height: 843,
      },
      action: {
        type: "uri",
        label: "マイページ",
        uri: "${LIFF_BASE_URL}/users/me",
      },
    },
  ],
  alias: "user-menu",
  imagePath: "images/user_menu.png",
  roleEntryFor: LineRichMenuType.USER,
};

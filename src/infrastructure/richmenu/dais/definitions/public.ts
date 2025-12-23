import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const publicMenu: RichMenuDefinition = {
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
        width: 2500,
        height: 843,
      },
      action: {
        type: "uri",
        label: "マイページ",
        uri: "${LIFF_BASE_URL}/users/me",
      },
    },
  ],
  alias: "public-menu",
  imagePath: "images/public_menu.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
  isDefault: true,
};

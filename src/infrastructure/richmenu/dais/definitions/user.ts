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
        x: 95,
        y: 146,
        width: 980,
        height: 318,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "admin-menu",
        data: "switch:admin-menu",
      },
    },
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
  alias: "user-menu",
  imagePath: "images/user_menu.png",
};

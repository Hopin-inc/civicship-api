import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const adminMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "管理者メニュー",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: {
        x: 135,
        y: 95,
        width: 687,
        height: 250,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "user-menu",
        data: "switch:user-menu",
      },
    },
    {
      bounds: {
        x: 324,
        y: 787,
        width: 740,
        height: 428,
      },
      action: {
        type: "uri",
        label: "ウォレット",
        uri: "${LIFF_BASE_URL}/admin/wallet",
      },
    },
    {
      bounds: {
        x: 1436,
        y: 787,
        width: 740,
        height: 428,
      },
      action: {
        type: "uri",
        label: "権限管理",
        uri: "${LIFF_BASE_URL}/admin/members",
      },
    },
  ],
  alias: "admin-menu",
  imagePath: "images/admin_menu.jpg",
  roleEntryFor: LineRichMenuType.ADMIN,
};

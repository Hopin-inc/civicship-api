import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const ubuyamaMainMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "main",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: {
        x: 810,
        y: 0,
        width: 806,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "earn",
        data: "switch:earn",
      },
    },
    {
      bounds: {
        x: 1616,
        y: 0,
        width: 884,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "use",
        data: "switch:use",
      },
    },
    {
      bounds: {
        x: 104,
        y: 427,
        width: 1125,
        height: 1193,
      },
      action: {
        type: "uri",
        label: "マイメニュー",
        uri: "https://liff.line.me/2008931712-4aSCpO6F/users/me",
      },
    },
    {
      bounds: {
        x: 1270,
        y: 427,
        width: 1125,
        height: 1193,
      },
      action: {
        type: "uri",
        label: "オープンチャット",
        uri: "https://line.me/ti/g2/1mPeYbm_fnHSdLX6KbvHyoNhzCEkxkzKamgOxg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
      },
    },
  ],
  alias: "main",
  imagePath: "images/main.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
  isDefault: true,
};

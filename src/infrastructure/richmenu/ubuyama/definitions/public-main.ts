import { RichMenuDefinition } from "../../types";

export const publicMainMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "public_menu_main",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 810,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "public-main",
        data: "switch:public-main",
      },
    },
    {
      bounds: {
        x: 810,
        y: 0,
        width: 806,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "public-use",
        data: "switch:public-use",
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
        richMenuAliasId: "public-earn",
        data: "switch:public-earn",
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
  alias: "public-main",
  imagePath: "images/public_menu_main.png",
  isDefault: true,
};

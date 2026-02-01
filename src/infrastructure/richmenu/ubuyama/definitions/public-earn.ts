import { RichMenuDefinition } from "../../types";

export const publicEarnMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "public_menu_earn",
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
  ],
  alias: "public-earn",
  imagePath: "images/public_menu_earn.png",
};

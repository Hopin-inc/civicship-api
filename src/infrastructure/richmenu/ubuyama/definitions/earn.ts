import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const ubuyamaEarnMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "earn",
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
        richMenuAliasId: "main",
        data: "switch:main",
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
  ],
  alias: "earn",
  imagePath: "images/earn.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
};

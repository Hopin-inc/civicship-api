import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const ubuyamaUseMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "use",
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
  ],
  alias: "use",
  imagePath: "images/use.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
};

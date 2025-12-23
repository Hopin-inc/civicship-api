import { RichMenuDefinition } from "../../types";

export const userJoinMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "user_menu_join",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 884,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "user-use",
        data: "switch:user-use",
      },
    },
    {
      bounds: {
        x: 884,
        y: 0,
        width: 810,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "user-earn",
        data: "switch:user-earn",
      },
    },
    {
      bounds: {
        x: 1694,
        y: 0,
        width: 806,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "user-join",
        data: "switch:user-join",
      },
    },
    {
      bounds: {
        x: 886,
        y: 427,
        width: 1500,
        height: 576,
      },
      action: {
        type: "uri",
        label: "IZUとDAO",
        uri: "https://drive.google.com/file/d/1DAZ2IEdApt-X8SolJ2CKAE6mpw6bHxyk/view?usp=sharing",
      },
    },
  ],
  alias: "user-join",
  imagePath: "images/user_menu_join.png",
};

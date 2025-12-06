import { RichMenuDefinition } from "../../types";

export const userEarnMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "user_menu_earn",
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
        x: 104,
        y: 427,
        width: 1125,
        height: 1193,
      },
      action: {
        type: "uri",
        label: "お手伝いリストを見る",
        uri: "https://lookerstudio.google.com/u/0/reporting/cf17e3fb-837d-4882-8377-861ba07fb03d/page/O65dF",
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
        label: "お手伝い終了報告をする",
        uri: "https://docs.google.com/forms/d/e/1FAIpQLSdNXGVjkcdUTqfnvdAni2kCDezLctzuo8MQk13ZV4e3QXTFIA/viewform",
      },
    },
  ],
  alias: "user-earn",
  imagePath: "images/user_menu_earn.png",
};

import { RichMenuDefinition } from "../../types";

/**
 * さんりくDAO「参加する(Join)」メニュー。
 * 現状はタブ切替のみ機能。「投票」「About Us」「社員権NFT購入」は
 * 画像表示のみ（アクション未設定）。
 */
export const sanrikuJoinMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "join",
  chatBarText: "メニューを開く",
  areas: [
    // タブ: 使う
    {
      bounds: {
        x: 0,
        y: 0,
        width: 810,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "use",
        data: "switch:use",
      },
    },
    // タブ: 貯める
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
    // タブ: 参加する（選択中）
    {
      bounds: {
        x: 1616,
        y: 0,
        width: 884,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "join",
        data: "switch:join",
      },
    },
  ],
  alias: "join",
  imagePath: "images/join.png",
};

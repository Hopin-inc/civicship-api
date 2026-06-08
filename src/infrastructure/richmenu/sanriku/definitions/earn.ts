import { RichMenuDefinition } from "@/infrastructure/richmenu/types";

/**
 * さんりくDAO「貯める(Earn)」メニュー。
 * 現状はタブ切替のみ機能。「お手伝いリストを見る」「お手伝い終了報告をする」は
 * 画像表示のみ（アクション未設定）。
 */
export const sanrikuEarnMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "earn",
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
    // タブ: 貯める（選択中）
    {
      bounds: {
        x: 810,
        y: 0,
        width: 884,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "earn",
        data: "switch:earn",
      },
    },
    // タブ: 参加する
    {
      bounds: {
        x: 1694,
        y: 0,
        width: 806,
        height: 360,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "join",
        data: "switch:join",
      },
    },
  ],
  alias: "earn",
  imagePath: "images/earn.png",
};

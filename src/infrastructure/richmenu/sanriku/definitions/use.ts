import { RichMenuDefinition } from "@/infrastructure/richmenu/types";
import { LineRichMenuType } from "@prisma/client";

/**
 * さんりくDAO「使う(Use)」メニュー。
 * デフォルト表示メニュー。現状リンクするのは「マイページ」のみで、
 * 「使い先を見る」「MAPで見る」は画像表示のみ（アクション未設定）。
 */
export const sanrikuUseMenu: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "use",
  chatBarText: "メニューを開く",
  areas: [
    // タブ: 使う（選択中）
    {
      bounds: {
        x: 0,
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
    // タブ: 貯める
    {
      bounds: {
        x: 884,
        y: 0,
        width: 810,
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
    // マイページ（唯一リンクするボタン）
    {
      bounds: {
        x: 104,
        y: 427,
        width: 2291,
        height: 576,
      },
      action: {
        type: "uri",
        label: "マイページ",
        uri: "${LIFF_BASE_URL}/users/me",
      },
    },
  ],
  alias: "use",
  imagePath: "images/use.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
  isDefault: true,
};

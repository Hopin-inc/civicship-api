import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const kibotchaMain: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "ユーザーメニュー",
  chatBarText: "メニューを開く",
  areas: [
    {
      bounds: {
        x: 1250,
        y: 0,
        width: 1249,
        height: 197,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "nft",
        data: "switch:nft",
      },
    },
    {
      // [マイページ]
      bounds: { x: 255, y: 133, width: 966, height: 797 },
      action: {
        type: "uri",
        label: "マイページ",
        uri: "https://liff.line.me/2007594504-p9d67D74/users/me",
      },
    },
    {
      // [貢献活動一覧]
      bounds: { x: 1250, y: 317, width: 1117, height: 185 },
      action: {
        type: "uri",
        label: "貢献活動一覧",
        uri: "https://docs.google.com/spreadsheets/d/1GAYtAgvbbifGwU9cCJctj9YyDLhZLuw4NglqLUfG1EI/htmlview#gid=0",
      },
    },
    {
      // [貢献納品フォーム]
      bounds: { x: 1250, y: 594, width: 1117, height: 185 },
      action: {
        type: "uri",
        label: "貢献納品フォーム",
        uri: "https://docs.google.com/forms/d/e/1FAIpQLSf3Ve1CTa5UVYxWd5_AOlUIPwE-TRe89WYIP0Sh878w6nkenQ/viewform?pli=1",
      },
    },
    {
      // [利用先一覧]
      bounds: { x: 1250, y: 870, width: 1117, height: 185 },
      action: {
        type: "uri",
        label: "利用先一覧",
        uri: "https://docs.google.com/document/u/0/d/1hkP3FNMrY42Xxc9ijPsYmsLNbPCi1Py-FXefg-_IX7g/mobilebasic#heading=h.s7jj7h28vpes",
      },
    },
    {
      // [メンバーを知る]
      bounds: { x: 71, y: 1235, width: 723, height: 375 },
      action: {
        type: "uri",
        label: "メンバーを知る",
        uri: "https://note.com/kibotcha_",
      },
    },
    {
      // [オープンチャット]
      bounds: { x: 893, y: 1235, width: 782, height: 465 },
      action: {
        type: "uri",
        label: "オープンチャット",
        uri: "https://line.me/ti/g2/Nrb7NZurR212jRQ0tmJjz0EKUV_HgF136nUuBA?",
      },
    },
    {
      // [公式HP]
      bounds: { x: 1701, y: 1235, width: 782, height: 465 },
      action: {
        type: "uri",
        label: "公式HP",
        uri: "https://kibotcha.com/",
      },
    },
  ],
  alias: "main",
  imagePath: "images/main.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
  isDefault: true,
};

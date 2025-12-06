import { RichMenuDefinition } from "../../types";

export const userMenu: RichMenuDefinition = {
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
        x: 34,
        y: 29,
        width: 282,
        height: 237,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "admin-menu",
        data: "switch:admin-menu",
      },
    },
    {
      bounds: {
        x: 357,
        y: 31,
        width: 1769,
        height: 237,
      },
      action: {
        type: "uri",
        label: "マイページ",
        uri: "https://liff.line.me/2007594504-p9d67D74/users/me",
      },
    },
    {
      bounds: {
        x: 38,
        y: 320,
        width: 782,
        height: 505,
      },
      action: {
        type: "uri",
        label: "貢献一覧",
        uri: "https://docs.google.com/spreadsheets/d/1GAYtAgvbbifGwU9cCJctj9YyDLhZLuw4NglqLUfG1EI/edit?gid=0#gid=0",
      },
    },
    {
      bounds: {
        x: 858,
        y: 320,
        width: 782,
        height: 505,
      },
      action: {
        type: "uri",
        label: "貢献納品フォーム",
        uri: "https://docs.google.com/forms/d/e/1FAIpQLSf3Ve1CTa5UVYxWd5_AOlUIPwE-TRe89WYIP0Sh878w6nkenQ/viewform",
      },
    },
    {
      bounds: {
        x: 1676,
        y: 320,
        width: 782,
        height: 505,
      },
      action: {
        type: "uri",
        label: "利用先一覧",
        uri: "https://docs.google.com/document/u/0/d/1hkP3FNMrY42Xxc9ijPsYmsLNbPCi1Py-FXefg-_IX7g/mobilebasic#heading=h.s7jj7h28vpes",
      },
    },
    {
      bounds: {
        x: 46,
        y: 861,
        width: 782,
        height: 465,
      },
      action: {
        type: "uri",
        label: "メンバーを知る",
        uri: "https://note.com/kibotcha_",
      },
    },
    {
      bounds: {
        x: 1677,
        y: 861,
        width: 782,
        height: 465,
      },
      action: {
        type: "uri",
        label: "公式HPへ",
        uri: "https://kibotcha.com",
      },
    },
    {
      bounds: {
        x: 58,
        y: 1485,
        width: 1159,
        height: 172,
      },
      action: {
        type: "uri",
        label: "KIBOTCHA DAO NFT",
        uri: "https://dao.kibotcha.com/",
      },
    },
    {
      bounds: {
        x: 1282,
        y: 1484,
        width: 1159,
        height: 172,
      },
      action: {
        type: "uri",
        label: "アースバッグハウス NFT",
        uri: "https://dao.kibotcha.com/iedao",
      },
    },
  ],
  alias: "user-menu",
  imagePath: "images/user_menu.jpg",
};

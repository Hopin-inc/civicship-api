import { RichMenuDefinition } from "../../types";
import { LineRichMenuType } from "@prisma/client";

export const kibotchaNft: RichMenuDefinition = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: true,
  name: "NFTメニュー",
  chatBarText: "メニューを開く",
  areas: [
    {
      // [タブ/ MAINへ切り替え]
      bounds: {
        x: 0,
        y: 0,
        width: 1255,
        height: 197,
      },
      action: {
        type: "richmenuswitch",
        richMenuAliasId: "main", // メインメニューのエイリアスID
        data: "switch:main",
      },
    },
    {
      // [住民証NFT]
      bounds: {
        x: 167,
        y: 534,
        width: 975,
        height: 975,
      },
      action: {
        type: "uri",
        label: "住民証NFT",
        uri: "https://dao.kibotcha.com/",
      },
    },
    {
      // [オーナー権NFT]
      bounds: {
        x: 1359,
        y: 534,
        width: 975,
        height: 975,
      },
      action: {
        type: "uri",
        label: "オーナー権NFT",
        uri: "https://dao.kibotcha.com/iedao",
      },
    },
  ],
  alias: "nft",
  imagePath: "images/nft.png",
  roleEntryFor: LineRichMenuType.PUBLIC,
};

import { RichMenuArea } from "../../types";

/**
 * 「参加する(Join)」メニュー右下の「社員権NFT購入」ボタン領域。
 * public-join / user-join で共通利用する。
 */
export const buyMembershipNftArea: RichMenuArea = {
  bounds: {
    x: 886,
    y: 1044,
    width: 1500,
    height: 576,
  },
  action: {
    type: "uri",
    label: "社員権NFT購入",
    uri: "https://dao.izudao.net/",
  },
};

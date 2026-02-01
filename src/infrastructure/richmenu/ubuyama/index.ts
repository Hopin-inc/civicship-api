import { CommunityRichMenuConfig } from "../types";
import { publicUseMenu } from "./definitions/public-use";
import { publicEarnMenu } from "./definitions/public-earn";
import { publicMainMenu } from "./definitions/public-main";

export const ubuyamaConfig: CommunityRichMenuConfig = {
  communityId: "ubuyama",
  menus: [publicUseMenu, publicEarnMenu, publicMainMenu],
};

export { publicUseMenu, publicEarnMenu, publicMainMenu };

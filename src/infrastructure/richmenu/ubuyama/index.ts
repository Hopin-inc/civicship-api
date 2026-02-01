import { CommunityRichMenuConfig } from "../types";
import { ubuyamaUseMenu } from "./definitions/use";
import { ubuyamaEarnMenu } from "./definitions/earn";
import { ubuyamaMainMenu } from "./definitions/main";

export const ubuyamaConfig: CommunityRichMenuConfig = {
  communityId: "ubuyama",
  menus: [ubuyamaUseMenu, ubuyamaEarnMenu, ubuyamaMainMenu],
};

export { ubuyamaUseMenu, ubuyamaEarnMenu, ubuyamaMainMenu };

import { CommunityRichMenuConfig } from "../types";
import { adminMenu } from "./definitions/admin";
import { userMenu } from "./definitions/user";
import { publicMenu } from "./definitions/public";

export const daisConfig: CommunityRichMenuConfig = {
  communityId: "dais",
  menus: [adminMenu, userMenu, publicMenu],
};

export { adminMenu, userMenu, publicMenu };

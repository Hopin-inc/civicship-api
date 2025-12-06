import { CommunityRichMenuConfig } from "../types";
import { adminMenu } from "./definitions/admin";
import { userMenu } from "./definitions/user";
import { publicMenu } from "./definitions/public";

export const neo88Config: CommunityRichMenuConfig = {
  communityId: "neo88",
  menus: [adminMenu, userMenu, publicMenu],
};

export { adminMenu, userMenu, publicMenu };

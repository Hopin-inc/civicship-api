import { CommunityRichMenuConfig } from "../types";
import { adminMenu } from "./definitions/admin";
import { userUseMenu } from "./definitions/user-use";
import { userEarnMenu } from "./definitions/user-earn";
import { userJoinMenu } from "./definitions/user-join";
import { publicUseMenu } from "./definitions/public-use";
import { publicEarnMenu } from "./definitions/public-earn";
import { publicJoinMenu } from "./definitions/public-join";

export const izuConfig: CommunityRichMenuConfig = {
  communityId: "izu",
  menus: [
    adminMenu,
    userUseMenu,
    userEarnMenu,
    userJoinMenu,
    publicUseMenu,
    publicEarnMenu,
    publicJoinMenu,
  ],
};

export {
  adminMenu,
  userUseMenu,
  userEarnMenu,
  userJoinMenu,
  publicUseMenu,
  publicEarnMenu,
  publicJoinMenu,
};

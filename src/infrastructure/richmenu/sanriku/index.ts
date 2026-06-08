import { CommunityRichMenuConfig } from "@/infrastructure/richmenu/types";
import { sanrikuUseMenu } from "./definitions/use";
import { sanrikuEarnMenu } from "./definitions/earn";
import { sanrikuJoinMenu } from "./definitions/join";

export const sanrikuConfig: CommunityRichMenuConfig = {
  communityId: "sanriku",
  menus: [sanrikuUseMenu, sanrikuEarnMenu, sanrikuJoinMenu],
};

export { sanrikuUseMenu, sanrikuEarnMenu, sanrikuJoinMenu };

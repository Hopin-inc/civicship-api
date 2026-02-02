import { CommunityRichMenuConfig } from "../types";
import { kibotchaMain } from "@/infrastructure/richmenu/kibotcha/definitions/main";
import { kibotchaNft } from "@/infrastructure/richmenu/kibotcha/definitions/nft";

export const kibotchaConfig: CommunityRichMenuConfig = {
  communityId: "kibotcha",
  menus: [kibotchaMain, kibotchaNft],
};

export { kibotchaMain, kibotchaNft };

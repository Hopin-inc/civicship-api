import { CommunityRichMenuConfig } from "./types";
import { neo88Config } from "./neo88";
import { izuConfig } from "./izu";
import { daisConfig } from "./dais";
import { kibotchaConfig } from "./kibotcha";

export const communityConfigs: Record<string, CommunityRichMenuConfig> = {
  neo88: neo88Config,
  izu: izuConfig,
  dais: daisConfig,
  kibotcha: kibotchaConfig,
};

export function getCommunityConfig(communityId: string): CommunityRichMenuConfig | undefined {
  return communityConfigs[communityId];
}

export function getAllCommunityIds(): string[] {
  return Object.keys(communityConfigs);
}

export * from "./types";
export * from "./utils";

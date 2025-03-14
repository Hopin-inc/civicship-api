import { ShieldRule } from "graphql-shield/typings/types";
import { isCommunityManager, isCommunityMember } from "@/presentation/graphql/permission/rule";

const articleQueryPermissions: Record<string, ShieldRule> = {
  articlesCommunityInternal: isCommunityMember,
  articlesAll: isCommunityManager,
};

export { articleQueryPermissions };

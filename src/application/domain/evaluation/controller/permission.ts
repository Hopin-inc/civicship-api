import { and } from "graphql-shield";
import { isCommunityManager, sanitizeInput } from "@/presentation/graphql/permission/rule";
import { GqlMutation } from "@/types/graphql";
import { ShieldRule } from "graphql-shield/typings/types";

const evaluationMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {
  evaluationPass: and(isCommunityManager, sanitizeInput),
  evaluationFail: and(isCommunityManager, sanitizeInput),
};

export { evaluationMutationPermissions };

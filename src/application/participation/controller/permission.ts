import { ShieldRule } from "graphql-shield/typings/types";
import { GqlMutation } from "@/types/graphql";

const participationMutationPermissions: Partial<Record<keyof GqlMutation, ShieldRule>> = {};

export { participationMutationPermissions };

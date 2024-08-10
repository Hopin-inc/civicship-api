import TargetService from "@/services/target.service";
import {
  GqlMutationTargetCreateArgs,
  GqlMutationTargetDeleteArgs,
  GqlMutationTargetAddGroupArgs,
  GqlMutationTargetRemoveGroupArgs,
  GqlMutationTargetAddOrganizationArgs,
  GqlMutationTargetRemoveOrganizationArgs,
  GqlQueryTargetsArgs,
  GqlQueryTargetArgs,
  GqlMutationTargetUpdateIndexArgs,
  GqlMutationTargetUpdateArgs,
} from "@/types/graphql";

const targetResolver = {
  Query: {
    targets: async (_: unknown, args: GqlQueryTargetsArgs) =>
      TargetService.queryTargets(args),
    target: async (_: unknown, args: GqlQueryTargetArgs) =>
      TargetService.getTarget(args),
  },
  Mutation: {
    targetCreate: async (_: unknown, args: GqlMutationTargetCreateArgs) =>
      TargetService.targetCreate(args),
    targetDelete: async (_: unknown, args: GqlMutationTargetDeleteArgs) =>
      TargetService.targetDelete(args),
    targetUpdate: async (
      _: unknown,
      args: GqlMutationTargetUpdateArgs,
    ) => TargetService.targetUpdate(args),
    targetAddGroup: async (
      _: unknown,
      args: GqlMutationTargetAddGroupArgs,
    ) => TargetService.targetAddGroup(args),
    targetRemoveGroup: async (
      _: unknown,
      args: GqlMutationTargetRemoveGroupArgs,
    ) => TargetService.targetRemoveGroup(args),
    targetAddOrganization: async (
      _: unknown,
      args: GqlMutationTargetAddOrganizationArgs,
    ) => TargetService.targetAddOrganization(args),
    targetRemoveOrganization: async (
      _: unknown,
      args: GqlMutationTargetRemoveOrganizationArgs,
    ) => TargetService.targetRemoveOrganization(args),
    targetUpdateIndex: async (
      _: unknown,
      args: GqlMutationTargetUpdateIndexArgs,
    ) => TargetService.targetUpdateIndex(args),
  },
};

export default targetResolver;
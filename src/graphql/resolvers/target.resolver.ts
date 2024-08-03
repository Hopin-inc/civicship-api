import TargetService from "@/services/target.service";
import {
  GqlMutationCreateTargetArgs,
  GqlMutationDeleteTargetArgs,
  GqlMutationAddGroupToTargetArgs,
  GqlMutationRemoveGroupFromTargetArgs,
  GqlMutationAddOrganizationToTargetArgs,
  GqlMutationRemoveOrganizationFromTargetArgs,
  GqlQueryTargetsArgs,
  GqlQueryTargetArgs,
  GqlMutationUpdateIndexOfTargetArgs,
  GqlMutationUpdateTargetInfoArgs,
} from "@/types/graphql";

const targetResolver = {
  Query: {
    targets: async (_: unknown, args: GqlQueryTargetsArgs) =>
      TargetService.queryTargets(args),
    target: async (_: unknown, args: GqlQueryTargetArgs) =>
      TargetService.getTarget(args),
  },
  Mutation: {
    createTarget: async (_: unknown, args: GqlMutationCreateTargetArgs) =>
      TargetService.createTarget(args),
    deleteTarget: async (_: unknown, args: GqlMutationDeleteTargetArgs) =>
      TargetService.deleteTarget(args),
    updateInfoTarget: async (
      _: unknown,
      args: GqlMutationUpdateTargetInfoArgs,
    ) => TargetService.updateInfoTarget(args),
    addGroupToTarget: async (
      _: unknown,
      args: GqlMutationAddGroupToTargetArgs,
    ) => TargetService.addGroupToTarget(args),
    removeGroupFromTarget: async (
      _: unknown,
      args: GqlMutationRemoveGroupFromTargetArgs,
    ) => TargetService.removeGroupFromTarget(args),
    addOrganizationToTarget: async (
      _: unknown,
      args: GqlMutationAddOrganizationToTargetArgs,
    ) => TargetService.addOrganizationToTarget(args),
    removeOrganizationFromTarget: async (
      _: unknown,
      args: GqlMutationRemoveOrganizationFromTargetArgs,
    ) => TargetService.removeOrganizationFromTarget(args),
    updateIndexToTarget: async (
      _: unknown,
      args: GqlMutationUpdateIndexOfTargetArgs,
    ) => TargetService.updateIndexToTarget(args),
  },
};

export default targetResolver;

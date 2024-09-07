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
  GqlMutationTargetUpdateContentArgs,
} from "@/types/graphql";
import TargetUseCase from "@/domains/target/usecase";

const targetResolver = {
  Query: {
    targets: async (_: unknown, args: GqlQueryTargetsArgs) =>
      TargetUseCase.userGetManyTargets(args),
    target: async (_: unknown, args: GqlQueryTargetArgs) => TargetUseCase.userGetTarget(args),
  },
  Mutation: {
    targetCreate: async (_: unknown, args: GqlMutationTargetCreateArgs) =>
      TargetUseCase.userCreateTarget(args),
    targetDelete: async (_: unknown, args: GqlMutationTargetDeleteArgs) =>
      TargetUseCase.userDeleteTarget(args),
    targetUpdateContent: async (_: unknown, args: GqlMutationTargetUpdateContentArgs) =>
      TargetUseCase.userUpdateContentOfTarget(args),
    targetAddGroup: async (_: unknown, args: GqlMutationTargetAddGroupArgs) =>
      TargetUseCase.userAddGroupToTarget(args),
    targetRemoveGroup: async (_: unknown, args: GqlMutationTargetRemoveGroupArgs) =>
      TargetUseCase.userRemoveGroupFromTarget(args),
    targetAddOrganization: async (_: unknown, args: GqlMutationTargetAddOrganizationArgs) =>
      TargetUseCase.userAddOrganizationToTarget(args),
    targetRemoveOrganization: async (_: unknown, args: GqlMutationTargetRemoveOrganizationArgs) =>
      TargetUseCase.userRemoveOrganizationFromTarget(args),
    targetUpdateIndex: async (_: unknown, args: GqlMutationTargetUpdateIndexArgs) =>
      TargetUseCase.userUpdateIndexOfTarget(args),
  },
};

export default targetResolver;

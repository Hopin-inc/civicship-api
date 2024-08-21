import GroupService from "@/services/group.service";
import {
  GqlQueryGroupArgs,
  GqlMutationGroupDeleteArgs,
  GqlMutationGroupCreateArgs,
  GqlQueryGroupsArgs,
  GqlMutationGroupRemoveUserArgs,
  GqlMutationGroupAddUserArgs,
  GqlMutationGroupAddEventArgs,
  GqlMutationGroupRemoveEventArgs,
  GqlMutationGroupAddTargetArgs,
  GqlMutationGroupRemoveTargetArgs,
  GqlMutationGroupAddParentArgs,
  GqlMutationGroupRemoveParentArgs,
  GqlMutationGroupAddChildArgs,
  GqlMutationGroupRemoveChildArgs,
  GqlMutationGroupUpdateArgs,
} from "@/types/graphql";

const groupResolver = {
  Query: {
    groups: async (_: unknown, args: GqlQueryGroupsArgs) =>
      GroupService.queryGroups(args),
    group: async (_: unknown, args: GqlQueryGroupArgs) =>
      GroupService.getGroup(args),
  },
  Mutation: {
    groupCreate: async (_: unknown, args: GqlMutationGroupCreateArgs) =>
      GroupService.groupCreate(args),
    groupDelete: async (_: unknown, args: GqlMutationGroupDeleteArgs) =>
      GroupService.groupDelete(args),
    groupUpdate: async (_: unknown, args: GqlMutationGroupUpdateArgs) =>
      GroupService.groupUpdate(args),
    groupAddUser: async (_: unknown, args: GqlMutationGroupAddUserArgs) =>
      GroupService.groupAddUser(args),
    groupRemoveUser: async (_: unknown, args: GqlMutationGroupRemoveUserArgs) =>
      GroupService.groupRemoveUser(args),
    groupAddEvent: async (_: unknown, args: GqlMutationGroupAddEventArgs) =>
      GroupService.groupAddEvent(args),
    groupRemoveEvent: async (
      _: unknown,
      args: GqlMutationGroupRemoveEventArgs,
    ) => GroupService.groupRemoveEvent(args),
    groupAddTarget: async (_: unknown, args: GqlMutationGroupAddTargetArgs) =>
      GroupService.groupAddTarget(args),
    groupRemoveTarget: async (
      _: unknown,
      args: GqlMutationGroupRemoveTargetArgs,
    ) => GroupService.groupRemoveTarget(args),
    groupAddParent: async (_: unknown, args: GqlMutationGroupAddParentArgs) =>
      GroupService.groupAddParent(args),
    groupRemoveParent: async (
      _: unknown,
      args: GqlMutationGroupRemoveParentArgs,
    ) => GroupService.groupRemoveParent(args),
    groupAddChild: async (_: unknown, args: GqlMutationGroupAddChildArgs) =>
      GroupService.groupAddChild(args),
    groupRemoveChild: async (
      _: unknown,
      args: GqlMutationGroupRemoveChildArgs,
    ) => GroupService.groupRemoveChild(args),
  },
};

export default groupResolver;

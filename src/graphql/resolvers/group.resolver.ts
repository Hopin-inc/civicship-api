import GroupService from "@/services/group.service";
import {
  GqlQueryGroupArgs,
  GqlMutationDeleteGroupArgs,
  GqlMutationCreateGroupArgs,
  GqlQueryGroupsArgs,
  GqlMutationRemoveUserFromGroupArgs,
  GqlMutationAddUserToGroupArgs,
  GqlMutationAddEventOfGroupArgs,
  GqlMutationRemoveEventFromGroupArgs,
  GqlMutationAddTargetToGroupArgs,
  GqlMutationRemoveTargetFromGroupArgs,
  GqlMutationAddParentGroupToGroupArgs,
  GqlMutationRemoveParentGroupFromParentArgs,
  GqlMutationAddChildGroupToGroupArgs,
  GqlMutationRemoveChildGroupFromParentArgs,
  GqlMutationUpdateGroupInfoArgs,
} from "@/types/graphql";

const groupResolver = {
  Query: {
    groups: async (_: unknown, args: GqlQueryGroupsArgs) =>
      GroupService.queryGroups(args),
    group: async (_: unknown, args: GqlQueryGroupArgs) =>
      GroupService.getGroup(args),
  },
  Mutation: {
    createGroup: async (_: unknown, args: GqlMutationCreateGroupArgs) =>
      GroupService.createGroup(args),
    deleteGroup: async (_: unknown, args: GqlMutationDeleteGroupArgs) =>
      GroupService.deleteGroup(args),
    updateGroupInfo: async (_: unknown, args: GqlMutationUpdateGroupInfoArgs) =>
      GroupService.updateGroupInfo(args),
    addUserToGroup: async (_: unknown, args: GqlMutationAddUserToGroupArgs) =>
      GroupService.addUserToGroup(args),
    removeUserFromGroup: async (
      _: unknown,
      args: GqlMutationRemoveUserFromGroupArgs,
    ) => GroupService.removeUserFromGroup(args),
    addEventOfGroup: async (_: unknown, args: GqlMutationAddEventOfGroupArgs) =>
      GroupService.addEventOfGroup(args),
    removeEventFromGroup: async (
      _: unknown,
      args: GqlMutationRemoveEventFromGroupArgs,
    ) => GroupService.removeEventFromGroup(args),
    addTargetToGroup: async (
      _: unknown,
      args: GqlMutationAddTargetToGroupArgs,
    ) => GroupService.addTargetToGroup(args),
    removeTargetFromGroup: async (
      _: unknown,
      args: GqlMutationRemoveTargetFromGroupArgs,
    ) => GroupService.removeTargetFromGroup(args),
    addParentGroupToGroup: async (
      _: unknown,
      args: GqlMutationAddParentGroupToGroupArgs,
    ) => GroupService.addParentGroupToGroup(args),
    removeParentGroupFromParent: async (
      _: unknown,
      args: GqlMutationRemoveParentGroupFromParentArgs,
    ) => GroupService.removeParentGroupFromParent(args),
    addChildGroupToGroup: async (
      _: unknown,
      args: GqlMutationAddChildGroupToGroupArgs,
    ) => GroupService.addChildGroupToGroup(args),
    removeChildGroupFromParent: async (
      _: unknown,
      args: GqlMutationRemoveChildGroupFromParentArgs,
    ) => GroupService.removeChildGroupFromParent(args),
  },
};

export default groupResolver;

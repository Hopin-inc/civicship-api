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
  GqlMutationGroupUpdateContentArgs,
  GqlMutationGroupChangeOrganizationArgs,
} from "@/types/graphql";
import GroupUseCase from "@/usacase/group.usecase";

const groupResolver = {
  Query: {
    groups: async (_: unknown, args: GqlQueryGroupsArgs) => GroupUseCase.userGetManyGroups(args),
    group: async (_: unknown, args: GqlQueryGroupArgs) => GroupUseCase.userGetGroup(args),
  },
  Mutation: {
    groupCreate: async (_: unknown, args: GqlMutationGroupCreateArgs) =>
      GroupUseCase.userCreateGroup(args),
    groupDelete: async (_: unknown, args: GqlMutationGroupDeleteArgs) =>
      GroupUseCase.userDeleteGroup(args),
    groupUpdateContent: async (_: unknown, args: GqlMutationGroupUpdateContentArgs) =>
      GroupUseCase.userUpdateGroupContent(args),
    groupChangeOrganization: async (_: unknown, args: GqlMutationGroupChangeOrganizationArgs) =>
      GroupUseCase.userChangeOrganizationOfGroup(args),
    groupAddUser: async (_: unknown, args: GqlMutationGroupAddUserArgs) =>
      GroupUseCase.userAddUserToGroup(args),
    groupRemoveUser: async (_: unknown, args: GqlMutationGroupRemoveUserArgs) =>
      GroupUseCase.userRemoveUserFromGroup(args),
    groupAddEvent: async (_: unknown, args: GqlMutationGroupAddEventArgs) =>
      GroupUseCase.userAddEventToGroup(args),
    groupRemoveEvent: async (_: unknown, args: GqlMutationGroupRemoveEventArgs) =>
      GroupUseCase.userRemoveEventFromGroup(args),
    groupAddTarget: async (_: unknown, args: GqlMutationGroupAddTargetArgs) =>
      GroupUseCase.userAddTargetToGroup(args),
    groupRemoveTarget: async (_: unknown, args: GqlMutationGroupRemoveTargetArgs) =>
      GroupUseCase.userRemoveTargetFromGroup(args),
    groupAddParent: async (_: unknown, args: GqlMutationGroupAddParentArgs) =>
      GroupUseCase.userAddParentToGroup(args),
    groupRemoveParent: async (_: unknown, args: GqlMutationGroupRemoveParentArgs) =>
      GroupUseCase.userRemoveParentFromGroup(args),
    groupAddChild: async (_: unknown, args: GqlMutationGroupAddChildArgs) =>
      GroupUseCase.userAddChildToGroup(args),
    groupRemoveChild: async (_: unknown, args: GqlMutationGroupRemoveChildArgs) =>
      GroupUseCase.userRemoveChildFromGroup(args),
  },
};

export default groupResolver;

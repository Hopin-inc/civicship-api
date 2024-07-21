import GroupService from "@/services/group.service";
import {
  GqlQueryGroupArgs,
  GqlMutationUpdateGroupArgs,
  GqlMutationDeleteGroupArgs,
  GqlMutationCreateGroupArgs,
  GqlQueryGroupsArgs,
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
    updateGroup: async (_: unknown, args: GqlMutationUpdateGroupArgs) =>
      GroupService.updateGroup(args),
    deleteGroup: async (_: unknown, args: GqlMutationDeleteGroupArgs) =>
      GroupService.deleteGroup(args),
  },
};

export default groupResolver;

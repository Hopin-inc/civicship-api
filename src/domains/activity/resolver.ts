import {
  GqlMutationActivityCreateArgs,
  GqlMutationActivityDeleteArgs,
  GqlMutationActivityUpdateContentArgs,
  GqlMutationActivityPublishArgs,
  GqlMutationActivityUnpublishArgs,
  GqlMutationActivityAddUserArgs,
  GqlMutationActivityAddEventArgs,
  GqlMutationActivityRemoveEventArgs,
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
  GqlMutationActivityRemoveUserArgs,
} from "@/types/graphql";
import ActivityUseCase from "@/domains/activity/usecase";

const activityResolver = {
  Query: {
    activities: async (_: unknown, args: GqlQueryActivitiesArgs) =>
      ActivityUseCase.userGetManyPublicActivities(args),
    activity: async (_: unknown, args: GqlQueryActivityArgs) =>
      ActivityUseCase.userGetActivity(args),
  },
  Mutation: {
    activityCreate: async (_: unknown, args: GqlMutationActivityCreateArgs) =>
      ActivityUseCase.userCreateActivity(args),
    activityDelete: async (_: unknown, args: GqlMutationActivityDeleteArgs) =>
      ActivityUseCase.userDeleteActivity(args),
    activityUpdateContent: async (_: unknown, args: GqlMutationActivityUpdateContentArgs) =>
      ActivityUseCase.userUpdateActivityContent(args),
    activityPublish: async (_: unknown, args: GqlMutationActivityPublishArgs) =>
      ActivityUseCase.userPublishActivity(args),
    activityUnpublish: async (_: unknown, args: GqlMutationActivityUnpublishArgs) =>
      ActivityUseCase.userUnpublishActivity(args),
    activityAddUser: async (_: unknown, args: GqlMutationActivityAddUserArgs) =>
      ActivityUseCase.userAddUserToActivity(args),
    activityRemoveUser: async (_: unknown, args: GqlMutationActivityRemoveUserArgs) =>
      ActivityUseCase.userRemoveUserFromActivity(args),
    activityAddEvent: async (_: unknown, args: GqlMutationActivityAddEventArgs) =>
      ActivityUseCase.userAddEventToActivity(args),
    activityRemoveEvent: async (_: unknown, args: GqlMutationActivityRemoveEventArgs) =>
      ActivityUseCase.userRemoveEventFromActivity(args),
  },
};

export default activityResolver;

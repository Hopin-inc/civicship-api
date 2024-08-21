import ActivityService from "@/services/activity.service";
import {
  GqlMutationActivityCreateArgs,
  GqlMutationActivityDeleteArgs,
  GqlMutationActivityUpdateArgs,
  GqlMutationActivityPublishArgs,
  GqlMutationActivityUnpublishArgs,
  GqlMutationActivityAddUserArgs,
  GqlMutationActivityUpdateUserArgs,
  GqlMutationActivityAddEventArgs,
  GqlMutationActivityRemoveEventArgs,
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
} from "@/types/graphql";

const activityResolver = {
  Query: {
    activities: async (_: unknown, args: GqlQueryActivitiesArgs) =>
      ActivityService.queryActivities(args),
    activity: async (_: unknown, args: GqlQueryActivityArgs) =>
      ActivityService.getActivity(args),
  },
  Mutation: {
    activityCreate: async (_: unknown, args: GqlMutationActivityCreateArgs) =>
      ActivityService.activityCreate(args),
    activityDelete: async (_: unknown, args: GqlMutationActivityDeleteArgs) =>
      ActivityService.activityDelete(args),
    activityUpdate: async (_: unknown, args: GqlMutationActivityUpdateArgs) =>
      ActivityService.activityUpdate(args),
    activityPublish: async (_: unknown, args: GqlMutationActivityPublishArgs) =>
      ActivityService.activityPublish(args),
    activityUnpublish: async (
      _: unknown,
      args: GqlMutationActivityUnpublishArgs,
    ) => ActivityService.activityUnpublish(args),
    activityAddUser: async (_: unknown, args: GqlMutationActivityAddUserArgs) =>
      ActivityService.activityAddUser(args),
    activityUpdateUser: async (
      _: unknown,
      args: GqlMutationActivityUpdateUserArgs,
    ) => ActivityService.activityUpdateUser(args),
    activityAddEvent: async (
      _: unknown,
      args: GqlMutationActivityAddEventArgs,
    ) => ActivityService.activityAddEvent(args),
    activityRemoveEvent: async (
      _: unknown,
      args: GqlMutationActivityRemoveEventArgs,
    ) => ActivityService.activityRemoveEvent(args),
  },
};

export default activityResolver;

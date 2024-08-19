import ActivityService from "@/services/activity.service";
import {
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
  GqlMutationDeleteActivityArgs,
  GqlMutationCreateActivityArgs,
  GqlMutationRemoveEventFromActivityArgs,
  GqlMutationUpdateActivityInfoArgs,
  GqlMutationUpdateActivityPrivacyArgs,
  GqlMutationAddUserToActivityArgs,
  GqlMutationAddEventToActivityArgs,
  GqlMutationUpdateUserOfActivityArgs,
} from "@/types/graphql";

const activityResolver = {
  Query: {
    activities: async (_: unknown, args: GqlQueryActivitiesArgs) =>
      ActivityService.queryActivities(args),
    activity: async (_: unknown, args: GqlQueryActivityArgs) =>
      ActivityService.getActivity(args),
  },
  Mutation: {
    createActivity: async (_: unknown, args: GqlMutationCreateActivityArgs) =>
      ActivityService.createActivity(args),
    deleteActivity: async (_: unknown, args: GqlMutationDeleteActivityArgs) =>
      ActivityService.deleteActivity(args),
    updateActivityInfo: async (
      _: unknown,
      args: GqlMutationUpdateActivityInfoArgs,
    ) => ActivityService.updateActivityInfo(args),
    updateActivityPrivacy: async (
      _: unknown,
      args: GqlMutationUpdateActivityPrivacyArgs,
    ) => ActivityService.updateActivityPrivacy(args),
    addUserToActivity: async (
      _: unknown,
      args: GqlMutationAddUserToActivityArgs,
    ) => ActivityService.addUserToActivity(args),
    UpdateUserOfActivity: async (
      _: unknown,
      args: GqlMutationUpdateUserOfActivityArgs,
    ) => ActivityService.updateUserOfActivity(args),
    addEventToActivity: async (
      _: unknown,
      args: GqlMutationAddEventToActivityArgs,
    ) => ActivityService.addEventToActivity(args),
    removeEventFromActivity: async (
      _: unknown,
      args: GqlMutationRemoveEventFromActivityArgs,
    ) => ActivityService.removeEventFromActivity(args),
  },
};

export default activityResolver;

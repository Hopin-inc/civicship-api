import ActivityService from "@/services/activity.service";
import {
  GqlQueryActivitiesArgs,
  GqlQueryActivityArgs,
  GqlMutationUpdateActivityArgs,
  GqlMutationDeleteActivityArgs,
  GqlMutationCreateActivityArgs,
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
    updateActivity: async (_: unknown, args: GqlMutationUpdateActivityArgs) =>
      ActivityService.updateActivity(args),
    deleteActivity: async (_: unknown, args: GqlMutationDeleteActivityArgs) =>
      ActivityService.deleteActivity(args),
  },
};

export default activityResolver;

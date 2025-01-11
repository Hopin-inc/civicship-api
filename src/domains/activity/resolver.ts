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
import { IContext } from "@/types/server";

const activityResolver = {
  Query: {
    activities: async (_: unknown, args: GqlQueryActivitiesArgs, ctx: IContext) =>
      ActivityUseCase.userGetManyPublicActivities(ctx, args),
    activity: async (_: unknown, args: GqlQueryActivityArgs, ctx: IContext) =>
      ActivityUseCase.userGetActivity(ctx, args),
  },
  Mutation: {
    activityCreate: async (_: unknown, args: GqlMutationActivityCreateArgs, ctx: IContext) =>
      ActivityUseCase.userCreateActivity(ctx, args),
    activityDelete: async (_: unknown, args: GqlMutationActivityDeleteArgs, ctx: IContext) =>
      ActivityUseCase.userDeleteActivity(ctx, args),
    activityUpdateContent: async (_: unknown, args: GqlMutationActivityUpdateContentArgs, ctx: IContext) =>
      ActivityUseCase.userUpdateActivityContent(ctx, args),
    activityPublish: async (_: unknown, args: GqlMutationActivityPublishArgs, ctx: IContext) =>
      ActivityUseCase.userPublishActivity(ctx, args),
    activityUnpublish: async (_: unknown, args: GqlMutationActivityUnpublishArgs, ctx: IContext) =>
      ActivityUseCase.userUnpublishActivity(ctx, args),
    activityAddUser: async (_: unknown, args: GqlMutationActivityAddUserArgs, ctx: IContext) =>
      ActivityUseCase.userAddUserToActivity(ctx, args),
    activityRemoveUser: async (_: unknown, args: GqlMutationActivityRemoveUserArgs, ctx: IContext) =>
      ActivityUseCase.userRemoveUserFromActivity(ctx, args),
    activityAddEvent: async (_: unknown, args: GqlMutationActivityAddEventArgs, ctx: IContext) =>
      ActivityUseCase.userAddEventToActivity(ctx, args),
    activityRemoveEvent: async (_: unknown, args: GqlMutationActivityRemoveEventArgs, ctx: IContext) =>
      ActivityUseCase.userRemoveEventFromActivity(ctx, args),
  },
};

export default activityResolver;

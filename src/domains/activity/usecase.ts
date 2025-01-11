import {
  GqlActivity,
  GqlActivitiesConnection,
  GqlActivityUpdateContentPayload,
  GqlMutationActivityAddUserArgs,
  GqlMutationActivityCreateArgs,
  GqlMutationActivityDeleteArgs,
  GqlMutationActivityPublishArgs,
  GqlMutationActivityUnpublishArgs,
  GqlMutationActivityUpdateContentArgs,
  GqlQueryActivityArgs,
  GqlQueryActivitiesArgs,
  GqlMutationActivityAddEventArgs,
  GqlMutationActivityRemoveEventArgs,
  GqlActivitySwitchPrivacyPayload,
  GqlActivityUpdateUserPayload,
  GqlActivityUpdateEventPayload,
  GqlMutationActivityRemoveUserArgs,
} from "@/types/graphql";
import ActivityService from "@/domains/activity/service";
import UserService from "@/domains/user/service";
import EventService from "@/domains/event/service";
import ActivityResponseFormat from "@/domains/activity/presenter/response";
import { handlePrismaError } from "@/prisma/error";
import { IContext } from "@/types/server";

export default class ActivityUseCase {
  static async userGetManyPublicActivities(
    ctx: IContext,
    { cursor, filter, sort, first }: GqlQueryActivitiesArgs
  ): Promise<GqlActivitiesConnection> {
    const take = first ?? 10;
    const data = await ActivityService.fetchActivities(ctx, { cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const activities: GqlActivity[] = data.slice(0, take).map((record) => {
      return ActivityResponseFormat.get(record);
    });
    return ActivityResponseFormat.query(activities, hasNextPage);
  }

  static async userGetActivity(ctx: IContext, { id }: GqlQueryActivityArgs): Promise<GqlActivity | null> {
    const activity = await ActivityService.findActivity(ctx, id);
    if (!activity) {
      return null;
    }
    return ActivityResponseFormat.get(activity);
  }

  static async userCreateActivity(ctx: IContext, { input }: GqlMutationActivityCreateArgs) {
    const activity = await ActivityService.createActivity(ctx, { input });
    return ActivityResponseFormat.create(activity);
  }

  static async userDeleteActivity(ctx: IContext, { id }: GqlMutationActivityDeleteArgs) {
    await ActivityService.deleteActivity(ctx, id);
    return ActivityResponseFormat.delete(id);
  }

  static async userUpdateActivityContent(
    ctx: IContext,
    { id, input }: GqlMutationActivityUpdateContentArgs,
  ): Promise<GqlActivityUpdateContentPayload> {
    try {
      const activity = await ActivityService.updateContent(ctx, { id, input });
      return ActivityResponseFormat.updateContent(activity);
    } catch (e) {
      return handlePrismaError(e);
    }
  }

  static async userPublishActivity(
    ctx: IContext,
    { id }: GqlMutationActivityPublishArgs,
  ): Promise<GqlActivitySwitchPrivacyPayload> {
    const activity = await ActivityService.publishActivity(ctx, id);
    return ActivityResponseFormat.switchPrivacy(activity);
  }

  static async userUnpublishActivity(
    ctx: IContext,
    { id }: GqlMutationActivityUnpublishArgs,
  ): Promise<GqlActivitySwitchPrivacyPayload> {
    const activity = await ActivityService.unpublishActivity(ctx, id);
    return ActivityResponseFormat.switchPrivacy(activity);
  }

  static async userAddUserToActivity(
    ctx: IContext,
    { id, input }: GqlMutationActivityAddUserArgs,
  ): Promise<GqlActivityUpdateUserPayload> {
    const user = await UserService.checkIfUserExists(input.userId);

    const activity = await ActivityService.addUser(ctx, { id, input });
    return ActivityResponseFormat.updateUser(activity, user);
  }

  static async userRemoveUserFromActivity(
    ctx: IContext,
    { id, input }: GqlMutationActivityRemoveUserArgs,
  ): Promise<GqlActivityUpdateUserPayload> {
    const user = await UserService.checkIfUserExists(input.userId);

    const activity = await ActivityService.removeUser(ctx, { id, input });
    return ActivityResponseFormat.updateUser(activity, user);
  }

  static async userAddEventToActivity(
    ctx: IContext,
    { id, input }: GqlMutationActivityAddEventArgs,
  ): Promise<GqlActivityUpdateEventPayload> {
    const event = await EventService.checkIfEventExistsRelation(input.eventId);

    const activity = await ActivityService.addEvent(ctx, { id, input });
    return ActivityResponseFormat.updateEvent(activity, event);
  }

  static async userRemoveEventFromActivity(
    ctx: IContext,
    { id, input }: GqlMutationActivityRemoveEventArgs,
  ): Promise<GqlActivityUpdateEventPayload> {
    const event = await EventService.checkIfEventExistsRelation(input.eventId);

    const activity = await ActivityService.removeEvent(ctx, { id, input });
    return ActivityResponseFormat.updateEvent(activity, event);
  }
}

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
import { handlePrismaError } from "@/repository/error";

export default class ActivityUseCase {
  static async userGetManyPublicActivities({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryActivitiesArgs): Promise<GqlActivitiesConnection> {
    const take = first ?? 10;
    const data = await ActivityService.fetchActivities({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const activities: GqlActivity[] = data.slice(0, take).map((record) => {
      return ActivityResponseFormat.get(record);
    });
    return ActivityResponseFormat.query(activities, hasNextPage);
  }

  static async userGetActivity({ id }: GqlQueryActivityArgs): Promise<GqlActivity | null> {
    const activity = await ActivityService.findActivity(id);
    if (!activity) {
      return null;
    }
    return ActivityResponseFormat.get(activity);
  }

  static async userCreateActivity({ input }: GqlMutationActivityCreateArgs) {
    const activity = await ActivityService.createActivity({ input });
    return ActivityResponseFormat.create(activity);
  }

  static async userDeleteActivity({ id }: GqlMutationActivityDeleteArgs) {
    await ActivityService.deleteActivity(id);
    return ActivityResponseFormat.delete(id);
  }

  static async userUpdateActivityContent({
    id,
    input,
  }: GqlMutationActivityUpdateContentArgs): Promise<GqlActivityUpdateContentPayload> {
    try {
      const activity = await ActivityService.updateContent({ id, input });
      return ActivityResponseFormat.updateContent(activity);
    } catch (e) {
      return handlePrismaError(e);
    }
  }

  static async userPublishActivity({
    id,
  }: GqlMutationActivityPublishArgs): Promise<GqlActivitySwitchPrivacyPayload> {
    const activity = await ActivityService.publishActivity(id);
    return ActivityResponseFormat.switchPrivacy(activity);
  }

  static async userUnpublishActivity({
    id,
  }: GqlMutationActivityUnpublishArgs): Promise<GqlActivitySwitchPrivacyPayload> {
    const activity = await ActivityService.unpublishActivity(id);
    return ActivityResponseFormat.switchPrivacy(activity);
  }

  static async userAddUserToActivity({
    id,
    input,
  }: GqlMutationActivityAddUserArgs): Promise<GqlActivityUpdateUserPayload> {
    const user = await UserService.checkIfUserExists(input.userId);

    const activity = await ActivityService.addUser({ id, input });
    return ActivityResponseFormat.updateUser(activity, user);
  }

  static async userRemoveUserFromActivity({
    id,
    input,
  }: GqlMutationActivityRemoveUserArgs): Promise<GqlActivityUpdateUserPayload> {
    const user = await UserService.checkIfUserExists(input.userId);

    const activity = await ActivityService.removeUser({ id, input });
    return ActivityResponseFormat.updateUser(activity, user);
  }

  static async userAddEventToActivity({
    id,
    input,
  }: GqlMutationActivityAddEventArgs): Promise<GqlActivityUpdateEventPayload> {
    const event = await EventService.checkIfEventExistsRelation(input.eventId);

    const activity = await ActivityService.addEvent({ id, input });
    return ActivityResponseFormat.updateEvent(activity, event);
  }

  static async userRemoveEventFromActivity({
    id,
    input,
  }: GqlMutationActivityRemoveEventArgs): Promise<GqlActivityUpdateEventPayload> {
    const event = await EventService.checkIfEventExistsRelation(input.eventId);

    const activity = await ActivityService.removeEvent({ id, input });
    return ActivityResponseFormat.updateEvent(activity, event);
  }
}

import {
  GqlEvent,
  GqlEventDeletePayload,
  GqlEventPlanPayload,
  GqlEventsConnection,
  GqlEventUpdateContentPayload,
  GqlEventUpdateGroupPayload,
  GqlEventUpdateOrganizationPayload,
  GqlEventUpdatePrivacyPayload,
  GqlMutationEventAddGroupArgs,
  GqlMutationEventAddOrganizationArgs,
  GqlMutationEventDeleteArgs,
  GqlMutationEventPlanArgs,
  GqlMutationEventPublishArgs,
  GqlMutationEventRemoveGroupArgs,
  GqlMutationEventUpdateContentArgs,
  GqlQueryEventArgs,
  GqlQueryEventsArgs,
} from "@/types/graphql";
import EventService from "@/domains/event/service";
import EventResponseFormat from "@/domains/event/presenter/response";
import GroupService from "@/domains/group/service";
import OrganizationService from "@/domains/organization/service";

export default class EventUseCase {
  static async userGetManyPublicEvents({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryEventsArgs): Promise<GqlEventsConnection> {
    const take = first ?? 10;
    const data = await EventService.fetchPublicEvents({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const events: GqlEvent[] = data.slice(0, take).map((record) => {
      return EventResponseFormat.get(record);
    });
    return EventResponseFormat.query(events, hasNextPage);
  }

  static async userGetEvent({ id }: GqlQueryEventArgs): Promise<GqlEvent | null> {
    const event = await EventService.findEvent(id);
    if (!event) {
      return null;
    }
    return EventResponseFormat.get(event);
  }

  static async userPlanEvent({ input }: GqlMutationEventPlanArgs): Promise<GqlEventPlanPayload> {
    const event = await EventService.createEvent({ input });
    return EventResponseFormat.create(event);
  }

  static async userUpdateContentOfEvent({
    id,
    input,
  }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
    const existingEvent = await EventService.checkIfEventExistsForUpdate(id);

    const event = await EventService.updateContent({ id, input }, existingEvent);
    return EventResponseFormat.updateContent(event);
  }

  static async userDeleteEvent({ id }: GqlMutationEventDeleteArgs): Promise<GqlEventDeletePayload> {
    await EventService.deleteEvent({ id });
    return EventResponseFormat.delete(id);
  }

  static async userPublishEvent({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await EventService.publishEvent({ id });
    return EventResponseFormat.switchPrivacy(event);
  }

  static async userUnpublishEvent({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await EventService.unpublishEvent({ id });
    return EventResponseFormat.switchPrivacy(event);
  }

  static async userAddGroupToEvent({
    id,
    input,
  }: GqlMutationEventAddGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);

    const event = await EventService.addGroup({ id, input });
    return EventResponseFormat.updateGroup(event, group);
  }

  static async userRemoveGroupFromEvent({
    id,
    input,
  }: GqlMutationEventRemoveGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);

    const event = await EventService.removeGroup({ id, input });
    return EventResponseFormat.updateGroup(event, group);
  }

  static async userAddOrganizationToEvent({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const event = await EventService.addOrganization({ id, input });
    return EventResponseFormat.updateOrganization(event, organization);
  }

  static async userRemoveOrganizationFromEvent({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const event = await EventService.removeOrganization({ id, input });
    return EventResponseFormat.updateOrganization(event, organization);
  }
}

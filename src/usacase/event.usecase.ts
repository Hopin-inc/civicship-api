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
import EventService from "@/services/event.service";
import EventPresenterResponse from "@/presenter/event/response";
import GroupService from "@/services/group.service";
import OrganizationService from "@/services/organization.service";

export default class EventUseCase {
  static async userFetchPublicEvents({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryEventsArgs): Promise<GqlEventsConnection> {
    const take = first ?? 10;
    const data = await EventService.fetchPublicEvents({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const events: GqlEvent[] = data.slice(0, take).map((record) => {
      return EventPresenterResponse.getResponse(record);
    });
    return EventPresenterResponse.queryPublicResponse(events, hasNextPage);
  }

  static async userGetEventWithRelations({ id }: GqlQueryEventArgs): Promise<GqlEvent | null> {
    const event = await EventService.getEventWithRelations(id);
    if (!event) {
      return null;
    }
    return EventPresenterResponse.getResponse(event);
  }

  static async userPlanEvent({ input }: GqlMutationEventPlanArgs): Promise<GqlEventPlanPayload> {
    const event = await EventService.createEvent({ input });
    return EventPresenterResponse.createResponse(event);
  }

  static async userUpdateEventContent({
    id,
    input,
  }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
    const existingEvent = await EventService.getEventForUpdate(id);

    const event = await EventService.eventUpdateContent({ id, input }, existingEvent);
    return EventPresenterResponse.updateContentResponse(event);
  }

  static async userDeleteEvent({ id }: GqlMutationEventDeleteArgs): Promise<GqlEventDeletePayload> {
    await EventService.eventDelete({ id });
    return EventPresenterResponse.deleteResponse(id);
  }

  static async userPublishEvent({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await EventService.publishEvent({ id });
    return EventPresenterResponse.updatePrivacyResponse(event);
  }

  static async userUnpublishEvent({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    const event = await EventService.unpublishEvent({ id });
    return EventPresenterResponse.updatePrivacyResponse(event);
  }

  static async userAddGroupToEvent({
    id,
    input,
  }: GqlMutationEventAddGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);

    const event = await EventService.eventAddGroup({ id, input });
    return EventPresenterResponse.updateGroupResponse(event, group);
  }

  static async userRemoveGroupFromEvent({
    id,
    input,
  }: GqlMutationEventRemoveGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);

    const event = await EventService.eventRemoveGroup({ id, input });
    return EventPresenterResponse.updateGroupResponse(event, group);
  }

  static async userAddOrganizationToEvent({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const event = await EventService.eventAddOrganization({ id, input });
    return EventPresenterResponse.updateOrganizationResponse(event, organization);
  }

  static async userRemoveOrganizationFromEvent({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const event = await EventService.eventRemoveOrganization({ id, input });
    return EventPresenterResponse.updateOrganizationResponse(event, organization);
  }
}

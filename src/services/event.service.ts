import {
  GqlQueryEventsArgs,
  GqlMutationEventDeleteArgs,
  GqlMutationEventUpdateContentArgs,
  GqlMutationEventPublishArgs,
  GqlMutationEventUnpublishArgs,
  GqlMutationEventAddGroupArgs,
  GqlMutationEventAddOrganizationArgs,
  GqlMutationEventRemoveOrganizationArgs,
  GqlMutationEventPlanArgs,
  GqlMutationEventRemoveGroupArgs,
} from "@/types/graphql";
import { RELATION_ACTION } from "@/consts";
import { Prisma } from "@prisma/client";
import EventPresenterInput from "@/presenter/event/input";
import { EventUpdateContentPayloadWithArgs } from "@/types/include/event.type";
import EventRepository from "@/prisma/repository/event.repository";

export default class EventService {
  static async fetchPublicEvents({ cursor, filter, sort }: GqlQueryEventsArgs, take: number) {
    const where = EventPresenterInput.queryWhereInput({ filter });
    const orderBy = EventPresenterInput.queryOrderByInput({ sort });
    return await EventRepository.queryPublicEvents(where, orderBy, take, cursor);
  }

  static async getEventForUpdate(id: string) {
    const event = await EventRepository.findEventByIdForUpdate(id);
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }
    return event;
  }

  static async getEventWithRelations(id: string) {
    return await EventRepository.findEventWithRelations(id);
  }

  static async createEvent({ input }: GqlMutationEventPlanArgs) {
    const data: Prisma.EventCreateInput = EventPresenterInput.createInput({ input });
    return await EventRepository.createEvent(data);
  }

  static async eventUpdateContent(
    { id, input }: GqlMutationEventUpdateContentArgs,
    existingEvent: EventUpdateContentPayloadWithArgs,
  ) {
    const data: Prisma.EventUpdateInput = EventPresenterInput.updateContentInput(
      existingEvent,
      input,
    );
    return await EventRepository.updateContent(id, data);
  }

  static async eventDelete({ id }: GqlMutationEventDeleteArgs) {
    await EventRepository.deleteEvent({ id });
  }

  static async publishEvent({ id }: GqlMutationEventPublishArgs) {
    return await EventRepository.updatePrivacy(id, true);
  }

  static async unpublishEvent({ id }: GqlMutationEventUnpublishArgs) {
    return await EventRepository.updatePrivacy(id, false);
  }

  static async eventAddGroup({ id, input }: GqlMutationEventAddGroupArgs) {
    const data: Prisma.EventUpdateInput = EventPresenterInput.updateGroupInput(
      id,
      input.groupId,
      RELATION_ACTION.CONNECTORCREATE,
    );
    return await EventRepository.updateRelation(id, data);
  }

  static async eventRemoveGroup({ id, input }: GqlMutationEventRemoveGroupArgs) {
    const data: Prisma.EventUpdateInput = EventPresenterInput.updateGroupInput(
      id,
      input.groupId,
      RELATION_ACTION.DELETE,
    );
    return await EventRepository.updateRelation(id, data);
  }

  static async eventAddOrganization({ id, input }: GqlMutationEventAddOrganizationArgs) {
    const data: Prisma.EventUpdateInput = EventPresenterInput.updateOrganizationInput(
      id,
      input.organizationId,
      RELATION_ACTION.CONNECTORCREATE,
    );
    return await EventRepository.updateRelation(id, data);
  }

  static async eventRemoveOrganization({ id, input }: GqlMutationEventRemoveOrganizationArgs) {
    const data: Prisma.EventUpdateInput = EventPresenterInput.updateOrganizationInput(
      id,
      input.organizationId,
      RELATION_ACTION.DELETE,
    );
    return await EventRepository.updateRelation(id, data);
  }
}

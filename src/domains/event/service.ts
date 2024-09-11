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
import { RELATION_ACTION } from "@/consts/prisma";
import { Prisma } from "@prisma/client";
import EventInputFormat from "@/domains/event/presenter/input";
import { EventUpdateContentPayloadWithArgs } from "@/domains/event/type";
import EventRepository from "@/domains/event/repository";

export default class EventService {
  static async fetchPublicEvents({ cursor, filter, sort }: GqlQueryEventsArgs, take: number) {
    const where = EventInputFormat.filter({ filter });
    const orderBy = EventInputFormat.sort({ sort });

    return await EventRepository.queryPublic(where, orderBy, take, cursor);
  }

  static async checkIfEventExistsForUpdate(id: string) {
    const event = await EventRepository.findForUpdateContent(id);
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }

    return event;
  }

  static async checkIfEventExistsRelation(id: string) {
    const event = await EventRepository.findForUpdateRelation(id);
    if (!event) {
      throw new Error(`Event with ID ${id} not found`);
    }

    return event;
  }

  static async findEvent(id: string) {
    return await EventRepository.find(id);
  }

  static async createEvent({ input }: GqlMutationEventPlanArgs) {
    const data: Prisma.EventCreateInput = EventInputFormat.create({ input });
    return await EventRepository.create(data);
  }

  static async updateContent(
    { id, input }: GqlMutationEventUpdateContentArgs,
    existingEvent: EventUpdateContentPayloadWithArgs,
  ) {
    const data: Prisma.EventUpdateInput = EventInputFormat.updateContent(existingEvent, input);
    return await EventRepository.updateContent(id, data);
  }

  static async deleteEvent({ id }: GqlMutationEventDeleteArgs) {
    await EventRepository.delete(id);
  }

  static async publishEvent({ id }: GqlMutationEventPublishArgs) {
    return await EventRepository.switchPrivacy(id, true);
  }

  static async unpublishEvent({ id }: GqlMutationEventUnpublishArgs) {
    return await EventRepository.switchPrivacy(id, false);
  }

  static async addGroup({ id, input }: GqlMutationEventAddGroupArgs) {
    const data: Prisma.EventUpdateInput = EventInputFormat.updateGroup(
      id,
      input.groupId,
      RELATION_ACTION.CONNECT_OR_CREATE,
    );
    return await EventRepository.updateRelation(id, data);
  }

  static async removeGroup({ id, input }: GqlMutationEventRemoveGroupArgs) {
    const data: Prisma.EventUpdateInput = EventInputFormat.updateGroup(
      id,
      input.groupId,
      RELATION_ACTION.DELETE,
    );
    return await EventRepository.updateRelation(id, data);
  }

  static async addOrganization({ id, input }: GqlMutationEventAddOrganizationArgs) {
    const data: Prisma.EventUpdateInput = EventInputFormat.updateOrganization(
      id,
      input.organizationId,
      RELATION_ACTION.CONNECT_OR_CREATE,
    );
    return await EventRepository.updateRelation(id, data);
  }

  static async removeOrganization({ id, input }: GqlMutationEventRemoveOrganizationArgs) {
    const data: Prisma.EventUpdateInput = EventInputFormat.updateOrganization(
      id,
      input.organizationId,
      RELATION_ACTION.DELETE,
    );
    return await EventRepository.updateRelation(id, data);
  }
}

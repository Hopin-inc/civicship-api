import EventService from "@/services/event.service";
import {
  GqlQueryEventsArgs,
  GqlMutationEventCreateArgs,
  GqlQueryEventArgs,
  GqlMutationEventDeleteArgs,
  GqlMutationEventUpdateContentArgs,
  GqlMutationEventPublishArgs,
  GqlMutationEventUnpublishArgs,
  GqlMutationEventAddGroupArgs,
  GqlMutationEventRemoveGroupArgs,
  GqlMutationEventAddOrganizationArgs,
  GqlMutationEventRemoveOrganizationArgs,
} from "@/types/graphql";

const eventResolver = {
  Query: {
    events: async (_: unknown, args: GqlQueryEventsArgs) => EventService.queryEvents(args),
    event: async (_: unknown, args: GqlQueryEventArgs) => EventService.getEvent(args),
  },
  Mutation: {
    eventCreate: async (_: unknown, args: GqlMutationEventCreateArgs) =>
      EventService.eventCreate(args),
    eventDelete: async (_: unknown, args: GqlMutationEventDeleteArgs) =>
      EventService.eventDelete(args),
    eventUpdateContent: async (_: unknown, args: GqlMutationEventUpdateContentArgs) =>
      EventService.eventUpdateContent(args),
    eventPublish: async (_: unknown, args: GqlMutationEventPublishArgs) =>
      EventService.eventPublish(args),
    eventUnpublish: async (_: unknown, args: GqlMutationEventUnpublishArgs) =>
      EventService.eventUnpublish(args),
    eventAddGroup: async (_: unknown, args: GqlMutationEventAddGroupArgs) =>
      EventService.eventAddGroup(args),
    eventRemoveGroup: async (_: unknown, args: GqlMutationEventRemoveGroupArgs) =>
      EventService.eventRemoveGroup(args),
    eventAddOrganization: async (_: unknown, args: GqlMutationEventAddOrganizationArgs) =>
      EventService.eventAddOrganization(args),
    eventRemoveOrganization: async (_: unknown, args: GqlMutationEventRemoveOrganizationArgs) =>
      EventService.eventRemoveOrganization(args),
  },
};

export default eventResolver;

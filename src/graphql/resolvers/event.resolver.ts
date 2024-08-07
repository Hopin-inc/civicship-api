import EventService from "@/services/event.service";
import {
  GqlQueryEventsArgs,
  GqlMutationCreateEventArgs,
  GqlQueryEventArgs,
  GqlMutationDeleteEventArgs,
  GqlMutationUpdateEventInfoArgs,
} from "@/types/graphql";

const eventResolver = {
  Query: {
    events: async (_: unknown, args: GqlQueryEventsArgs) =>
      EventService.queryEvents(args),
    event: async (_: unknown, args: GqlQueryEventArgs) =>
      EventService.getEvent(args),
  },
  Mutation: {
    createEvent: async (_: unknown, args: GqlMutationCreateEventArgs) =>
      EventService.createEvent(args),
    deleteEvent: async (_: unknown, args: GqlMutationDeleteEventArgs) =>
      EventService.deleteEvent(args),
    updateEventInfo: async (_: unknown, args: GqlMutationUpdateEventInfoArgs) =>
      EventService.updateEventInfo(args),
  },
};

export default eventResolver;

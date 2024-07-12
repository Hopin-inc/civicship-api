import EventService from "@/services/event.service";
import {
  GqlQueryEventsArgs,
  GqlMutationCreateEventArgs,
  GqlQueryEventArgs,
  GqlMutationUpdateEventArgs,
  GqlMutationDeleteEventArgs,
} from "@/types/graphql";

const eventResolver = {
  Query: {
    events: async (_: unknown, args: GqlQueryEventsArgs) => EventService.queryEvents(args),
    event: async (_: unknown, args: GqlQueryEventArgs) => EventService.getEvent(args)
  },
  Mutation: {
    createEvent: async (_: unknown, args: GqlMutationCreateEventArgs) => EventService.createEvent(args),
    updateEvent: async (_: unknown, args: GqlMutationUpdateEventArgs) => EventService.updateEvent(args),
    deleteEvent: async (_: unknown, args: GqlMutationDeleteEventArgs) => EventService.deleteEvent(args)
  }
};

export default eventResolver;

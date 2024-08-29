import {
  GqlQueryEventsArgs,
  GqlMutationEventPlanArgs,
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
import EventUseCase from "@/usacase/event.usecase";

const eventResolver = {
  Query: {
    events: async (_: unknown, args: GqlQueryEventsArgs) => {
      try {
        return await EventUseCase.userGetPublicEvents(args);
      } catch (error) {
        throw new Error("Error fetching public events");
      }
    },
    event: async (_: unknown, args: GqlQueryEventArgs) => {
      try {
        return await EventUseCase.userGetEvent(args);
      } catch (error) {
        throw new Error("Error fetching event");
      }
    },
  },
  Mutation: {
    eventPlan: async (_: unknown, args: GqlMutationEventPlanArgs) => {
      try {
        return await EventUseCase.userPlanEvent(args);
      } catch (error) {
        throw new Error("Error planning event");
      }
    },
    eventDelete: async (_: unknown, args: GqlMutationEventDeleteArgs) => {
      try {
        return await EventUseCase.userDeleteEvent(args);
      } catch (error) {
        throw new Error("Error deleting event");
      }
    },
    eventUpdateContent: async (_: unknown, args: GqlMutationEventUpdateContentArgs) => {
      try {
        return await EventUseCase.userUpdateContentOfEvent(args);
      } catch (error) {
        throw new Error("Error updating event content");
      }
    },
    eventPublish: async (_: unknown, args: GqlMutationEventPublishArgs) => {
      try {
        return await EventUseCase.userPublishEvent(args);
      } catch (error) {
        throw new Error("Error publishing event");
      }
    },
    eventUnpublish: async (_: unknown, args: GqlMutationEventUnpublishArgs) => {
      try {
        return await EventUseCase.userUnpublishEvent(args);
      } catch (error) {
        throw new Error("Error unpublishing event");
      }
    },
    eventAddGroup: async (_: unknown, args: GqlMutationEventAddGroupArgs) => {
      try {
        return await EventUseCase.userAddGroupToEvent(args);
      } catch (error) {
        throw new Error("Error adding group to event");
      }
    },
    eventRemoveGroup: async (_: unknown, args: GqlMutationEventRemoveGroupArgs) => {
      try {
        return await EventUseCase.userRemoveGroupFromEvent(args);
      } catch (error) {
        throw new Error("Error removing group from event");
      }
    },
    eventAddOrganization: async (_: unknown, args: GqlMutationEventAddOrganizationArgs) => {
      try {
        return await EventUseCase.userAddOrganizationToEvent(args);
      } catch (error) {
        throw new Error("Error adding organization to event");
      }
    },
    eventRemoveOrganization: async (_: unknown, args: GqlMutationEventRemoveOrganizationArgs) => {
      try {
        return await EventUseCase.userRemoveOrganizationFromEvent(args);
      } catch (error) {
        throw new Error("Error removing organization from event");
      }
    },
  },
};

export default eventResolver;

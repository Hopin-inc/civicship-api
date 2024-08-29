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
    events: async (_: unknown, args: GqlQueryEventsArgs) =>
      EventUseCase.userFetchPublicEvents(args),
    event: async (_: unknown, args: GqlQueryEventArgs) =>
      EventUseCase.userGetEventWithRelations(args),
  },
  Mutation: {
    eventPlan: async (_: unknown, args: GqlMutationEventPlanArgs) =>
      EventUseCase.userPlanEvent(args),
    eventDelete: async (_: unknown, args: GqlMutationEventDeleteArgs) =>
      EventUseCase.userDeleteEvent(args),
    eventUpdateContent: async (_: unknown, args: GqlMutationEventUpdateContentArgs) =>
      EventUseCase.userUpdateEventContent(args),
    eventPublish: async (_: unknown, args: GqlMutationEventPublishArgs) =>
      EventUseCase.userPublishEvent(args),
    eventUnpublish: async (_: unknown, args: GqlMutationEventUnpublishArgs) =>
      EventUseCase.userUnpublishEvent(args),
    eventAddGroup: async (_: unknown, args: GqlMutationEventAddGroupArgs) =>
      EventUseCase.userAddGroupToEvent(args),
    eventRemoveGroup: async (_: unknown, args: GqlMutationEventRemoveGroupArgs) =>
      EventUseCase.userRemoveGroupFromEvent(args),
    eventAddOrganization: async (_: unknown, args: GqlMutationEventAddOrganizationArgs) =>
      EventUseCase.userAddOrganizationToEvent(args),
    eventRemoveOrganization: async (_: unknown, args: GqlMutationEventRemoveOrganizationArgs) =>
      EventUseCase.userRemoveOrganizationFromEvent(args),
  },
};

export default eventResolver;

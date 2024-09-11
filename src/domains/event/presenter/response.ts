import {
  GqlEvent,
  GqlEventDeleteSuccess,
  GqlEventPlanSuccess,
  GqlEventsConnection,
  GqlEventUpdateContentSuccess,
  GqlEventUpdateGroupSuccess,
  GqlEventUpdateOrganizationSuccess,
  GqlEventUpdatePrivacySuccess,
  GqlGroup,
  GqlOrganization,
} from "@/types/graphql";
import {
  EventCreatePayloadWithArgs,
  EventGetPayloadWithArgs,
  EventUpdateContentPayloadWithArgs,
} from "@/domains/event/type";

export default class EventResponseFormat {
  static query(events: GqlEvent[], hasNextPage: boolean): GqlEventsConnection {
    return {
      totalCount: events.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: events[0]?.id,
        endCursor: events.length ? events[events.length - 1].id : undefined,
      },
      edges: events.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static get(event: EventGetPayloadWithArgs): GqlEvent {
    return {
      ...event,
      agendas: event.agendas?.map((r) => r.agenda),
      cities: event.cities?.map((r) => ({
        ...r.city,
        state: r.city.state,
      })),
      skillsets: event.skillsets?.map((r) => r.skillset),
      organizations: event.organizations?.map((r) => ({
        ...r.organization,
        city: {
          ...r.organization.city,
          state: r.organization.city.state,
        },
        state: r.organization.state,
      })),
      groups: event.groups?.map((r) => r.group),
      activities: event.activities
        ? {
            data: event.activities,
            total: event._count.activities,
          }
        : undefined,
      likes: event.likes
        ? {
            data: event.likes,
            total: event._count.likes,
          }
        : undefined,
      comments: event.comments
        ? {
            data: event.comments,
            total: event._count.comments,
          }
        : undefined,
    };
  }

  static create(event: EventCreatePayloadWithArgs): GqlEventPlanSuccess {
    return {
      __typename: "EventPlanSuccess",
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        cities: event.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        skillsets: event.skillsets.map((r) => r.skillset),
        organizations: event.organizations.map((r) => ({
          ...r.organization,
          city: {
            ...r.organization.city,
            state: r.organization.city.state,
          },
          state: r.organization.state,
        })),
        groups: event.groups.map((r) => r.group),
      },
    };
  }

  static updateContent(event: EventUpdateContentPayloadWithArgs): GqlEventUpdateContentSuccess {
    return {
      __typename: "EventUpdateContentSuccess",
      event: {
        ...event,
        agendas: event.agendas.map((r) => r.agenda),
        cities: event.cities.map((r) => ({
          ...r.city,
          state: r.city.state,
        })),
        skillsets: event.skillsets.map((r) => r.skillset),
      },
    };
  }

  static delete(id: string): GqlEventDeleteSuccess {
    return { eventId: id };
  }

  static switchPrivacy(event: GqlEvent): GqlEventUpdatePrivacySuccess {
    return {
      __typename: "EventUpdatePrivacySuccess",
      event,
    };
  }

  static updateGroup(event: GqlEvent, group: GqlGroup): GqlEventUpdateGroupSuccess {
    return {
      __typename: "EventUpdateGroupSuccess",
      event,
      group,
    };
  }

  static updateOrganization(
    event: GqlEvent,
    organization: GqlOrganization,
  ): GqlEventUpdateOrganizationSuccess {
    return {
      __typename: "EventUpdateOrganizationSuccess",
      event,
      organization,
    };
  }
}

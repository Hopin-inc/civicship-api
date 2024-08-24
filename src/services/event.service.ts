import {
  GqlEvent,
  GqlEventsConnection,
  GqlQueryEventArgs,
  GqlQueryEventsArgs,
  GqlMutationEventDeleteArgs,
  GqlMutationEventUpdateContentArgs,
  GqlMutationEventPublishArgs,
  GqlMutationEventUnpublishArgs,
  GqlMutationEventAddGroupArgs,
  GqlMutationEventRemoveGroupArgs,
  GqlMutationEventAddOrganizationArgs,
  GqlMutationEventRemoveOrganizationArgs,
  GqlEventDeletePayload,
  GqlEventUpdateContentPayload,
  GqlEventUpdatePrivacyPayload,
  GqlEventUpdateGroupPayload,
  GqlEventUpdateOrganizationPayload,
  GqlEventPlanPayload,
  GqlMutationEventPlanArgs,
} from "@/types/graphql";
import { prismaClient } from "@/prisma/client";
import { handleError } from "@/utils/error";
import { RELATION_ACTION } from "@/consts";
import { Prisma } from "@prisma/client";
import { GraphQLResolveInfo } from "graphql";
import { doesPathExist } from "@/utils";

export default class EventService {
  private static db = prismaClient;

  static async queryEvents(
    { cursor, filter, sort, first }: GqlQueryEventsArgs,
    info: GraphQLResolveInfo,
  ): Promise<GqlEventsConnection> {
    const take = first ?? 10;
    const where: Prisma.EventWhereInput = {
      AND: [
        filter?.agendaId ? { agendas: { some: { agendaId: filter?.agendaId } } } : {},
        filter?.cityCode ? { cities: { some: { cityCode: filter?.cityCode } } } : {},
        filter?.keyword
          ? {
              OR: [
                { description: { contains: filter?.keyword } },
                {
                  organizations: {
                    some: {
                      organization: { name: { contains: filter?.keyword } },
                    },
                  },
                },
              ],
            }
          : {},
      ],
    };

    const orderBy: Prisma.EventOrderByWithRelationInput = {
      startsAt: sort?.startsAt ?? Prisma.SortOrder.desc,
    };

    const include: Prisma.EventInclude = {
      agendas: doesPathExist(info.fieldNodes, ["events", "edges", "node", "agendas"])
        ? { include: { agenda: true } }
        : undefined,
      cities: doesPathExist(info.fieldNodes, ["events", "edges", "node", "cities"])
        ? { include: { city: { include: { state: true } } } }
        : undefined,
      skillsets: doesPathExist(info.fieldNodes, ["events", "edges", "node", "skillsets"])
        ? { include: { skillset: true } }
        : undefined,
      organizations: doesPathExist(info.fieldNodes, ["events", "edges", "node", "organizations"])
        ? {
            include: {
              organization: {
                include: {
                  city: {
                    include: {
                      state: true,
                    },
                  },
                  state: true,
                },
              },
            },
          }
        : undefined,
      groups: doesPathExist(info.fieldNodes, ["events", "edges", "node", "groups"])
        ? { include: { group: true } }
        : undefined,
      activities: doesPathExist(info.fieldNodes, ["events", "edges", "node", "activities"])
        ? {
            include: {
              stat: { select: { totalMinutes: true } },
            },
          }
        : undefined,
      likes: doesPathExist(info.fieldNodes, ["events", "edges", "node", "likes"])
        ? { include: { event: true, user: true } }
        : undefined,
      comments: doesPathExist(info.fieldNodes, ["events", "edges", "node", "comments"])
        ? { include: { event: true, user: true } }
        : undefined,
      stat: doesPathExist(info.fieldNodes, ["events", "edges", "node", "stat"])
        ? { select: { totalMinutes: true } }
        : undefined,
    };

    const data = await this.db.event.findMany({
      where,
      orderBy,
      include,
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasNextPage = data.length > take;
    const formattedData: GqlEvent[] = data.slice(0, take).map((record) => {
      return {
        ...record,
        agendas: record.agendas?.map((r) => r.agenda),
        cities: record.cities?.map((r) => ({
          ...r.city,
          state: r.city?.state,
        })),
        skillsets: record.skillsets?.map((r) => r.skillset),
        organizations: record.organizations?.map((r) => ({
          ...r.organization,
          city: {
            ...r.organization.city,
            state: r.organization.city?.state,
          },
          state: r.organization.state,
        })),
        groups: record.groups?.map((r) => r.group),
        activities: record.activities
          ? {
              __typename: "Activities",
              data: record.activities.map((activity) => ({
                ...activity,
                totalMinutes: 0,
              })),
              total: record.activities.length,
            }
          : undefined,
        likes: record.likes
          ? {
              __typename: "Likes",
              data: record.likes.map((like) => ({
                ...like,
                event: like.event,
                user: like.user,
              })),
              total: record.likes.length,
            }
          : undefined,
        comments: record.comments
          ? {
              __typename: "Comments",
              data: record.comments.map((comment) => ({
                ...comment,
                event: comment.event,
                user: comment.user,
              })),
              total: record.comments.length,
            }
          : undefined,
      };
    });

    return {
      totalCount: data.length,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: true,
        startCursor: formattedData[0]?.id,
        endCursor: formattedData.length ? formattedData[formattedData.length - 1].id : undefined,
      },
      edges: formattedData.map((edge) => ({
        cursor: edge.id,
        node: edge,
      })),
    };
  }

  static async getEvent({ id }: GqlQueryEventArgs): Promise<GqlEvent | null> {
    const event = await this.db.event.findUnique({
      where: { id },
      include: {
        agendas: { include: { agenda: true } },
        cities: { include: { city: { include: { state: true } } } },
        skillsets: { include: { skillset: true } },
        organizations: {
          include: {
            organization: {
              include: {
                city: {
                  include: {
                    state: true,
                  },
                },
                state: true,
              },
            },
          },
        },
        groups: { include: { group: true } },
        stat: { select: { totalMinutes: true } },
      },
    });
    return event
      ? {
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
          totalMinutes: event.stat?.totalMinutes ?? 0,
        }
      : null;
  }

  static async eventPlan({ input }: GqlMutationEventPlanArgs): Promise<GqlEventPlanPayload> {
    try {
      return await this.db.event.plan({ input });
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventUpdateContent({
    id,
    input,
  }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
    try {
      return await this.db.event.updateContent({ id: id, input: input });
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventDelete({ id }: GqlMutationEventDeleteArgs): Promise<GqlEventDeletePayload> {
    await this.db.event.delete({
      where: { id },
    });
    return { eventId: id };
  }

  static async eventPublish({
    id,
  }: GqlMutationEventPublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    try {
      return await this.db.event.updatePrivacy(id, true);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventUnpublish({
    id,
  }: GqlMutationEventUnpublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    try {
      return await this.db.event.updatePrivacy(id, false);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventAddGroup({
    id,
    input,
  }: GqlMutationEventAddGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    try {
      return await this.db.event.eventUpdateGroup(id, input.groupId, RELATION_ACTION.CONNECT);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventRemoveGroup({
    id,
    input,
  }: GqlMutationEventRemoveGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    try {
      return await this.db.event.eventUpdateGroup(id, input.groupId, RELATION_ACTION.DELETE);
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventAddOrganization({
    id,
    input,
  }: GqlMutationEventAddOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    try {
      return await this.db.event.updateOrganization(
        id,
        input.organizationId,
        RELATION_ACTION.CONNECTORCREATE,
      );
    } catch (error) {
      return await handleError(error);
    }
  }

  static async eventRemoveOrganization({
    id,
    input,
  }: GqlMutationEventRemoveOrganizationArgs): Promise<GqlEventUpdateOrganizationPayload> {
    try {
      return await this.db.event.updateOrganization(
        id,
        input.organizationId,
        RELATION_ACTION.DELETE,
      );
    } catch (error) {
      return await handleError(error);
    }
  }
}

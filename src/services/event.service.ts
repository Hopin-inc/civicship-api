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
import { handlePrismaError } from "@/prisma/extension/error";
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

    const include = Prisma.validator<Prisma.EventInclude>()({
      agendas: { include: { agenda: true } },
      cities: { include: { city: { include: { state: true } } } },
      skillsets: { include: { skillset: true } },
      organizations: {
        include: {
          organization: {
            include: {
              city: { include: { state: true } },
              state: true,
            },
          },
        },
      },
      groups: { include: { group: true } },
      activities: {
        include: {
          stat: { select: { totalMinutes: true } },
        },
      },
      likes: { include: { user: true, event: true } },
      comments: { include: { user: true, event: true } },
      stat: { select: { totalMinutes: true } },
      _count: {
        select: {
          activities: true,
          likes: true,
          comments: true,
        },
      },
    });

    const data = await this.db.event.findMany({
      where,
      orderBy,
      relationLoadStrategy: "join",
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
        totalMinutes: record.stat?.totalMinutes ?? 0,
        activities: record.activities
          ? {
              data: record.activities.map((activity) => ({
                ...activity,
                totalMinutes: activity.stat?.totalMinutes ?? 0,
              })),
              total: record._count.activities,
            }
          : undefined,
        likes: record.likes
          ? {
              data: record.likes.map((like) => {
                if (!like.user) {
                  throw new Error(`User for like with ID ${like.id} not found`);
                }
                if (!like.event) {
                  throw new Error(`Event for like with ID ${like.id} not found`);
                }
                return {
                  ...like,
                  user: like.user,
                  event: like.event,
                };
              }),
              total: record._count.likes,
            }
          : undefined,
        comments: record.comments
          ? {
              data: record.comments.map((comment) => {
                if (!comment.event) {
                  throw new Error(`Event with ID ${comment.eventId} not found`);
                }
                if (!comment.user) {
                  throw new Error(`User for comment with ID ${comment.id} not found`);
                }
                return {
                  ...comment,
                  user: comment.user,
                  event: comment.event,
                };
              }),
              total: record._count.comments,
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

  static async eventGet({ id }: GqlQueryEventArgs): Promise<GqlEvent | null> {
    return await this.db.event.getWithRelations(id);
  }

  static async eventPlan({ input }: GqlMutationEventPlanArgs): Promise<GqlEventPlanPayload> {
    try {
      return await this.db.event.plan({ input });
    } catch (error) {
      return await handlePrismaError(error);
    }
  }

  static async eventUpdateContent({
    id,
    input,
  }: GqlMutationEventUpdateContentArgs): Promise<GqlEventUpdateContentPayload> {
    try {
      return await this.db.event.updateContent({ id: id, input: input });
    } catch (error) {
      return await handlePrismaError(error);
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
      return await handlePrismaError(error);
    }
  }

  static async eventUnpublish({
    id,
  }: GqlMutationEventUnpublishArgs): Promise<GqlEventUpdatePrivacyPayload> {
    try {
      return await this.db.event.updatePrivacy(id, false);
    } catch (error) {
      return await handlePrismaError(error);
    }
  }

  static async eventAddGroup({
    id,
    input,
  }: GqlMutationEventAddGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    try {
      return await this.db.event.updateGroup(id, input.groupId, RELATION_ACTION.CONNECT);
    } catch (error) {
      return await handlePrismaError(error);
    }
  }

  static async eventRemoveGroup({
    id,
    input,
  }: GqlMutationEventRemoveGroupArgs): Promise<GqlEventUpdateGroupPayload> {
    try {
      return await this.db.event.updateGroup(id, input.groupId, RELATION_ACTION.DELETE);
    } catch (error) {
      return await handlePrismaError(error);
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
      return await handlePrismaError(error);
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
      return await handlePrismaError(error);
    }
  }
}

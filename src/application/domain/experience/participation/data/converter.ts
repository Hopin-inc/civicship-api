import {
  GqlImageInput,
  GqlParticipationBulkCreateInput,
  GqlParticipationCreatePersonalRecordInput,
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
} from "@/types/graphql";
import {
  OpportunityCategory,
  ParticipationStatus,
  ParticipationStatusReason,
  Prisma,
} from "@prisma/client";
import { injectable } from "tsyringe";

@injectable()
export default class ParticipationConverter {
  filter(filter?: GqlParticipationFilterInput): Prisma.ParticipationWhereInput {
    return {
      AND: [
        filter?.userIds ? { userId: { in: filter.userIds } } : {},
        filter?.categories && filter.categories.length
          ? {
              reservation: {
                opportunitySlot: {
                  opportunity: {
                    category: { in: filter.categories.filter(isOpportunityCategory) },
                  },
                },
              },
            }
          : {},
        filter?.dateFrom || filter?.dateTo
          ? {
              reservation: {
                opportunitySlot: {
                  startsAt: {
                    ...(filter.dateFrom ? { gte: filter.dateFrom } : {}),
                    ...(filter.dateTo ? { lte: filter.dateTo } : {}),
                  },
                },
              },
            }
          : {},
        filter?.cityCodes
          ? {
              reservation: {
                opportunitySlot: {
                  opportunity: {
                    place: {
                      city: {
                        code: { in: filter.cityCodes },
                      },
                    },
                  },
                },
              },
            }
          : {},
        filter?.stateCodes
          ? {
              reservation: {
                opportunitySlot: {
                  opportunity: {
                    place: {
                      city: {
                        state: {
                          code: { in: filter.stateCodes },
                        },
                      },
                    },
                  },
                },
              },
            }
          : {},
        filter?.status ? { status: filter.status } : {},
        filter?.communityId ? { communityId: filter.communityId } : {},
        filter?.opportunityId
          ? {
              OR: [
                { reservation: { opportunitySlot: { opportunityId: filter.opportunityId } } },
                { opportunitySlot: { opportunityId: filter.opportunityId } },
              ],
            }
          : {},
        filter?.opportunitySlotId
          ? { reservation: { opportunitySlotId: filter.opportunitySlotId } }
          : {},
        filter?.reservationId ? { reservationId: filter.reservationId } : {},
      ],
    };
  }

  sort(sort?: GqlParticipationSortInput): Prisma.ParticipationOrderByWithRelationInput[] {
    return [
      { reservation: { opportunitySlot: { startsAt: sort?.startsAt ?? "desc" } } },
      { createdAt: "desc" },
    ];
  }

  create(
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
  ): {
    data: Omit<Prisma.ParticipationCreateInput, "images">;
    images: GqlImageInput[];
  } {
    const { images, description } = input;

    return {
      data: {
        status: ParticipationStatus.PARTICIPATED,
        reason: ParticipationStatusReason.PERSONAL_RECORD,
        description: description ?? null,
        user: { connect: { id: currentUserId } },
        statusHistories: {
          create: {
            status: ParticipationStatus.PARTICIPATED,
            reason: ParticipationStatusReason.PERSONAL_RECORD,
            createdByUser: { connect: { id: currentUserId } },
          },
        },
      },
      images: images ?? [],
    };
  }

  createMany(
    input: GqlParticipationBulkCreateInput,
    communityId: string,
  ): Prisma.ParticipationCreateInput[] {
    return input.userIds.map((userId) => ({
      userId,
      communityId,
      opportunitySlotId: input.slotId,
      description: input.description ?? null,
      status: ParticipationStatus.PARTICIPATING,
      reason: ParticipationStatusReason.PERSONAL_RECORD,
    }));
  }

  setStatus(
    currentUserId: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
  ): Prisma.ParticipationUpdateInput {
    return {
      status,
      reason,
      statusHistories: {
        create: {
          status,
          reason,
          createdByUser: { connect: { id: currentUserId } },
        },
      },
    };
  }
}

function isOpportunityCategory(value: string): value is OpportunityCategory {
  return ["QUEST", "EVENT", "ACTIVITY"].includes(value);
}

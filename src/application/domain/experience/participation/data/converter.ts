import {
  GqlImageInput,
  GqlParticipationCreatePersonalRecordInput,
  GqlParticipationFilterInput,
  GqlParticipationSortInput,
} from "@/types/graphql";
import {
  GqlOpportunityCategory as OpportunityCategory,
  GqlParticipationStatus as ParticipationStatus,
  GqlParticipationStatusReason as ParticipationStatusReason,
} from "@/types/graphql";
import { injectable } from "tsyringe";

@injectable()
export default class ParticipationConverter {
  filter(filter?: GqlParticipationFilterInput): any {
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
          ? { reservation: { opportunitySlot: { opportunityId: filter.opportunityId } } }
          : {},
        filter?.opportunitySlotId
          ? { reservation: { opportunitySlotId: filter.opportunitySlotId } }
          : {},
        filter?.reservationId ? { reservationId: filter.reservationId } : {},
      ],
    };
  }

  sort(sort?: GqlParticipationSortInput): any[] {
    return [
      { reservation: { opportunitySlot: { startsAt: sort?.startsAt ?? "desc" } } },
      { createdAt: "desc" },
    ];
  }

  create(
    input: GqlParticipationCreatePersonalRecordInput,
    currentUserId: string,
  ): {
    data: any;
    images: GqlImageInput[];
  } {
    const { images, description } = input;

    return {
      data: {
        status: ParticipationStatus.Participated,
        reason: ParticipationStatusReason.PersonalRecord,
        description: description ?? null,
        user: { connect: { id: currentUserId } },
        statusHistories: {
          create: {
            status: ParticipationStatus.Participated,
            reason: ParticipationStatusReason.PersonalRecord,
            createdByUser: { connect: { id: currentUserId } },
          },
        },
      },
      images: images ?? [],
    };
  }

  setStatus(
    currentUserId: string,
    status: ParticipationStatus,
    reason: ParticipationStatusReason,
  ): any {
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
  return ["Quest", "Event", "Activity"].includes(value);
}

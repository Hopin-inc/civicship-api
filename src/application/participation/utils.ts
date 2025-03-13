import { IContext } from "@/types/server";
import { Prisma } from "@prisma/client";
import { PrismaParticipation } from "@/application/participation/data/type";

import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
} from "@/types/graphql";
import { clampFirst } from "@/utils";
import ParticipationService from "@/application/participation/service";
import ParticipationOutputFormat from "@/application/participation/presenter";
import { NotFoundError } from "@/errors/graphql";
import OpportunityRepository from "@/application/opportunity/data/repository";

export default class ParticipationUtils {
  static async fetchParticipationsCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlParticipationFilterInput;
      sort?: GqlParticipationSortInput;
      first?: number;
    },
  ): Promise<GqlParticipationsConnection> {
    const take = clampFirst(first);

    const res = await ParticipationService.fetchParticipations(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;

    const data: GqlParticipation[] = res.slice(0, take).map((record) => {
      return ParticipationOutputFormat.get(record);
    });

    return ParticipationOutputFormat.query(data, hasNextPage);
  }

  static async validateParticipation(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participation: PrismaParticipation,
  ): Promise<{
    opportunity: NonNullable<Awaited<ReturnType<typeof OpportunityRepository.find>>>;
    participation: PrismaParticipation;
  }> {
    if (!participation.opportunityId) {
      throw new NotFoundError("Opportunity", { id: participation.opportunityId });
    }

    const opportunity = await OpportunityRepository.find(ctx, participation.opportunityId, tx);
    if (!opportunity) {
      throw new NotFoundError("Opportunity", { id: participation.opportunityId });
    }

    if (!participation.userId) {
      throw new NotFoundError("Participated user", { userId: participation.userId });
    }

    return { opportunity, participation };
  }

  static extractParticipationData(participation: PrismaParticipation) {
    const opportunityId = participation.opportunity?.id ?? null;
    if (!opportunityId) {
      throw new Error(`Cannot determine opportunityId from participation: id=${participation.id}`);
    }

    const participantId = participation.user?.id ?? null;

    if (!participantId) {
      throw new Error(`Cannot determine userId from participation: id=${participation.id}`);
    }

    return { opportunityId, participantId };
  }
}

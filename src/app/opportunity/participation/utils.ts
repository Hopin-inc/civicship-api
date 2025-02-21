import { IContext } from "@/types/server";
import { ParticipationStatus, Prisma } from "@prisma/client";
import { ParticipationPayloadWithArgs } from "@/infra/prisma/types/opportunity/participation";

import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
} from "@/types/graphql";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import ParticipationRepository from "@/infra/repositories/opportunity/participation";
import { clampFirst } from "@/utils";
import ParticipationService from "@/app/opportunity/participation/service";
import ParticipationOutputFormat from "@/presentation/graphql/dto/opportunity/participation/output";
import { getCurrentUserId } from "@/utils";
import OpportunityRepository from "@/infra/repositories/opportunity";
import ParticipationStatusHistoryService from "@/app/opportunity/participation/statusHistory/service";

export default class ParticipationUtils {
  private static issuer = new PrismaClientIssuer();

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

  static async setParticipationStatus(ctx: IContext, id: string, status: ParticipationStatus) {
    const userId = getCurrentUserId(ctx);
    return this.issuer.public(ctx, async (tx) => {
      const res = await ParticipationRepository.setStatus(ctx, id, status, tx);
      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        id,
        status,
        userId,
      );

      return res;
    });
  }

  static async validateParticipation(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participation: ParticipationPayloadWithArgs,
  ): Promise<{
    opportunity: NonNullable<Awaited<ReturnType<typeof OpportunityRepository.find>>>;
    participation: ParticipationPayloadWithArgs;
  }> {
    if (!participation.opportunityId) {
      throw new Error(`Opportunity with ID ${participation.opportunityId} not found`);
    }

    const opportunity = await OpportunityRepository.find(ctx, participation.opportunityId, tx);
    if (!opportunity) {
      throw new Error(`Opportunity with ID ${participation.opportunityId} not found`);
    }

    if (!participation.userId) {
      throw new Error(`Participation with ID ${participation.userId} not found`);
    }

    return { opportunity, participation };
  }
}

import { IContext } from "@/types/server";
import { ParticipationStatus, Prisma } from "@prisma/client";
import { ParticipationPayloadWithArgs } from "@/infrastructure/prisma/types/opportunity/participation";

import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
} from "@/types/graphql";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import ParticipationRepository from "@/infrastructure/prisma/repositories/opportunity/participation";
import { clampFirst } from "@/utils";
import ParticipationService from "@/application/opportunity/participation/service";
import ParticipationOutputFormat from "@/presentation/graphql/dto/opportunity/participation/output";
import OpportunityRepository from "@/infrastructure/prisma/repositories/opportunity";
import ParticipationStatusHistoryService from "@/application/opportunity/participation/statusHistory/service";
import { getCurrentUserId } from "@/utils";
import OpportunityRepository from "@/infra/repositories/opportunity";
import ParticipationStatusHistoryService from "@/app/opportunity/participation/statusHistory/service";
import { NotFoundError } from "@/errors/graphql";

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

  static async setParticipationStatus(
    ctx: IContext,
    id: string,
    currentUserId: string,
    status: ParticipationStatus,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      const res = await ParticipationRepository.setStatus(ctx, id, status, tx);
      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        id,
        status,
        currentUserId,
      );
      return res;
    } else {
      return this.issuer.public(ctx, async (innerTx) => {
        const res = await ParticipationRepository.setStatus(ctx, id, status, innerTx);
        await ParticipationStatusHistoryService.recordParticipationHistory(
          ctx,
          innerTx,
          id,
          status,
          currentUserId,
        );
        return res;
      });
    }
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

  static extractParticipationData(participation: ParticipationPayloadWithArgs) {
    const communityId = participation.communityId ?? participation.opportunity?.communityId ?? null;
    if (!communityId) {
      throw new Error(`Cannot determine communityId from participation: id=${participation.id}`);
    }

    const opportunityId = participation.opportunity?.id ?? null;
    if (!opportunityId) {
      throw new Error(`Cannot determine opportunityId from participation: id=${participation.id}`);
    }

    const participantId = participation.user?.id ?? null;

    if (!participantId) {
      throw new Error(`Cannot determine userId from participation: id=${participation.id}`);
    }

    return { communityId, opportunityId, participantId };
  }
}

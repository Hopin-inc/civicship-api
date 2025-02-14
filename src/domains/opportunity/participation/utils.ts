import { IContext } from "@/types/server";
import { OpportunityCategory, ParticipationStatus, Prisma } from "@prisma/client";
import { ParticipationPayloadWithArgs } from "@/domains/opportunity/participation/type";

import {
  GqlParticipation,
  GqlParticipationFilterInput,
  GqlParticipationsConnection,
  GqlParticipationSortInput,
  GqlTransactionGiveRewardPointInput,
} from "@/types/graphql";
import { PrismaClientIssuer } from "@/prisma/client";
import ParticipationRepository from "@/domains/opportunity/participation/repository";
import { clampFirst } from "@/utils";
import ParticipationService from "@/domains/opportunity/participation/service";
import ParticipationOutputFormat from "@/domains/opportunity/participation/presenter/output";
import { getCurrentUserId } from "@/utils";
import MembershipUtils from "@/domains/membership/utils";
import ParticipationStatusHistoryService from "@/domains/opportunity/participationStatusHistory/service";
import OpportunityRepository from "@/domains/opportunity/repository";
import TransactionService from "@/domains/transaction/service";
import WalletService from "@/domains/membership/wallet/service";

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
    status: ParticipationStatus,
    communityId?: string,
  ) {
    const userId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx) => {
      const res = await ParticipationRepository.setStatus(ctx, id, status, tx);

      if (communityId && status === ParticipationStatus.PARTICIPATING) {
        await MembershipUtils.joinCommunityAndCreateMemberWallet(ctx, tx, userId, communityId);
      }

      if (communityId && status === ParticipationStatus.APPROVED) {
        const { opportunity, participation } = await validateParticipation(ctx, tx, res);

        if (opportunity.category === OpportunityCategory.TASK) {
          const fromPointChange = -opportunity.pointsPerParticipation;
          const toPointChange = opportunity.pointsPerParticipation;

          const { fromWalletId, toWalletId } = await WalletService.findWalletsForGiveReward(
            ctx,
            tx,
            communityId,
            participation.id,
            fromPointChange,
          );

          const input: GqlTransactionGiveRewardPointInput = {
            fromWalletId,
            fromPointChange,
            toWalletId,
            toPointChange,
            participationId: participation.id,
          };

          await TransactionService.giveRewardPoint(ctx, tx, input);
        }
      }
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
}

async function validateParticipation(
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

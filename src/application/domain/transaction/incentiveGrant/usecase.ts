import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import IncentiveGrantPresenter from "./presenter";
import IncentiveGrantService from "./service";
import { IIncentiveGrantRepository } from "./data/interface";
import CommunityService from "@/application/domain/account/community/service";
import NotificationService from "@/application/domain/notification/service";
import { clampFirst } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import logger from "@/infrastructure/logging";
import { NotFoundError, AuthorizationError } from "@/errors/graphql";
import {
  GqlQueryIncentiveGrantsArgs,
  GqlQueryIncentiveGrantArgs,
  GqlMutationIncentiveGrantRetryArgs,
  GqlIncentiveGrant,
  GqlIncentiveGrantsConnection,
  GqlIncentiveGrantFilterInput,
  GqlSortDirection,
  GqlIncentiveGrantRetryPayload,
} from "@/types/graphql";

@injectable()
export default class IncentiveGrantUseCase {
  constructor(
    @inject("IncentiveGrantRepository") private readonly repository: IIncentiveGrantRepository,
    @inject("IncentiveGrantService") private readonly service: IncentiveGrantService,
    @inject("CommunityService") private readonly communityService: CommunityService,
    @inject("NotificationService") private readonly notificationService: NotificationService,
  ) {}

  async visitorBrowseIncentiveGrants(
    args: GqlQueryIncentiveGrantsArgs,
    ctx: IContext,
  ): Promise<GqlIncentiveGrantsConnection> {
    const { filter, sort, cursor, first } = args;
    const take = clampFirst(first);

    // Build where clause
    const where: Prisma.IncentiveGrantWhereInput = this.buildWhereClause(filter);

    // Build orderBy clause
    const orderBy: Prisma.IncentiveGrantOrderByWithRelationInput[] = [];
    if (sort?.createdAt) {
      orderBy.push({ createdAt: sort.createdAt === GqlSortDirection.Asc ? "asc" : "desc" });
    }
    if (sort?.updatedAt) {
      orderBy.push({ updatedAt: sort.updatedAt === GqlSortDirection.Asc ? "asc" : "desc" });
    }
    if (orderBy.length === 0) {
      orderBy.push({ createdAt: "desc" });
    }

    const [records, totalCount] = await Promise.all([
      this.repository.query(ctx, where, orderBy, take, cursor),
      this.repository.count(ctx, where),
    ]);

    const hasNextPage = records.length > take;
    const data: GqlIncentiveGrant[] = records.slice(0, take).map((record) => {
      return IncentiveGrantPresenter.get(record);
    });

    return IncentiveGrantPresenter.query(data, totalCount, hasNextPage, cursor);
  }

  async visitorViewIncentiveGrant(
    args: GqlQueryIncentiveGrantArgs,
    ctx: IContext,
  ): Promise<GqlIncentiveGrant | null> {
    const { id } = args;
    const record = await this.repository.find(ctx, id);
    if (!record) {
      return null;
    }
    return IncentiveGrantPresenter.get(record);
  }

  private buildWhereClause(
    filter: GqlIncentiveGrantFilterInput | null | undefined,
  ): Prisma.IncentiveGrantWhereInput {
    if (!filter) {
      return {};
    }

    const where: Prisma.IncentiveGrantWhereInput = {};

    if (filter.communityId) {
      where.communityId = filter.communityId;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    // Handle logical operators
    if (filter.and) {
      where.AND = filter.and.map((f) => this.buildWhereClause(f));
    }
    if (filter.or) {
      where.OR = filter.or.map((f) => this.buildWhereClause(f));
    }
    if (filter.not) {
      where.NOT = this.buildWhereClause(filter.not);
    }

    return where;
  }

  async ownerRetryIncentiveGrant(
    args: GqlMutationIncentiveGrantRetryArgs,
    ctx: IContext,
  ): Promise<GqlIncentiveGrantRetryPayload> {
    const { input } = args;

    return ctx.issuer.onlyBelongingCommunity(ctx, async (tx: Prisma.TransactionClient) => {
      // Retry the failed grant
      const result = await this.service.retryFailedGrant(ctx, input.incentiveGrantId, tx);

      // Get the updated grant record within the same transaction
      const updatedGrant = await this.repository.findInTransaction(ctx, input.incentiveGrantId, tx);
      if (!updatedGrant) {
        throw new NotFoundError("IncentiveGrant", { id: input.incentiveGrantId });
      }

      // Security check: Ensure the grant belongs to the community specified in the permission
      if (updatedGrant.communityId !== permission.communityId) {
        throw new AuthorizationError("Grant does not belong to the specified community");
      }

      // Send notification if retry was successful (best-effort)
      if (result.success && result.transaction) {
        const transaction = result.transaction;
        const community = await this.communityService.findCommunityOrThrow(
          ctx,
          updatedGrant.communityId,
        );

        this.notificationService
          .pushSignupBonusGrantedMessage(
            ctx,
            transaction.id,
            transaction.toPointChange,
            transaction.comment,
            community.name,
            updatedGrant.userId,
          )
          .catch((error) => {
            logger.error("Failed to send signup bonus notification after retry", {
              transactionId: transaction.id,
              userId: updatedGrant.userId,
              communityId: updatedGrant.communityId,
              incentiveGrantId: input.incentiveGrantId,
              error,
            });
          });
      }

      return {
        __typename: "IncentiveGrantRetrySuccess",
        incentiveGrant: IncentiveGrantPresenter.get(updatedGrant),
        // Transaction will be resolved by the field resolver using DataLoader
        transaction: null,
      };
    });
  }
}

import { IncentiveGrantFailureCode, Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import IncentiveGrantPresenter from "./presenter";
import IncentiveGrantService from "./service";
import { IIncentiveGrantRepository } from "./data/interface";
import CommunityService from "@/application/domain/account/community/service";
import NotificationService from "@/application/domain/notification/service";
import { clampFirst } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import logger from "@/infrastructure/logging";
import {
  NotFoundError,
  AuthorizationError,
  InvalidGrantStatusError,
  UnsupportedGrantTypeError,
  IncentiveDisabledError,
  InsufficientBalanceError,
} from "@/errors/graphql";
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
    const { input, permission } = args;

    try {
      // Execute retry in transaction
      const txResult = await ctx.issuer.onlyBelongingCommunity(
        ctx,
        async (tx: Prisma.TransactionClient) => {
          // 1. Get the grant record and verify authorization BEFORE retry
          const grant = await this.repository.findInTransaction(ctx, input.incentiveGrantId, tx);
          if (!grant) {
            throw new NotFoundError("IncentiveGrant", { id: input.incentiveGrantId });
          }

          // 2. Security check: Ensure the grant belongs to the community (before retry)
          if (grant.community.id !== permission.communityId) {
            throw new AuthorizationError("Grant does not belong to the specified community");
          }

          // 3. Retry the failed grant
          const result = await this.service.retryFailedGrant(ctx, input.incentiveGrantId, tx);

          // 4. Get the updated grant record within the same transaction
          const updatedGrant = await this.repository.findInTransaction(
            ctx,
            input.incentiveGrantId,
            tx,
          );
          if (!updatedGrant) {
            throw new NotFoundError("IncentiveGrant", { id: input.incentiveGrantId });
          }

          return {
            grant: updatedGrant,
            transaction: result.transaction,
          };
        },
      );

      // 5. Send notification outside of transaction (best-effort)
      if (txResult.transaction) {
        const community = await this.communityService.findCommunityOrThrow(
          ctx,
          txResult.grant.community.id,
        );

        this.notificationService
          .pushSignupBonusGrantedMessage(
            ctx,
            txResult.transaction.id,
            txResult.transaction.toPointChange,
            txResult.transaction.comment,
            community.name,
            txResult.grant.user.id,
          )
          .catch((error) => {
            logger.error("Failed to send signup bonus notification after retry", {
              transactionId: txResult.transaction!.id,
              userId: txResult.grant.user.id,
              communityId: txResult.grant.community.id,
              incentiveGrantId: input.incentiveGrantId,
              error,
            });
          });
      }

      return {
        __typename: "IncentiveGrantRetrySuccess",
        incentiveGrant: IncentiveGrantPresenter.get(txResult.grant),
        // Transaction will be resolved by the field resolver using DataLoader
        transaction: null,
      };
    } catch (error: any) {
      // Handle business logic errors: persist failure info in a separate transaction
      const isValidationError =
        error instanceof NotFoundError ||
        error instanceof InvalidGrantStatusError ||
        error instanceof UnsupportedGrantTypeError ||
        error instanceof IncentiveDisabledError ||
        error instanceof AuthorizationError;

      if (!isValidationError) {
        // Attempt to mark as failed in a separate transaction
        await this.updateFailedGrantStatus(ctx, input.incentiveGrantId, error).catch(
          (updateError) => {
            logger.error("Failed to update grant failure status", {
              incentiveGrantId: input.incentiveGrantId,
              error: updateError,
            });
          },
        );
      }

      // Re-throw the error
      throw error;
    }
  }

  /**
   * Update failed grant status in a separate transaction.
   * This ensures failure information persists even when the main transaction is rolled back.
   */
  private async updateFailedGrantStatus(
    ctx: IContext,
    incentiveGrantId: string,
    error: any,
  ): Promise<void> {
    await ctx.issuer.onlyBelongingCommunity(ctx, async (tx: Prisma.TransactionClient) => {
      const grant = await this.repository.findInTransaction(ctx, incentiveGrantId, tx);
      if (!grant || grant.status === "COMPLETED") {
        // Don't update if grant not found or already completed
        return;
      }

      // Determine failure code
      let failureCode: IncentiveGrantFailureCode;
      if (error instanceof InsufficientBalanceError) {
        failureCode = IncentiveGrantFailureCode.INSUFFICIENT_FUNDS;
      } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        failureCode = IncentiveGrantFailureCode.DATABASE_ERROR;
      } else {
        failureCode = IncentiveGrantFailureCode.UNKNOWN;
      }

      // Mark as failed
      await this.repository.markAsFailed(
        ctx,
        grant.user.id,
        grant.community.id,
        grant.type,
        grant.sourceId,
        failureCode,
        error.message || "Unknown error",
        tx,
      );
    });
  }
}

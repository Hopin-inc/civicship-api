import { IContext } from "@/types/server";
import { GqlQueryUtilityHistoriesArgs } from "@/types/graphql";
import { Prisma, UtilityStatus } from "@prisma/client";
import UtilityHistoryRepository from "@/infrastructure/prisma/repositories/utility/history";
import UtilityHistoryInputFormat from "@/presentation/graphql/dto/utility/history/input";
import { OpportunityRequiredUtilityPayloadWithArgs } from "@/infrastructure/prisma/types/opportunity/requiredUtility";

export default class UtilityHistoryService {
  static async fetchUtilityHistories(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryUtilityHistoriesArgs,
    take: number,
  ) {
    const where = UtilityHistoryInputFormat.filter(filter);
    const orderBy = UtilityHistoryInputFormat.sort(sort);

    return await UtilityHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findUtilityHistory(ctx: IContext, id: string) {
    return await UtilityHistoryRepository.find(ctx, id);
  }

  static async fetchAvailableUtilitiesOrThrow(ctx: IContext, walletId: string, utilityId: string) {
    const availableUtilities = await UtilityHistoryRepository.queryAvailableUtilities(
      ctx,
      walletId,
      utilityId,
    );

    if (!availableUtilities || availableUtilities.length === 0) {
      throw new Error(`Available utility with ID ${utilityId} not found in wallet ${walletId}.`);
    }

    return availableUtilities;
  }

  static async consumeFirstAvailableUtilityForOpportunity(
    ctx: IContext,
    requiredUtilities: OpportunityRequiredUtilityPayloadWithArgs[],
    userWalletId: string,
    utilityId: string,
    status: UtilityStatus,
    tx: Prisma.TransactionClient,
    transactionId?: string,
  ): Promise<void> {
    const availableUtilities = await this.fetchAvailableUtilitiesOrThrow(
      ctx,
      userWalletId,
      utilityId,
    );

    let matchedRequiredUtilities;

    const hasRequiredUtility = requiredUtilities.some((requiredUtility) => {
      const foundUtility = availableUtilities.find(
        (availableUtility) => availableUtility.utilityId === requiredUtility.utilityId,
      );
      if (foundUtility) {
        matchedRequiredUtilities = foundUtility;
        return true;
      }
      return false;
    });

    if (!hasRequiredUtility) {
      const requiredUtilityIds = requiredUtilities.map((ru) => ru.utilityId).join(", ");
      throw new Error(
        `Required utility not found. ` +
          `Required utility IDs: ${requiredUtilityIds}, ` +
          `Wallet ID: ${userWalletId}, Specified utility ID: ${utilityId}`,
      );
    }

    await this.recordUtilityHistory(
      ctx,
      tx,
      status,
      userWalletId,
      matchedRequiredUtilities[0].id,
      transactionId,
    );
  }

  static async refundReservedUtilityForOpportunity(
    ctx: IContext,
    requiredUtilities: OpportunityRequiredUtilityPayloadWithArgs[],
    reservedUtilityId: string,
    userWalletId: string,
    tx: Prisma.TransactionClient,
    transactionId?: string,
  ): Promise<void> {
    let matchedRequiredUtility: OpportunityRequiredUtilityPayloadWithArgs | undefined;

    const hasRequiredUtility = requiredUtilities.some((requiredUtility) => {
      if (reservedUtilityId === requiredUtility.utilityId) {
        matchedRequiredUtility = requiredUtility;
        return true;
      }
      return false;
    });

    if (!hasRequiredUtility || !matchedRequiredUtility) {
      const requiredUtilityIds = requiredUtilities.map((ru) => ru.utilityId).join(", ");
      throw new Error(
        `Required utility not found. ` +
          `Required utility IDs: ${requiredUtilityIds}, ` +
          `Wallet ID: ${userWalletId}`,
      );
    }

    await this.recordUtilityHistory(
      ctx,
      tx,
      UtilityStatus.REFUNDED,
      userWalletId,
      matchedRequiredUtility.utilityId,
      transactionId,
    );
  }

  static async recordUtilityHistory(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    status: UtilityStatus,
    walletId: string,
    utilityId: string,
    transactionId?: string,
  ) {
    const data = UtilityHistoryInputFormat.create({
      status,
      walletId,
      utilityId,
      transactionId,
    });

    return await UtilityHistoryRepository.create(ctx, data, tx);
  }
}

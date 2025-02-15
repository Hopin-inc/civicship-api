import { IContext } from "@/types/server";
import ParticipationStatusHistoryInputFormat from "@/domains/opportunity/participationStatusHistory/presenter/input";
import ParticipationStatusHistoryRepository from "@/domains/opportunity/participationStatusHistory/repository";
import { GqlQueryParticipationStatusHistoriesArgs } from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";

export default class ParticipationStatusHistoryService {
  static async fetchStatusHistories(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationStatusHistoriesArgs,
    take: number,
  ) {
    const where = ParticipationStatusHistoryInputFormat.filter(filter);
    const orderBy = ParticipationStatusHistoryInputFormat.sort(sort ?? {});

    return await ParticipationStatusHistoryRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async recordParticipationHistory(
    ctx: IContext,
    tx: Prisma.TransactionClient,
    participationId: string,
    status: ParticipationStatus,
    createdById: string,
  ) {
    const data = ParticipationStatusHistoryInputFormat.create({
      participationId,
      status,
      createdById,
    });

    await ParticipationStatusHistoryRepository.create(ctx, data, tx);
  }
}

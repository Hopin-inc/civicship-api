import { IContext } from "@/types/server";
import { GqlQueryParticipationStatusHistoriesArgs } from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";
import ParticipationStatusHistoryRepository from "@/application/participationStatusHistory/data/repository";
import ParticipationStatusHistoryInputFormat from "@/application/participationStatusHistory/data/converter";

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

  static async findParticipationStatusHistory(ctx: IContext, id: string) {
    return await ParticipationStatusHistoryRepository.find(ctx, id);
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

import { GqlParticipationInviteInput, GqlQueryParticipationsArgs } from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";
import ParticipationInputFormat from "@/presentation/graphql/dto/opportunity/participation/input";
import ParticipationRepository from "@/infra/prisma/repositories/opportunity/participation";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { IContext } from "@/types/server";
import ParticipationUtils from "@/app/opportunity/participation/utils";
import { getCurrentUserId } from "@/utils";
import ParticipationStatusHistoryService from "@/app/opportunity/participation/statusHistory/service";

export default class ParticipationService {
  private static issuer = new PrismaClientIssuer();

  static async fetchParticipations(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryParticipationsArgs,
    take: number,
  ) {
    const where = ParticipationInputFormat.filter(filter ?? {});
    const orderBy = ParticipationInputFormat.sort(sort ?? {});

    return await ParticipationRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findParticipation(ctx: IContext, id: string) {
    return await ParticipationRepository.find(ctx, id);
  }

  static async findParticipationOrThrow(ctx: IContext, id: string) {
    const participation = await ParticipationRepository.find(ctx, id);
    if (!participation) {
      throw new Error(`ParticipationNotFound: ID=${id}`);
    }
    return participation;
  }

  static async applyParticipation(
    ctx: IContext,
    currentUserId: string,
    data: Prisma.ParticipationCreateInput,
    status: ParticipationStatus,
    tx: Prisma.TransactionClient,
  ) {
    const participation = await ParticipationRepository.create(
      ctx,
      {
        ...data,
        status,
      },
      tx,
    );

    await ParticipationStatusHistoryService.recordParticipationHistory(
      ctx,
      tx,
      participation.id,
      status,
      currentUserId,
    );

    return participation;
  }

  static async inviteParticipation(ctx: IContext, input: GqlParticipationInviteInput) {
    const userId = getCurrentUserId(ctx);

    return this.issuer.public(ctx, async (tx) => {
      const data: Prisma.ParticipationCreateInput = ParticipationInputFormat.invite(input);

      const participation = await ParticipationRepository.create(
        ctx,
        {
          ...data,
          status: ParticipationStatus.INVITED,
        },
        tx,
      );

      await ParticipationStatusHistoryService.recordParticipationHistory(
        ctx,
        tx,
        participation.id,
        ParticipationStatus.INVITED,
        userId,
      );

      return participation;
    });
  }

  static async cancelInvitation(ctx: IContext, id: string) {
    const currentUserId = getCurrentUserId(ctx);

    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      currentUserId,
      ParticipationStatus.CANCELED,
    );
  }

  static async denyInvitation(ctx: IContext, id: string) {
    const currentUserId = getCurrentUserId(ctx);

    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      currentUserId,
      ParticipationStatus.NOT_PARTICIPATING,
    );
  }

  static async cancelApplication(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);

    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      currentUserId,
      ParticipationStatus.CANCELED,
      tx,
    );
  }

  static async denyApplication(ctx: IContext, id: string, tx: Prisma.TransactionClient) {
    const currentUserId = getCurrentUserId(ctx);

    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      currentUserId,
      ParticipationStatus.NOT_PARTICIPATING,
      tx,
    );
  }

  static async denyPerformance(ctx: IContext, id: string) {
    const currentUserId = getCurrentUserId(ctx);

    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      currentUserId,
      ParticipationStatus.DENIED,
    );
  }
}

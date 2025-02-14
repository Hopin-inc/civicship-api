import { GqlParticipationInviteInput, GqlQueryParticipationsArgs } from "@/types/graphql";
import { ParticipationStatus, Prisma } from "@prisma/client";
import ParticipationInputFormat from "@/domains/opportunity/participation/presenter/input";
import ParticipationRepository from "@/domains/opportunity/participation/repository";
import { PrismaClientIssuer } from "@/prisma/client";
import { IContext } from "@/types/server";
import ParticipationUtils from "@/domains/opportunity/participation/utils";
import { getCurrentUserId } from "@/utils";
import ParticipationStatusHistoryService from "@/domains/opportunity/participationStatusHistory/service";

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
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.CANCELED);
  }

  static async denyInvitation(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      ParticipationStatus.NOT_PARTICIPATING,
    );
  }

  static async cancelApplication(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.CANCELED);
  }

  static async denyApplication(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(
      ctx,
      id,
      ParticipationStatus.NOT_PARTICIPATING,
    );
  }

  static async denyPerformance(ctx: IContext, id: string) {
    return ParticipationUtils.setParticipationStatus(ctx, id, ParticipationStatus.DENIED);
  }
}

import {
  GqlMutationParticipationBulkCreateArgs,
  GqlMutationParticipationCreatePersonalRecordArgs,
  GqlMutationParticipationDeletePersonalRecordArgs,
  GqlParticipationBulkCreatePayload,
  GqlParticipationCreatePersonalRecordPayload,
  GqlParticipationDeletePayload,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";

@injectable()
export default class ParticipationResolver {
  constructor(
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
  ) {}

  Query = {
    participations: (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) => {
      return this.participationUseCase.visitorBrowseParticipations(args, ctx);
    },

    participation: (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      return this.participationUseCase.visitorViewParticipation(args, ctx);
    },
  };

  Mutation = {
    participationBulkCreate: (
      _: unknown,
      args: GqlMutationParticipationBulkCreateArgs,
      ctx: IContext,
    ): Promise<GqlParticipationBulkCreatePayload> => {
      return this.participationUseCase.managerBulkCreateParticipations(args, ctx);
    },

    participationCreatePersonalRecord: (
      _: unknown,
      args: GqlMutationParticipationCreatePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationCreatePersonalRecordPayload> => {
      return this.participationUseCase.userCreatePersonalParticipationRecord(args, ctx);
    },

    participationDeletePersonalRecord: (
      _: unknown,
      args: GqlMutationParticipationDeletePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationDeletePayload> => {
      return this.participationUseCase.userDeletePersonalParticipationRecord(args, ctx);
    },
  };

  Participation = {
    user: (parent, _: unknown, ctx: IContext) => {
      return parent.userId ? ctx.loaders.user.load(parent.userId) : null;
    },

    community: (parent, _: unknown, ctx: IContext) => {
      return parent.communityId ? ctx.loaders.community.load(parent.communityId) : null;
    },

    reservation: (parent, _: unknown, ctx: IContext) => {
      return parent.reservationId ? ctx.loaders.reservation.load(parent.reservationId) : null;
    },

    evaluation: async (parent, _: unknown, ctx: IContext) => {
      // evaluationIdを参照せず、participationIdで直接Evaluationを検索
      const evaluation = await ctx.issuer.internal((tx) =>
        tx.evaluation.findUnique({
          where: { participationId: parent.id },
        }),
      );
      return evaluation;
    },

    images: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.imagesByParticipation.load(parent.id);
    },

    transactions: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.transactionsByParticipation.load(parent.id);
    },

    statusHistories: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.participationStatusHistoriesByParticipation.load(parent.id);
    },

    ticketStatusHistories: (parent, _: unknown, ctx: IContext) => {
      return ctx.loaders.ticketStatusHistoriesByParticipation.load(parent.id);
    },
  };
}

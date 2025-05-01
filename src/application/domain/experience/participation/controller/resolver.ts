import {
  GqlMutationParticipationCreatePersonalRecordArgs,
  GqlMutationParticipationDeletePersonalRecordArgs,
  GqlParticipation,
  GqlParticipationCreatePersonalRecordPayload,
  GqlParticipationDeletePayload,
  GqlParticipationStatusHistoriesArgs,
  GqlQueryParticipationArgs,
  GqlQueryParticipationsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/experience/participation/statusHistory/usecase";

@injectable()
export default class ParticipationResolver {
  constructor(
    @inject("ParticipationUseCase") private readonly participationUseCase: ParticipationUseCase,
    @inject("ParticipationStatusHistoryUseCase")
    private readonly statusHistoryUseCase: ParticipationStatusHistoryUseCase,
  ) {}

  Query = {
    participations: (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) => {
      return this.participationUseCase.visitorBrowseParticipations(args, ctx);
    },

    participation: (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      if (!ctx.loaders?.participation) {
        return this.participationUseCase.visitorViewParticipation(args, ctx);
      }
      return ctx.loaders.participation.load(args.id);
    },
  };

  Mutation = {
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
    statusHistories: (
      parent: GqlParticipation,
      args: GqlParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      return this.statusHistoryUseCase.visitorBrowseStatusHistoriesByParticipation(
        parent,
        args,
        ctx,
      );
    },
  };
}

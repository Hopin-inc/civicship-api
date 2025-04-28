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
import ParticipationUseCase from "@/application/domain/experience/participation/usecase";
import ParticipationStatusHistoryUseCase from "@/application/domain/experience/participation/statusHistory/usecase";
import { container } from "tsyringe";

const participationResolver = {
  Query: {
    participations: async (_: unknown, args: GqlQueryParticipationsArgs, ctx: IContext) => {
      const useCase = container.resolve(ParticipationUseCase);
      return useCase.visitorBrowseParticipations(args, ctx);
    },

    participation: async (_: unknown, args: GqlQueryParticipationArgs, ctx: IContext) => {
      if (!ctx.loaders?.participation) {
        const useCase = container.resolve(ParticipationUseCase);
        return useCase.visitorViewParticipation(args, ctx);
      }
      return await ctx.loaders.participation.load(args.id);
    },
  },
  Mutation: {
    participationCreatePersonalRecord: async (
      _: unknown,
      args: GqlMutationParticipationCreatePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationCreatePersonalRecordPayload> => {
      const useCase = container.resolve(ParticipationUseCase);
      return useCase.userCreatePersonalParticipationRecord(args, ctx);
    },

    participationDeletePersonalRecord: async (
      _: unknown,
      args: GqlMutationParticipationDeletePersonalRecordArgs,
      ctx: IContext,
    ): Promise<GqlParticipationDeletePayload> => {
      const useCase = container.resolve(ParticipationUseCase);
      return useCase.userDeletePersonalParticipationRecord(args, ctx);
    },
  },
  Participation: {
    statusHistories: async (
      parent: GqlParticipation,
      args: GqlParticipationStatusHistoriesArgs,
      ctx: IContext,
    ) => {
      const usecase = container.resolve(ParticipationStatusHistoryUseCase);
      return usecase.visitorBrowseStatusHistoriesByParticipation(parent, args, ctx);
    },
  },
};

export default participationResolver;

import {
  GqlMutationParticipationImageBulkUpdateArgs,
  GqlParticipationImageBulkUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ParticipationImageUseCase from "@/application/domain/participation/image/usecase";

const participationImageResolver = {
  Mutation: {
    participationImageBulkUpdate: async (
      _: unknown,
      args: GqlMutationParticipationImageBulkUpdateArgs,
      ctx: IContext,
    ): Promise<GqlParticipationImageBulkUpdatePayload> => {
      return ParticipationImageUseCase.userBulkUpdateParticipationImages(args, ctx);
    },
  },
};

export default participationImageResolver;

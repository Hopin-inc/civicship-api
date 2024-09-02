import {
  GqlQueryApplicationConfirmationsArgs,
  GqlMutationApplicationConfirmationCreateArgs,
  GqlQueryApplicationConfirmationArgs,
} from "@/types/graphql";
import ApplicationConfirmationUseCase from "@/usecase/applicationConfirmation.usecase";

const applicationConfirmationResolver = {
  Query: {
    applicationConfirmations: async (_: unknown, args: GqlQueryApplicationConfirmationsArgs) =>
      ApplicationConfirmationUseCase.userGetManyApplicationConfirmations(args),
    applicationConfirmation: async (_: unknown, args: GqlQueryApplicationConfirmationArgs) =>
      ApplicationConfirmationUseCase.userGetApplicationConfirmation(args),
  },
  Mutation: {
    applicationConfirmationCreate: async (
      _: unknown,
      args: GqlMutationApplicationConfirmationCreateArgs,
    ) => ApplicationConfirmationUseCase.userCreateApplicationConfirmation(args),
  },
};

export default applicationConfirmationResolver;

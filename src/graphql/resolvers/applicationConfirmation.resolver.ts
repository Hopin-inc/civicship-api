import ApplicationConfirmationService from "@/services/applicationConfirmation.service";
import {
  GqlQueryApplicationConfirmationsArgs,
  GqlMutationApplicationConfirmationCreateArgs,
  GqlQueryApplicationConfirmationArgs,
} from "@/types/graphql";

const applicationConfirmationResolver = {
  Query: {
    applicationConfirmations: async (
      _: unknown,
      args: GqlQueryApplicationConfirmationsArgs,
    ) => ApplicationConfirmationService.queryApplicationConfirmations(args),
    applicationConfirmation: async (
      _: unknown,
      args: GqlQueryApplicationConfirmationArgs,
    ) => ApplicationConfirmationService.getApplicationConfirmation(args),
  },
  Mutation: {
    applicationConfirmationCreate: async (
      _: unknown,
      args: GqlMutationApplicationConfirmationCreateArgs,
    ) => ApplicationConfirmationService.applicationConfirmationCreate(args),
  },
};

export default applicationConfirmationResolver;

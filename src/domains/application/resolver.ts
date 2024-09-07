import ApplicationUseCase from "@/domains/application/usecase";
import {
  GqlQueryApplicationsArgs,
  GqlMutationApplicationCreateArgs,
  GqlQueryApplicationArgs,
  GqlMutationApplicationDeleteArgs,
  GqlMutationApplicationPublishArgs,
  GqlMutationApplicationUnpublishArgs,
  GqlMutationApplicationUpdateCommentArgs,
  GqlMutationApplicationApprovalArgs,
  GqlMutationApplicationAddConfirmationArgs,
  GqlMutationApplicationRefusalArgs,
  GqlMutationApplicationUpdateConfirmationCommentArgs,
  GqlMutationApplicationDeleteConfirmationArgs,
} from "@/types/graphql";

const applicationResolver = {
  Query: {
    applications: async (_: unknown, args: GqlQueryApplicationsArgs) =>
      ApplicationUseCase.userGetManyPublicApplications(args),
    application: async (_: unknown, args: GqlQueryApplicationArgs) =>
      ApplicationUseCase.userGetApplication(args),
  },
  Mutation: {
    applicationCreate: async (_: unknown, args: GqlMutationApplicationCreateArgs) =>
      ApplicationUseCase.userCreateApplication(args),
    applicationDelete: async (_: unknown, args: GqlMutationApplicationDeleteArgs) =>
      ApplicationUseCase.userDeleteApplication(args),
    applicationUpdateComment: async (_: unknown, args: GqlMutationApplicationUpdateCommentArgs) =>
      ApplicationUseCase.userUpdateApplicationComment(args),
    applicationPublish: async (_: unknown, args: GqlMutationApplicationPublishArgs) =>
      ApplicationUseCase.userPublishApplication(args),
    applicationUnpublish: async (_: unknown, args: GqlMutationApplicationUnpublishArgs) =>
      ApplicationUseCase.userUnpublishApplication(args),
    applicationUpdateConfirmation: async (
      _: unknown,
      args: GqlMutationApplicationAddConfirmationArgs,
    ) => ApplicationUseCase.userUpdateApplicationConfirmation(args),
    applicationApprove: async (_: unknown, args: GqlMutationApplicationApprovalArgs) =>
      ApplicationUseCase.userApproveApplication(args),
    applicationRefuse: async (_: unknown, args: GqlMutationApplicationRefusalArgs) =>
      ApplicationUseCase.userRefuseApplication(args),
    applicationUpdateConfirmationComment: async (
      _: unknown,
      args: GqlMutationApplicationUpdateConfirmationCommentArgs,
    ) => ApplicationUseCase.userUpdateApplicationConfirmationComment(args),
    applicationDeleteConfirmation: async (
      _: unknown,
      args: GqlMutationApplicationDeleteConfirmationArgs,
    ) => ApplicationUseCase.userDeleteApplicationConfirmation(args),
  },
};

export default applicationResolver;

import ApplicationUseCase from "@/usecase/application.usecase";
import {
  GqlQueryApplicationsArgs,
  GqlMutationApplicationCreateArgs,
  GqlQueryApplicationArgs,
  GqlMutationApplicationDeleteArgs,
  GqlMutationApplicationUpdateCommentArgs,
  GqlMutationApplicationPublishArgs,
  GqlMutationApplicationUnpublishArgs,
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
  },
};

export default applicationResolver;

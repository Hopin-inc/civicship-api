import ApplicationService from "@/services/application.service";
import {
  GqlQueryApplicationsArgs,
  GqlMutationApplicationCreateArgs,
  GqlQueryApplicationArgs,
  GqlMutationApplicationDeleteArgs,
  GqlMutationApplicationUpdateArgs,
  GqlMutationApplicationPublishArgs,
  GqlMutationApplicationUnpublishArgs,
} from "@/types/graphql";

const applicationResolver = {
  Query: {
    applications: async (_: unknown, args: GqlQueryApplicationsArgs) =>
      ApplicationService.queryApplications(args),
    application: async (_: unknown, args: GqlQueryApplicationArgs) =>
      ApplicationService.getApplication(args),
  },
  Mutation: {
    applicationCreate: async (
      _: unknown,
      args: GqlMutationApplicationCreateArgs,
    ) => ApplicationService.applicationCreate(args),
    applicationDelete: async (
      _: unknown,
      args: GqlMutationApplicationDeleteArgs,
    ) => ApplicationService.applicationDelete(args),
    applicationUpdate: async (
      _: unknown,
      args: GqlMutationApplicationUpdateArgs,
    ) => ApplicationService.applicationUpdate(args),
    applicationPublish: async (
      _: unknown,
      args: GqlMutationApplicationPublishArgs,
    ) => ApplicationService.applicationPublish(args),
    applicationUnpublish: async (
      _: unknown,
      args: GqlMutationApplicationUnpublishArgs,
    ) => ApplicationService.applicationUnpublish(args),
  },
};

export default applicationResolver;

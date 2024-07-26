import OrganizationService from "@/services/organization.service";
import {
  GqlMutationCreateOrganizationArgs,
  GqlMutationDeleteOrganizationArgs,
  GqlMutationUpdateOrganizationArgs,
  GqlQueryOrganizationArgs,
  GqlQueryOrganizationsArgs,
} from "@/types/graphql";

const organizationResolver = {
  Query: {
    organizations: async (_: unknown, args: GqlQueryOrganizationsArgs) =>
      OrganizationService.queryOrganizations(args),
    organization: async (_: unknown, args: GqlQueryOrganizationArgs) =>
      OrganizationService.getOrganization(args),
  },
  Mutation: {
    createOrganization: async (
      _: unknown,
      args: GqlMutationCreateOrganizationArgs,
    ) => OrganizationService.createOrganization(args),
    updateOrganization: async (
      _: unknown,
      args: GqlMutationUpdateOrganizationArgs,
    ) => OrganizationService.updateOrganization(args),
    deleteOrganization: async (
      _: unknown,
      args: GqlMutationDeleteOrganizationArgs,
    ) => OrganizationService.deleteOrganization(args),
  },
};

export default organizationResolver;

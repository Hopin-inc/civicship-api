import OrganizationService from "@/services/organization.service";
import {
  GqlMutationCreateOrganizationArgs,
  GqlMutationDeleteOrganizationArgs,
  GqlMutationAddTargetInOrganizationArgs,
  GqlMutationUpdateOrganizationDefaultInfoArgs,
  GqlMutationUpdateOrganizationOverviewArgs,
  GqlMutationAddUserInOrganizationArgs,
  GqlMutationRemoveUserFromOrganizationArgs,
  GqlMutationRemoveTargetFromOrganizationArgs,
  GqlQueryOrganizationArgs,
  GqlQueryOrganizationsArgs,
  GqlMutationUpdateGroupOfOrganizationArgs,
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
    deleteOrganization: async (
      _: unknown,
      args: GqlMutationDeleteOrganizationArgs,
    ) => OrganizationService.deleteOrganization(args),
    updateOrganizationDefaultInfo: async (
      _: unknown,
      args: GqlMutationUpdateOrganizationDefaultInfoArgs,
    ) => OrganizationService.updateOrganizationDefaultInfo(args),
    updateOrganizationOverview: async (
      _: unknown,
      args: GqlMutationUpdateOrganizationOverviewArgs,
    ) => OrganizationService.updateOrganizationOverview(args),
    addUserInOrganization: async (
      _: unknown,
      args: GqlMutationAddUserInOrganizationArgs,
    ) => OrganizationService.addUserInOrganization(args),
    removeUserFromOrganization: async (
      _: unknown,
      args: GqlMutationRemoveUserFromOrganizationArgs,
    ) => OrganizationService.removeUserFromOrganization(args),
    addTargetInOrganization: async (
      _: unknown,
      args: GqlMutationAddTargetInOrganizationArgs,
    ) => OrganizationService.addTargetInOrganization(args),
    removeTargetFromOrganization: async (
      _: unknown,
      args: GqlMutationRemoveTargetFromOrganizationArgs,
    ) => OrganizationService.removeTargetFromOrganization(args),
    updateOrganizationOfGroup: async (
      _: unknown,
      args: GqlMutationUpdateGroupOfOrganizationArgs,
    ) => OrganizationService.updateOrganizationOfGroup(args),
  },
};

export default organizationResolver;

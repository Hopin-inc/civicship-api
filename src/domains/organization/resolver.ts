import OrganizationService from "@/domains/organization/service";
import {
  GqlMutationOrganizationCreateArgs,
  GqlMutationOrganizationDeleteArgs,
  GqlMutationOrganizationAddTargetArgs,
  GqlMutationOrganizationUpdateDefaultArgs,
  GqlMutationOrganizationPublishArgs,
  GqlMutationOrganizationUnpublishArgs,
  GqlMutationOrganizationAddUserArgs,
  GqlMutationOrganizationRemoveUserArgs,
  GqlMutationOrganizationRemoveTargetArgs,
  GqlMutationOrganizationAddGroupArgs,
  GqlMutationOrganizationRemoveGroupArgs,
  GqlQueryOrganizationArgs,
  GqlQueryOrganizationsArgs,
  GqlMutationOrganizationUpdateContentArgs,
} from "@/types/graphql";

const organizationResolver = {
  Query: {
    organizations: async (_: unknown, args: GqlQueryOrganizationsArgs) =>
      OrganizationService.queryOrganizations(args),
    organization: async (_: unknown, args: GqlQueryOrganizationArgs) =>
      OrganizationService.getOrganization(args),
  },
  Mutation: {
    organizationCreate: async (_: unknown, args: GqlMutationOrganizationCreateArgs) =>
      OrganizationService.organizationCreate(args),
    organizationDelete: async (_: unknown, args: GqlMutationOrganizationDeleteArgs) =>
      OrganizationService.organizationDelete(args),
    organizationUpdateDefault: async (_: unknown, args: GqlMutationOrganizationUpdateDefaultArgs) =>
      OrganizationService.organizationUpdateDefault(args),
    organizationUpdateContent: async (_: unknown, args: GqlMutationOrganizationUpdateContentArgs) =>
      OrganizationService.organizationUpdateContent(args),
    organizationPublish: async (_: unknown, args: GqlMutationOrganizationPublishArgs) =>
      OrganizationService.organizationPublish(args),
    organizationUnpublish: async (_: unknown, args: GqlMutationOrganizationUnpublishArgs) =>
      OrganizationService.organizationUnpublish(args),
    organizationAddUser: async (_: unknown, args: GqlMutationOrganizationAddUserArgs) =>
      OrganizationService.organizationAddUser(args),
    organizationRemoveUser: async (_: unknown, args: GqlMutationOrganizationRemoveUserArgs) =>
      OrganizationService.organizationRemoveUser(args),
    organizationAddTarget: async (_: unknown, args: GqlMutationOrganizationAddTargetArgs) =>
      OrganizationService.organizationAddTarget(args),
    organizationRemoveTarget: async (_: unknown, args: GqlMutationOrganizationRemoveTargetArgs) =>
      OrganizationService.organizationRemoveTarget(args),
    organizationAddGroup: async (_: unknown, args: GqlMutationOrganizationAddGroupArgs) =>
      OrganizationService.organizationAddGroup(args),
    organizationRemoveGroup: async (_: unknown, args: GqlMutationOrganizationRemoveGroupArgs) =>
      OrganizationService.organizationRemoveGroup(args),
  },
};

export default organizationResolver;

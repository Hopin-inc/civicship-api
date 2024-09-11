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
import OrganizationUseCase from "@/domains/organization/usecase";

const organizationResolver = {
  Query: {
    organizations: async (_: unknown, args: GqlQueryOrganizationsArgs) =>
      OrganizationUseCase.userGetManyOrganizations(args),
    organization: async (_: unknown, args: GqlQueryOrganizationArgs) =>
      OrganizationUseCase.userGetOrganization(args),
  },
  Mutation: {
    organizationCreate: async (_: unknown, args: GqlMutationOrganizationCreateArgs) =>
      OrganizationUseCase.userCreateOrganization(args),
    organizationDelete: async (_: unknown, args: GqlMutationOrganizationDeleteArgs) =>
      OrganizationUseCase.userDeleteOrganization(args),
    organizationUpdateDefault: async (_: unknown, args: GqlMutationOrganizationUpdateDefaultArgs) =>
      OrganizationUseCase.userUpdateDefaultInfoOfOrganization(args),
    organizationUpdateContent: async (_: unknown, args: GqlMutationOrganizationUpdateContentArgs) =>
      OrganizationUseCase.userUpdateContentOfOrganization(args),
    organizationPublish: async (_: unknown, args: GqlMutationOrganizationPublishArgs) =>
      OrganizationUseCase.userPublishOrganization(args),
    organizationUnpublish: async (_: unknown, args: GqlMutationOrganizationUnpublishArgs) =>
      OrganizationUseCase.userUnpublishOrganization(args),
    organizationAddUser: async (_: unknown, args: GqlMutationOrganizationAddUserArgs) =>
      OrganizationUseCase.userAddUserToOrganization(args),
    organizationRemoveUser: async (_: unknown, args: GqlMutationOrganizationRemoveUserArgs) =>
      OrganizationUseCase.userRemoveUserFromOrganization(args),
    organizationAddTarget: async (_: unknown, args: GqlMutationOrganizationAddTargetArgs) =>
      OrganizationUseCase.userAddTargetToOrganization(args),
    organizationRemoveTarget: async (_: unknown, args: GqlMutationOrganizationRemoveTargetArgs) =>
      OrganizationUseCase.userRemoveTargetFromOrganization(args),
    organizationAddGroup: async (_: unknown, args: GqlMutationOrganizationAddGroupArgs) =>
      OrganizationUseCase.userAddGroupToOrganization(args),
    organizationRemoveGroup: async (_: unknown, args: GqlMutationOrganizationRemoveGroupArgs) =>
      OrganizationUseCase.userRemoveGroupFromOrganization(args),
  },
};

export default organizationResolver;

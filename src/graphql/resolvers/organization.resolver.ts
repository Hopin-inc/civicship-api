import OrganizationService from "@/services/organization.service";
import {
  GqlMutationCreateOrganizationArgs,
} from "@/types/graphql";

const organizationResolver = {
  Query: {},
  Mutation: {
    createOrganization: async (_: unknown, args: GqlMutationCreateOrganizationArgs) => OrganizationService.createOrganization(args)
  }
};

export default organizationResolver;

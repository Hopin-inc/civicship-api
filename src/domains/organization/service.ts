import {
  GqlQueryOrganizationsArgs,
  GqlQueryOrganizationArgs,
  GqlMutationOrganizationCreateArgs,
  GqlMutationOrganizationDeleteArgs,
  GqlMutationOrganizationUpdateContentArgs,
  GqlMutationOrganizationAddUserArgs,
  GqlMutationOrganizationRemoveUserArgs,
  GqlMutationOrganizationAddTargetArgs,
  GqlMutationOrganizationRemoveTargetArgs,
  GqlMutationOrganizationAddGroupArgs,
  GqlMutationOrganizationRemoveGroupArgs,
  GqlMutationOrganizationPublishArgs,
  GqlMutationOrganizationUnpublishArgs,
  GqlMutationOrganizationUpdateDefaultArgs,
} from "@/types/graphql";
import OrganizationInputFormat from "@/domains/organization/presenter/input";
import OrganizationRepository from "@/domains/organization/repository";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts/prisma";
import { OrganizationUpdateContentPayloadWithArgs } from "@/domains/organization/type";

export default class OrganizationService {
  static async fetchOrganizations(
    { cursor, filter, sort }: GqlQueryOrganizationsArgs,
    take: number,
  ) {
    const where = OrganizationInputFormat.filter({ filter });
    const orderBy = OrganizationInputFormat.sort({ sort });

    return await OrganizationRepository.query(where, orderBy, take, cursor);
  }

  static async getOrganization({ id }: GqlQueryOrganizationArgs) {
    return OrganizationRepository.find(id);
  }

  static async checkIfOrganizationExists(id: string) {
    const organization = await OrganizationRepository.checkExists(id);
    if (!organization) {
      throw new Error(`Group with ID ${id} not found`);
    }
    return organization;
  }

  static async findOrganizationForUpdateContent(id: string) {
    const organization = await OrganizationRepository.findForUpdateContent(id);
    if (!organization) {
      throw new Error(`Group with ID ${id} not found`);
    }
    return organization;
  }

  static async organizationCreate({ input }: GqlMutationOrganizationCreateArgs) {
    const data: Prisma.OrganizationCreateInput = OrganizationInputFormat.create(input);
    return await OrganizationRepository.create(data);
  }

  static async organizationDelete({ id }: GqlMutationOrganizationDeleteArgs) {
    return await OrganizationRepository.delete(id);
  }

  static async organizationUpdateContent(
    { id, input }: GqlMutationOrganizationUpdateContentArgs,
    existingOrganization: OrganizationUpdateContentPayloadWithArgs,
  ) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateContent(
      existingOrganization,
      input,
    );
    return await OrganizationRepository.updateContent(id, data);
  }

  static async organizationAddUser({ id, input }: GqlMutationOrganizationAddUserArgs) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateUser(
      id,
      input.userId,
      RELATION_ACTION.CONNECT_OR_CREATE,
    );
    return await OrganizationRepository.updateRelation(id, data);
  }

  static async organizationRemoveUser({ id, input }: GqlMutationOrganizationRemoveUserArgs) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateUser(
      id,
      input.userId,
      RELATION_ACTION.DELETE,
    );
    return await OrganizationRepository.updateRelation(id, data);
  }

  static async organizationAddTarget({ id, input }: GqlMutationOrganizationAddTargetArgs) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateTarget(
      input.targetId,
      RELATION_ACTION.CONNECT,
    );
    return await OrganizationRepository.updateRelation(id, data);
  }

  static async organizationRemoveTarget({ id, input }: GqlMutationOrganizationRemoveTargetArgs) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateTarget(
      input.targetId,
      RELATION_ACTION.DISCONNECT,
    );
    return await OrganizationRepository.updateRelation(id, data);
  }

  static async organizationAddGroup({ id, input }: GqlMutationOrganizationAddGroupArgs) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateGroup(
      input.groupId,
      RELATION_ACTION.CONNECT,
    );
    return await OrganizationRepository.updateRelation(id, data);
  }

  static async organizationRemoveGroup({ id, input }: GqlMutationOrganizationRemoveGroupArgs) {
    const data: Prisma.OrganizationUpdateInput = OrganizationInputFormat.updateGroup(
      input.groupId,
      RELATION_ACTION.DISCONNECT,
    );
    return await OrganizationRepository.updateRelation(id, data);
  }

  static async organizationPublish({ id }: GqlMutationOrganizationPublishArgs) {
    return await OrganizationRepository.switchPrivacy(id, true);
  }

  static async organizationUnpublish({ id }: GqlMutationOrganizationUnpublishArgs) {
    return await OrganizationRepository.switchPrivacy(id, false);
  }

  static async organizationUpdateDefaultInfo({
    id,
    input,
  }: GqlMutationOrganizationUpdateDefaultArgs) {
    return await OrganizationRepository.updateDefaultInfo(id, input);
  }
}

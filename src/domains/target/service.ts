import {
  GqlQueryTargetsArgs,
  GqlQueryTargetArgs,
  GqlMutationTargetCreateArgs,
  GqlMutationTargetDeleteArgs,
  GqlMutationTargetUpdateContentArgs,
  GqlMutationTargetAddGroupArgs,
  GqlMutationTargetRemoveGroupArgs,
  GqlMutationTargetAddOrganizationArgs,
  GqlMutationTargetRemoveOrganizationArgs,
  GqlMutationTargetUpdateIndexArgs,
} from "@/types/graphql";
import TargetInputFormat from "@/domains/target/presenter/input";
import TargetRepository from "@/domains/target/repository";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts";

export default class TargetService {
  static async fetchTargets({ cursor, filter, sort }: GqlQueryTargetsArgs, take: number) {
    const where = TargetInputFormat.filter({ filter });
    const orderBy = TargetInputFormat.sort({ sort });

    return await TargetRepository.query(where, orderBy, take, cursor);
  }

  static async getTarget({ id }: GqlQueryTargetArgs) {
    return TargetRepository.find(id);
  }

  static async checkIfTargetExists(id: string) {
    const target = await TargetRepository.checkExists(id);
    if (!target) {
      throw new Error(`Target with ID ${id} not found`);
    }
    return target;
  }

  static async findTargetForUpdateContent(id: string) {
    const target = await TargetRepository.findForUpdateContent(id);
    if (!target) {
      throw new Error(`Target with ID ${id} not found`);
    }
    return target;
  }

  static async targetCreate({ input }: GqlMutationTargetCreateArgs) {
    const data: Prisma.TargetCreateInput = TargetInputFormat.create(input);
    return await TargetRepository.create(data);
  }

  static async targetDelete({ id }: GqlMutationTargetDeleteArgs) {
    return await TargetRepository.delete(id);
  }

  static async targetUpdateContent({ id, input }: GqlMutationTargetUpdateContentArgs) {
    return await TargetRepository.updateContent(id, input);
  }

  static async targetAddGroup({ id, input }: GqlMutationTargetAddGroupArgs) {
    const data: Prisma.TargetUpdateInput = TargetInputFormat.updateGroup(
      input.groupId,
      RELATION_ACTION.CONNECT,
    );
    return await TargetRepository.updateRelation(id, data);
  }

  static async targetRemoveGroup({ id, input }: GqlMutationTargetRemoveGroupArgs) {
    const data: Prisma.TargetUpdateInput = TargetInputFormat.updateGroup(
      input.groupId,
      RELATION_ACTION.DISCONNECT,
    );
    return await TargetRepository.updateRelation(id, data);
  }

  static async targetAddOrganization({ id, input }: GqlMutationTargetAddOrganizationArgs) {
    const data: Prisma.TargetUpdateInput = TargetInputFormat.updateOrganization(
      input.organizationId,
      RELATION_ACTION.CONNECT,
    );
    return await TargetRepository.updateRelation(id, data);
  }

  static async targetRemoveOrganization({ id, input }: GqlMutationTargetRemoveOrganizationArgs) {
    const data: Prisma.TargetUpdateInput = TargetInputFormat.updateOrganization(
      input.organizationId,
      RELATION_ACTION.DISCONNECT,
    );
    return await TargetRepository.updateRelation(id, data);
  }

  static async targetUpdateIndex({ id, input }: GqlMutationTargetUpdateIndexArgs) {
    const data: Prisma.TargetUpdateInput = TargetInputFormat.updateIndex(
      input.indexId,
      RELATION_ACTION.CONNECT,
    );
    return await TargetRepository.updateRelation(id, data);
  }
}

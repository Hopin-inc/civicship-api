import {
  GqlMutationGroupAddChildArgs,
  GqlMutationGroupAddEventArgs,
  GqlMutationGroupAddParentArgs,
  GqlMutationGroupAddTargetArgs,
  GqlMutationGroupAddUserArgs,
  GqlMutationGroupChangeOrganizationArgs,
  GqlMutationGroupCreateArgs,
  GqlMutationGroupRemoveChildArgs,
  GqlMutationGroupRemoveEventArgs,
  GqlMutationGroupRemoveParentArgs,
  GqlMutationGroupRemoveTargetArgs,
  GqlMutationGroupRemoveUserArgs,
  GqlMutationGroupUpdateContentArgs,
  GqlQueryGroupsArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import GroupRepository from "@/domains/group/repository";
import GroupInputFormat from "@/domains/group/presenter/input";
import { RELATION_ACTION } from "@/consts";
import { GroupUpdateContentPayloadWithArgs } from "@/domains/group/type";

export default class GroupService {
  static async fetchGroups({ cursor, filter, sort }: GqlQueryGroupsArgs, take: number) {
    const where: Prisma.GroupWhereInput = GroupInputFormat.filter({ filter });
    const orderBy: Prisma.GroupOrderByWithRelationInput[] = GroupInputFormat.sort({ sort });

    return GroupRepository.query(where, orderBy, take, cursor);
  }

  static async findGroup(id: string) {
    return await GroupRepository.find(id);
  }

  static async checkIfGroupExists(id: string) {
    const group = await GroupRepository.checkExists(id);
    if (!group) {
      throw new Error(`Group with ID ${id} not found`);
    }
    return group;
  }

  static async checkIfGroupExistsForUpdateContent(id: string) {
    const existingGroup = await GroupRepository.findForUpdateContent(id);
    if (!existingGroup) {
      throw new Error(`Group with ID ${id} not found`);
    }
    return existingGroup;
  }

  static async createGroup({ input }: GqlMutationGroupCreateArgs) {
    const data: Prisma.GroupCreateInput = GroupInputFormat.create({ input });
    return await GroupRepository.create(data);
  }

  static async deleteGroup(id: string) {
    return await GroupRepository.delete(id);
  }

  static async updateContent(
    { id, input }: GqlMutationGroupUpdateContentArgs,
    exitingGroup: GroupUpdateContentPayloadWithArgs,
  ) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateContent(exitingGroup, input);
    return GroupRepository.updateContent(id, data);
  }

  static async changeOrganization({ id, input }: GqlMutationGroupChangeOrganizationArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.changeOrganization(input);
    return GroupRepository.updateRelation(id, data);
  }

  static async addUser({ id, input }: GqlMutationGroupAddUserArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateUser(
      id,
      input.userId,
      RELATION_ACTION.CONNECTORCREATE,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async removeUser({ id, input }: GqlMutationGroupRemoveUserArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateUser(
      id,
      input.userId,
      RELATION_ACTION.DELETE,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async addEvent({ id, input }: GqlMutationGroupAddEventArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateEvent(
      id,
      input.eventId,
      RELATION_ACTION.CONNECTORCREATE,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async removeEvent({ id, input }: GqlMutationGroupRemoveEventArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateEvent(
      id,
      input.eventId,
      RELATION_ACTION.DELETE,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async addTarget({ id, input }: GqlMutationGroupAddTargetArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateTarget(
      id,
      input.targetId,
      RELATION_ACTION.CONNECT,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async removeTarget({ id, input }: GqlMutationGroupRemoveTargetArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateTarget(
      id,
      input.targetId,
      RELATION_ACTION.DISCONNECT,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async addParent({ id, input }: GqlMutationGroupAddParentArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateParent(
      id,
      input.parentId,
      RELATION_ACTION.CONNECT,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async removeParent({ id, input }: GqlMutationGroupRemoveParentArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateParent(
      id,
      input.parentId,
      RELATION_ACTION.DISCONNECT,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async addChild({ id, input }: GqlMutationGroupAddChildArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateChild(
      id,
      input.childId,
      RELATION_ACTION.CONNECT,
    );
    return await GroupRepository.updateRelation(id, data);
  }

  static async removeChild({ id, input }: GqlMutationGroupRemoveChildArgs) {
    const data: Prisma.GroupUpdateInput = GroupInputFormat.updateChild(
      id,
      input.childId,
      RELATION_ACTION.DISCONNECT,
    );
    return await GroupRepository.updateRelation(id, data);
  }
}

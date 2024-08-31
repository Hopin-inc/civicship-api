import {
  GqlGroup,
  GqlGroupChangeOrganizationPayload,
  GqlGroupsConnection,
  GqlGroupUpdateChildPayload,
  GqlGroupUpdateContentPayload,
  GqlGroupUpdateEventPayload,
  GqlGroupUpdateParentPayload,
  GqlGroupUpdateTargetPayload,
  GqlGroupUpdateUserPayload,
  GqlMutationGroupAddChildArgs,
  GqlMutationGroupAddEventArgs,
  GqlMutationGroupAddParentArgs,
  GqlMutationGroupAddTargetArgs,
  GqlMutationGroupAddUserArgs,
  GqlMutationGroupChangeOrganizationArgs,
  GqlMutationGroupCreateArgs,
  GqlMutationGroupDeleteArgs,
  GqlMutationGroupRemoveChildArgs,
  GqlMutationGroupRemoveEventArgs,
  GqlMutationGroupRemoveParentArgs,
  GqlMutationGroupRemoveUserArgs,
  GqlMutationGroupUpdateContentArgs,
  GqlQueryGroupArgs,
  GqlQueryGroupsArgs,
} from "@/types/graphql";
import GroupService from "@/services/group.service";
import GroupResponseFormat from "@/presenter/group/response";
import EventService from "@/services/event.service";
import UserService from "@/services/user.service";
import TargetService from "@/services/target.service";
import OrganizationService from "@/services/organization.service";

export default class GroupUseCase {
  static async userGetManyGroups({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryGroupsArgs): Promise<GqlGroupsConnection> {
    const take = first ?? 10;
    const data = await GroupService.fetchGroups({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const groups: GqlGroup[] = data.slice(0, take).map((record) => {
      return GroupResponseFormat.get(record);
    });
    return GroupResponseFormat.queryPublic(groups, hasNextPage);
  }

  static async userGetGroup({ id }: GqlQueryGroupArgs): Promise<GqlGroup | null> {
    const group = await GroupService.findGroup(id);
    if (!group) {
      return null;
    }
    return GroupResponseFormat.get(group);
  }

  static async userCreateGroup({ input }: GqlMutationGroupCreateArgs) {
    const group = await GroupService.createGroup({ input });
    return GroupResponseFormat.create(group);
  }

  static async userDeleteGroup({ id }: GqlMutationGroupDeleteArgs) {
    await GroupService.deleteGroup(id);
    return GroupResponseFormat.delete(id);
  }

  static async userUpdateGroupContent({
    id,
    input,
  }: GqlMutationGroupUpdateContentArgs): Promise<GqlGroupUpdateContentPayload> {
    const existingGroup = await GroupService.checkIfGroupExistsForUpdateContent(id);

    const group = await GroupService.updateContent({ id, input }, existingGroup);
    return GroupResponseFormat.updateContent(group);
  }

  static async userChangeOrganizationOfGroup({
    id,
    input,
  }: GqlMutationGroupChangeOrganizationArgs): Promise<GqlGroupChangeOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const group = await GroupService.changeOrganization({ id, input });
    return GroupResponseFormat.changeOrganization(group, organization);
  }

  static async userAddUserToGroup({
    id,
    input,
  }: GqlMutationGroupAddUserArgs): Promise<GqlGroupUpdateUserPayload> {
    const user = await UserService.checkIfUserExists(input.userId);

    const group = await GroupService.addUser({ id, input });
    return GroupResponseFormat.updateUser(group, user);
  }

  static async userRemoveUserFromGroup({
    id,
    input,
  }: GqlMutationGroupRemoveUserArgs): Promise<GqlGroupUpdateUserPayload> {
    const user = await UserService.checkIfUserExists(input.userId);

    const group = await GroupService.removeUser({ id, input });
    return GroupResponseFormat.updateUser(group, user);
  }

  static async userAddEventToGroup({
    id,
    input,
  }: GqlMutationGroupAddEventArgs): Promise<GqlGroupUpdateEventPayload> {
    const event = await EventService.checkIfEventExistsRelation(input.eventId);

    const group = await GroupService.addEvent({ id, input });
    return GroupResponseFormat.updateEvent(group, event);
  }

  static async userRemoveEventFromGroup({
    id,
    input,
  }: GqlMutationGroupRemoveEventArgs): Promise<GqlGroupUpdateEventPayload> {
    const event = await EventService.checkIfEventExistsRelation(input.eventId);

    const group = await GroupService.removeEvent({ id, input });
    return GroupResponseFormat.updateEvent(group, event);
  }

  static async userAddTargetToGroup({
    id,
    input,
  }: GqlMutationGroupAddTargetArgs): Promise<GqlGroupUpdateTargetPayload> {
    const target = await TargetService.checkIfTargetExists(input.targetId);

    const group = await GroupService.addTarget({ id, input });
    return GroupResponseFormat.updateTarget(group, target);
  }

  static async userRemoveTargetFromGroup({
    id,
    input,
  }: GqlMutationGroupAddTargetArgs): Promise<GqlGroupUpdateTargetPayload> {
    const target = await TargetService.checkIfTargetExists(input.targetId);

    const group = await GroupService.removeTarget({ id, input });
    return GroupResponseFormat.updateTarget(group, target);
  }

  static async userAddParentToGroup({
    id,
    input,
  }: GqlMutationGroupAddParentArgs): Promise<GqlGroupUpdateParentPayload> {
    const parent = await GroupService.checkIfGroupExists(input.parentId);

    const group = await GroupService.addParent({ id, input });
    return GroupResponseFormat.updateParent(group, parent);
  }

  static async userRemoveParentFromGroup({
    id,
    input,
  }: GqlMutationGroupRemoveParentArgs): Promise<GqlGroupUpdateParentPayload> {
    const parent = await GroupService.checkIfGroupExists(input.parentId);

    const group = await GroupService.removeParent({ id, input });
    return GroupResponseFormat.updateParent(group, parent);
  }

  static async userAddChildToGroup({
    id,
    input,
  }: GqlMutationGroupAddChildArgs): Promise<GqlGroupUpdateChildPayload> {
    const child = await GroupService.checkIfGroupExists(input.childId);

    const group = await GroupService.addChild({ id, input });
    return GroupResponseFormat.updateChild(group, child);
  }

  static async userRemoveChildFromGroup({
    id,
    input,
  }: GqlMutationGroupRemoveChildArgs): Promise<GqlGroupUpdateChildPayload> {
    const child = await GroupService.checkIfGroupExists(input.childId);

    const group = await GroupService.removeChild({ id, input });
    return GroupResponseFormat.updateChild(group, child);
  }
}

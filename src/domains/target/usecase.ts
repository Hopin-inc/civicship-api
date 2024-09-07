import {
  GqlTarget,
  GqlTargetsConnection,
  GqlTargetCreatePayload,
  GqlTargetDeletePayload,
  GqlTargetUpdateContentPayload,
  GqlMutationTargetAddGroupArgs,
  GqlMutationTargetAddOrganizationArgs,
  GqlMutationTargetCreateArgs,
  GqlMutationTargetDeleteArgs,
  GqlMutationTargetRemoveGroupArgs,
  GqlMutationTargetRemoveOrganizationArgs,
  GqlMutationTargetUpdateIndexArgs,
  GqlMutationTargetUpdateContentArgs,
  GqlQueryTargetArgs,
  GqlQueryTargetsArgs,
  GqlTargetUpdateIndexPayload,
  GqlTargetUpdateGroupPayload,
  GqlTargetUpdateOrganizationPayload,
} from "@/types/graphql";
import TargetService from "@/domains/target/service";
import GroupService from "@/domains/group/service";
import OrganizationService from "@/domains/organization/service";
import TargetResponseFormat from "@/domains/target/presenter/response";
import MasterService from "@/domains/master/service";

export default class TargetUseCase {
  static async userGetManyTargets({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryTargetsArgs): Promise<GqlTargetsConnection> {
    const take = first ?? 10;
    const data = await TargetService.fetchTargets({ cursor, filter, sort }, take);
    const hasNextPage = data.length > take;

    const targets: GqlTarget[] = data.slice(0, take).map((record) => {
      return TargetResponseFormat.get(record);
    });

    return TargetResponseFormat.query(targets, hasNextPage);
  }

  static async userGetTarget({ id }: GqlQueryTargetArgs): Promise<GqlTarget | null> {
    const target = await TargetService.getTarget({ id });
    if (!target) {
      return null;
    }
    return TargetResponseFormat.get(target);
  }

  static async userCreateTarget({
    input,
  }: GqlMutationTargetCreateArgs): Promise<GqlTargetCreatePayload> {
    const target = await TargetService.targetCreate({ input });
    return TargetResponseFormat.create(target);
  }

  static async userDeleteTarget({
    id,
  }: GqlMutationTargetDeleteArgs): Promise<GqlTargetDeletePayload> {
    await TargetService.targetDelete({ id });
    return TargetResponseFormat.delete(id);
  }

  static async userUpdateContentOfTarget({
    id,
    input,
  }: GqlMutationTargetUpdateContentArgs): Promise<GqlTargetUpdateContentPayload> {
    const target = await TargetService.targetUpdateContent({ id, input });
    return TargetResponseFormat.updateContent(target);
  }

  static async userUpdateIndexOfTarget({
    id,
    input,
  }: GqlMutationTargetUpdateIndexArgs): Promise<GqlTargetUpdateIndexPayload> {
    const index = await MasterService.checkIfIndexExists(input.indexId);

    const target = await TargetService.targetUpdateIndex({ id, input });
    return TargetResponseFormat.updateIndex(target, index);
  }

  static async userAddGroupToTarget({
    id,
    input,
  }: GqlMutationTargetAddGroupArgs): Promise<GqlTargetUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);

    const target = await TargetService.targetAddGroup({ id, input });
    return TargetResponseFormat.updateGroup(target, group);
  }

  static async userRemoveGroupFromTarget({
    id,
    input,
  }: GqlMutationTargetRemoveGroupArgs): Promise<GqlTargetUpdateGroupPayload> {
    const group = await GroupService.checkIfGroupExists(input.groupId);

    const target = await TargetService.targetRemoveGroup({ id, input });
    return TargetResponseFormat.updateGroup(target, group);
  }

  static async userAddOrganizationToTarget({
    id,
    input,
  }: GqlMutationTargetAddOrganizationArgs): Promise<GqlTargetUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const target = await TargetService.targetAddOrganization({ id, input });
    return TargetResponseFormat.updateOrganization(target, organization);
  }

  static async userRemoveOrganizationFromTarget({
    id,
    input,
  }: GqlMutationTargetRemoveOrganizationArgs): Promise<GqlTargetUpdateOrganizationPayload> {
    const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);

    const target = await TargetService.targetRemoveOrganization({ id, input });
    return TargetResponseFormat.updateOrganization(target, organization);
  }
}

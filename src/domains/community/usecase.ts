// import {
//   GqlOrganization,
//   GqlOrganizationsConnection,
//   GqlOrganizationCreatePayload,
//   GqlOrganizationDeletePayload,
//   GqlOrganizationUpdateContentPayload,
//   GqlMutationOrganizationAddTargetArgs,
//   GqlMutationOrganizationAddUserArgs,
//   GqlMutationOrganizationCreateArgs,
//   GqlMutationOrganizationDeleteArgs,
//   GqlMutationOrganizationRemoveTargetArgs,
//   GqlMutationOrganizationRemoveUserArgs,
//   GqlMutationOrganizationAddGroupArgs,
//   GqlMutationOrganizationRemoveGroupArgs,
//   GqlMutationOrganizationUpdateDefaultArgs,
//   GqlMutationOrganizationPublishArgs,
//   GqlMutationOrganizationUnpublishArgs,
//   GqlMutationOrganizationUpdateContentArgs,
//   GqlQueryOrganizationArgs,
//   GqlQueryOrganizationsArgs,
//   GqlOrganizationUpdateDefaultPayload,
//   GqlOrganizationSwitchPrivacyPayload,
//   GqlOrganizationUpdateGroupPayload,
//   GqlOrganizationUpdateTargetPayload,
//   GqlOrganizationUpdateUserPayload,
// } from "@/types/graphql";
// import OrganizationService from "@/domains/organization/service";
// import OrganizationResponseFormat from "@/domains/organization/presenter/response";
// import UserService from "@/domains/user/service";
// import TargetService from "@/domains/target/service";
// import GroupService from "@/domains/group/service";
//
// export default class OrganizationUseCase {
//   static async userGetManyOrganizations({
//     cursor,
//     filter,
//     sort,
//     first,
//   }: GqlQueryOrganizationsArgs): Promise<GqlOrganizationsConnection> {
//     const take = first ?? 10;
//     const data = await OrganizationService.fetchOrganizations({ cursor, filter, sort }, take);
//     const hasNextPage = data.length > take;
//
//     const organizations: GqlOrganization[] = data.slice(0, take).map((record) => {
//       return OrganizationResponseFormat.get(record);
//     });
//
//     return OrganizationResponseFormat.query(organizations, hasNextPage);
//   }
//
//   static async userGetOrganization({
//     id,
//   }: GqlQueryOrganizationArgs): Promise<GqlOrganization | null> {
//     const organization = await OrganizationService.getOrganization({ id });
//     if (!organization) {
//       return null;
//     }
//     return OrganizationResponseFormat.get(organization);
//   }
//
//   static async userCreateOrganization({
//     input,
//   }: GqlMutationOrganizationCreateArgs): Promise<GqlOrganizationCreatePayload> {
//     const organization = await OrganizationService.organizationCreate({ input });
//     return OrganizationResponseFormat.create(organization);
//   }
//
//   static async userDeleteOrganization({
//     id,
//   }: GqlMutationOrganizationDeleteArgs): Promise<GqlOrganizationDeletePayload> {
//     await OrganizationService.organizationDelete({ id });
//     return OrganizationResponseFormat.delete(id);
//   }
//
//   static async userUpdateDefaultInfoOfOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationUpdateDefaultArgs): Promise<GqlOrganizationUpdateDefaultPayload> {
//     const organization = await OrganizationService.organizationUpdateDefaultInfo({ id, input });
//     return OrganizationResponseFormat.updateDefaultInfo(organization);
//   }
//
//   static async userUpdateContentOfOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationUpdateContentArgs): Promise<GqlOrganizationUpdateContentPayload> {
//     const existingOrganization = await OrganizationService.findOrganizationForUpdateContent(id);
//
//     const organization = await OrganizationService.organizationUpdateContent(
//       { id, input },
//       existingOrganization,
//     );
//     return OrganizationResponseFormat.updateContent(organization);
//   }
//
//   static async userAddUserToOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationAddUserArgs): Promise<GqlOrganizationUpdateUserPayload> {
//     const user = await UserService.checkIfUserExists(input.userId);
//
//     const organization = await OrganizationService.organizationAddUser({ id, input });
//     return OrganizationResponseFormat.updateUser(organization, user);
//   }
//
//   static async userRemoveUserFromOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationRemoveUserArgs): Promise<GqlOrganizationUpdateUserPayload> {
//     const user = await UserService.checkIfUserExists(input.userId);
//
//     const organization = await OrganizationService.organizationRemoveUser({ id, input });
//     return OrganizationResponseFormat.updateUser(organization, user);
//   }
//
//   static async userAddTargetToOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationAddTargetArgs): Promise<GqlOrganizationUpdateTargetPayload> {
//     const target = await TargetService.checkIfTargetExists(input.targetId);
//
//     const organization = await OrganizationService.organizationAddTarget({ id, input });
//     return OrganizationResponseFormat.updateTarget(organization, target);
//   }
//
//   static async userRemoveTargetFromOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationRemoveTargetArgs): Promise<GqlOrganizationUpdateTargetPayload> {
//     const target = await TargetService.checkIfTargetExists(input.targetId);
//
//     const organization = await OrganizationService.organizationRemoveTarget({ id, input });
//     return OrganizationResponseFormat.updateTarget(organization, target);
//   }
//
//   static async userAddGroupToOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationAddGroupArgs): Promise<GqlOrganizationUpdateGroupPayload> {
//     const group = await GroupService.checkIfGroupExists(input.groupId);
//
//     const organization = await OrganizationService.organizationAddGroup({ id, input });
//     return OrganizationResponseFormat.updateGroup(organization, group);
//   }
//
//   static async userRemoveGroupFromOrganization({
//     id,
//     input,
//   }: GqlMutationOrganizationRemoveGroupArgs): Promise<GqlOrganizationUpdateGroupPayload> {
//     const group = await GroupService.checkIfGroupExists(input.groupId);
//
//     const organization = await OrganizationService.organizationRemoveGroup({ id, input });
//     return OrganizationResponseFormat.updateGroup(organization, group);
//   }
//
//   static async userPublishOrganization({
//     id,
//   }: GqlMutationOrganizationPublishArgs): Promise<GqlOrganizationSwitchPrivacyPayload> {
//     const organization = await OrganizationService.organizationPublish({ id });
//     return OrganizationResponseFormat.switchPrivacy(organization);
//   }
//
//   static async userUnpublishOrganization({
//     id,
//   }: GqlMutationOrganizationUnpublishArgs): Promise<GqlOrganizationSwitchPrivacyPayload> {
//     const organization = await OrganizationService.organizationUnpublish({ id });
//     return OrganizationResponseFormat.switchPrivacy(organization);
//   }
// }

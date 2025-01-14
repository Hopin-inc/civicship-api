// import {
//   GqlUser,
//   GqlUsersConnection,
//   GqlUserUpdateContentPayload,
//   GqlMutationUserAddActivityArgs,
//   GqlMutationUserAddGroupArgs,
//   GqlMutationUserAddOrganizationArgs,
//   GqlMutationUserCreateArgs,
//   GqlMutationUserDeleteArgs,
//   GqlMutationUserPublishArgs,
//   GqlMutationUserRemoveActivityArgs,
//   GqlMutationUserRemoveGroupArgs,
//   GqlMutationUserRemoveOrganizationArgs,
//   GqlMutationUserUnpublishArgs,
//   GqlMutationUserUpdateContentArgs,
//   GqlQueryUserArgs,
//   GqlQueryUsersArgs,
//   GqlUserUpdateActivityPayload,
//   GqlUserUpdateGroupPayload,
//   GqlUserUpdateOrganizationPayload,
//   GqlUserSwitchPrivacyPayload,
// } from "@/types/graphql";
// import UserService from "@/domains/user/service";
// import ActivityService from "@/domains/activity/service";
// import GroupService from "@/domains/group/service";
// import OrganizationService from "@/domains/organization/service";
// import UserResponseFormat from "@/domains/user/presenter/response";
// import { IContext } from "@/types/server";
//
// export default class UserUseCase {
//   static async userGetManyPublicUsers(
//     ctx: IContext,
//     { cursor, filter, sort, first }: GqlQueryUsersArgs,
//   ): Promise<GqlUsersConnection> {
//     const take = first ?? 10;
//     const data = await UserService.fetchPublicUsers({ cursor, filter, sort }, take);
//     const hasNextPage = data.length > take;
//
//     const users: GqlUser[] = data.slice(0, take).map((record) => {
//       return UserResponseFormat.get(record);
//     });
//     return UserResponseFormat.query(users, hasNextPage);
//   }
//
//   static async userGetManyOrganizationUsers(
//     ctx: IContext,
//     { cursor, filter, sort, first }: GqlQueryUsersArgs,
//   ): Promise<GqlUsersConnection> {
//     const take = first ?? 10;
//     const data = await UserService.fetchOrganizationUsers(ctx, { cursor, filter, sort }, take);
//     const hasNextPage = data.length > take;
//
//     const users: GqlUser[] = data.slice(0, take).map((record) => {
//       return UserResponseFormat.get(record);
//     });
//     return UserResponseFormat.query(users, hasNextPage);
//   }
//
//   static async userGetUser(
//     ctx: IContext,
//     { id }: GqlQueryUserArgs,
//   ): Promise<GqlUser | null> {
//     const user = await UserService.findUser(id);
//     if (!user) {
//       return null;
//     }
//     return UserResponseFormat.get(user);
//   }
//
//   static async userCreateUser(
//     ctx: IContext,
//     { input }: GqlMutationUserCreateArgs,
//   ) {
//     const user = await UserService.createUser({ input });
//     return UserResponseFormat.create(user);
//   }
//
//   static async userDeleteUser(
//     ctx: IContext,
//     { id }: GqlMutationUserDeleteArgs,
//   ) {
//     await UserService.deleteUser(id);
//     return UserResponseFormat.delete(id);
//   }
//
//   static async userUpdateUserContent(
//     ctx: IContext,
//     { id, input }: GqlMutationUserUpdateContentArgs,
//   ): Promise<GqlUserUpdateContentPayload> {
//     const existingUser = await UserService.checkIfUserExistsForUpdateContent(id);
//
//     const user = await UserService.updateContent({ id, input }, existingUser);
//     return UserResponseFormat.updateContent(user);
//   }
//
//   static async userPublishUser(
//     ctx: IContext,
//     { id }: GqlMutationUserPublishArgs,
//   ): Promise<GqlUserSwitchPrivacyPayload> {
//     const user = await UserService.publishUser(id);
//     return UserResponseFormat.switchPrivacy(user);
//   }
//
//   static async userUnpublishUser(
//     ctx: IContext,
//     { id }: GqlMutationUserUnpublishArgs,
//   ): Promise<GqlUserSwitchPrivacyPayload> {
//     const user = await UserService.unpublishUser(id);
//     return UserResponseFormat.switchPrivacy(user);
//   }
//
//   static async userAddGroupToUser(
//     ctx: IContext,
//     { id, input }: GqlMutationUserAddGroupArgs,
//   ): Promise<GqlUserUpdateGroupPayload> {
//     const group = await GroupService.checkIfGroupExists(input.groupId);
//
//     const user = await UserService.addGroup({ id, input });
//     return UserResponseFormat.updateGroup(user, group);
//   }
//
//   static async userRemoveGroupFromUser(
//     ctx: IContext,
//     { id, input }: GqlMutationUserRemoveGroupArgs,
//   ): Promise<GqlUserUpdateGroupPayload> {
//     const group = await GroupService.checkIfGroupExists(input.groupId);
//
//     const user = await UserService.removeGroup({ id, input });
//     return UserResponseFormat.updateGroup(user, group);
//   }
//
//   static async userAddOrganizationToUser(
//     ctx: IContext,
//     { id, input }: GqlMutationUserAddOrganizationArgs,
//   ): Promise<GqlUserUpdateOrganizationPayload> {
//     const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);
//
//     const user = await UserService.addOrganization({ id, input });
//     return UserResponseFormat.updateOrganization(user, organization);
//   }
//
//   static async userRemoveOrganizationFromUser(
//     ctx: IContext,
//     { id, input }: GqlMutationUserRemoveOrganizationArgs,
//   ): Promise<GqlUserUpdateOrganizationPayload> {
//     const organization = await OrganizationService.checkIfOrganizationExists(input.organizationId);
//
//     const user = await UserService.removeOrganization({ id, input });
//     return UserResponseFormat.updateOrganization(user, organization);
//   }
//
//   static async userAddActivityToUser(
//     ctx: IContext,
//     { id, input }: GqlMutationUserAddActivityArgs,
//   ): Promise<GqlUserUpdateActivityPayload> {
//     const activity = await ActivityService.checkIfActivityExists(ctx, input.activityId);
//
//     const user = await UserService.addActivity({ id, input });
//     return UserResponseFormat.updateActivity(user, activity);
//   }
//
//   static async userRemoveActivityFromUser(
//     ctx: IContext,
//     { id, input }: GqlMutationUserRemoveActivityArgs,
//   ): Promise<GqlUserUpdateActivityPayload> {
//     const activity = await ActivityService.checkIfActivityExists(ctx, input.activityId);
//
//     const user = await UserService.removeActivity({ id, input });
//     return UserResponseFormat.updateActivity(user, activity);
//   }
// }

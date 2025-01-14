// import {
//   GqlMutationUserAddActivityArgs,
//   GqlMutationUserAddGroupArgs,
//   GqlMutationUserAddOrganizationArgs,
//   GqlMutationUserCreateArgs,
//   GqlMutationUserRemoveActivityArgs,
//   GqlMutationUserRemoveGroupArgs,
//   GqlMutationUserRemoveOrganizationArgs,
//   GqlMutationUserUpdateContentArgs,
//   GqlQueryUsersArgs,
// } from "@/types/graphql";
// import { Prisma } from "@prisma/client";
// import UserRepository from "@/domains/user/repository";
// import UserInputFormat from "@/domains/user/presenter/input";
// import { RELATION_ACTION } from "@/consts/prisma";
// import { UserUpdateContentPayloadWithArgs } from "@/domains/user/type";
// import { IContext } from "@/types/server";
//
// export default class UserService {
//   static async fetchPublicUsers({ cursor, filter, sort }: GqlQueryUsersArgs, take: number) {
//     const where = UserInputFormat.filter({ filter });
//     const orderBy = UserInputFormat.sort({ sort });
//     return UserRepository.query(where, orderBy, take, cursor);
//   }
//
//   static async fetchOrganizationUsers(ctx: IContext, { cursor, filter, sort }: GqlQueryUsersArgs, take: number) {
//     const where = UserInputFormat.filter({ filter });
//     const orderBy = UserInputFormat.sort({ sort });
//     return UserRepository.queryOnlyOrganization(ctx, where, orderBy, take, cursor);
//   }
//
//   static async findUser(id: string) {
//     return await UserRepository.find(id);
//   }
//
//   static async checkIfUserExists(id: string) {
//     const user = await UserRepository.checkExists(id);
//     if (!user) {
//       throw new Error(`User with ID ${id} not found`);
//     }
//     return user;
//   }
//
//   static async checkIfUserExistsForUpdateContent(id: string) {
//     const existingUser = await UserRepository.findForUpdateContent(id);
//     if (!existingUser) {
//       throw new Error(`User with ID ${id} not found`);
//     }
//     return existingUser;
//   }
//
//   static async createUser({ input }: GqlMutationUserCreateArgs) {
//     const data: Prisma.UserCreateInput = UserInputFormat.create({ input });
//     return await UserRepository.create(data);
//   }
//
//   static async deleteUser(id: string) {
//     return await UserRepository.delete(id);
//   }
//
//   static async updateContent(
//     { id, input }: GqlMutationUserUpdateContentArgs,
//     existingUser: UserUpdateContentPayloadWithArgs,
//   ) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateContent(existingUser, input);
//     return UserRepository.updateContent(id, data);
//   }
//
//   static async publishUser(id: string) {
//     return await UserRepository.switchPrivacy(id, true);
//   }
//
//   static async unpublishUser(id: string) {
//     return await UserRepository.switchPrivacy(id, false);
//   }
//
//   static async addGroup({ id, input }: GqlMutationUserAddGroupArgs) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateGroup(
//       id,
//       input.groupId,
//       RELATION_ACTION.CONNECT_OR_CREATE,
//     );
//     return await UserRepository.updateRelation(id, data);
//   }
//
//   static async removeGroup({ id, input }: GqlMutationUserRemoveGroupArgs) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateGroup(
//       id,
//       input.groupId,
//       RELATION_ACTION.DELETE,
//     );
//     return await UserRepository.updateRelation(id, data);
//   }
//
//   static async addOrganization({ id, input }: GqlMutationUserAddOrganizationArgs) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateOrganization(
//       id,
//       input.organizationId,
//       RELATION_ACTION.CONNECT_OR_CREATE,
//     );
//     return await UserRepository.updateRelation(id, data);
//   }
//
//   static async removeOrganization({ id, input }: GqlMutationUserRemoveOrganizationArgs) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateOrganization(
//       id,
//       input.organizationId,
//       RELATION_ACTION.DELETE,
//     );
//     return await UserRepository.updateRelation(id, data);
//   }
//
//   static async addActivity({ id, input }: GqlMutationUserAddActivityArgs) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateActivity(
//       id,
//       input.activityId,
//       RELATION_ACTION.CONNECT_OR_CREATE,
//     );
//     return await UserRepository.updateRelation(id, data);
//   }
//
//   static async removeActivity({ id, input }: GqlMutationUserRemoveActivityArgs) {
//     const data: Prisma.UserUpdateInput = UserInputFormat.updateActivity(
//       id,
//       input.activityId,
//       RELATION_ACTION.DELETE,
//     );
//     return await UserRepository.updateRelation(id, data);
//   }
// }

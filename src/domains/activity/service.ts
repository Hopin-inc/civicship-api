import {
  GqlQueryActivitiesArgs,
  GqlMutationActivityCreateArgs,
  GqlMutationActivityUpdateContentArgs,
  GqlMutationActivityAddUserArgs,
  GqlMutationActivityRemoveUserArgs,
  GqlMutationActivityAddEventArgs,
  GqlMutationActivityRemoveEventArgs,
} from "@/types/graphql";
import { RELATION_ACTION } from "@/consts/prisma";
import { Prisma } from "@prisma/client";
import ActivityInputFormat from "@/domains/activity/presenter/input";
import ActivityRepository from "@/domains/activity/repository";
import { IContext } from "@/types/server";

export default class ActivityService {
  static async fetchActivities(ctx: IContext, { cursor, filter, sort }: GqlQueryActivitiesArgs, take: number) {
    const where = ActivityInputFormat.filter({ filter });
    const orderBy = ActivityInputFormat.sort({ sort });

    return ActivityRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async checkIfActivityExists(ctx: IContext, id: string) {
    const activity = await ActivityRepository.checkExists(ctx, id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  static async findActivity(ctx: IContext, id: string) {
    return await ActivityRepository.find(ctx, id);
  }

  static async createActivity(ctx: IContext, { input }: GqlMutationActivityCreateArgs) {
    const data: Prisma.ActivityCreateInput = ActivityInputFormat.create({ input });
    return await ActivityRepository.create(ctx, data);
  }

  static async updateContent(ctx: IContext, { id, input }: GqlMutationActivityUpdateContentArgs) {
    return await ActivityRepository.updateContent(ctx, id, input);
  }

  static async deleteActivity(ctx: IContext, id: string) {
    await ActivityRepository.delete(ctx, id);
  }

  static async publishActivity(ctx: IContext, id: string) {
    return await ActivityRepository.switchPrivacy(ctx, id, true);
  }

  static async unpublishActivity(ctx: IContext, id: string) {
    return await ActivityRepository.switchPrivacy(ctx, id, false);
  }

  static async addUser(ctx: IContext, { id, input }: GqlMutationActivityAddUserArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateUser(
      input.userId,
      RELATION_ACTION.CONNECT,
    );
    return await ActivityRepository.updateRelation(ctx, id, data);
  }

  static async removeUser(ctx: IContext, { id, input }: GqlMutationActivityRemoveUserArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateUser(
      input.userId,
      RELATION_ACTION.DISCONNECT,
    );
    return await ActivityRepository.updateRelation(ctx, id, data);
  }

  static async addEvent(ctx: IContext, { id, input }: GqlMutationActivityAddEventArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateEvent(
      input.eventId,
      RELATION_ACTION.CONNECT,
    );
    return await ActivityRepository.updateRelation(ctx, id, data);
  }

  static async removeEvent(ctx: IContext, { id, input }: GqlMutationActivityRemoveEventArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateEvent(
      input.eventId,
      RELATION_ACTION.DISCONNECT,
    );
    return await ActivityRepository.updateRelation(ctx, id, data);
  }
}

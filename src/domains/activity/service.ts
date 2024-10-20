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

export default class ActivityService {
  static async fetchActivities({ cursor, filter, sort }: GqlQueryActivitiesArgs, take: number) {
    const where = ActivityInputFormat.filter({ filter });
    const orderBy = ActivityInputFormat.sort({ sort });

    return ActivityRepository.query(where, orderBy, take, cursor);
  }

  static async checkIfActivityExists(id: string) {
    const activity = await ActivityRepository.checkExists(id);
    if (!activity) {
      throw new Error(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  static async findActivity(id: string) {
    return await ActivityRepository.find(id);
  }

  static async createActivity({ input }: GqlMutationActivityCreateArgs) {
    const data: Prisma.ActivityCreateInput = ActivityInputFormat.create({ input });
    return await ActivityRepository.create(data);
  }

  static async updateContent({ id, input }: GqlMutationActivityUpdateContentArgs) {
    return await ActivityRepository.updateContent(id, input);
  }

  static async deleteActivity(id: string) {
    await ActivityRepository.delete(id);
  }

  static async publishActivity(id: string) {
    return await ActivityRepository.switchPrivacy(id, true);
  }

  static async unpublishActivity(id: string) {
    return await ActivityRepository.switchPrivacy(id, false);
  }

  static async addUser({ id, input }: GqlMutationActivityAddUserArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateUser(
      input.userId,
      RELATION_ACTION.CONNECT,
    );
    return await ActivityRepository.updateRelation(id, data);
  }

  static async removeUser({ id, input }: GqlMutationActivityRemoveUserArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateUser(
      input.userId,
      RELATION_ACTION.DISCONNECT,
    );
    return await ActivityRepository.updateRelation(id, data);
  }

  static async addEvent({ id, input }: GqlMutationActivityAddEventArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateEvent(
      input.eventId,
      RELATION_ACTION.CONNECT,
    );
    return await ActivityRepository.updateRelation(id, data);
  }

  static async removeEvent({ id, input }: GqlMutationActivityRemoveEventArgs) {
    const data: Prisma.ActivityUpdateInput = ActivityInputFormat.updateEvent(
      input.eventId,
      RELATION_ACTION.DISCONNECT,
    );
    return await ActivityRepository.updateRelation(id, data);
  }
}

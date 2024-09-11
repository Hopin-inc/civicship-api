import {
  GqlMutationIssueCreateArgs,
  GqlMutationIssueDeleteArgs,
  GqlMutationIssueAddGroupArgs,
  GqlMutationIssueRemoveGroupArgs,
  GqlMutationIssueAddOrganizationArgs,
  GqlMutationIssueRemoveOrganizationArgs,
  GqlMutationIssueAddSkillsetArgs,
  GqlMutationIssueRemoveSkillsetArgs,
  GqlMutationIssueAddCityArgs,
  GqlMutationIssueRemoveCityArgs,
  GqlMutationIssueAddCategoryArgs,
  GqlMutationIssueRemoveCategoryArgs,
  GqlMutationIssueUpdateContentArgs,
  GqlMutationIssuePublishArgs,
  GqlMutationIssueUnpublishArgs,
  GqlQueryIssueArgs,
  GqlQueryIssuesArgs,
} from "@/types/graphql";
import { Prisma } from "@prisma/client";
import { RELATION_ACTION } from "@/consts/prisma";
import IssueRepository from "@/domains/issue/repository";
import IssueInputFormat from "@/domains/issue/presenter/input";

export default class IssueService {
  static async fetchIssues({ cursor, filter, sort }: GqlQueryIssuesArgs, take: number) {
    const where = IssueInputFormat.filter({ filter });
    const orderBy = IssueInputFormat.sort({ sort });

    return await IssueRepository.query(where, orderBy, take, cursor);
  }

  static async getIssue({ id }: GqlQueryIssueArgs) {
    return IssueRepository.find(id);
  }

  static async checkIfIssueExists(id: string) {
    const issue = await IssueRepository.checkExists(id);
    if (!issue) {
      throw new Error(`Issue with ID ${id} not found`);
    }
    return issue;
  }

  static async findIssueForUpdateContent(id: string) {
    const issue = await IssueRepository.findForUpdateContent(id);
    if (!issue) {
      throw new Error(`Issue with ID ${id} not found`);
    }
    return issue;
  }

  static async issueCreate({ input }: GqlMutationIssueCreateArgs) {
    const data: Prisma.IssueCreateInput = IssueInputFormat.create(input);
    return await IssueRepository.create(data);
  }

  static async issueDelete({ id }: GqlMutationIssueDeleteArgs) {
    return await IssueRepository.delete(id);
  }

  static async issueUpdateContent({ id, input }: GqlMutationIssueUpdateContentArgs) {
    return await IssueRepository.updateContent(id, input);
  }

  static async issueAddGroup({ id, input }: GqlMutationIssueAddGroupArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateGroup(
      id,
      input.groupId,
      RELATION_ACTION.CONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueRemoveGroup({ id, input }: GqlMutationIssueRemoveGroupArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateGroup(
      id,
      input.groupId,
      RELATION_ACTION.DISCONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueAddOrganization({ id, input }: GqlMutationIssueAddOrganizationArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateOrganization(
      id,
      input.organizationId,
      RELATION_ACTION.CONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueRemoveOrganization({ id, input }: GqlMutationIssueRemoveOrganizationArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateOrganization(
      id,
      input.organizationId,
      RELATION_ACTION.DISCONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueAddSkillset({ id, input }: GqlMutationIssueAddSkillsetArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateSkillset(
      id,
      input.skillsetId,
      RELATION_ACTION.CONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueRemoveSkillset({ id, input }: GqlMutationIssueRemoveSkillsetArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateSkillset(
      id,
      input.skillsetId,
      RELATION_ACTION.DISCONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueAddCity({ id, input }: GqlMutationIssueAddCityArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateCity(
      id,
      input.cityId,
      RELATION_ACTION.CONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueRemoveCity({ id, input }: GqlMutationIssueRemoveCityArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateCity(
      id,
      input.cityId,
      RELATION_ACTION.DISCONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueAddCategory({ id, input }: GqlMutationIssueAddCategoryArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateCategory(
      id,
      input.categoryId,
      RELATION_ACTION.CONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issueRemoveCategory({ id, input }: GqlMutationIssueRemoveCategoryArgs) {
    const data: Prisma.IssueUpdateInput = IssueInputFormat.updateCategory(
      id,
      input.categoryId,
      RELATION_ACTION.DISCONNECT,
    );
    return await IssueRepository.updateRelation(id, data);
  }

  static async issuePublish({ id }: GqlMutationIssuePublishArgs) {
    return await IssueRepository.switchPrivacy(id, true);
  }

  static async issueUnpublish({ id }: GqlMutationIssueUnpublishArgs) {
    return await IssueRepository.switchPrivacy(id, false);
  }
}

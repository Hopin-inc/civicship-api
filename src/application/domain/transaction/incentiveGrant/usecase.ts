import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import IncentiveGrantPresenter from "./presenter";
import { IIncentiveGrantRepository } from "./data/interface";
import { clampFirst } from "@/application/domain/utils";
import { inject, injectable } from "tsyringe";
import {
  GqlQueryIncentiveGrantsArgs,
  GqlQueryIncentiveGrantArgs,
  GqlIncentiveGrant,
  GqlIncentiveGrantsConnection,
  GqlIncentiveGrantFilterInput,
} from "@/types/graphql";

@injectable()
export default class IncentiveGrantUseCase {
  constructor(
    @inject("IncentiveGrantRepository") private readonly repository: IIncentiveGrantRepository,
  ) {}

  async visitorBrowseIncentiveGrants(
    args: GqlQueryIncentiveGrantsArgs,
    ctx: IContext,
  ): Promise<GqlIncentiveGrantsConnection> {
    const { filter, sort, cursor, first } = args;
    const take = clampFirst(first);

    // Build where clause
    const where: Prisma.IncentiveGrantWhereInput = this.buildWhereClause(filter);

    // Build orderBy clause
    const orderBy: Prisma.IncentiveGrantOrderByWithRelationInput[] = [];
    if (sort?.createdAt) {
      orderBy.push({ createdAt: sort.createdAt === "ASC" ? "asc" : "desc" });
    }
    if (sort?.updatedAt) {
      orderBy.push({ updatedAt: sort.updatedAt === "ASC" ? "asc" : "desc" });
    }
    if (orderBy.length === 0) {
      orderBy.push({ createdAt: "desc" });
    }

    const [records, totalCount] = await Promise.all([
      this.repository.query(ctx, where, orderBy, take, cursor),
      this.repository.count(ctx, where),
    ]);

    const hasNextPage = records.length > take;
    const data: GqlIncentiveGrant[] = records.slice(0, take).map((record) => {
      return IncentiveGrantPresenter.get(record);
    });

    return IncentiveGrantPresenter.query(data, totalCount, hasNextPage, cursor);
  }

  async visitorViewIncentiveGrant(
    args: GqlQueryIncentiveGrantArgs,
    ctx: IContext,
  ): Promise<GqlIncentiveGrant | null> {
    const { id } = args;
    const record = await this.repository.find(ctx, id);
    if (!record) {
      return null;
    }
    return IncentiveGrantPresenter.get(record);
  }

  private buildWhereClause(filter: GqlIncentiveGrantFilterInput | null | undefined): Prisma.IncentiveGrantWhereInput {
    if (!filter) {
      return {};
    }

    const where: Prisma.IncentiveGrantWhereInput = {};

    if (filter.communityId) {
      where.communityId = filter.communityId;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.type) {
      where.type = filter.type;
    }
    if (filter.status) {
      where.status = filter.status;
    }

    // Handle logical operators
    if (filter.and) {
      where.AND = filter.and.map((f) => this.buildWhereClause(f));
    }
    if (filter.or) {
      where.OR = filter.or.map((f) => this.buildWhereClause(f));
    }
    if (filter.not) {
      where.NOT = this.buildWhereClause(filter.not);
    }

    return where;
  }
}

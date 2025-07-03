import { Prisma } from "@prisma/client";
import {
  articleSelectDetail,
  articleForPortfolioSelectDetail,
} from "@/application/domain/content/article/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";

@injectable()
export default class ArticleRepository {
  async query(
    ctx: IContext,
    where: Prisma.ArticleWhereInput,
    orderBy: Prisma.ArticleOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    isForPortfolio: boolean = false,
  ) {
    return ctx.issuer.public(ctx, (tx) =>
      tx.article.findMany({
        where,
        orderBy,
        select: isForPortfolio ? articleForPortfolioSelectDetail : articleSelectDetail,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      }),
    );
  }

  async findAccessible(
    ctx: IContext,
    where: Prisma.ArticleWhereUniqueInput & Prisma.ArticleWhereInput,
    isForPortfolio: boolean = false,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.article.findUnique({
        where,
        select: isForPortfolio ? articleForPortfolioSelectDetail : articleSelectDetail,
      });
    });
  }

  async create(
    ctx: IContext,
    data: Prisma.ArticleCreateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.article.create({
      data,
      select: articleSelectDetail,
    });
  }

  async update(
    ctx: IContext,
    id: string,
    data: Prisma.ArticleUpdateInput,
    tx: Prisma.TransactionClient,
  ) {
    return tx.article.update({
      where: { id },
      data,
      select: articleSelectDetail,
    });
  }

  async delete(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ) {
    return tx.article.delete({
      where: { id },
      select: articleSelectDetail,
    });
  }
}

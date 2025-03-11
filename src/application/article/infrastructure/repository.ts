import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { articleInclude } from "@/application/article/infrastructure/type";
import { IContext } from "@/types/server";

export default class ArticleRepository {
  private static issuer = new PrismaClientIssuer();

  static async query(
    ctx: IContext,
    where: Prisma.ArticleWhereInput,
    orderBy: Prisma.ArticleOrderByWithRelationInput[],
    take: number,
    cursor?: string,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.article.findMany({
        where,
        orderBy,
        include: articleInclude,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });
  }

  static async find(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.article.findUnique({
        where: { id },
        include: articleInclude,
      });
    });
  }

  static async create(
    ctx: IContext,
    data: Prisma.ArticleCreateInput,
    tx?: Prisma.TransactionClient,
  ) {
    if (tx) {
      return tx.article.create({
        data,
        include: articleInclude,
      });
    }
    return this.issuer.public(ctx, (transaction) => {
      return transaction.article.create({
        data,
        include: articleInclude,
      });
    });
  }

  static async delete(ctx: IContext, id: string) {
    return this.issuer.public(ctx, (tx) => {
      return tx.article.delete({
        where: { id },
        include: articleInclude,
      });
    });
  }

  static async update(ctx: IContext, id: string, data: Prisma.ArticleUpdateInput) {
    return this.issuer.public(ctx, (tx) => {
      return tx.article.update({
        where: { id },
        data,
        include: articleInclude,
      });
    });
  }
}

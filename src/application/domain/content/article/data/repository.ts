import { Prisma } from "@prisma/client";
import { articleInclude } from "@/application/domain/content/article/data/type";
import { IContext } from "@/types/server";
import { injectable } from "tsyringe";

@injectable()
export default class ArticleRepository {
  async query<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    where: Prisma.ArticleWhereInput,
    orderBy: Prisma.ArticleOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    include: T = articleInclude as T,
  ) {
    return ctx.issuer.public(ctx, (tx) =>
      tx.article.findMany({
        where,
        orderBy,
        include,
        take: take + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
      }),
    );
  }

  async findAccessible(
    ctx: IContext,
    where: Prisma.ArticleWhereUniqueInput & Prisma.ArticleWhereInput,
  ) {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.article.findUnique({
        where,
        include: articleInclude,
      });
    });
  }
}

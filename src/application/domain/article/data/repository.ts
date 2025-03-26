import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { Prisma } from "@prisma/client";
import { articleInclude } from "@/application/domain/article/data/type";
import { IContext } from "@/types/server";

export default class ArticleRepository {
  private static issuer = new PrismaClientIssuer();

  static async query<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    where: Prisma.ArticleWhereInput,
    orderBy: Prisma.ArticleOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    include: T = articleInclude as T,
  ): Promise<Prisma.ArticleGetPayload<{ include: T }>[]> {
    return this.issuer.public(ctx, (tx) =>
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

  static async findAccessible(
    ctx: IContext,
    where: Prisma.ArticleWhereUniqueInput & Prisma.ArticleWhereInput,
  ) {
    return this.issuer.public(ctx, (tx) => {
      return tx.article.findUnique({
        where,
        include: articleInclude,
      });
    });
  }
}

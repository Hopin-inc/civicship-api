import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaArticle } from "@/application/domain/content/article/data/type";

export interface IArticleRepository {
  query<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    where: Prisma.ArticleWhereInput,
    orderBy: Prisma.ArticleOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    include?: T,
  ): Promise<Prisma.ArticleGetPayload<{ include: T }>[]>;

  findAccessible(
    ctx: IContext,
    where: Prisma.ArticleWhereUniqueInput & Prisma.ArticleWhereInput,
  ): Promise<PrismaArticle | null>;
}

import { Prisma } from "@prisma/client";
import { 
  articleSelectDetail, 
  articleForPortfolioSelectDetail,
  PrismaArticleDetail,
  PrismaArticleForPortfolioDetail
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
  ): Promise<PrismaArticleDetail[] | PrismaArticleForPortfolioDetail[]> {
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
  ): Promise<PrismaArticleDetail | PrismaArticleForPortfolioDetail | null> {
    return ctx.issuer.public(ctx, (tx) => {
      return tx.article.findUnique({
        where,
        select: isForPortfolio ? articleForPortfolioSelectDetail : articleSelectDetail,
      });
    });
  }
}

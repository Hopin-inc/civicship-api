import {
  GqlArticleCreateInput,
  GqlArticleUpdateInput,
  GqlQueryArticlesArgs,
} from "@/types/graphql";
import ArticleConverter from "@/application/article/data/converter";
import ArticleRepository from "@/application/article/data/repository";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { NotFoundError } from "@/errors/graphql";

export default class ArticleService {
  static async fetchArticles(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryArticlesArgs,
    take: number,
  ) {
    const where = ArticleConverter.filter(filter ?? {});
    const orderBy = ArticleConverter.sort(sort ?? {});
    return ArticleRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findArticle(ctx: IContext, id: string) {
    return ArticleRepository.find(ctx, id);
  }

  static async createArticle(ctx: IContext, input: GqlArticleCreateInput) {
    const data: Prisma.ArticleCreateInput = ArticleConverter.create(input);
    return ArticleRepository.create(ctx, data);
  }

  static async deleteArticle(ctx: IContext, id: string) {
    const article = await ArticleRepository.find(ctx, id);
    if (!article) {
      throw new NotFoundError("Article", { id });
    }
    return ArticleRepository.delete(ctx, id);
  }

  static async updateArticle(ctx: IContext, id: string, input: GqlArticleUpdateInput) {
    const article = await ArticleRepository.find(ctx, id);
    if (!article) {
      throw new NotFoundError("Article", { id });
    }
    const data: Prisma.ArticleUpdateInput = ArticleConverter.update(input);
    return ArticleRepository.update(ctx, id, data);
  }
}

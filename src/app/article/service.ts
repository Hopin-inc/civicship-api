import {
  GqlArticleCreateInput,
  GqlArticleUpdateInput,
  GqlQueryArticlesArgs,
} from "@/types/graphql";
import ArticleInputFormat from "@/presentation/graphql/dto/article/input";
import ArticleRepository from "@/infra/repositories/article";
import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";

export default class ArticleService {
  static async fetchArticles(
    ctx: IContext,
    { cursor, filter, sort }: GqlQueryArticlesArgs,
    take: number,
  ) {
    const where = ArticleInputFormat.filter(filter ?? {});
    const orderBy = ArticleInputFormat.sort(sort ?? {});
    return ArticleRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findArticle(ctx: IContext, id: string) {
    return ArticleRepository.find(ctx, id);
  }

  static async createArticle(ctx: IContext, input: GqlArticleCreateInput) {
    const data: Prisma.ArticleCreateInput = ArticleInputFormat.create(input);
    return ArticleRepository.create(ctx, data);
  }

  static async deleteArticle(ctx: IContext, id: string) {
    const article = await ArticleRepository.find(ctx, id);
    if (!article) {
      throw new Error(`ArticleNotFound: ID=${id}`);
    }
    return ArticleRepository.delete(ctx, id);
  }

  static async updateArticle(ctx: IContext, id: string, input: GqlArticleUpdateInput) {
    const article = await ArticleRepository.find(ctx, id);
    if (!article) {
      throw new Error(`ArticleNotFound: ID=${id}`);
    }
    const data: Prisma.ArticleUpdateInput = ArticleInputFormat.update(input);
    return ArticleRepository.update(ctx, id, data);
  }
}

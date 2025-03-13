import { GqlQueryArticlesArgs } from "@/types/graphql";
import ArticleConverter from "@/application/article/data/converter";
import ArticleRepository from "@/application/article/data/repository";
import { IContext } from "@/types/server";

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
}

import { GqlArticleFilterInput, GqlArticlesConnection, GqlArticleSortInput } from "@/types/graphql";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import ArticleService from "@/application/article/service";
import ArticlePresenter from "@/application/article/presenter";

export default class ArticleUtils {
  static async fetchArticlesCommon(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
      first,
    }: {
      cursor?: string;
      filter?: GqlArticleFilterInput;
      sort?: GqlArticleSortInput;
      first?: number;
    },
  ): Promise<GqlArticlesConnection> {
    const take = clampFirst(first);
    const res = await ArticleService.fetchArticles(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => ArticlePresenter.get(record));
    return ArticlePresenter.query(data, hasNextPage);
  }
}

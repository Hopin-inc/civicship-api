import { GqlArticleFilterInput, GqlArticlesConnection, GqlArticleSortInput } from "@/types/graphql";
import ArticleConverter from "@/application/article/data/converter";
import ArticleRepository from "@/application/article/data/repository";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import ArticlePresenter from "@/application/article/presenter";
import { PublishStatus } from "@prisma/client";
import { ValidationError } from "@/errors/graphql";

export default class ArticleService {
  static async fetchArticlesConnection(
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
    const res = await this.fetchArticles(ctx, { cursor, filter, sort }, take);
    const hasNextPage = res.length > take;
    const data = res.slice(0, take).map((record) => ArticlePresenter.get(record));
    return ArticlePresenter.query(data, hasNextPage);
  }

  static async fetchArticles(
    ctx: IContext,
    {
      cursor,
      filter,
      sort,
    }: {
      cursor?: string;
      filter?: GqlArticleFilterInput;
      sort?: GqlArticleSortInput;
    },
    take: number,
  ) {
    const where = ArticleConverter.filter(filter ?? {});
    const orderBy = ArticleConverter.sort(sort ?? {});
    return ArticleRepository.query(ctx, where, orderBy, take, cursor);
  }

  static async findArticle(ctx: IContext, id: string) {
    return ArticleRepository.find(ctx, id);
  }

  static async validatePublishStatus(
    allowedStatuses: PublishStatus[],
    filter?: GqlArticleFilterInput,
  ) {
    if (
      filter?.publishStatus &&
      !filter.publishStatus.every((status) => allowedStatuses.includes(status))
    ) {
      throw new ValidationError(
        `Validation error: publishStatus must be one of ${allowedStatuses.join(", ")}`,
        [JSON.stringify(filter?.publishStatus)],
      );
    }
  }
}

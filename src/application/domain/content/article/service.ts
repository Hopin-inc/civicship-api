import { GqlArticleFilterInput, GqlQueryArticlesArgs } from "@/types/graphql";
import ArticleConverter from "@/application/domain/content/article/data/converter";
import ArticleRepository from "@/application/domain/content/article/data/repository";
import { IContext } from "@/types/server";
import { Prisma, PublishStatus } from "@prisma/client";
import { ValidationError } from "@/errors/graphql";

export default class ArticleService {
  static async fetchArticles<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryArticlesArgs,
    take: number,
    include?: T,
  ): Promise<Prisma.ArticleGetPayload<{ include: T }>[]> {
    const where = ArticleConverter.filter(filter ?? {});
    const orderBy = ArticleConverter.sort(sort ?? {});

    return await ArticleRepository.query(ctx, where, orderBy, take, cursor, include);
  }

  static async findArticle(ctx: IContext, id: string, filter: GqlArticleFilterInput) {
    const where = ArticleConverter.findAccessible(id, filter ?? {});

    const article = await ArticleRepository.findAccessible(ctx, where);
    if (!article) {
      return null;
    }

    return article;
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

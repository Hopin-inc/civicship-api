import ArticleConverter from "@/application/domain/content/article/data/converter";
import { Prisma, PublishStatus } from "@prisma/client";
import { ValidationError } from "@/errors/graphql";
import { IArticleRepository } from "@/application/domain/content/article/data/interface";
import { IContext } from "@/types/server";
import { GqlArticleFilterInput, GqlQueryArticlesArgs } from "@/types/graphql";

export default class ArticleService {
  constructor(
    private readonly repository: IArticleRepository,
    private readonly converter: ArticleConverter,
  ) {}

  async fetchArticles<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    { filter, sort, cursor }: GqlQueryArticlesArgs,
    take: number,
    include?: T,
  ): Promise<Prisma.ArticleGetPayload<{ include: T }>[]> {
    const where = this.converter.filter(filter ?? {});
    const orderBy = this.converter.sort(sort ?? {});

    return this.repository.query(ctx, where, orderBy, take, cursor, include);
  }

  async findArticle(ctx: IContext, id: string, filter: GqlArticleFilterInput) {
    const where = this.converter.findAccessible(id, filter ?? {});
    const article = await this.repository.findAccessible(ctx, where);
    if (!article) {
      return null;
    }
    return article;
  }

  async validatePublishStatus(allowedStatuses: PublishStatus[], filter?: GqlArticleFilterInput) {
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

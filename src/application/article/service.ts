import { GqlArticleFilterInput, GqlArticlesConnection, GqlArticleSortInput } from "@/types/graphql";
import ArticleConverter from "@/application/article/data/converter";
import ArticleRepository from "@/application/article/data/repository";
import { IContext } from "@/types/server";
import { clampFirst } from "@/utils";
import ArticlePresenter from "@/application/article/presenter";
import { PublishStatus, Role } from "@prisma/client";
import { AuthorizationError, ValidationError } from "@/errors/graphql";

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
    const article = await ArticleRepository.find(ctx, id);
    if (!article) {
      return null;
    }

    if (article.publishStatus === PublishStatus.PUBLIC) {
      return article;
    }

    if (article.publishStatus === PublishStatus.COMMUNITY_INTERNAL) {
      return validateCommunityInternalAccess(ctx, article);
    }

    if (article.publishStatus === PublishStatus.PRIVATE) {
      const articleId = article.id;

      if (isUserArticleOrRelated(ctx, articleId)) {
        return article;
      }

      validateCommunityMembership(ctx, article.communityId);
      return article;
    }

    throw new AuthorizationError("Unauthorized access");
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

function validateCommunityInternalAccess(
  ctx: IContext,
  article: { publishStatus: PublishStatus; communityId: string },
): typeof article {
  const communityId = article.communityId;
  const hasMembership =
    ctx.hasPermissions?.memberships.some((m) => m.communityId === communityId) ?? false;
  if (!hasMembership) {
    throw new AuthorizationError("User is not a member of the community");
  }
  return article;
}

function isUserArticleOrRelated(ctx: IContext, articleId: string): boolean {
  return (
    (ctx.hasPermissions?.articlesWrittenByMe?.some((a) => a.id === articleId) ?? false) ||
    (ctx.hasPermissions?.articlesAboutMe?.some((a) => a.id === articleId) ?? false)
  );
}

function validateCommunityMembership(ctx: IContext, communityId: string): void {
  const membership = ctx.hasPermissions?.memberships?.find((m) => m.communityId === communityId);
  if (!(membership?.role === Role.OWNER || membership?.role === Role.MANAGER)) {
    throw new AuthorizationError("User must be community manager");
  }
}

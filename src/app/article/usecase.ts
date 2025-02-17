import {
  GqlQueryArticlesArgs,
  GqlQueryArticleArgs,
  GqlArticlesConnection,
  GqlArticle,
  GqlMutationArticleCreateArgs,
  GqlArticleCreatePayload,
  GqlMutationArticleDeleteArgs,
  GqlArticleDeletePayload,
  GqlMutationArticleUpdateArgs,
  GqlArticleUpdatePayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ArticleService from "@/app/article/service";
import ArticleOutputFormat from "@/presentation/graphql/dto/article/output";
import { clampFirst } from "@/utils";

export default class ArticleUseCase {
  static async visitorBrowseArticles(
    ctx: IContext,
    { filter, sort, cursor, first }: GqlQueryArticlesArgs,
  ): Promise<GqlArticlesConnection> {
    const take = clampFirst(first);
    const records = await ArticleService.fetchArticles(ctx, { filter, sort, cursor }, take);
    const hasNextPage = records.length > take;
    const data: GqlArticle[] = records.slice(0, take).map((r) => ArticleOutputFormat.get(r));
    return ArticleOutputFormat.query(data, hasNextPage);
  }

  static async visitorViewArticle(
    ctx: IContext,
    { id }: GqlQueryArticleArgs,
  ): Promise<GqlArticle | null> {
    const record = await ArticleService.findArticle(ctx, id);
    return record ? ArticleOutputFormat.get(record) : null;
  }

  static async managerCreateArticle(
    ctx: IContext,
    { input }: GqlMutationArticleCreateArgs,
  ): Promise<GqlArticleCreatePayload> {
    const record = await ArticleService.createArticle(ctx, input);
    return ArticleOutputFormat.create(record);
  }

  static async managerUpdateArticle(
    ctx: IContext,
    { id, input }: GqlMutationArticleUpdateArgs,
  ): Promise<GqlArticleUpdatePayload> {
    const record = await ArticleService.updateArticle(ctx, id, input);
    return ArticleOutputFormat.update(record);
  }

  static async managerDeleteArticle(
    ctx: IContext,
    { id }: GqlMutationArticleDeleteArgs,
  ): Promise<GqlArticleDeletePayload> {
    const record = await ArticleService.deleteArticle(ctx, id);
    return ArticleOutputFormat.delete(record);
  }
}

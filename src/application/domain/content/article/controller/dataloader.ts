import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlArticle } from "@/types/graphql";
import { articleSelectDetail, PrismaArticleDetail } from "@/application/domain/content/article/data/type";
import ArticlePresenter from "@/application/domain/content/article/presenter";

async function batchArticlesById(
  issuer: PrismaClientIssuer,
  articleIds: readonly string[],
): Promise<(GqlArticle | null)[]> {
  const records = await issuer.internal(async (tx) =>
    tx.article.findMany({
      where: { id: { in: [...articleIds] } },
      select: articleSelectDetail,
    }),
  ) as PrismaArticleDetail[];
  const map = new Map(records.map((record) => [record.id, ArticlePresenter.get(record)]));
  return articleIds.map((id) => map.get(id) ?? null);
}

export function createArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlArticle | null>((keys) => batchArticlesById(issuer, keys));
}

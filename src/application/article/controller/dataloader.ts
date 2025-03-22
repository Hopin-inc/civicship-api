import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlArticle } from "@/types/graphql";
import { articleInclude } from "@/application/article/data/type";
import ArticlePresenter from "@/application/article/presenter";

async function batchArticlesById(
  issuer: PrismaClientIssuer,
  articleIds: readonly string[],
): Promise<(GqlArticle | null)[]> {
  const records = await issuer.internal(async (tx) =>
    tx.article.findMany({
      where: { id: { in: [...articleIds] } },
      include: articleInclude,
    }),
  );
  const map = new Map(records.map((record) => [record.id, ArticlePresenter.get(record)]));
  return articleIds.map((id) => map.get(id) ?? null);
}

export function createArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlArticle | null>((keys) => batchArticlesById(issuer, keys));
}

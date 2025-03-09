import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infra/prisma/client";
import { GqlArticle } from "@/types/graphql";
import { articleInclude } from "@/infra/prisma/types/article";
import ArticleOutputFormat from "@/presentation/graphql/dto/article/output";

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
  const map = new Map(records.map((record) => [record.id, ArticleOutputFormat.get(record)]));
  return articleIds.map((id) => map.get(id) ?? null);
}

export function createArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlArticle | null>((keys) => batchArticlesById(issuer, keys));
}

import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlPortfolio } from "@/types/graphql";
import { portfolioFromParticipationInclude } from "@/application/domain/experience/participation/data/type";
import { portfolioFromArticleInclude } from "@/application/domain/content/article/data/type";
import ViewPresenter from "@/application/view/presenter";
async function batchParticipationsForPortfolio(issuer: PrismaClientIssuer, ids: readonly string[]) {
  const records = await issuer.internal(async (tx) =>
    tx.participation.findMany({
      where: { id: { in: [...ids] } },
      include: portfolioFromParticipationInclude,
    }),
  );
  const map = new Map(
    records.map((record) => [record.id, ViewPresenter.getFromParticipation(record)]),
  );
  return ids.map((id) => map.get(id) ?? null);
}

export function createPortfolioParticipationLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlPortfolio | null>((keys) =>
    batchParticipationsForPortfolio(issuer, keys),
  );
}

async function batchArticlesForPortfolio(issuer: PrismaClientIssuer, ids: readonly string[]) {
  const records = await issuer.internal(async (tx) =>
    tx.article.findMany({
      where: { id: { in: [...ids] } },
      include: portfolioFromArticleInclude,
    }),
  );
  const map = new Map(records.map((record) => [record.id, ViewPresenter.getFromArticle(record)]));
  return ids.map((id) => map.get(id) ?? null);
}

export function createPortfolioArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlPortfolio | null>((keys) =>
    batchArticlesForPortfolio(issuer, keys),
  );
}

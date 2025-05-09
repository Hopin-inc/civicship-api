import DataLoader from "dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { GqlUser } from "@/types/graphql";
import UserPresenter from "@/application/domain/account/user/presenter";
import { userSelectDetail } from "@/application/domain/account/user/data/type";
import { createLoaderById } from "@/presentation/graphql/dataloader/utils";

export function createUserLoader(issuer: PrismaClientIssuer) {
  return createLoaderById(async (ids) => {
    return issuer.internal((tx) =>
      tx.user.findMany({
        where: { id: { in: [...ids] } },
        select: userSelectDetail,
      }),
    );
  }, UserPresenter.get);
}

export function createAuthorsByArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUser[]>(async (articleIds) => {
    const articles = await issuer.internal((tx) =>
      tx.article.findMany({
        where: { id: { in: [...articleIds] } },
        include: { authors: true },
      }),
    );

    const map = new Map<string, GqlUser[]>();
    for (const article of articles) {
      map.set(article.id, article.authors.map(UserPresenter.get));
    }

    return articleIds.map((id) => map.get(id) ?? []);
  });
}

export function createRelatedUsersByArticleLoader(issuer: PrismaClientIssuer) {
  return new DataLoader<string, GqlUser[]>(async (articleIds) => {
    const articles = await issuer.internal((tx) =>
      tx.article.findMany({
        where: { id: { in: [...articleIds] } },
        include: { relatedUsers: true },
      }),
    );

    const map = new Map<string, GqlUser[]>();
    for (const article of articles) {
      map.set(article.id, article.relatedUsers.map(UserPresenter.get));
    }

    return articleIds.map((id) => map.get(id) ?? []);
  });
}

import { Prisma } from "@prisma/client";
import { IContext } from "@/types/server";
import { PrismaArticle } from "@/application/domain/content/article/data/type";

export interface IArticleRepository {
  query<T extends Prisma.ArticleInclude>(
    ctx: IContext,
    where: Prisma.ArticleWhereInput,
    orderBy: Prisma.ArticleOrderByWithRelationInput[],
    take: number,
    cursor?: string,
    include?: T,
  ): Promise<Prisma.ArticleGetPayload<{ include: T }>[]>;

  find(ctx: IContext, id: string): Promise<{
    id: string;
    title: string;
    category: string | null;
    introduction: string | null;
    body: string;
    publishStatus: import("@prisma/client").PublishStatus;
    thumbnailId: string | null;
    communityId: string;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    authors: { id: string }[];
    relatedUsers: { id: string }[];
  } | null>;

  create(
    ctx: IContext,
    data: Prisma.ArticleCreateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaArticle>;

  update(
    ctx: IContext,
    id: string,
    data: Prisma.ArticleUpdateInput,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaArticle>;

  delete(
    ctx: IContext,
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<PrismaArticle>;
}

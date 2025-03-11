import { Prisma } from "@prisma/client";
import { communityInclude } from "@/application/community/infrastructure/type";

export const articleInclude = Prisma.validator<Prisma.ArticleInclude>()({
  community: { include: communityInclude },
});

export type ArticlePayloadWithArgs = Prisma.ArticleGetPayload<{
  include: typeof articleInclude;
}>;

import { Prisma } from "@prisma/client";

export const likeCreateInclude = Prisma.validator<Prisma.LikeInclude>()({
  user: true,
  event: true,
});

export type LikeCreatePayloadWithArgs = Prisma.LikeGetPayload<{
  include: typeof likeCreateInclude;
}>;

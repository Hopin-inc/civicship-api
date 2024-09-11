import { Prisma } from "@prisma/client";

export const commentCreateInclude = Prisma.validator<Prisma.CommentInclude>()({
  user: true,
  event: true,
});

export const commentUpdateInclude = Prisma.validator<Prisma.CommentInclude>()({
  user: true,
  event: true,
});

export type CommentCreatePayloadWithArgs = Prisma.CommentGetPayload<{
  include: typeof commentCreateInclude;
}>;

export type CommentUpdatePayloadWithArgs = Prisma.CommentGetPayload<{
  include: typeof commentUpdateInclude;
}>;

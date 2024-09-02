import { Prisma } from "@prisma/client";

export const activityGetInclude = Prisma.validator<Prisma.ActivityInclude>()({
  user: true,
  event: true,
});

export const activityCreateInclude = Prisma.validator<Prisma.ActivityInclude>()({
  user: true,
  event: true,
});

export const activityUpdateContentInclude = Prisma.validator<Prisma.ActivityInclude>()({
  user: true,
  event: true,
});

export type ActivityGetPayloadWithArgs = Prisma.ActivityGetPayload<{
  include: typeof activityGetInclude;
}>;

export type ActivityCreatePayloadWithArgs = Prisma.ActivityGetPayload<{
  include: typeof activityCreateInclude;
}>;

export type ActivityUpdateContentPayloadWithArgs = Prisma.ActivityGetPayload<{
  include: typeof activityUpdateContentInclude;
}>;

import { Prisma } from "@prisma/client";

export const applicationConfirmationGetInclude =
  Prisma.validator<Prisma.ApplicationConfirmationInclude>()({
    application: {
      include: {
        event: true,
        user: true,
      },
    },
    confirmedBy: true,
  });

export const applicationConfirmationCreateInclude =
  Prisma.validator<Prisma.ApplicationConfirmationInclude>()({
    application: {
      include: {
        event: true,
        user: true,
      },
    },
    confirmedBy: true,
  });

export type ApplicationConfirmationGetPayloadWithArgs = Prisma.ApplicationConfirmationGetPayload<{
  include: typeof applicationConfirmationGetInclude;
}>;

export type ApplicationConfirmationCreatePayloadWithArgs =
  Prisma.ApplicationConfirmationGetPayload<{
    include: typeof applicationConfirmationCreateInclude;
  }>;

import { Prisma } from "@prisma/client";

export const applicationGetInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  event: true,
  user: true,
  activity: {
    include: {
      event: true,
      user: true,
    },
  },
  approvals: {
    include: {
      confirmedBy: true,
    },
  },
});

export const applicationCreateInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  event: true,
  user: true,
});

export const applicationUpdateContentInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  user: true,
  event: true,
  approvals: {
    include: {
      confirmedBy: true,
    },
  },
});

export const applicationUpdateConfirmationInclude = Prisma.validator<Prisma.ApplicationInclude>()({
  event: true,
  user: true,
  approvals: {
    include: {
      confirmedBy: true,
    },
  },
});

export type ApplicationGetPayloadWithArgs = Prisma.ApplicationGetPayload<{
  include: typeof applicationGetInclude;
}>;

export type ApplicationCreatePayloadWithArgs = Prisma.ApplicationGetPayload<{
  include: typeof applicationCreateInclude;
}>;

export type ApplicationUpdateContentPayloadWithArgs = Prisma.ApplicationGetPayload<{
  include: typeof applicationUpdateContentInclude;
}>;

export type ApplicationUpdateConfirmationPayloadWithArgs = Prisma.ApplicationGetPayload<{
  include: typeof applicationUpdateConfirmationInclude;
}>;

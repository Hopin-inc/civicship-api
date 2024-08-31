import { Prisma } from "@prisma/client";

export const groupGetInclude = Prisma.validator<Prisma.GroupInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
  organization: { include: { city: { include: { state: true } }, state: true } },

  users: { include: { user: true } },
  events: { include: { event: true } },

  targets: true,
  parent: true,
  children: true,
});

export const groupCreateInclude = Prisma.validator<Prisma.GroupInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
  organization: { include: { city: { include: { state: true } }, state: true } },

  parent: true,
});

export const groupUpdateContentInclude = Prisma.validator<Prisma.GroupInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
});

export type GroupGetPayloadWithArgs = Prisma.GroupGetPayload<{
  include: typeof groupGetInclude;
}>;

export type GroupCreatePayloadWithArgs = Prisma.GroupGetPayload<{
  include: typeof groupCreateInclude;
}>;

export type GroupUpdateContentPayloadWithArgs = Prisma.GroupGetPayload<{
  include: typeof groupUpdateContentInclude;
}>;

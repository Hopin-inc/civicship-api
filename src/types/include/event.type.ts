import { Prisma } from "@prisma/client";

export const eventInclude = Prisma.validator<Prisma.EventInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
  skillsets: { include: { skillset: true } },
  organizations: {
    include: {
      organization: {
        include: {
          city: { include: { state: true } },
          state: true,
        },
      },
    },
  },
  groups: { include: { group: true } },
});

export const eventUpdateContentInclude = Prisma.validator<Prisma.EventInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
  skillsets: { include: { skillset: true } },
});

export const eventGetInclude = Prisma.validator<Prisma.EventInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
  skillsets: { include: { skillset: true } },
  organizations: {
    include: {
      organization: {
        include: {
          city: { include: { state: true } },
          state: true,
        },
      },
    },
  },
  groups: { include: { group: true } },
  activities: true,
  likes: true,
  comments: true,
  _count: {
    select: {
      activities: true,
      likes: true,
      comments: true,
    },
  },
});

export type EventCreatePayloadWithArgs = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

export type EventGetPayloadWithArgs = Prisma.EventGetPayload<{
  include: typeof eventGetInclude;
}>;

export type EventUpdateContentPayloadWithArgs = Prisma.EventGetPayload<{
  include: typeof eventUpdateContentInclude;
}>;

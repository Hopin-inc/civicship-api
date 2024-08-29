import { Prisma } from "@prisma/client";

const eventInclude = Prisma.validator<Prisma.EventInclude>()({
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

const eventUpdateContentInclude = Prisma.validator<Prisma.EventInclude>()({
  agendas: { include: { agenda: true } },
  cities: { include: { city: { include: { state: true } } } },
  skillsets: { include: { skillset: true } },
});

const eventGetInclude = Prisma.validator<Prisma.EventInclude>()({
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

type EventCreatePayloadWithArgs = Prisma.EventGetPayload<{
  include: typeof eventInclude;
}>;

type EventGetPayloadWithArgs = Prisma.EventGetPayload<{
  include: typeof eventGetInclude;
}>;

type EventUpdateContentPayloadWithArgs = Prisma.EventGetPayload<{
  include: typeof eventUpdateContentInclude;
}>;

export {
  eventInclude,
  eventUpdateContentInclude,
  eventGetInclude,
  EventCreatePayloadWithArgs,
  EventGetPayloadWithArgs,
  EventUpdateContentPayloadWithArgs,
};

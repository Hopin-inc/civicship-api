import { Prisma } from "@prisma/client";

export const issueGetInclude = Prisma.validator<Prisma.IssueInclude>()({
  issueCategories: { include: { issueCategory: true } },
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

export const issueCreateInclude = Prisma.validator<Prisma.IssueInclude>()({
  issueCategories: { include: { issueCategory: true } },
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

export const issueUpdateContentInclude = Prisma.validator<Prisma.IssueInclude>()({
  issueCategories: { include: { issueCategory: true } },
  cities: { include: { city: { include: { state: true } } } },
  skillsets: { include: { skillset: true } },
});

export type IssueGetPayloadWithArgs = Prisma.IssueGetPayload<{
  include: typeof issueGetInclude;
}>;

export type IssueCreatePayloadWithArgs = Prisma.IssueGetPayload<{
  include: typeof issueCreateInclude;
}>;

export type IssueUpdateContentPayloadWithArgs = Prisma.IssueGetPayload<{
  include: typeof issueUpdateContentInclude;
}>;

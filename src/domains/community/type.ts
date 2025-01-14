// import { Prisma } from "@prisma/client";
//
// export const organizationDefaultInclude = Prisma.validator<Prisma.OrganizationInclude>()({
//   city: { include: { state: true } },
//   state: true,
// });
//
// export const organizationGetInclude = Prisma.validator<Prisma.OrganizationInclude>()({
//   city: { include: { state: true } },
//   state: true,
//   users: { include: { user: true } },
//   groups: true,
//   targets: true,
//   agendas: { include: { agenda: true } },
// });
//
// export const organizationCreateInclude = Prisma.validator<Prisma.OrganizationInclude>()({
//   city: { include: { state: true } },
//   state: true,
//   users: { include: { user: true } },
//   groups: true,
//   targets: true,
//   agendas: { include: { agenda: true } },
// });
//
// export const organizationUpdateContentInclude = Prisma.validator<Prisma.OrganizationInclude>()({
//   city: { include: { state: true } },
//   state: true,
//   cities: { include: { city: { include: { state: true } } } },
//   users: { include: { user: true } },
//   groups: true,
//   targets: true,
//   agendas: { include: { agenda: true } },
// });
//
// export type OrganizationDefaultPayloadWithArgs = Prisma.OrganizationGetPayload<{
//   include: typeof organizationDefaultInclude;
// }>;
//
// export type OrganizationGetPayloadWithArgs = Prisma.OrganizationGetPayload<{
//   include: typeof organizationGetInclude;
// }>;
//
// export type OrganizationCreatePayloadWithArgs = Prisma.OrganizationGetPayload<{
//   include: typeof organizationCreateInclude;
// }>;
//
// export type OrganizationUpdateContentPayloadWithArgs = Prisma.OrganizationGetPayload<{
//   include: typeof organizationUpdateContentInclude;
// }>;

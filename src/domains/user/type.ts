// import { Prisma } from "@prisma/client";
//
// export const userGetInclude = Prisma.validator<Prisma.UserInclude>()({
//   agendas: { include: { agenda: true } },
//   cities: { include: { city: { include: { state: true } } } },
//   groups: { include: { group: true } },
//   organizations: {
//     include: { organization: { include: { city: { include: { state: true } }, state: true } } },
//   },
//   activities: true,
//   likes: true,
//   comments: true,
// });
//
// export const userCreateInclude = Prisma.validator<Prisma.UserInclude>()({
//   groups: { include: { group: true } },
//   organizations: {
//     include: { organization: { include: { city: { include: { state: true } }, state: true } } },
//   },
// });
//
// export const userUpdateContentInclude = Prisma.validator<Prisma.UserInclude>()({
//   agendas: { include: { agenda: true } },
//   cities: { include: { city: { include: { state: true } } } },
// });
//
// export type UserGetPayloadWithArgs = Prisma.UserGetPayload<{
//   include: typeof userGetInclude;
// }>;
//
// export type UserCreatePayloadWithArgs = Prisma.UserGetPayload<{
//   include: typeof userCreateInclude;
// }>;
//
// export type UserUpdateContentPayloadWithArgs = Prisma.UserGetPayload<{
//   include: typeof userUpdateContentInclude;
// }>;

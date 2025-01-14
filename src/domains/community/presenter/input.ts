// import {
//   GqlOrganizationCreateInput,
//   GqlOrganizationUpdateContentInput,
//   GqlQueryOrganizationsArgs,
// } from "@/types/graphql";
// import { Prisma } from "@prisma/client";
// import { calculateDifferences } from "@/utils";
// import { RELATION_ACTION } from "@/consts/prisma";
// import { OrganizationUpdateContentPayloadWithArgs } from "@/domains/organization/type";
//
// export default class OrganizationInputFormat {
//   static filter({ filter }: GqlQueryOrganizationsArgs): Prisma.OrganizationWhereInput {
//     return {
//       AND: [
//         filter?.agendaId ? { agendas: { some: { agendaId: filter?.agendaId } } } : {},
//         filter?.keyword
//           ? {
//               OR: [{ name: { contains: filter?.keyword } }, { bio: { contains: filter?.keyword } }],
//             }
//           : {},
//       ],
//     };
//   }
//
//   static sort({ sort }: GqlQueryOrganizationsArgs): Prisma.OrganizationOrderByWithRelationInput {
//     return {
//       updatedAt: sort?.updatedAt ?? Prisma.SortOrder.desc,
//     };
//   }
//
//   static create(input: GqlOrganizationCreateInput): Prisma.OrganizationCreateInput {
//     const { agendaIds, cityCode, stateCode, stateCountryCode, ...properties } = input;
//
//     return {
//       ...properties,
//       state: {
//         connect: {
//           code_countryCode: { code: stateCode, countryCode: stateCountryCode },
//         },
//       },
//       city: {
//         connect: { code: cityCode },
//       },
//       agendas: {
//         createMany: {
//           data: agendaIds?.map((agendaId) => ({ agendaId })) ?? [],
//           skipDuplicates: true,
//         },
//       },
//     };
//   }
//
//   static updateContent(
//     existingOrganization: OrganizationUpdateContentPayloadWithArgs,
//     input: GqlOrganizationUpdateContentInput,
//   ): Prisma.OrganizationUpdateInput {
//     const { agendaIds, cityCodes, ...properties } = input;
//
//     const [
//       { toAdd: agendasToAdd, toRemove: agendasToRemove },
//       { toAdd: citiesToAdd, toRemove: citiesToRemove },
//     ] = [
//       calculateDifferences(new Set(existingOrganization.agendas.map((r) => r.agendaId)), agendaIds),
//       calculateDifferences(new Set(existingOrganization.cities.map((r) => r.city.code)), cityCodes),
//     ];
//
//     return {
//       ...properties,
//       agendas: {
//         createMany: {
//           data: agendasToAdd.map((agendaId) => ({ agendaId })),
//           skipDuplicates: true,
//         },
//         deleteMany: {
//           agendaId: { in: agendasToRemove },
//         },
//       },
//       cities: {
//         createMany: {
//           data: citiesToAdd.map((cityCode) => ({ cityCode })),
//           skipDuplicates: true,
//         },
//         deleteMany: {
//           cityCode: { in: citiesToRemove },
//         },
//       },
//     };
//   }
//
//   static updateUser(
//     organizationId: string,
//     userId: string,
//     action: RELATION_ACTION,
//   ): Prisma.OrganizationUpdateInput {
//     const data: Prisma.OrganizationUpdateInput = {};
//
//     switch (action) {
//       case RELATION_ACTION.CONNECT_OR_CREATE:
//         data.users = {
//           connectOrCreate: {
//             where: {
//               userId_organizationId: { organizationId, userId },
//             },
//             create: { userId },
//           },
//         };
//         break;
//
//       case RELATION_ACTION.DELETE:
//         data.users = {
//           delete: {
//             userId_organizationId: { organizationId, userId },
//             userId,
//           },
//         };
//         break;
//
//       default:
//         throw new Error(`Invalid action: ${action}`);
//     }
//
//     return data;
//   }
//
//   static updateTarget(targetId: string, action: RELATION_ACTION): Prisma.OrganizationUpdateInput {
//     const data: Prisma.OrganizationUpdateInput = {};
//
//     switch (action) {
//       case RELATION_ACTION.CONNECT:
//         data.targets = {
//           connect: {
//             id: targetId,
//           },
//         };
//         break;
//
//       case RELATION_ACTION.DISCONNECT:
//         data.targets = {
//           disconnect: {
//             id: targetId,
//           },
//         };
//         break;
//
//       default:
//         throw new Error(`Invalid action: ${action}`);
//     }
//
//     return data;
//   }
//
//   static updateGroup(groupId: string, action: RELATION_ACTION): Prisma.OrganizationUpdateInput {
//     const data: Prisma.OrganizationUpdateInput = {};
//
//     switch (action) {
//       case RELATION_ACTION.CONNECT:
//         data.groups = {
//           connect: {
//             id: groupId,
//           },
//         };
//         break;
//
//       case RELATION_ACTION.DISCONNECT:
//         data.groups = {
//           disconnect: {
//             id: groupId,
//           },
//         };
//         break;
//
//       default:
//         throw new Error(`Invalid action: ${action}`);
//     }
//
//     return data;
//   }
// }

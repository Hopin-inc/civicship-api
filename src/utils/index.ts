// import { PrismaClient } from "@prisma/client";
// import { ConnectArgs, UpdateArgs } from "types/MutationArgs";
// import { ENTITY_NAME } from "@/consts";
//
// const db = new PrismaClient();
//
// export async function updateEntityConnection<T extends { id: string }>(
//   {
//     entityName,
//     relatedEntityName,
//     entityId,
//     relatedEntityId,
//     includeOptions = {},
//   }: ConnectArgs,
//   { connect }: UpdateArgs,
// ) {
//   const dbEntity = db[entityName];
//   const dbRelatedEntity = db[relatedEntityName];
//
//   // relationKey のロジックを修正し、汎用性を持たせる
//   const relationKey =
//     relatedEntityName === ENTITY_NAME.GROUP ||
//     relatedEntityName === ENTITY_NAME.ORGANIZATION
//       ? `${relatedEntityName}Id_${entityName}Id`
//       : "id";
//
//   const [entity, relatedEntity] = await db.$transaction([
//     dbEntity.update({
//       where: { id: entityId },
//       data: {
//         [relatedEntityName === ENTITY_NAME.GROUP ||
//         relatedEntityName === ENTITY_NAME.ORGANIZATION
//           ? `${relatedEntityName}s`
//           : relatedEntityName]: connect
//           ? {
//               connect: {
//                 [relationKey]:
//                   relatedEntityName === ENTITY_NAME.GROUP ||
//                   relatedEntityName === ENTITY_NAME.ORGANIZATION
//                     ? {
//                         [`${relatedEntityName}Id`]: relatedEntityId,
//                         [`${entityName}Id`]: entityId,
//                       }
//                     : relatedEntityId,
//               },
//             }
//           : {
//               disconnect: {
//                 [relationKey]:
//                   relatedEntityName === ENTITY_NAME.GROUP ||
//                   relatedEntityName === ENTITY_NAME.ORGANIZATION
//                     ? {
//                         [`${relatedEntityName}Id`]: relatedEntityId,
//                         [`${entityName}Id`]: entityId,
//                       }
//                     : relatedEntityId,
//               },
//             },
//       },
//       include: includeOptions,
//     }),
//     dbRelatedEntity.findUnique({
//       where: { id: relatedEntityId },
//     }),
//   ]);
//
//   if (!relatedEntity) {
//     throw new Error(
//       `${relatedEntityName.charAt(0).toUpperCase() + relatedEntityName.slice(1)} with ID ${relatedEntityId} not found`,
//     );
//   }
//
//   return [entity, relatedEntity] as [T, typeof relatedEntity];
// }

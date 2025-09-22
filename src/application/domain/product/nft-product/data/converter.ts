import { Prisma } from '@prisma/client';

export interface NftProductUpdateData {
  externalRef?: string;
}

export default class NftProductConverter {
  static toPrismaUpdateInput(data: NftProductUpdateData): Prisma.NftProductUpdateInput {
    const updateData: Prisma.NftProductUpdateInput = {};

    if (data.externalRef !== undefined) {
      updateData.externalRef = data.externalRef;
    }

    return updateData;
  }
}

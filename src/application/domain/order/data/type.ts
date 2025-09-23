export * from '../type';
import { Prisma } from '@prisma/client';

export const productSelectForValidation = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { nftProduct: true }
});

export type ProductForValidation = Prisma.ProductGetPayload<typeof productSelectForValidation>;

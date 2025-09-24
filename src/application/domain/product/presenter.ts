import { injectable } from 'tsyringe';
import { GqlProduct, GqlProductType } from '@/types/graphql';
import { PrismaProductForValidation } from './data/type';

@injectable()
export default class ProductPresenter {
  static toGraphQL(product: PrismaProductForValidation): GqlProduct {
    return {
      __typename: 'Product',
      id: product.id,
      name: product.name,
      price: product.price,
      type: product.type as GqlProductType,
      maxSupply: product.maxSupply,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

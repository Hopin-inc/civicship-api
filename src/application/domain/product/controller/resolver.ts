import { inject, injectable } from "tsyringe";
import {
  GqlQueryProductArgs,
  GqlProduct,
  GqlMutationProductBuyArgs,
  GqlProductBuyPayload,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import ProductUseCase from "@/application/domain/product/usecase";

@injectable()
export default class ProductResolver {
  constructor(@inject("ProductUseCase") private readonly productUseCase: ProductUseCase) {}

  Query = {
    product: async (
      _: unknown,
      args: GqlQueryProductArgs,
      ctx: IContext,
    ): Promise<GqlProduct | null> => {
      return null;
      // return this.productUseCase.userGetProduct(args, ctx);
    },
  };

  Mutation = {
    productBuy: async (
      _: unknown,
      { productId }: GqlMutationProductBuyArgs,
      ctx: IContext,
    ): Promise<GqlProductBuyPayload> => {
      return this.productUseCase.userBuyProduct(ctx, { productId });
    },
  };

  // Product = {
  //   remainingSupply: async (
  //     parent: PrismaProductDetail,
  //     _: unknown,
  //     ctx: IContext,
  //   ): Promise<number> => {
  //     return this.productUseCase.calculateRemainingSupply(ctx, parent.id);
  //   },
  //
  //   estimatedNextNumber: async (
  //     parent: PrismaProductDetail,
  //     _: unknown,
  //     ctx: IContext,
  //   ): Promise<number> => {
  //     return this.productUseCase.calculateEstimatedNextNumber(ctx, parent.id);
  //   },
  //
  //   isSoldOut: async (parent: PrismaProductDetail, _: unknown, ctx: IContext): Promise<boolean> => {
  //     const remaining = await this.productUseCase.calculateRemainingSupply(ctx, parent.id);
  //     return remaining <= 0;
  //   },
  // };
}

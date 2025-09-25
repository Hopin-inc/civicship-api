import "reflect-metadata";
import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import OrderUseCase from "../usecase";
import { GqlMutationOrderCreateArgs } from "@/types/graphql";

@injectable()
export default class OrderResolver {
  constructor(@inject("OrderUseCase") private readonly orderUseCase: OrderUseCase) {}

  Mutation = {
    orderCreate: async (_parent: unknown, args: GqlMutationOrderCreateArgs, ctx: IContext) => {
      return this.orderUseCase.userCreateOrder(ctx, args);
    },
  };
}

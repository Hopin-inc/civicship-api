import "reflect-metadata";
import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import OrderUseCase from '../usecase';

interface OrderCreateInput {
  productId: string;
  quantity: number;
  receiverAddress: string;
}

interface OrderCreateArgs {
  input: OrderCreateInput;
}

@injectable()
export default class OrderResolver {
  constructor(
    @inject("OrderUseCase") private readonly orderUseCase: OrderUseCase,
  ) {}

  Mutation = {
    orderCreate: async (
      _parent: unknown,
      args: OrderCreateArgs,
      ctx: IContext
    ) => {
      return this.orderUseCase.createOrder(ctx, args);
    },
  };
}

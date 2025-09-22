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
  constructor(@inject("OrderUseCase") private readonly useCase: OrderUseCase) {}

  Mutation = {
    orderCreate: async (
      _: unknown,
      args: OrderCreateArgs,
      ctx: IContext
    ) => {
      return this.useCase.createOrder(ctx, args);
    },
  };
}

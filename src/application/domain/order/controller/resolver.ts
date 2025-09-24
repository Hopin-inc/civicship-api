import "reflect-metadata";
import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import OrderUseCase from '../usecase';

@injectable()
export default class OrderResolver {
  constructor(
    @inject("OrderUseCase") private readonly orderUseCase: OrderUseCase,
  ) {}

  Mutation = {
    orderCreate: async (_parent: unknown, args: any, ctx: IContext) => {
      return this.orderUseCase.createOrder(ctx, args);
    },
  };
}

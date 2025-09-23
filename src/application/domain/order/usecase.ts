import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { getCurrentUserId } from '@/application/domain/utils';
import { buildCustomProps } from '@/infrastructure/libs/nmkr/customProps';
import { NmkrClient } from '@/infrastructure/libs/nmkr/api/client';
import logger from '@/infrastructure/logging';
import OrderService from './service';
import OrderPresenter from './presenter';

interface OrderCreateInput {
  productId: string;
  quantity: number;
  receiverAddress: string;
}

interface OrderCreateArgs {
  input: OrderCreateInput;
}

interface OrderCreateSuccess {
  __typename: 'OrderCreateSuccess';
  order: ReturnType<typeof OrderPresenter.toGraphQL>;
  paymentAddress: string;
  paymentDeadline: string;
  totalAmount: number;
  customProperty: string;
}

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
  ) {}

  async createOrder(
    ctx: IContext,
    args: OrderCreateArgs
  ): Promise<OrderCreateSuccess> {
    const currentUserId = getCurrentUserId(ctx);
    const { productId, quantity, receiverAddress } = args.input;

    logger.info("Order creation initiated", {
      userId: currentUserId,
      productId,
      quantity,
      receiverAddress
    });

    const { order } = await this.orderService.createWithReservation(ctx, {
      items: [{ productId, quantity }],
      receiverAddress
    });

    logger.info("Order created successfully", {
      orderId: order.id,
      userId: currentUserId,
      totalAmount: order.totalAmount
    });

    const orderItem = order.items[0];
    const customProps = {
      propsVersion: 1 as const,
      orderId: order.id,
      orderItemId: orderItem.id,
      userRef: currentUserId,
      receiverAddress
    };

    logger.info("Requesting NMKR payment address", {
      orderId: order.id,
      orderItemId: orderItem.id,
      externalRef: orderItem.product.nftProduct!.externalRef
    });

    const paymentResponse = await this.nmkrClient.getPaymentAddressForSpecificNftSale(
      orderItem.product.nftProduct!.externalRef!,
      1,
      orderItem.priceSnapshot.toString(),
      buildCustomProps(customProps),
      receiverAddress
    );

    if (!paymentResponse.paymentAddress || !paymentResponse.paymentAddressId) {
      throw new Error('NMKR payment address not received');
    }

    const externalRef = paymentResponse.paymentAddressId.toString();
    const updatedOrder = await this.orderService.updateOrderWithExternalRef(ctx, order.id, externalRef);

    logger.info("Order creation completed", {
      orderId: order.id,
      paymentAddress: paymentResponse.paymentAddress,
      paymentAddressId: paymentResponse.paymentAddressId
    });

    return {
      __typename: 'OrderCreateSuccess',
      order: OrderPresenter.toGraphQL(updatedOrder),
      paymentAddress: paymentResponse.paymentAddress,
      paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: order.totalAmount!,
      customProperty: buildCustomProps(customProps)
    };
  }
}

import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { buildCustomProps } from '@/application/domain/nmkr/customProps';
import InventoryService from '@/application/domain/product/inventory/service';
import { getCurrentUserId } from '@/application/domain/utils';
import logger from '@/infrastructure/logging';
import { Prisma } from '@prisma/client';
import { NmkrClient } from '@/infrastructure/libs/nmkr/api/client';
import OrderRepository from './data/repository';
import OrderConverter from './data/converter';
import OrderPresenter from './presenter';
import { OrderWithItems } from './type';

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
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
    @inject("InventoryService") private readonly inventoryService: InventoryService,
    @inject("OrderRepository") private readonly orderRepository: OrderRepository,
    @inject("OrderConverter") private readonly orderConverter: OrderConverter,
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

    const order = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: { 
          nftProduct: true
        }
      });

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      if (product.type !== 'NFT') {
        throw new Error(`Product is not an NFT: ${productId}`);
      }

      if (!product.nftProduct) {
        throw new Error(`NFT product not found for product: ${productId}`);
      }

      if (!product.nftProduct.externalRef) {
        throw new Error(`NFT product missing externalRef: ${productId}`);
      }

      const inventory = await this.inventoryService.calculateInventory(ctx, productId);
      if (inventory.available < quantity) {
        throw new Error(`Insufficient inventory. Available: ${inventory.available}, Requested: ${quantity}`);
      }

      await this.inventoryService.reserveInventory(tx, [{ productId, quantity }]);

      const totalAmount = product.price * quantity;
      const orderData = this.orderConverter.toPrismaCreateInput({
        userId: currentUserId,
        productId,
        quantity,
        priceSnapshot: product.price,
        totalAmount,
      });

      const createdOrder = await this.orderRepository.create(tx, orderData);

      logger.info("Order created successfully", {
        orderId: createdOrder.id,
        userId: currentUserId,
        totalAmount
      });

      return createdOrder;
    });

    const updatedOrder = await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      return await this.orderRepository.findById(tx, order.id);
    });

    if (!updatedOrder) {
      throw new Error(`Order not found: ${order.id}`);
    }

    const orderItem = updatedOrder.items[0];
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

    if (!paymentResponse.paymentAddress) {
      throw new Error('NMKR payment address not received');
    }

    if (!paymentResponse.paymentAddressId) {
      throw new Error('NMKR payment address ID not received');
    }

    const externalRef = paymentResponse.paymentAddressId.toString();

    await ctx.issuer.internal(async (tx: Prisma.TransactionClient) => {
      const updateData = this.orderConverter.toPrismaUpdateInput(externalRef);
      await this.orderRepository.update(tx, order.id, updateData);
    });

    logger.info("Order creation completed", {
      orderId: order.id,
      paymentAddress: paymentResponse.paymentAddress,
      paymentAddressId: paymentResponse.paymentAddressId
    });

    const orderWithExternalRef: OrderWithItems = {
      ...updatedOrder,
      externalRef,
    };

    return {
      __typename: 'OrderCreateSuccess',
      order: OrderPresenter.toGraphQL(orderWithExternalRef),
      paymentAddress: paymentResponse.paymentAddress,
      paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      totalAmount: order.totalAmount!,
      customProperty: buildCustomProps(customProps)
    };
  }
}

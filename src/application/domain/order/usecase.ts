import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { GqlOrderCreateInput, GqlOrderCreatePayload } from '@/types/graphql';
import { getCurrentUserId } from '@/application/domain/utils';
import { buildCustomProps, parseCustomProps } from '@/infrastructure/libs/nmkr/customProps';
import { NmkrClient } from '@/infrastructure/libs/nmkr/api/client';
import logger from '@/infrastructure/logging';
import OrderService from './service';
import ProductService from '@/application/domain/product/service';
import OrderPresenter from './presenter';
import NftMintWebhookService from '@/application/domain/account/nft-mint/webhook/service';
import NftMintService from '@/application/domain/account/nft-mint/service';
import { OrderStatus } from '@prisma/client';
import { 
  OrderValidationError, 
  InsufficientInventoryError, 
  ProductNotFoundError,
  NmkrApiError
} from './errors';

interface OrderCreateArgs {
  input: GqlOrderCreateInput;
}

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
    @inject("NftMintWebhookService") private readonly nftMintWebhookService: NftMintWebhookService,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
  ) {}

  async createOrder(
    ctx: IContext,
    args: OrderCreateArgs
  ): Promise<GqlOrderCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const { items, receiverAddress } = args.input;

    if (!items || items.length === 0) {
      throw new OrderValidationError('Order must contain at least one item', 'EMPTY_ORDER');
    }

    if (items.length > 1) {
      throw new OrderValidationError('Multiple items not yet supported', 'MULTIPLE_ITEMS_NOT_SUPPORTED');
    }

    const { productId, quantity } = items[0];

    logger.info("Order creation initiated", {
      userId: currentUserId,
      productId,
      quantity,
      receiverAddress
    });

    try {
      let order;
      
      await ctx.issuer.internal(async (tx) => {
        const product = await this.productService.validateProductForOrder(ctx, productId, tx);
        
        const inventoryBefore = await this.productService.calculateInventory(ctx, productId, tx);
        if (inventoryBefore.maxSupply != null && inventoryBefore.available < quantity) {
          throw new InsufficientInventoryError(
            `Insufficient inventory. Available: ${inventoryBefore.available}, Requested: ${quantity}`,
            productId,
            inventoryBefore.available,
            quantity
          );
        }
        
        order = await this.orderService.create(ctx, {
          userId: currentUserId,
          items: [{ productId, quantity, priceSnapshot: product.price }],
        }, tx);
        
        const inventoryAfter = await this.productService.calculateInventory(ctx, productId, tx);
        if (inventoryAfter.maxSupply != null && inventoryAfter.available < 0) {
          logger.error("Inventory oversold detected after order creation", {
            orderId: order.id,
            productId,
            inventoryBefore,
            inventoryAfter,
            requestedQuantity: quantity
          });
          throw new InsufficientInventoryError(
            `Inventory oversold. Available after creation: ${inventoryAfter.available}`,
            productId,
            inventoryAfter.available,
            quantity
          );
        }
        
        logger.info("Order creation inventory audit", {
          orderId: order.id,
          productId,
          inventoryBefore,
          inventoryAfter,
          requestedQuantity: quantity,
          correlationId: `order-${order.id}-${Date.now()}`
        });
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

      logger.info("Requesting NMKR payment transaction", {
        orderId: order.id,
        orderItemId: orderItem.id,
        externalRef: orderItem.product.nftProduct!.externalRef
      });

      const paymentResponse = await this.nmkrClient.createSpecificNftSale({
        projectuid: orderItem.product.nftProduct!.externalRef!,
        receiveraddress: receiverAddress,
        customproperties: buildCustomProps(customProps),
      });

      if (!paymentResponse.uid) {
        throw new NmkrApiError('NMKR payment transaction not created', 'PAYMENT_TRANSACTION_ERROR');
      }

      const externalRef = paymentResponse.uid;
      const updatedOrder = await this.orderService.updateOrderWithExternalRef(ctx, order.id, externalRef);

      logger.info("Order creation completed", {
        orderId: order.id,
        paymentTransactionUid: paymentResponse.uid,
        correlationId: `order-${order.id}-${Date.now()}`
      });

      return {
        __typename: 'OrderCreateSuccess',
        order: OrderPresenter.toGraphQL(updatedOrder),
        paymentLink: `https://nmkr.io/pay/${paymentResponse.uid}`,
        paymentProvider: 'NMKR_PAY' as const,
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalAmount: updatedOrder.totalAmount!,
        currency: 'JPY',
        customProperty: JSON.stringify(customProps),
      };
    } catch (error) {
      logger.warn('Order creation failed', { 
        userId: currentUserId, 
        items,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      if (error instanceof InsufficientInventoryError) {
        return {
          __typename: 'OrderCreateError',
          message: error.message,
          code: 'INSUFFICIENT_INVENTORY'
        };
      }
      
      if (error instanceof ProductNotFoundError) {
        return {
          __typename: 'OrderCreateError',
          message: error.message,
          code: 'PRODUCT_NOT_FOUND'
        };
      }
      
      if (error instanceof OrderValidationError) {
        return {
          __typename: 'OrderCreateError',
          message: error.message,
          code: error.code
        };
      }
      
      if (error instanceof NmkrApiError) {
        return {
          __typename: 'OrderCreateError',
          message: error.message,
          code: error.code
        };
      }
      
      return {
        __typename: 'OrderCreateError',
        message: 'Order creation failed',
        code: 'INTERNAL_ERROR'
      };
    }
  }

  async processNmkrWebhook(
    ctx: IContext,
    payload: {
      paymentTransactionUid: string;
      projectUid: string;
      state: string;
      paymentTransactionSubstate?: string;
      txHash?: string;
      customProperty?: string;
    }
  ): Promise<void> {
    const { paymentTransactionUid, state, paymentTransactionSubstate, txHash, customProperty } = payload;

    logger.info("Processing NMKR webhook", {
      paymentTransactionUid,
      state,
      substate: paymentTransactionSubstate,
      txHash,
    });

    if (!customProperty) {
      logger.warn("NMKR webhook missing customProperty", { paymentTransactionUid });
      return;
    }

    const customPropsResult = parseCustomProps(customProperty);
    if (!customPropsResult.success) {
      logger.error("NMKR webhook invalid customProperty", {
        paymentTransactionUid,
        error: customPropsResult.error,
      });
      return;
    }
    
    const { orderId, nftMintId } = customPropsResult.data;

    if (state === 'confirmed' && orderId) {
      await this.processOrderPayment(ctx, orderId, paymentTransactionUid);
      return;
    }

    if (nftMintId) {
      await this.nftMintWebhookService.processStateTransition(
        ctx,
        nftMintId,
        state,
        txHash,
        paymentTransactionUid
      );
      return;
    }

    logger.warn("NMKR webhook missing both orderId and nftMintId in customProperty", { paymentTransactionUid });
  }

  private async processOrderPayment(ctx: IContext, orderId: string, paymentTransactionUid: string): Promise<void> {
    logger.info("Processing order payment confirmation", { orderId, paymentTransactionUid });

    try {
      await ctx.issuer.internal(async (tx) => {
        const order = await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);

        for (const orderItem of order.items) {
          await this.nftMintService.createForOrderItem(
            ctx,
            orderItem.id,
            'system-wallet',
            tx
          );
        }

        const inventorySnapshots: Array<{
          orderItemId: string;
          productId: string;
          inventory: any;
        }> = [];
        for (const item of order.items) {
          const inventory = await this.productService.calculateInventory(ctx, item.productId, tx);
          inventorySnapshots.push({
            orderItemId: item.id,
            productId: item.productId,
            inventory
          });
        }
        
        logger.info("Inventory transfer audit", {
          orderId,
          paymentTransactionUid,
          transition: "PENDING->PAID",
          inventorySnapshots
        });

        logger.info("Order payment processed successfully", {
          orderId,
          paymentTransactionUid,
          itemCount: order.items.length,
          correlationId: `webhook-${paymentTransactionUid}-${Date.now()}`
        });
      });
    } catch (error) {
      logger.error("Failed to process order payment", {
        orderId,
        paymentTransactionUid,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
}

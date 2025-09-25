import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationOrderCreateArgs, GqlOrderCreatePayload } from "@/types/graphql";
import { getCurrentUserId } from "@/application/domain/utils";
import { buildCustomProps, parseCustomProps } from "@/infrastructure/libs/nmkr/customProps";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import logger from "@/infrastructure/logging";
import OrderService from "./service";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import NftMintService from "@/application/domain/reward/nft/nft-mint/service";
import { OrderStatus } from "@prisma/client";

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
  ) {}

  async userCreateOrder(
    ctx: IContext,
    args: GqlMutationOrderCreateArgs,
  ): Promise<GqlOrderCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const { items, receiverAddress } = args.input;

    if (!items || items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    if (items.length > 1) {
      throw new Error("Multiple items not yet supported");
    }

    const { productId, quantity } = items[0];

    try {
      let order;

      await ctx.issuer.internal(async (tx) => {
        const product = await this.productService.findOrThrowForOrder(ctx, productId, tx);

        const inventoryBefore = await this.productService.calculateInventory(ctx, productId, tx);
        if (inventoryBefore.maxSupply != null && inventoryBefore.available < quantity) {
          throw new Error(
            `Insufficient inventory. Available: ${inventoryBefore.available}, Requested: ${quantity}`,
          );
        }

        order = await this.orderService.createOrder(
          ctx,
          {
            userId: currentUserId,
            items: [{ productId, quantity, priceSnapshot: product.price }],
          },
          tx,
        );

        const inventoryAfter = await this.productService.calculateInventory(ctx, productId, tx);
        if (inventoryAfter.maxSupply != null && inventoryAfter.available < 0) {
          logger.error("Inventory oversold detected after order creation", {
            orderId: order.id,
            productId,
            inventoryBefore,
            inventoryAfter,
            requestedQuantity: quantity,
          });
          throw new Error("Inventory oversold detected after order creation");
        }
      });

      const orderItem = order.items[0];
      const customProps = {
        propsVersion: 1 as const,
        orderId: order.id,
        orderItemId: orderItem.id,
        userRef: currentUserId,
        receiverAddress,
      };

      const paymentResponse = await this.nmkrClient.createSpecificNftSale({
        projectuid: orderItem.product.nftProduct!.externalRef!,
        receiveraddress: receiverAddress,
        customproperties: buildCustomProps(customProps),
      });

      if (!paymentResponse.uid) {
        throw new Error("NMKR payment transaction not created");
      }

      const externalRef = paymentResponse.uid;
      const updatedOrder = await this.orderService.updateOrderWithExternalRef(
        ctx,
        order.id,
        externalRef,
      );

      return {
        __typename: "OrderCreateSuccess",
        order: OrderPresenter.create(updatedOrder),
        paymentLink: `https://nmkr.io/pay/${paymentResponse.uid}`,
        paymentProvider: "NMKR_PAY" as const,
        paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        totalAmount: updatedOrder.totalAmount!,
        currency: "JPY",
        customProperty: JSON.stringify(customProps),
      };
    } catch (error) {
      logger.warn("Order creation failed", {
        userId: currentUserId,
        items,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
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
    },
  ): Promise<void> {
    const { paymentTransactionUid, state, txHash, customProperty } = payload;

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

    if (state === "confirmed" && orderId) {
      await this.processOrderPayment(ctx, orderId, paymentTransactionUid);
      return;
    }

    if (nftMintId) {
      await this.nftMintService.processWebhookStateTransition(
        ctx,
        nftMintId,
        state,
        txHash,
        paymentTransactionUid,
      );
      return;
    }

    logger.warn("NMKR webhook missing both orderId and nftMintId in customProperty", {
      paymentTransactionUid,
    });
  }

  private async processOrderPayment(
    ctx: IContext,
    orderId: string,
    paymentTransactionUid: string,
  ): Promise<void> {
    try {
      await ctx.issuer.internal(async (tx) => {
        const order = await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);

        for (const orderItem of order.items) {
          await this.nftMintService.createForOrderItem(ctx, orderItem.id, "system-wallet", tx);
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
            inventory,
          });
        }
      });
    } catch (error) {
      logger.error("Failed to process order payment", {
        orderId,
        paymentTransactionUid,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

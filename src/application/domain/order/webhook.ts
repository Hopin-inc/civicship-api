import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlPaymentProvider } from "@/types/graphql";
import { parseCustomProps, CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import logger from "@/infrastructure/logging";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import { NftMintStatus, OrderStatus, Prisma } from "@prisma/client";
import { InventorySnapshot } from "@/application/domain/product/data/type";
import { IOrderItemService } from "@/application/domain/order/orderItem/data/interface";
import OrderService from "@/application/domain/order/service";

type NmkrWebhookPayload = {
  paymentTransactionUid: string;
  projectUid: string;
  state: string;
  paymentTransactionSubstate?: string;
  txHash?: string;
  customProperty?: string;
};

@injectable()
export default class OrderWebhook {
  constructor(
    @inject("OrderItemService") private readonly orderItemService: IOrderItemService,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("OrderService") private readonly orderService: OrderService,
  ) {}

  async processWebhook(
    ctx: IContext,
    payload: {
      provider: GqlPaymentProvider;
      projectUid: string;
      paymentTransactionUid: string;
      state: string;
      txHash?: string;
      customProperty?: string;
    },
  ): Promise<"NMKR" | "STRIPE" | "IGNORED"> {
    switch (payload.provider) {
      case GqlPaymentProvider.Nmkr:
        await this.processNmkrWebhook(ctx, payload);
        return "NMKR";
      case GqlPaymentProvider.Stripe:
        await this.processStripeWebhook(ctx, payload);
        return "STRIPE";
      default:
        logger.warn("[OrderWebhook] Unsupported payment provider", { provider: payload.provider });
        return "IGNORED";
    }
  }

  private async processNmkrWebhook(ctx: IContext, payload: NmkrWebhookPayload): Promise<void> {
    const { paymentTransactionUid, state, txHash, customProperty } = payload;

    const props = this.validateCustomProps(paymentTransactionUid, customProperty);
    if (!props) return;

    const { orderId, nftMintId } = props;

    await ctx.issuer.internal(async (tx) => {
      if (orderId && state === "confirmed") {
        await this.processOrderPayment(ctx, orderId, paymentTransactionUid, tx);
        return;
      }

      if (nftMintId) {
        await this.handleMintTransition(ctx, nftMintId, state, txHash, tx);
        return;
      }

      logger.warn("[OrderWebhook] No actionable IDs in customProperty", {
        paymentTransactionUid,
      });
    });
  }

  private async processStripeWebhook(ctx: IContext, payload: {
    provider: GqlPaymentProvider;
    projectUid: string;
    paymentTransactionUid: string;
    state: string;
    txHash?: string;
    customProperty?: string;
  }): Promise<void> {
    const { paymentTransactionUid, state, customProperty } = payload;

    logger.info("[OrderWebhook] Processing Stripe webhook", {
      paymentTransactionUid,
      state,
    });

    let customProps: CustomPropsV1 | null = null;
    if (customProperty) {
      const parsed = parseCustomProps(customProperty);
      if (parsed.success) {
        customProps = parsed.data;
      } else {
        logger.warn("[OrderWebhook] Invalid Stripe metadata", {
          paymentTransactionUid,
          error: parsed.error,
        });
      }
    }

    if (state === "succeeded" && customProps?.orderId) {
      const orderId = customProps.orderId;
      await ctx.issuer.internal(async (tx) => {
        await this.processOrderPayment(ctx, orderId, paymentTransactionUid, tx);
      });
    }else if (state === "payment_failed" && customProps?.orderId) {
      await this.orderService.updateOrderStatus(ctx, customProps.orderId, OrderStatus.FAILED);
      logger.info("[OrderWebhook] Stripe payment failed", {
        paymentTransactionUid,
        orderId: customProps.orderId,
      });
    } else {
      logger.info("[OrderWebhook] Stripe webhook processed", {
        paymentTransactionUid,
        state,
        hasCustomProps: !!customProps,
      });
    }
  }

  private validateCustomProps(paymentTransactionUid: string, raw?: string) {
    if (!raw) {
      logger.warn("[OrderWebhook] Missing customProperty", { paymentTransactionUid });
      return null;
    }
    const parsed = parseCustomProps(raw);
    if (!parsed.success) {
      logger.error("[OrderWebhook] Invalid customProperty", {
        paymentTransactionUid,
        error: parsed.error,
      });
      return null;
    }
    return parsed.data;
  }

  private async handleMintTransition(
    ctx: IContext,
    nftMintId: string,
    state: string,
    txHash: string | undefined,
    tx: Prisma.TransactionClient,
  ) {
    const status = this.mapNmkrState(state);
    if (!status) {
      logger.warn("[OrderWebhook] Unsupported NMKR state for mint transition", { state });
      return;
    }
    await this.nftMintService.processStateTransition(ctx, { nftMintId, status, txHash }, tx);
    logger.info("[OrderWebhook] NFT mint state transitioned", { nftMintId, status, state });
  }


  private async processOrderPayment(
    ctx: IContext,
    orderId: string,
    paymentTransactionUid: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const order = await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);
      logger.info("[OrderWebhook] Order marked as PAID", { orderId, paymentTransactionUid });

      for (const orderItem of order.items) {
        await this.nftMintService.createForOrderItem(ctx, orderItem.id, "system-wallet", tx);
        logger.debug("[OrderWebhook] NFT mint created for orderItem", {
          orderId,
          orderItemId: orderItem.id,
        });
      }

      // 在庫計算（今は返却先なし → 将来 InventoryService に移す想定）
      for (const item of order.items) {
        const inventory = await this.calculateInventory(ctx, item.productId, tx);
        logger.debug("[OrderWebhook] Inventory snapshot", {
          orderId,
          orderItemId: item.id,
          inventory,
        });
      }
    } catch (error) {
      logger.error("[OrderWebhook] Failed to process order payment", {
        orderId,
        paymentTransactionUid,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private async calculateInventory(
    ctx: IContext,
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<InventorySnapshot> {
    const product = await tx.product.findUnique({
      where: { id: productId },
      select: { maxSupply: true },
    });

    const [reserved, soldPendingMint, minted] = await Promise.all([
      this.orderItemService.countReservedByProduct(ctx, productId, tx),
      this.orderItemService.countSoldPendingMintByProduct(ctx, productId, tx),
      this.nftMintService.countMintedByProduct(ctx, productId, tx),
    ]);

    const maxSupply = product?.maxSupply ?? null;
    const available =
      maxSupply == null
        ? Number.MAX_SAFE_INTEGER
        : Math.max(0, maxSupply - reserved - soldPendingMint - minted);

    return { productId, reserved, soldPendingMint, minted, available, maxSupply };
  }

  private mapNmkrState(state: string): NftMintStatus | null {
    switch (state) {
      case "confirmed":
        return NftMintStatus.SUBMITTED;
      case "finished":
        return NftMintStatus.MINTED;
      case "canceled":
      case "expired":
        return NftMintStatus.FAILED;
      default:
        return null;
    }
  }
}

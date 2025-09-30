import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderService from "@/application/domain/order/service";
import ProductService from "@/application/domain/product/service";
import PaymentEventService from "@/application/domain/order/paymentEvent/service";
import { Prisma } from "@prisma/client";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";
import NftInstanceService from "@/application/domain/account/nft-instance/service";
import { WebhookMetadataError, PaymentStateTransitionError } from "@/errors/graphql";
import { OrderWithItems } from "@/application/domain/order/data/type";

type StripePayload = {
  id: string;
  state: string;
  metadata?: {
    orderId: string;
    nmkrProjectUid: string;
    nmkrNftUid: string;
    nftInstanceId: string;
  };
};

@injectable()
export default class OrderWebhook {
  constructor(
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("NftInstanceService") private readonly nftInstanceService: NftInstanceService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("PaymentEventService") private readonly paymentEventService: PaymentEventService,
  ) {}

  public async processStripeWebhook(ctx: IContext, payload: StripePayload): Promise<void> {
    const { id: paymentTransactionUid, state, metadata } = payload;

    logger.info("[OrderWebhook] Stripe webhook received", {
      paymentTransactionUid,
      state,
      metadata,
    });

    this.validateMetadata(metadata);
    const meta = metadata;

    await ctx.issuer.internal(async (tx) => {
      const shouldProcess = await this.paymentEventService.ensureEventIdempotency(
        ctx,
        paymentTransactionUid,
        `webhook.${state}`,
        meta.orderId,
        tx,
      );

      if (!shouldProcess) {
        logger.info("[OrderWebhook] Event already processed, skipping", {
          paymentTransactionUid,
          orderId: meta.orderId,
        });
        return;
      }

      switch (state) {
        case "succeeded":
          await this.processOrderPayment(ctx, {
            orderId: meta.orderId,
            paymentTransactionUid,
            tx,
            meta,
          });
          break;

        case "payment_failed":
        case "expired":
        case "canceled":
          await this.handleFailedOrder(ctx, meta.orderId, paymentTransactionUid, state, tx);
          break;

        default:
          logger.info("[OrderWebhook] Unhandled state; no-op", { orderId: meta.orderId, state });
      }
    });
  }

  private validateMetadata(meta?: StripeMetadata): asserts meta is Required<StripeMetadata> {
    if (!meta?.orderId || !meta?.nmkrProjectUid || !meta?.nmkrNftUid || !meta?.nftInstanceId) {
      logger.error("[OrderWebhook] Missing required metadata", { meta });
      throw new WebhookMetadataError("Missing required metadata", JSON.stringify(meta));
    }
  }

  private async handleFailedOrder(
    ctx: IContext,
    orderId: string,
    paymentTransactionUid: string,
    state: string,
    tx: Prisma.TransactionClient,
  ) {
    try {
      await this.orderService.handlePaymentFailure(ctx, orderId, tx);

      logger.info("[OrderWebhook] Payment failure handled", {
        orderId,
        paymentTransactionUid,
        state,
      });
    } catch (error) {
      logger.error("[OrderWebhook] Failed to handle payment failure", {
        orderId,
        state,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new PaymentStateTransitionError(
        "Failed to handle payment failure",
        orderId,
        state,
        "FAILED",
      );
    }
  }

  private async processOrderPayment(
    ctx: IContext,
    args: {
      orderId: string;
      paymentTransactionUid: string;
      tx: Prisma.TransactionClient;
      meta: StripeMetadata;
    },
  ): Promise<void> {
    const { orderId, paymentTransactionUid, tx, meta } = args;

    const order = await this.orderService.processPaymentCompletion(
      ctx,
      orderId,
      paymentTransactionUid,
      tx,
    );
    const wallet = await this.nftWalletService.ensureNmkrWallet(ctx, order.userId);

    await this.enqueueMintJobs(ctx, order, wallet, meta, tx);
    await this.productService.snapshotOrderInventory(ctx, order, tx);
  }

  private async enqueueMintJobs(
    ctx: IContext,
    order: OrderWithItems,
    wallet: PrismaNftWalletDetail,
    meta: { nmkrProjectUid?: string; nmkrNftUid?: string; nftInstanceId?: string } | null,
    tx: Prisma.TransactionClient,
  ) {
    const { nftInstanceId: metaNftInstanceId } = meta ?? {};

    for (const orderItem of order.items) {
      const nftInstanceId = await this.resolveInstanceId(ctx, metaNftInstanceId, wallet.id);

      const mint = await this.nftMintService.createMintRecord(ctx, orderItem.id, wallet.id, tx);

      if (nftInstanceId) {
        await this.nftInstanceService.markAsMinting(ctx, nftInstanceId, mint.id, wallet.id, tx);
      } else {
        logger.error("[OrderWebhook] No nftInstance found for nftUid", {
          orderId: order.id,
          orderItemId: orderItem.id,
          metaNftInstanceId,
        });
      }

      logger.info("[OrderWebhook] Mint job enqueued in QUEUED status", {
        orderId: order.id,
        orderItemId: orderItem.id,
        nftInstanceId,
        mintId: mint.id,
        status: mint.status,
      });
    }
  }

  private async resolveInstanceId(ctx: IContext, id: string | undefined, fallbackWalletId: string) {
    if (!id) return null;
    const found = await this.nftInstanceService.findInstanceById(ctx, id);
    return found ? found.id : fallbackWalletId;
  }
}

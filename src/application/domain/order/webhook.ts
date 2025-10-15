import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderService from "@/application/domain/order/service";
import OrderRepository from "@/application/domain/order/data/repository";
import PaymentEventService from "@/application/domain/order/paymentEvent/service";
import { Prisma, Provider } from "@prisma/client";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";
import NftInstanceService from "@/application/domain/account/nft-instance/service";
import { WebhookMetadataError, PaymentStateTransitionError } from "@/errors/graphql";
import { OrderWithItems } from "@/application/domain/order/data/type";
import { PrismaNftMint } from "@/application/domain/reward/nft-mint/data/type";

type PaymentMetadata = {
  orderId: string;
  nmkrProjectUid: string;
  nmkrNftUid: string;
  nftInstanceId: string;
};

type StripePayload = {
  id: string;
  state: string;
  metadata?: PaymentMetadata;
};

type SquarePayload = {
  id: string;
  state: string;
  orderId?: string;
};

type PaymentState = "succeeded" | "payment_failed" | "expired" | "canceled";

@injectable()
export default class OrderWebhook {
  constructor(
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("NftInstanceService") private readonly nftInstanceService: NftInstanceService,
    @inject("PaymentEventService") private readonly paymentEventService: PaymentEventService,
    @inject("OrderRepository") private readonly orderRepository: OrderRepository,
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

    await this.handlePaymentEvent(
      ctx,
      Provider.STRIPE,
      paymentTransactionUid,
      state as PaymentState,
      meta,
    );
  }

  public async processSquareWebhook(ctx: IContext, payload: SquarePayload): Promise<void> {
    const { id: paymentId, state, orderId } = payload;

    logger.info("[OrderWebhook] Square webhook received", {
      paymentId,
      state,
      orderId,
    });

    if (!orderId) {
      logger.error("[OrderWebhook] Missing orderId in Square webhook", { paymentId, state });
      throw new WebhookMetadataError("Missing orderId in Square webhook", JSON.stringify(payload));
    }

    const order = await this.orderRepository.findById(ctx, orderId);
    if (!order) {
      logger.error("[OrderWebhook] Order not found for Square payment", { orderId, paymentId });
      throw new WebhookMetadataError("Order not found", orderId);
    }

    const firstItem = order.items?.[0];
    if (!firstItem) {
      logger.error("[OrderWebhook] No order items found", { orderId });
      throw new WebhookMetadataError("No order items found", orderId);
    }

    const product = firstItem.product;
    if (!product) {
      logger.error("[OrderWebhook] Product not found for order", { orderId });
      throw new WebhookMetadataError("Product not found", orderId);
    }

    const nmkrIntegration = product.integrations?.find((i) => i.provider === Provider.NMKR);
    if (!nmkrIntegration) {
      logger.error("[OrderWebhook] NMKR integration not found for product", { 
        productId: product.id,
        orderId 
      });
      throw new WebhookMetadataError("NMKR integration not found", product.id);
    }

    const nftInstance = await this.nftInstanceService.findInstanceById(
      ctx,
      nmkrIntegration.externalRef,
    );
    
    const nftInstanceId = nftInstance?.id || nmkrIntegration.externalRef;

    const meta: PaymentMetadata = {
      orderId,
      nmkrProjectUid: nmkrIntegration.externalRef,
      nmkrNftUid: nmkrIntegration.externalRef,
      nftInstanceId,
    };

    await this.handlePaymentEvent(ctx, Provider.SQUARE, paymentId, state as PaymentState, meta);
  }

  private async handlePaymentEvent(
    ctx: IContext,
    provider: Provider,
    paymentId: string,
    state: PaymentState,
    metadata: PaymentMetadata,
  ): Promise<void> {
    logger.info("[OrderWebhook] Payment event received", {
      provider,
      paymentId,
      state,
      metadata,
    });

    await ctx.issuer.internal(async (tx) => {
      const shouldProcess = await this.paymentEventService.ensureEventIdempotency(
        ctx,
        paymentId,
        `webhook.${state}`,
        metadata.orderId,
        tx,
      );

      if (!shouldProcess) {
        logger.info("[OrderWebhook] Event already processed, skipping", {
          provider,
          paymentId,
        });
        return;
      }

      switch (state) {
        case "succeeded":
          await this.processOrderPayment(ctx, {
            orderId: metadata.orderId,
            paymentTransactionUid: paymentId,
            tx,
            meta: metadata,
          });
          break;

        case "payment_failed":
        case "expired":
        case "canceled":
          await this.handleFailedOrder(ctx, metadata.orderId, paymentId, state, tx);
          break;

        default:
          logger.info("[OrderWebhook] Unhandled state; no-op", {
            provider,
            orderId: metadata.orderId,
            state,
          });
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

      let mint: PrismaNftMint | null = null;
      if (nftInstanceId) {
        mint = await this.nftMintService.createMintRecord(
          ctx,
          orderItem.id,
          nftInstanceId,
          tx,
        );
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
        mintId: mint?.id ?? null,
        status: mint?.status ?? "SKIPPED",
      });
    }
  }

  private async resolveInstanceId(ctx: IContext, id: string | undefined, fallbackWalletId: string) {
    if (!id) return null;
    const found = await this.nftInstanceService.findInstanceById(ctx, id);
    return found ? found.id : fallbackWalletId;
  }
}

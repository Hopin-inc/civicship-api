import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderService from "@/application/domain/order/service";
import ProductService from "@/application/domain/product/service";
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

    switch (state) {
      case "succeeded":
        await ctx.issuer.internal(async (tx) => {
          await this.processOrderPayment(ctx, {
            orderId: meta.orderId,
            paymentTransactionUid,
            tx,
            meta,
          });
        });
        break;

      case "payment_failed":
      case "expired":
      case "canceled":
        await this.handleFailedOrder(ctx, meta.orderId, paymentTransactionUid, state);
        break;

      default:
        logger.info("[OrderWebhook] Unhandled state; no-op", { orderId: meta.orderId, state });
    }
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
  ) {
    try {
      await ctx.issuer.internal(async (tx) => {
        await this.orderService.handlePaymentFailure(ctx, orderId, tx);
      });

      logger.info("[OrderWebhook] Payment failure handled", {
        orderId,
        paymentTransactionUid,
        state,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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

    await this.processOrderItems(ctx, order, wallet, meta, tx);
    await this.productService.snapshotOrderInventory(ctx, order, tx);
  }

  private async processOrderItems(
    ctx: IContext,
    order: OrderWithItems,
    wallet: PrismaNftWalletDetail,
    meta: { nmkrProjectUid?: string; nmkrNftUid?: string; nftInstanceId?: string } | null,
    tx: Prisma.TransactionClient,
  ) {
    const { nmkrProjectUid, nmkrNftUid, nftInstanceId: metaNftInstanceId } = meta ?? {};

    for (const orderItem of order.items) {
      const nftInstanceId = await this.resolveInstanceId(ctx, metaNftInstanceId, wallet.id);

      const mint = await this.nftMintService.createMintRecord(ctx, orderItem.id, wallet.id, tx);

      if (nftInstanceId) {
        await this.nftInstanceService.markAsMinting(ctx, nftInstanceId, mint.id, wallet.id, tx);
      } else {
        logger.error("[OrderWebhook] No nftInstance found for nftUid", {
          orderId: order.id,
          orderItemId: orderItem.id,
          nmkrNftUid,
        });
      }

      logger.debug("[OrderWebhook] Mint record created & instance updated", {
        orderId: order.id,
        orderItemId: orderItem.id,
        nftInstanceId,
        mintId: mint.id,
      });

      if (nmkrProjectUid && nmkrNftUid) {
        await this.nftMintService.mintViaNmkr(
          ctx,
          {
            mintId: mint.id,
            projectUid: nmkrProjectUid,
            nftUid: nmkrNftUid,
            walletAddress: wallet.walletAddress,
            orderId: order.id,
            orderItemId: orderItem.id,
          },
          tx,
        );
      } else {
        logger.error("[OrderWebhook] Missing projectUid or nftUid; skip NMKR mint", {
          orderId: order.id,
          orderItemId: orderItem.id,
          nmkrProjectUid,
          nmkrNftUid,
        });
      }
    }
  }

  private async resolveInstanceId(ctx: IContext, id: string | undefined, fallbackWalletId: string) {
    if (!id) return null;
    const found = await this.nftInstanceService.findInstanceById(ctx, id);
    return found ? found.id : fallbackWalletId;
  }
}

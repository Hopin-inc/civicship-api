import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderService from "@/application/domain/order/service";
import { IOrderItemService } from "@/application/domain/order/orderItem/data/interface";
import { InventorySnapshot } from "@/application/domain/product/data/type";
import { Prisma, NftInstanceStatus } from "@prisma/client";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import {
  WebhookMetadataError,
  PaymentStateTransitionError,
} from "@/errors/graphql";
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
    @inject("OrderItemService") private readonly orderItemService: IOrderItemService,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("NftInstanceRepository") private readonly nftInstanceRepo: INftInstanceRepository,
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
        await this.orderService.processPaymentFailure(ctx, orderId, tx);

        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (order?.items) {
          for (const item of order.items) {
            const nftInstances = await tx.nftInstance.findMany({
              where: {
                productId: item.productId,
                status: NftInstanceStatus.RESERVED,
                communityId: ctx.communityId,
              },
              take: item.quantity,
              orderBy: { sequenceNum: "asc" },
            });

            for (const instance of nftInstances) {
              await this.nftInstanceRepo.releaseReservation(ctx, instance.id, tx);
            }
          }
        }
      });

      logger.info("[OrderWebhook] Marked order as FAILED and released reservations", {
        orderId,
        paymentTransactionUid,
        state,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new PaymentStateTransitionError(
        "Failed to update order status to FAILED and release reservations",
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

    const order = await this.markOrderPaid(ctx, orderId, paymentTransactionUid, tx);
    const wallet = await this.getOrCreateWallet(ctx, order.userId);

    await this.processOrderItems(ctx, order, wallet, meta, tx);
    await this.snapshotInventory(ctx, order, tx);
  }

  private async markOrderPaid(
    ctx: IContext,
    orderId: string,
    paymentTransactionUid: string,
    tx: Prisma.TransactionClient,
  ) {
    return await this.orderService.processPaymentCompletion(ctx, orderId, paymentTransactionUid, tx);
  }

  private async getOrCreateWallet(ctx: IContext, userId: string) {
    return await this.nftWalletService.ensureNmkrWallet(ctx, userId);
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
        await tx.nftInstance.update({
          where: { id: nftInstanceId },
          data: {
            nftMintId: mint.id,
            nftWalletId: wallet.id,
            status: NftInstanceStatus.MINTING,
          },
        });
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
        await this.nftMintService.mintViaNmkr(ctx, {
          mintId: mint.id,
          projectUid: nmkrProjectUid,
          nftUid: nmkrNftUid,
          walletAddress: wallet.walletAddress,
          orderId: order.id,
          orderItemId: orderItem.id,
        }, tx);
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
    const found = await ctx.issuer.public(ctx, (prisma) =>
      prisma.nftInstance.findFirst({
        where: { id },
        select: { id: true },
      }),
    );

    return found ? found.id : fallbackWalletId;
  }


  private async snapshotInventory(
    ctx: IContext,
    order: Awaited<ReturnType<OrderService["updateOrderStatus"]>>,
    tx: Prisma.TransactionClient,
  ) {
    for (const item of order.items) {
      const inventory = await this.calculateInventory(ctx, item.productId, tx);
      logger.debug("[OrderWebhook] Inventory snapshot", {
        orderId: order.id,
        orderItemId: item.id,
        inventory,
      });
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
        : Math.max(0, (maxSupply ?? 0) - reserved - soldPendingMint - minted);

    return { productId, reserved, soldPendingMint, minted, available, maxSupply };
  }

}

import crypto from "crypto";
import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";
import { parseCustomProps, CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderService from "@/application/domain/order/service";
import { IOrderItemService } from "@/application/domain/order/orderItem/data/interface";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import { InventorySnapshot } from "@/application/domain/product/data/type";
import { Prisma, OrderStatus, NftMintStatus, NftInstanceStatus } from "@prisma/client";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { 
  WebhookMetadataError, 
  NmkrMintingError, 
  NmkrTokenUnavailableError, 
  NmkrInsufficientCreditsError,
  PaymentStateTransitionError 
} from "@/errors/graphql";

type StripePayload = {
  id: string;
  state: string;
  customProperty?: string;
};

type NormalizedCustomProps = CustomPropsV1 & {
  projectUid?: string;
};

@injectable()
export default class OrderWebhook {
  constructor(
    @inject("OrderItemService") private readonly orderItemService: IOrderItemService,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
    @inject("NftInstanceRepository") private readonly nftInstanceRepo: INftInstanceRepository,
  ) {}

  public async processStripeWebhook(ctx: IContext, payload: StripePayload): Promise<void> {
    const { id: paymentTransactionUid, state, customProperty } = payload;

    logger.info("[OrderWebhook] Stripe webhook received", {
      paymentTransactionUid,
      state,
    });

    const meta = this.parseMeta(customProperty);
    if (!meta?.orderId) {
      logger.warn("[OrderWebhook] Missing orderId in metadata. Skip.");
      throw new WebhookMetadataError("Missing orderId in webhook metadata", customProperty);
    }

    if (state !== "succeeded") {
      if (state === "payment_failed") {
        try {
          await ctx.issuer.internal(async (tx) => {
            await this.orderService.updateOrderStatus(ctx, meta.orderId!, OrderStatus.FAILED, tx);
            
            const order = await tx.order.findUnique({
              where: { id: meta.orderId! },
              include: { items: true },
            });
            
            if (order?.items) {
              for (const item of order.items) {
                const nftInstances = await tx.nftInstance.findMany({
                  where: {
                    productId: item.productId,
                    status: NftInstanceStatus.RESERVED,
                  },
                  take: item.quantity,
                });
                
                for (const instance of nftInstances) {
                  await this.nftInstanceRepo.releaseReservation(ctx, instance.id, tx);
                }
              }
            }
          });
          
          logger.info("[OrderWebhook] Marked order as FAILED and released reservations", {
            orderId: meta.orderId,
            paymentTransactionUid,
          });
        } catch (error) {
          throw new PaymentStateTransitionError(
            "Failed to update order status to FAILED and release reservations",
            meta.orderId!,
            state,
            "FAILED",
          );
        }
      } else {
        logger.info("[OrderWebhook] Non-success state; no-op", {
          orderId: meta.orderId,
          state,
        });
      }
      return;
    }

    await ctx.issuer.internal(async (tx) => {
      await this.processOrderPayment(ctx, {
        orderId: meta.orderId!,
        paymentTransactionUid,
        tx,
        meta,
      });
    });
  }

  private async processOrderPayment(
    ctx: IContext,
    args: {
      orderId: string;
      paymentTransactionUid: string;
      tx: Prisma.TransactionClient;
      meta: ReturnType<OrderWebhook["parseMeta"]>;
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
    const order = await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);
    logger.info("[OrderWebhook] Order marked as PAID", { orderId, paymentTransactionUid });
    return order;
  }

  private async getOrCreateWallet(ctx: IContext, userId: string) {
    let wallet = await this.nftWalletService.checkIfExists(ctx, userId);
    if (!wallet) {
      wallet = await this.ensureNmkrWallet(ctx, userId);
    }
    return wallet;
  }

  private async processOrderItems(
    ctx: IContext,
    order: Awaited<ReturnType<OrderService["updateOrderStatus"]>>,
    wallet: PrismaNftWalletDetail,
    meta: { projectUid?: string; nftUid?: string } | null,
    tx: Prisma.TransactionClient,
  ) {
    const { projectUid, nftUid } = meta ?? {};

    for (const orderItem of order.items) {
      const nftInstanceId = await this.resolveInstanceId(ctx, nftUid, wallet.id);

      const mint = await this.nftMintService.createForOrderItem(ctx, orderItem.id, wallet.id, tx);

      logger.debug("[OrderWebhook] Mint record created", {
        orderId: order.id,
        orderItemId: orderItem.id,
        nftInstanceId,
        mintId: mint.id,
      });

      if (nftInstanceId) {
        await tx.nftInstance.update({
          where: { id: nftInstanceId },
          data: {
            nftMintId: mint.id,
            nftWalletId: wallet.id,
            status: NftInstanceStatus.MINTING,
          },
        });
      }

      logger.debug("[OrderWebhook] Mint record created & instance updated", {
        orderId: order.id,
        orderItemId: orderItem.id,
        nftInstanceId,
        mintId: mint.id,
      });

      if (projectUid && nftUid) {
        await this.tryMintViaNmkr(ctx, {
          order,
          orderItemId: orderItem.id,
          mintId: mint.id,
          projectUid,
          nftUid,
          walletAddress: wallet.walletAddress,
          tx,
        });
      } else {
        logger.warn("[OrderWebhook] Missing projectUid or nftUid; skip NMKR mint", {
          orderId: order.id,
          orderItemId: orderItem.id,
          projectUid,
          nftUid,
        });
      }
    }
  }

  private async resolveInstanceId(
    ctx: IContext,
    nftUid: string | undefined,
    fallbackWalletId: string,
  ) {
    if (!nftUid) return fallbackWalletId;

    const found = await ctx.issuer.public(ctx, (prisma) =>
      prisma.nftInstance.findFirst({
        where: { instanceId: nftUid },
        select: { id: true },
      }),
    );

    return found ? found.id : fallbackWalletId;
  }

  private async tryMintViaNmkr(
    ctx: IContext,
    args: {
      order: { id: string };
      orderItemId: string;
      mintId: string;
      projectUid: string;
      nftUid: string;
      walletAddress: string;
      tx: Prisma.TransactionClient;
    },
  ) {
    const { order, orderItemId, mintId, projectUid, nftUid, walletAddress, tx } = args;

    try {
      const res = await this.nmkrClient.mintAndSendSpecific(projectUid, nftUid, 1, walletAddress);
      logger.debug("[OrderWebhook] NMKR mint triggered", res);

      await this.nftMintService.processStateTransition(
        ctx,
        { nftMintId: mintId, status: NftMintStatus.SUBMITTED },
        tx,
      );

      logger.info("[OrderWebhook] NMKR mint triggered & marked SUBMITTED", {
        orderId: order.id,
        orderItemId,
        mintId,
        projectUid,
        nftUid,
        receiver: walletAddress,
      });
    } catch (e) {
      let nmkrError: NmkrMintingError;
      
      if (e instanceof Error && e.message.includes("404")) {
        nmkrError = new NmkrTokenUnavailableError(
          nftUid,
          order.id,
          orderItemId,
          mintId,
        );
      } else if (e instanceof Error && e.message.includes("402")) {
        nmkrError = new NmkrInsufficientCreditsError(order.id, orderItemId, mintId);
      } else {
        nmkrError = new NmkrMintingError(
          "NMKR minting operation failed",
          order.id,
          orderItemId,
          mintId,
          e,
        );
      }
      
      logger.error("[OrderWebhook] NMKR mint failed", {
        orderId: order.id,
        orderItemId,
        mintId,
        error: e instanceof Error ? e.message : String(e),
        details: e,
        errorType: nmkrError.constructor.name,
      });
      
      throw nmkrError;
    }
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

  private parseMeta(customProperty?: string): NormalizedCustomProps | null {
    if (!customProperty) return null;

    const parsed = parseCustomProps(customProperty);
    if (!parsed.success) {
      logger.warn("[OrderWebhook] parseCustomProps failed", { error: parsed.error });
      try {
        const fallback = JSON.parse(customProperty) as Record<string, string>;
        return {
          orderId: fallback.orderId,
          projectUid: fallback.projectUid || fallback.projectId,
          nftUid: fallback.nftUid || fallback.instanceId,
        };
      } catch {
        return null;
      }
    }

    const data = parsed.data;
    return {
      ...data,
      projectUid: data.projectUid ?? (data as { projectId?: string }).projectId,
      nftUid: data.nftUid,
    };
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

  private async ensureNmkrWallet(ctx: IContext, userId: string): Promise<PrismaNftWalletDetail> {
    const walletResponse = await this.nmkrClient.createWallet({
      walletName: userId,
      enterpriseaddress: true,
      walletPassword: crypto.randomBytes(32).toString("hex"),
    });

    logger.debug("[OrderWebhook] Created NMKR Managed wallet", {
      userId,
      address: walletResponse.address,
    });

    return this.nftWalletService.createInternalWallet(ctx, userId, walletResponse.address);
  }
}

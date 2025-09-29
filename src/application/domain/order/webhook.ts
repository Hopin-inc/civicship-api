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
import { Prisma, OrderStatus, NftMintStatus } from "@prisma/client";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";

type StripePayload = {
  /** Checkout Session ID or PaymentIntent ID */
  id: string;
  /** "succeeded" | "payment_failed" | ... */
  state: string;
  /**
   * JSON.stringify(metadata)
   * 期待キー例:
   * - orderId (必須)
   * - projectId or projectUid (NMKRプロジェクト)
   * - instanceId or nftUid    (NMKRトークンインスタンスID)
   * - userId / userRef, productId etc...
   */
  customProperty?: string;
};

@injectable()
export default class OrderWebhook {
  constructor(
    @inject("OrderItemService") private readonly orderItemService: IOrderItemService,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
  ) {}

  /**
   * Router側で Stripe のイベント（checkout.session.completed / payment_intent.succeeded 等）を受け、
   * 必要情報を詰めてこのメソッドに渡してください。
   */
  public async processStripeWebhook(ctx: IContext, payload: StripePayload): Promise<void> {
    const { id: paymentTransactionUid, state, customProperty } = payload;

    logger.info("[OrderWebhook] Stripe webhook received", {
      paymentTransactionUid,
      state,
    });

    // --- メタデータの抽出 ---
    const meta = this.parseMeta(customProperty);
    if (!meta?.orderId) {
      logger.warn("[OrderWebhook] Missing orderId in metadata. Skip.");
      return;
    }

    if (state !== "succeeded") {
      if (state === "payment_failed") {
        await this.orderService.updateOrderStatus(ctx, meta.orderId, OrderStatus.FAILED);
        logger.info("[OrderWebhook] Marked order as FAILED", {
          orderId: meta.orderId,
          paymentTransactionUid,
        });
      } else {
        logger.info("[OrderWebhook] Non-success state; no-op", {
          orderId: meta.orderId,
          state,
        });
      }
      return;
    }

    // --- 決済成功処理をトランザクションで ---
    await ctx.issuer.internal(async (tx) => {
      await this.processOrderPayment(ctx, {
        orderId: meta.orderId!,
        paymentTransactionUid,
        tx,
        meta,
      });
    });
  }

  // =========================
  // Core Business
  // =========================
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

    // 1) 注文を PAID に
    const order = await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);
    logger.info("[OrderWebhook] Order marked as PAID", { orderId, paymentTransactionUid });

    // 2) ユーザーのNFTウォレット確保（無ければNMKR Managed Wallet作成）
    const userId = order.userId;
    let wallet = await this.nftWalletService.checkIfExists(ctx, userId);
    if (!wallet) wallet = await this.ensureNmkrWallet(ctx, userId);

    // 3) アイテムごとに Mint レコード作成
    //    metadata.instanceId/nftUid があれば該当インスタンスに紐づけ。無ければユーザウォレットを紐づけ。
    const { instanceId, projectUid } = meta ?? {};

    for (const orderItem of order.items) {
      let targetNftInstanceId = wallet.id;

      if (instanceId) {
        const found = await ctx.issuer.public(ctx, (prisma) =>
          prisma.nftInstance.findFirst({
            where: { instanceId },
            select: { id: true },
          }),
        );
        if (found) targetNftInstanceId = found.id;
      }

      const mint = await this.nftMintService.createForOrderItem(ctx, orderItem.id, wallet.id, tx);

      logger.debug("[OrderWebhook] Mint record created", {
        orderId,
        orderItemId: orderItem.id,
        nftInstanceId: targetNftInstanceId,
        mintId: mint.id,
      });

      // 4) NMKR ミント実行（metadata に必要情報がある時のみ）
      if (projectUid && instanceId) {
        try {
          await this.nmkrClient.mintAndSendSpecific(
            projectUid,
            instanceId,
            1,
            wallet.walletAddress,
          );

          // 送信開始＝SUBMITTED としておく（実チェーン反映はNMKRの別Webhookで最終確定が良い）
          await this.nftMintService.processStateTransition(
            ctx,
            { nftMintId: mint.id, status: NftMintStatus.SUBMITTED },
            tx,
          );

          logger.info("[OrderWebhook] NMKR mint triggered & marked SUBMITTED", {
            orderId,
            orderItemId: orderItem.id,
            mintId: mint.id,
            projectUid,
            instanceId,
            receiver: wallet.walletAddress,
          });
        } catch (e) {
          logger.error("[OrderWebhook] NMKR mint failed", {
            orderId,
            orderItemId: orderItem.id,
            mintId: mint.id,
            error: e instanceof Error ? e.message : String(e),
          });
          // ここで FAILED に倒すかは運用方針次第（リトライ設計があるならSUBMITTEDのまま or 専用状態を用意）
          // await this.nftMintService.processStateTransition(ctx, { nftMintId: mint.id, status: NftMintStatus.FAILED }, tx);
        }
      } else {
        logger.warn("[OrderWebhook] Missing projectUid or instanceId in metadata; skip NMKR mint", {
          orderId,
          orderItemId: orderItem.id,
          projectUid,
          instanceId,
        });
      }
    }

    // 5) 在庫ログ（任意）
    for (const item of order.items) {
      const inventory = await this.calculateInventory(ctx, item.productId, tx);
      logger.debug("[OrderWebhook] Inventory snapshot", {
        orderId,
        orderItemId: item.id,
        inventory,
      });
    }
  }

  // =========================
  // Helpers
  // =========================
  private parseMeta(customProperty?: string):
    | (CustomPropsV1 & {
        projectUid?: string; // projectId / projectUid の正規化
        instanceId?: string; // instanceId / nftUid の正規化
      })
    | null {
    if (!customProperty) return null;

    const parsed = parseCustomProps(customProperty);
    if (!parsed.success) {
      logger.warn("[OrderWebhook] parseCustomProps failed", { error: parsed.error });
      // Stripe metadata が CustomPropsV1 形式じゃない時の保険: 素朴パース
      try {
        const fallback = JSON.parse(customProperty) as Record<string, string>;
        return {
          orderId: fallback.orderId,
          projectUid: fallback.projectUid || fallback.projectId,
          instanceId: fallback.instanceId || fallback.nftUid,
          // 必要なら他フィールドも拾う
        } as any;
      } catch {
        return null;
      }
    }

    const data = parsed.data;
    return {
      ...data,
      projectUid: (data as any).projectUid || (data as any).projectId,
      instanceId: (data as any).instanceId || (data as any).nftUid,
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

  /**
   * NMKR Managed Wallet 作成 → 内部ウォレットとして登録
   * ※ 独自のウォレット生成があるならここを差し替え
   */
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

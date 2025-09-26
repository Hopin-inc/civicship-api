import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import {
  GqlMutationOrderCreateArgs,
  GqlOrderCreatePayload,
  GqlPaymentProvider,
} from "@/types/graphql";
import { CustomPropsV1, parseCustomProps } from "@/infrastructure/libs/nmkr/customProps";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import logger from "@/infrastructure/logging";
import OrderService from "./service";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import NftMintService from "@/application/domain/reward/nft-mint/service";
import { NftMintStatus, OrderStatus, Prisma } from "@prisma/client";
import { InventorySnapshot } from "@/application/domain/product/data/type";
import { IOrderItemService } from "@/application/domain/order/orderItem/data/interface";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderConverter from "@/application/domain/order/data/converter";
import { getCurrentUserId } from "@/application/domain/utils";

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("OrderItemService") private readonly orderItemService: IOrderItemService,
    @inject("NftMintService") private readonly nftMintService: NftMintService,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
  ) {}

  async userCreateOrder(
    ctx: IContext,
    { productId }: GqlMutationOrderCreateArgs,
  ): Promise<GqlOrderCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    // const currentUserId = "cmfzidhe3000n8zta98ux2kil";
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const order = await ctx.issuer.internal(async (tx) => {
      return this.orderService.createOrder(
        ctx,
        {
          userId: currentUserId,
          items: [{ productId, quantity: 1, priceSnapshot: product.price }],
        },
        tx,
      );
    });

    let nftWallet = await this.nftWalletService.checkIfExists(ctx, currentUserId);
    if (!nftWallet) {
      const parentCustomerId = Number(process.env.NMKR_CUSTOMER_ID);
      try {
        const walletResponse = await this.nmkrClient.createWallet(parentCustomerId, {
          walletName: currentUserId,
          enterpriseaddress: true,
          walletPassword: "stringstring",
        });

        logger.debug("Created NMKR Managed wallet", walletResponse);

        nftWallet = await ctx.issuer.internal((tx) =>
          this.nftWalletService.createInternalWallet(
            ctx,
            currentUserId,
            walletResponse.address,
            tx,
          ),
        );
      } catch (error) {
        logger.error("Failed to create NMKR Managed wallet", {
          userId: currentUserId,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    }

    const customProps: CustomPropsV1 = {
      orderId: order.id,
      userRef: currentUserId,
    };
    const paymenttransaction = this.converter.nmkrPaymentTransactionInput(
      product,
      nftWallet,
      customProps,
    );

    let paymentUid: string;
    let paymentUrl: string;
    try {
      const paymentResponse = await this.nmkrClient.createSpecificNftSale(paymenttransaction);
      logger.debug("Created NMKR payment transaction", paymentResponse);

      const paymentAddressId = paymentResponse.paymentAddressId;
      const paymentAddress = paymentResponse.paymentAddress;

      if (!paymentAddressId) {
        throw new Error("NMKR payment transaction not created");
      }
      paymentUid = paymentAddressId.toString();
      paymentUrl = paymentAddress || "";
    } catch (err) {
      await this.safeMarkOrderFailed(ctx, order.id, err);
      throw err;
    }

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentUid);
    return OrderPresenter.create(paymentUrl);
  }

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
      // case "STRIPE":
      // return this.processStripeWebhook(ctx, payload);
      default:
        logger.warn("Unsupported payment provider", { provider: payload.provider });
        return "IGNORED";
    }
  }

  private async processNmkrWebhook(
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

    let handled = false;
    await ctx.issuer.internal(async (tx) => {
      if (state === "confirmed" && orderId) {
        await this.processOrderPayment(ctx, orderId, paymentTransactionUid, tx);
        handled = true;
        return;
      }
      if (nftMintId) {
        const status = this.mapNmkrState(state);
        await this.nftMintService.processStateTransition(ctx, { nftMintId, status, txHash }, tx);
        handled = true;
        return;
      }
    });
    if (!handled) {
      logger.warn("NMKR webhook missing both orderId and nftMintId in customProperty", {
        paymentTransactionUid,
      });
    }
  }

  private async processOrderPayment(
    ctx: IContext,
    orderId: string,
    paymentTransactionUid: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    try {
      const order = await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.PAID, tx);

      for (const orderItem of order.items) {
        await this.nftMintService.createForOrderItem(ctx, orderItem.id, "system-wallet", tx);
      }

      const inventorySnapshots: Array<{
        orderItemId: string;
        productId: string;
        inventory: InventorySnapshot;
      }> = [];
      for (const item of order.items) {
        const inventory = await this.calculateInventory(ctx, item.productId, tx);
        inventorySnapshots.push({
          orderItemId: item.id,
          productId: item.productId,
          inventory,
        });
      }
    } catch (error) {
      logger.error("Failed to process order payment", {
        orderId,
        paymentTransactionUid,
        error: error instanceof Error ? error.message : "Unknown error",
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

  private async safeMarkOrderFailed(ctx: IContext, orderId: string, cause: unknown) {
    try {
      await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.CANCELED);
    } catch (updateErr) {
      logger.error("Failed to mark order as FAILED after NMKR error", {
        orderId,
        nmkrError: cause instanceof Error ? cause.message : String(cause),
        updateError: updateErr instanceof Error ? updateErr.message : String(updateErr),
      });
    }
  }

  private mapNmkrState(state: string): NftMintStatus {
    switch (state) {
      case "confirmed":
        return NftMintStatus.SUBMITTED;
      case "finished":
        return NftMintStatus.MINTED;
      case "canceled":
      case "expired":
        return NftMintStatus.FAILED;
      default:
        throw new Error(`Unsupported NMKR state: ${state}`);
    }
  }
}

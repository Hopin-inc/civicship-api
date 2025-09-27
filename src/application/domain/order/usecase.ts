import crypto from "crypto";
import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationOrderCreateArgs, GqlOrderCreatePayload, GqlPaymentProvider } from "@/types/graphql";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { NmkrClient } from "@/infrastructure/libs/nmkr/api/client";
import { StripeClient } from "@/infrastructure/libs/stripe/api/client";
import { getCurrentUserId } from "@/application/domain/utils";
import logger from "@/infrastructure/logging";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import { OrderStatus, PaymentProvider } from "@prisma/client";
import NFTWalletService from "@/application/domain/account/nft-wallet/service";
import OrderConverter from "@/application/domain/order/data/converter";
import OrderService from "@/application/domain/order/service";
import { PrismaProduct } from "@/application/domain/product/data/type";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("NFTWalletService") private readonly nftWalletService: NFTWalletService,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
    @inject("StripeClient") private readonly stripeClient: StripeClient,
  ) {}

  async userCreateOrder(
    ctx: IContext,
    { productId, paymentProvider = GqlPaymentProvider.Nmkr }: GqlMutationOrderCreateArgs,
  ): Promise<GqlOrderCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const order = await ctx.issuer.internal((tx) =>
      this.orderService.createOrder(
        ctx,
        {
          userId: currentUserId,
          items: [{ productId, quantity: 1, priceSnapshot: product.price }],
          paymentProvider: paymentProvider === GqlPaymentProvider.Stripe ? PaymentProvider.STRIPE : PaymentProvider.NMKR,
        },
        tx,
      ),
    );

    const customProps: CustomPropsV1 = {
      orderId: order.id,
      userRef: currentUserId,
    };

    const paymentResult = await this.createPaymentForProvider(
      ctx,
      paymentProvider,
      product,
      customProps,
      currentUserId
    );

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentResult.uid);
    return OrderPresenter.create(paymentResult.url);
  }

  private async ensureWallet(ctx: IContext, userId: string) {
    const nftWallet = await this.nftWalletService.checkIfExists(ctx, userId);
    if (nftWallet) return nftWallet;

    const parentCustomerId = Number(process.env.NMKR_CUSTOMER_ID);
    try {
      const walletResponse = await this.nmkrClient.createWallet(parentCustomerId, {
        walletName: userId,
        enterpriseaddress: true,
        walletPassword: crypto.randomBytes(32).toString("hex"),
      });

      logger.debug("[OrderUseCase] Created NMKR Managed wallet", {
        userId,
        response: walletResponse,
      });

      return await ctx.issuer.internal((tx) =>
        this.nftWalletService.createInternalWallet(ctx, userId, walletResponse.address, tx),
      );
    } catch (error) {
      logger.error("[OrderUseCase] Failed to create NMKR Managed wallet", { userId, error });
      throw error;
    }
  }

  private async createPaymentTransaction(
    ctx: IContext,
    product: PrismaProduct,
    nftWallet: PrismaNftWalletDetail,
    customProps: CustomPropsV1,
  ): Promise<{ uid: string; url: string }> {
    try {
      const payload = this.converter.nmkrPaymentTransactionInput(product, nftWallet, customProps);

      const paymentResponse = await this.nmkrClient.createSpecificNftSale(payload);
      const { paymentTransactionUid, nmkrPayUrl } = paymentResponse;
      if (!paymentTransactionUid || !nmkrPayUrl) {
        throw new Error("NMKR payment transaction not created");
      }

      logger.debug("[OrderUseCase] Created NMKR payment transaction", {
        orderId: customProps.orderId,
        paymentTransactionUid,
      });

      return {
        uid: paymentTransactionUid,
        url: nmkrPayUrl,
      };
    } catch (error) {
      if (customProps.orderId) {
        await this.safeMarkOrderFailed(ctx, customProps.orderId, error);
      }
      logger.error("[OrderUseCase] Failed to create NMKR payment transaction", {
        orderId: customProps.orderId,
        error,
      });
      throw error;
    }
  }

  private async createPaymentForProvider(
    ctx: IContext,
    paymentProvider: GqlPaymentProvider,
    product: PrismaProduct,
    customProps: CustomPropsV1,
    currentUserId: string,
  ): Promise<{ uid: string; url: string }> {
    if (paymentProvider === GqlPaymentProvider.Stripe) {
      return this.createStripePaymentIntent(ctx, product, customProps);
    } else {
      const nftWallet = await this.ensureWallet(ctx, currentUserId);
      return this.createPaymentTransaction(ctx, product, nftWallet, customProps);
    }
  }

  private async createStripePaymentIntent(
    ctx: IContext,
    product: PrismaProduct,
    customProps: CustomPropsV1,
  ): Promise<{ uid: string; url: string }> {
    try {
      const frontendUrl = process.env.FRONTEND_URL;
      if (!frontendUrl) {
        throw new Error("FRONTEND_URL environment variable is required for Stripe payments");
      }

      const paymentIntentParams = this.converter.stripePaymentIntentInput(product, customProps);
      const paymentIntent = await this.stripeClient.createPaymentIntent(paymentIntentParams);

      logger.debug("[OrderUseCase] Created Stripe payment intent", {
        orderId: customProps.orderId,
        paymentIntentId: paymentIntent.id,
      });

      return {
        uid: paymentIntent.id,
        url: `${frontendUrl}/payment/${paymentIntent.id}?client_secret=${paymentIntent.client_secret}`,
      };
    } catch (error) {
      if (customProps.orderId) {
        await this.safeMarkOrderFailed(ctx, customProps.orderId, error);
      }
      logger.error("[OrderUseCase] Failed to create Stripe payment intent", {
        orderId: customProps.orderId,
        error,
      });
      throw error;
    }
  }

  private async safeMarkOrderFailed(ctx: IContext, orderId: string, cause: unknown) {
    try {
      await this.orderService.updateOrderStatus(ctx, orderId, OrderStatus.CANCELED);
    } catch (updateErr) {
      logger.error("[OrderUseCase] Failed to mark order as FAILED after NMKR error", {
        orderId,
        nmkrError: cause instanceof Error ? cause.message : String(cause),
        updateError: updateErr instanceof Error ? updateErr.message : String(updateErr),
      });
    }
  }
}

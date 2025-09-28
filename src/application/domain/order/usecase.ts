import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationOrderCreateArgs, GqlOrderCreatePayload } from "@/types/graphql";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { StripeClient } from "@/infrastructure/libs/stripe";
import { getCurrentUserId } from "@/application/domain/utils";
import { validateEnvironmentVariables } from "@/infrastructure/config/validation";
import logger from "@/infrastructure/logging";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import { OrderStatus, PaymentProvider } from "@prisma/client";
import OrderConverter from "@/application/domain/order/data/converter";
import OrderService from "@/application/domain/order/service";
import { PrismaProduct } from "@/application/domain/product/data/type";

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("StripeClient") private readonly stripeClient: StripeClient,
  ) {}

  async userCreateOrder(
    ctx: IContext,
    { productId }: GqlMutationOrderCreateArgs,
  ): Promise<GqlOrderCreatePayload> {
    const currentUserId = getCurrentUserId(ctx);
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const order = await ctx.issuer.internal((tx) =>
      this.orderService.createOrder(
        ctx,
        {
          userId: currentUserId,
          items: [{ productId, quantity: 1, priceSnapshot: product.price }],
          paymentProvider: PaymentProvider.STRIPE,
        },
        tx,
      ),
    );

    const customProps: CustomPropsV1 = {
      orderId: order.id,
      userRef: currentUserId,
    };

    const paymentResult = await this.createStripePaymentIntent(ctx, product, customProps);

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentResult.uid);
    return OrderPresenter.create(paymentResult.url);
  }




  private async createStripePaymentIntent(
    ctx: IContext,
    product: PrismaProduct,
    customProps: CustomPropsV1,
  ): Promise<{ uid: string; url: string }> {
    try {
      const config = validateEnvironmentVariables();
      const paymentIntentParams = this.converter.stripePaymentIntentInput(product, customProps);
      const paymentIntent = await this.stripeClient.createPaymentIntent(paymentIntentParams);

      logger.debug("[OrderUseCase] Created Stripe payment intent", {
        orderId: customProps.orderId,
        paymentIntentId: paymentIntent.id,
      });

      return {
        uid: paymentIntent.id,
        url: `${config.frontendUrl}/payment/${paymentIntent.id}?client_secret=${paymentIntent.client_secret}`,
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

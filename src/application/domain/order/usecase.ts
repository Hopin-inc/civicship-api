import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationOrderCreateArgs, GqlOrderCreatePayload } from "@/types/graphql";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { StripeClient } from "@/infrastructure/libs/stripe";
import logger from "@/infrastructure/logging";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import { PaymentProvider } from "@prisma/client";
import OrderConverter from "@/application/domain/order/data/converter";
import OrderService from "@/application/domain/order/service";
import { PrismaProduct } from "@/application/domain/product/data/type";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { 
  InventoryUnavailableError, 
  PaymentSessionCreationError 
} from "@/errors/graphql";

@injectable()
export default class OrderUseCase {
  constructor(
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("StripeClient") private readonly stripeClient: StripeClient,
    @inject("NftInstanceRepository") private readonly nftInstanceRepo: INftInstanceRepository,
  ) {}

  async userCreateOrder(
    ctx: IContext,
    { productId }: GqlMutationOrderCreateArgs,
  ): Promise<GqlOrderCreatePayload> {
    // const currentUserId = getCurrentUserId(ctx);
    const currentUserId = "cmg4qdxub000n8zjbfr16vtsw";
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const order = await this.orderService.createOrder(ctx, {
      userId: currentUserId,
      items: [{ productId, quantity: 1, priceSnapshot: product.price }],
      paymentProvider: PaymentProvider.STRIPE,
    });

    const customProps: CustomPropsV1 = {
      orderId: order.id,
      userId: currentUserId,
    };

    const paymentResult = await this.reserveInstanceAndCreateStripePayment(
      ctx,
      product,
      customProps,
    );

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentResult.uid);
    return OrderPresenter.create(paymentResult.url);
  }

  private async reserveInstanceAndCreateStripePayment(
    ctx: IContext,
    product: PrismaProduct,
    customProps: CustomPropsV1,
  ): Promise<{ uid: string; url: string }> {
    return ctx.issuer.internal(async (tx) => {
      try {
        const nftInstance = await this.nftInstanceRepo.findAndReserveInstance(
          ctx,
          ctx.communityId,
          product.id,
          tx,
        );

        logger.debug("[OrderUseCase] Reserved NFT instance", { nftInstance });

        if (!nftInstance) {
          throw new InventoryUnavailableError(product.id, ctx.communityId, customProps.orderId);
        }

        const sessionParams = this.converter.stripeCheckoutSessionInput(
          product,
          nftInstance.instanceId,
          customProps,
        );
        const session = await this.stripeClient.createCheckoutSession(sessionParams);

        logger.debug("[OrderUseCase] Created Stripe checkout session", {
          orderId: customProps.orderId,
          sessionId: session.id,
          instanceId: nftInstance.instanceId,
          customProps: customProps,
        });

        return {
          uid: session.id,
          url: session.url ?? "",
        };
      } catch (error) {
        logger.error("[OrderUseCase] Failed to reserve instance and create Stripe payment session", {
          orderId: customProps.orderId,
          error,
        });
        
        if (error instanceof InventoryUnavailableError) {
          throw error;
        }
        
        throw new PaymentSessionCreationError(
          "Failed to create Stripe checkout session",
          customProps.orderId,
          error,
        );
      }
    });
  }

}

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
import { InventoryUnavailableError, PaymentSessionCreationError } from "@/errors/graphql";

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
    const currentUserId = "cmg546cxo000g8zfb6dgpeqcf";
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const order = await this.orderService.createOrder(ctx, {
      userId: currentUserId,
      items: [{ productId, quantity: 1, priceSnapshot: product.price }],
      paymentProvider: PaymentProvider.STRIPE,
    });

    const paymentResult = await this.reserveInstanceAndCreateStripePayment(ctx, order.id, product);

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentResult.uid);
    return OrderPresenter.create(paymentResult.url);
  }

  private async reserveInstanceAndCreateStripePayment(
    ctx: IContext,
    orderId: string,
    product: PrismaProduct,
  ): Promise<{ uid: string; url: string }> {
    return ctx.issuer.internal(async (tx) => {
      try {
        const nftInstance = await this.nftInstanceRepo.findAndReserveInstance(
          ctx,
          ctx.communityId,
          product.id,
          tx,
        );

        if (!nftInstance) {
          throw new InventoryUnavailableError(product.id, ctx.communityId);
        }

        const nftInstanceId = nftInstance["instance_id"];

        logger.debug("[NftInstanceRepository] Reserved NFT instance", {
          instanceId: nftInstanceId,
          communityId: ctx.communityId,
          productId: product.id,
          sequenceNum: nftInstance.sequenceNum,
        });

        const customProps: CustomPropsV1 = {
          orderId: orderId,
          nftInstanceId: nftInstance.id,
          nmkrProjectUid: product.nftProduct?.nmkrProjectId ?? "",
          nmkrNftUid: nftInstanceId,
        };

        const sessionParams = this.converter.stripeCheckoutSessionInput(product, customProps);
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
        logger.error(
          "[OrderUseCase] Failed to reserve instance and create Stripe payment session",
          {
            orderId,
            error,
          },
        );

        if (error instanceof InventoryUnavailableError) {
          throw error;
        }

        throw new PaymentSessionCreationError(
          "Failed to create Stripe checkout session",
          orderId,
          error,
        );
      }
    });
  }
}

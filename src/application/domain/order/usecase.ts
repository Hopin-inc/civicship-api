import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { GqlMutationOrderCreateArgs, GqlOrderCreatePayload } from "@/types/graphql";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";
import { StripeClient } from "@/infrastructure/libs/stripe/client";
import logger from "@/infrastructure/logging";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import { PaymentProvider } from "@prisma/client";
import OrderConverter from "@/application/domain/order/data/converter";
import OrderService from "@/application/domain/order/service";
import { PrismaProduct } from "@/application/domain/product/data/type";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { InventoryUnavailableError, PaymentSessionCreationError } from "@/errors/graphql";
import { OrderWithItems } from "@/application/domain/order/data/type";

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
    const currentUserId = "cmg546cy0000n8zfb5mru7sl3";
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const order = await this.orderService.createOrder(ctx, {
      userId: currentUserId,
      items: [{ productId, quantity: 1, priceSnapshot: product.price }],
      paymentProvider: PaymentProvider.STRIPE,
    });

    const paymentResult = await this.reserveInstanceAndCreateStripePayment(ctx, order, product);

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentResult.uid);
    return OrderPresenter.create(paymentResult.url);
  }

  private async reserveInstanceAndCreateStripePayment(
    ctx: IContext,
    order: OrderWithItems,
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

        const metadata: StripeMetadata = {
          orderId: order.id,
          orderItemId: order.items?.[0].id,
          nftInstanceId: nftInstance.id,
          nmkrProjectUid: product.nftProduct?.nmkrProjectId ?? "",
          nmkrNftUid: nftInstanceId,
        };

        const sessionParams = this.converter.stripeCheckoutSessionInput(product, metadata);
        const session = await this.stripeClient.createCheckoutSession(sessionParams);

        logger.debug("[OrderUseCase] Created Stripe checkout session", {
          sessionId: session.id,
          metadata: metadata,
        });

        return {
          uid: session.id,
          url: session.url ?? "",
        };
      } catch (error) {
        logger.error(
          "[OrderUseCase] Failed to reserve instance and create Stripe payment session",
          {
            orderId: order.id,
            error,
          },
        );

        if (error instanceof InventoryUnavailableError) {
          throw error;
        }

        throw new PaymentSessionCreationError(
          "Failed to create Stripe checkout session",
          order.id,
          error,
        );
      }
    });
  }
}

import { injectable, inject } from "tsyringe";
import { IContext } from "@/types/server";
import { StripeMetadata } from "@/infrastructure/libs/stripe/type";
import { SquareMetadata } from "@/infrastructure/libs/square/type";
import { StripeClient } from "@/infrastructure/libs/stripe/client";
import { SquareClient } from "@/infrastructure/libs/square/client";
import logger from "@/infrastructure/logging";
import ProductService from "@/application/domain/product/service";
import OrderPresenter from "./presenter";
import OrderConverter from "@/application/domain/order/data/converter";
import OrderService from "@/application/domain/order/service";
import { PrismaProduct } from "@/application/domain/product/data/type";
import INftInstanceRepository from "@/application/domain/account/nft-instance/data/interface";
import { InventoryUnavailableError, PaymentSessionCreationError } from "@/errors/graphql";
import { OrderWithItems } from "@/application/domain/order/data/type";
import { Provider } from "@prisma/client";
import { GqlMutationProductBuyArgs, GqlProduct, GqlProductBuyPayload, GqlPaymentProvider } from "@/types/graphql";
import ProductPresenter from "./presenter";
import { getCurrentUserId } from "@/application/domain/utils";
import CommunityConfigService from "@/application/domain/account/community/config/service";

@injectable()
export default class ProductUseCase {
  constructor(
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("OrderService") private readonly orderService: OrderService,
    @inject("ProductService") private readonly productService: ProductService,
    @inject("StripeClient") private readonly stripeClient: StripeClient,
    @inject("SquareClient") private readonly squareClient: SquareClient,
    @inject("NftInstanceRepository") private readonly nftInstanceRepo: INftInstanceRepository,
    @inject("CommunityConfigService")
    private readonly communityConfigService: CommunityConfigService,
  ) {}

  async userViewProduct(ctx: IContext, id: string): Promise<GqlProduct | null> {
    const product = await this.productService.findProduct(ctx, id);
    if (!product) return null;
    return ProductPresenter.get(product);
  }

  async userBuyProduct(
    ctx: IContext,
    { productId, paymentProvider }: GqlMutationProductBuyArgs,
  ): Promise<GqlProductBuyPayload> {
    const currentUserId = getCurrentUserId(ctx);
    const product = await this.productService.findOrThrowForOrder(ctx, productId);

    const provider = this.mapPaymentProvider(paymentProvider);

    const order = await this.orderService.createOrder(ctx, {
      userId: currentUserId,
      items: [{ productId, quantity: 1, priceSnapshot: product.price }],
      paymentProvider: provider,
    });

    let paymentResult: { uid: string; url: string };

    if (provider === Provider.STRIPE) {
      paymentResult = await this.reserveInstanceAndCreateStripePayment(ctx, order, product);
    } else if (provider === Provider.SQUARE) {
      paymentResult = await this.reserveInstanceAndCreateSquarePayment(ctx, order, product);
    } else {
      throw new PaymentSessionCreationError(
        `Unsupported payment provider: ${provider}`,
        order.id,
        null,
      );
    }

    await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentResult.uid);
    return OrderPresenter.create(paymentResult.url);
  }

  private mapPaymentProvider(gqlProvider?: GqlPaymentProvider | null): Provider {
    if (!gqlProvider) return Provider.STRIPE;

    switch (gqlProvider) {
      case GqlPaymentProvider.Stripe:
        return Provider.STRIPE;
      case GqlPaymentProvider.Square:
        return Provider.SQUARE;
      case GqlPaymentProvider.Nmkr:
        return Provider.NMKR;
      default:
        return Provider.STRIPE;
    }
  }

  private async reserveInstanceAndCreateStripePayment(
    ctx: IContext,
    order: OrderWithItems,
    product: PrismaProduct,
  ): Promise<{ uid: string; url: string }> {
    const nftInstance = await ctx.issuer.internal(async (tx) => {
      const instance = await this.nftInstanceRepo.findAndReserveInstance(
        ctx,
        ctx.communityId,
        product.id,
        tx,
      );

      if (!instance) {
        throw new InventoryUnavailableError(product.id, ctx.communityId);
      }

      const instanceId = instance["instance_id"];

      logger.debug("[NftInstanceRepository] Reserved NFT instance", {
        instanceId: instanceId,
        communityId: ctx.communityId,
        productId: product.id,
        sequenceNum: instance.sequenceNum,
      });

      return instance;
    });

    const instanceId = nftInstance["instance_id"];

    let session;
    try {
      const nmkrIntegration = product.integrations.find((i) => i.provider === Provider.NMKR);
      const metadata: StripeMetadata = {
        orderId: order.id,
        orderItemId: order.items?.[0].id,
        nftInstanceId: nftInstance.id,
        nmkrProjectUid: nmkrIntegration?.externalRef ?? "",
        nmkrNftUid: instanceId,
      };

      const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
      const sessionParams = this.converter.stripeCheckoutSessionInput(
        product,
        metadata,
        liffBaseUrl,
      );
      session = await this.stripeClient.createCheckoutSession(sessionParams);

      logger.debug("[OrderUseCase] Created Stripe checkout session", {
        sessionId: session.id,
        metadata,
      });
    } catch (error) {
      await ctx.issuer.internal(async (tx) => {
        await this.nftInstanceRepo.releaseReservation(ctx, nftInstance.id, tx);
      });

      throw new PaymentSessionCreationError(
        "Failed to create Stripe checkout session",
        order.id,
        error,
      );
    }

    await ctx.issuer.internal(async (tx) => {
      await this.orderService.updateOrderWithExternalRef(ctx, order.id, session.id, tx);
    });

    return {
      uid: session.id,
      url: session.url ?? "",
    };
  }

  private async reserveInstanceAndCreateSquarePayment(
    ctx: IContext,
    order: OrderWithItems,
    product: PrismaProduct,
  ): Promise<{ uid: string; url: string }> {
    const nftInstance = await ctx.issuer.internal(async (tx) => {
      const instance = await this.nftInstanceRepo.findAndReserveInstance(
        ctx,
        ctx.communityId,
        product.id,
        tx,
      );

      if (!instance) {
        throw new InventoryUnavailableError(product.id, ctx.communityId);
      }

      const instanceId = instance["instance_id"];

      logger.debug("[NftInstanceRepository] Reserved NFT instance", {
        instanceId: instanceId,
        communityId: ctx.communityId,
        productId: product.id,
        sequenceNum: instance.sequenceNum,
      });

      return instance;
    });

    const instanceId = nftInstance["instance_id"];

    let paymentLink;
    try {
      const nmkrIntegration = product.integrations.find((i) => i.provider === Provider.NMKR);
      const metadata: SquareMetadata = {
        orderId: order.id,
        orderItemId: order.items?.[0].id,
        nftInstanceId: nftInstance.id,
        nmkrProjectUid: nmkrIntegration?.externalRef ?? "",
        nmkrNftUid: instanceId,
      };

      const { liffBaseUrl } = await this.communityConfigService.getLiffConfig(ctx, ctx.communityId);
      
      const squareIntegration = product.integrations.find((i) => i.provider === Provider.SQUARE);
      if (!squareIntegration) {
        throw new PaymentSessionCreationError(
          "Square integration not found for product",
          order.id,
          null,
        );
      }

      paymentLink = await this.squareClient.createPaymentLink({
        orderId: order.id,
        lineItems: [
          {
            catalogObjectId: squareIntegration.externalRef,
            quantity: "1",
          },
        ],
        successUrl: `${liffBaseUrl}/payment/success`,
        metadata,
      });

      logger.debug("[OrderUseCase] Created Square payment link", {
        paymentLinkId: paymentLink?.id,
        orderId: order.id,
        metadata,
      });
    } catch (error) {
      await ctx.issuer.internal(async (tx) => {
        await this.nftInstanceRepo.releaseReservation(ctx, nftInstance.id, tx);
      });

      throw new PaymentSessionCreationError(
        "Failed to create Square payment link",
        order.id,
        error,
      );
    }

    if (!paymentLink || !paymentLink.url || !paymentLink.id) {
      await ctx.issuer.internal(async (tx) => {
        await this.nftInstanceRepo.releaseReservation(ctx, nftInstance.id, tx);
      });

      throw new PaymentSessionCreationError(
        "Square payment link missing required fields",
        order.id,
        null,
      );
    }

    await ctx.issuer.internal(async (tx) => {
      await this.orderService.updateOrderWithExternalRef(ctx, order.id, paymentLink.id, tx);
    });

    return {
      uid: paymentLink.id,
      url: paymentLink.url,
    };
  }
}

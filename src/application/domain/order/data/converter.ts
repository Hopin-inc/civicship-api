import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import { PrismaNftWalletCreateDetail } from "@/application/domain/account/nft-wallet/data/type";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { PrismaProduct } from "@/application/domain/product/data/type";
import Stripe from "stripe";

@injectable()
export default class OrderConverter {
  create(
    userId: string,
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; priceSnapshot: number }>,
    paymentProvider: PaymentProvider = PaymentProvider.NMKR,
  ): Prisma.OrderCreateInput {
    return {
      status: OrderStatus.PENDING,
      paymentProvider,
      totalAmount,
      user: {
        connect: { id: userId },
      },
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: item.priceSnapshot,
        })),
      },
    };
  }

  nmkrPaymentTransactionInput(
    product: PrismaProduct,
    nftWallet: PrismaNftWalletCreateDetail,
    customProps: CustomPropsV1,
  ) {
    return {
      projectUid: product.nftProduct!.externalRef,
      paymentTransactionType: "paymentgateway_nft_random",
      paymentgatewayParameters: {
        mintNfts: {
          countNfts: 1,
        },
      },
      optionalReceiverAddress: nftWallet.walletAddress,
      customProperties: customProps,
      paymentTransactionNotifications: [
        {
          notificationType: "webhook",
          notificationEndpoint: process.env.NMKR_WEBHOOK_URL!,
          hmacSecret: process.env.NMKR_WEBHOOK_HMAC_SECRET!,
        },
      ],
    };
  }

  stripePaymentIntentInput(
    product: PrismaProduct,
    customProps: CustomPropsV1,
  ): Stripe.PaymentIntentCreateParams {
    const amountInCents = Math.round(product.price * 100);
    
    return {
      amount: amountInCents,
      currency: process.env.STRIPE_CURRENCY || "usd",
      metadata: {
        orderId: customProps.orderId || "",
        userRef: customProps.userRef || "",
        productId: product.id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };
  }

  stripePaymentIntentWithInstanceInput(
    product: PrismaProduct,
    instanceId: string,
    customProps: CustomPropsV1,
  ): Stripe.PaymentIntentCreateParams {
    const amountInCents = Math.round(product.price * 100);
    
    return {
      amount: amountInCents,
      currency: process.env.STRIPE_CURRENCY || "usd",
      metadata: {
        orderId: customProps.orderId || "",
        userRef: customProps.userRef || "",
        productId: product.id,
        instanceId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    };
  }
}

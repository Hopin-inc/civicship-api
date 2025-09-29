import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { PrismaProduct } from "@/application/domain/product/data/type";
import Stripe from "stripe";
import { CreatePaymentTransactionRequest } from "@/infrastructure/libs/nmkr/type";

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
    receiverAddress: string,
    nftUid: string,
    customProps: CustomPropsV1,
  ): CreatePaymentTransactionRequest {
    return {
      projectUid: product.nftProduct!.externalRef!,
      paymentTransactionType: "nmkr_pay_specific",
      paymentgatewayParameters: {
        mintNfts: {
          countNfts: 1,
          reserveNfts: [
            {
              lovelace: product.price,
              nftUid: nftUid,
              tokencount: 1,
            },
          ],
        },
        optionalRecevierAddress: receiverAddress,
      },
      customProperties: sanitizeProps(customProps),
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
    const amountInYen = Math.round(product.price);

    return {
      amount: amountInYen,
      currency: "jpy",
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
    const amountInYen = Math.round(product.price);

    return {
      amount: amountInYen,
      currency: "jpy",
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

function sanitizeProps(props: CustomPropsV1): Record<string, string> {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Record<
    string,
    string
  >;
}

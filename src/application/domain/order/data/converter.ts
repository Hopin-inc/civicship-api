import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { PrismaProduct } from "@/application/domain/product/data/type";
import { CreatePaymentTransactionRequest } from "@/infrastructure/libs/nmkr/type";

@injectable()
export default class OrderConverter {
  create(
    userId: string,
    totalAmount: number,
    items: Array<{ productId: string; quantity: number; priceSnapshot: number }>,
  ): Prisma.OrderCreateInput {
    return {
      status: OrderStatus.PENDING,
      paymentProvider: PaymentProvider.NMKR,
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
}

function sanitizeProps(props: CustomPropsV1): Record<string, string> {
  return Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined)) as Record<
    string,
    string
  >;
}

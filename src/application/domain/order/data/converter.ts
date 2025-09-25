import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import { OrderWithItems } from "@/application/domain/order/data/type";
import { PrismaNftWalletCreateDetail } from "@/application/domain/account/nft-wallet/data/type";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";

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
    order: OrderWithItems,
    nftWallet: PrismaNftWalletCreateDetail,
    customProps: CustomPropsV1,
  ) {
    return {
      projectuid: order.items[0].product.nftProduct!.externalRef!,
      paymentTransactionType: "nmkr_pay_specific",
      receiveraddress: nftWallet.walletAddress,
      customproperties: customProps,
      paymentTransactionNotifications: [
        {
          notificationType: "webhook",
          notificationEndpoint: process.env.NMKR_WEBHOOK_URL!,
          hmacSecret: process.env.NMKR_WEBHOOK_HMAC_SECRET!,
        },
      ],
      paymentgatewayParameters: {
        mintNfts: {
          countNfts: 1,
          reserveNfts: [
            {
              nftUid: order.items[0].product.nftProduct!.externalRef!,
              tokencount: 1,
            },
          ],
        },
      },
    };
  }
}

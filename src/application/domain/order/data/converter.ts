import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
import { PrismaNftWalletCreateDetail } from "@/application/domain/account/nft-wallet/data/type";
import { CustomPropsV1 } from "@/infrastructure/libs/nmkr/customProps";
import { PrismaProduct } from "@/application/domain/product/data/type";

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
}

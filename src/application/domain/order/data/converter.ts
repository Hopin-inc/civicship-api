import { injectable } from "tsyringe";
import { Prisma, OrderStatus, PaymentProvider } from "@prisma/client";
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

  stripeCheckoutSessionInput(
    product: PrismaProduct,
    instanceId: string,
    customProps: CustomPropsV1,
  ): Stripe.Checkout.SessionCreateParams {
    const amountInYen = Math.round(product.price);

    return {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: product.name,
              description: product.description ?? undefined,
              images: product.imageUrl ? [product.imageUrl] : [],
            },
            unit_amount: amountInYen,
          },
          quantity: 1,
          adjustable_quantity: {
            enabled: false,
          },
        },
      ],
      success_url: `https://localhost:8000/users/me`,
      cancel_url: `https://localhost:8000/users/me`,
      metadata: {
        orderId: customProps.orderId || "",
        userId: customProps.userId || "",
        projectUid: product.nftProduct?.nmkrProjectId || "",
        nftUid: instanceId,
      },
    };
  }
}

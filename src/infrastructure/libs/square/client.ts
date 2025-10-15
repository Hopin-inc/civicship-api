import { injectable } from "tsyringe";
import { SquareClient as Square, SquareEnvironment } from "square";
import { validateEnvironmentVariables } from "@/infrastructure/config/validation";
import type { SquareMetadata } from "./type";

export interface CreatePaymentLinkParams {
  orderId: string;
  lineItems: Array<{
    name: string;
    quantity: string;
    basePriceMoney: {
      amount: bigint;
      currency: string;
    };
  }>;
  successUrl: string;
  metadata: SquareMetadata;
}

@injectable()
export class SquareClient {
  private readonly client: Square;
  private readonly config: ReturnType<typeof validateEnvironmentVariables>;

  constructor() {
    this.config = validateEnvironmentVariables();

    this.client = new Square({
      environment:
        this.config.square.environment === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
      token: this.config.square.accessToken,
    });
  }

  async createPaymentLink(params: CreatePaymentLinkParams) {
    const response = await this.client.checkout.paymentLinks.create({
      order: {
        locationId: this.config.square.locationId,
        lineItems: params.lineItems as any,
        referenceId: params.orderId,
      },
      checkoutOptions: {
        redirectUrl: params.successUrl,
      },
    });

    return response.paymentLink;
  }

  async retrievePayment(paymentId: string) {
    const response = await this.client.payments.get({
      paymentId,
    });
    return response.payment;
  }

  async retrieveOrder(orderId: string) {
    const response = await this.client.orders.get({
      orderId,
    });
    return response.order;
  }
}

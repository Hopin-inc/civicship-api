import { injectable } from "tsyringe";
import Stripe from "stripe";
import { validateEnvironmentVariables } from "@/infrastructure/config/validation";

@injectable()
export class StripeClient {
  private readonly stripe: Stripe;
  private readonly config: ReturnType<typeof validateEnvironmentVariables>;

  constructor() {
    this.config = validateEnvironmentVariables();

    this.stripe = new Stripe(this.config.stripe.secretKey, {
      apiVersion: "2023-10-16",
      typescript: true,
    });
  }

  async createProduct(params: Stripe.ProductCreateParams): Promise<Stripe.Product> {
    return await this.stripe.products.create(params);
  }

  async createPrice(params: Stripe.PriceCreateParams): Promise<Stripe.Price> {
    return await this.stripe.prices.create(params);
  }

  async createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create(params);
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.stripe.webhookSecret,
    );
  }
}

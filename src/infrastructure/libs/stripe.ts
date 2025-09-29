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

  async createCheckoutSession(
    params: Stripe.Checkout.SessionCreateParams,
  ): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.create(params);
  }

  async createPaymentIntent(
    params: Stripe.PaymentIntentCreateParams,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create(params);
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentRetrieveParams,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId, params);
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    params?: Stripe.PaymentIntentConfirmParams,
  ): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.confirm(paymentIntentId, params);
  }

  async createCustomer(params: Stripe.CustomerCreateParams): Promise<Stripe.Customer> {
    return await this.stripe.customers.create(params);
  }

  async retrieveCustomer(
    customerId: string,
    params?: Stripe.CustomerRetrieveParams,
  ): Promise<Stripe.Customer> {
    const customer = await this.stripe.customers.retrieve(customerId, params);
    if (customer.deleted) {
      throw new Error(`Customer ${customerId} has been deleted`);
    }
    return customer;
  }

  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams,
  ): Promise<Stripe.Customer> {
    return await this.stripe.customers.update(customerId, params);
  }

  async createSetupIntent(params: Stripe.SetupIntentCreateParams): Promise<Stripe.SetupIntent> {
    return await this.stripe.setupIntents.create(params);
  }

  async retrieveSetupIntent(
    setupIntentId: string,
    params?: Stripe.SetupIntentRetrieveParams,
  ): Promise<Stripe.SetupIntent> {
    return await this.stripe.setupIntents.retrieve(setupIntentId, params);
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.stripe.webhookSecret,
    );
  }

  getStripeInstance(): Stripe {
    return this.stripe;
  }
}

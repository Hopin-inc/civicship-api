import { injectable } from "tsyringe";
import { createStripeHttpClient, StripeApiError } from "./http";
import { StripeEndpoints } from "./endpoints";

type Arg<T extends (...a: any) => any, I extends number = 0> = Parameters<T>[I];
type Res<T extends (...a: any) => any> = Awaited<ReturnType<T>>;

@injectable()
export class StripeClient {
  private readonly endpoints: StripeEndpoints;

  constructor() {
    const httpClient = createStripeHttpClient();
    this.endpoints = new StripeEndpoints(httpClient);
  }

  private async handleRequest<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
    try {
      return await operation();
    } catch (error: unknown) {
      if (error instanceof StripeApiError) {
        throw error;
      }
      throw new Error(`${errorMessage}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createPaymentIntent(
    payload: Arg<StripeEndpoints["createPaymentIntent"]>,
  ): Promise<Res<StripeEndpoints["createPaymentIntent"]>> {
    return this.handleRequest(
      () => this.endpoints.createPaymentIntent(payload),
      "Failed to create Stripe payment intent",
    );
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Res<StripeEndpoints["retrievePaymentIntent"]>> {
    return this.handleRequest(
      () => this.endpoints.retrievePaymentIntent(paymentIntentId),
      "Failed to retrieve Stripe payment intent",
    );
  }

  async createCustomer(
    payload: Arg<StripeEndpoints["createCustomer"]>,
  ): Promise<Res<StripeEndpoints["createCustomer"]>> {
    return this.handleRequest(
      () => this.endpoints.createCustomer(payload),
      "Failed to create Stripe customer",
    );
  }

  async retrieveCustomer(
    customerId: string,
  ): Promise<Res<StripeEndpoints["retrieveCustomer"]>> {
    return this.handleRequest(
      () => this.endpoints.retrieveCustomer(customerId),
      "Failed to retrieve Stripe customer",
    );
  }
}

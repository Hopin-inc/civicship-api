import { AxiosInstance } from "axios";
import { StripeHttp } from "./http";

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customer?: string;
  metadata?: Record<string, string>;
  automatic_payment_methods?: {
    enabled: boolean;
  };
}

export interface PaymentIntent {
  id: string;
  object: "payment_intent";
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  customer?: string;
  metadata: Record<string, string>;
  created: number;
}

export interface CreateCustomerRequest {
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface Customer {
  id: string;
  object: "customer";
  email?: string;
  name?: string;
  metadata: Record<string, string>;
  created: number;
}

export class StripeEndpoints {
  private readonly http: StripeHttp;

  constructor(http: AxiosInstance) {
    this.http = new StripeHttp(http);
  }

  async createPaymentIntent(payload: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return this.http.postJSON<PaymentIntent, CreatePaymentIntentRequest>(
      "/v1/payment_intents",
      payload,
    );
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.http.getJSON<PaymentIntent>(`/v1/payment_intents/${paymentIntentId}`);
  }

  async createCustomer(payload: CreateCustomerRequest): Promise<Customer> {
    return this.http.postJSON<Customer, CreateCustomerRequest>("/v1/customers", payload);
  }

  async retrieveCustomer(customerId: string): Promise<Customer> {
    return this.http.getJSON<Customer>(`/v1/customers/${customerId}`);
  }
}

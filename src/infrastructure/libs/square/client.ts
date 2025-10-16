import { injectable } from "tsyringe";
import { SquareClient as Square, SquareEnvironment, OrderLineItem } from "square";
import { validateEnvironmentVariables } from "@/infrastructure/config/validation";
import type { SquareMetadata } from "./type";

export interface CreatePaymentLinkParams {
  orderId: string;
  lineItems: OrderLineItem[];
  successUrl: string;
  metadata: SquareMetadata;
}

export interface CreateCatalogItemParams {
  name: string;
  description: string;
  priceAmount: number;
  metadata?: Record<string, string>;
}

export interface CatalogItemResult {
  itemId: string;
  variationId: string;
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
        lineItems: params.lineItems,
        referenceId: params.orderId,
        metadata: params.metadata as Record<string, string>,
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

  async createCatalogItem(params: CreateCatalogItemParams): Promise<CatalogItemResult> {
    const timestamp = Date.now();
    const itemId = `ITEM_${timestamp}`;
    const variationId = `VAR_${timestamp}`;

    try {
      const response = await this.client.catalog.batchUpsert({
        idempotencyKey: `${itemId}_${variationId}`,
        batches: [
          {
            objects: [
              {
                type: "ITEM",
                id: `#${itemId}`,
                itemData: {
                  name: params.name,
                  description: params.description,
                  variations: [
                    {
                      type: "ITEM_VARIATION",
                      id: `#${variationId}`,
                      itemVariationData: {
                        name: params.name,
                        pricingType: "FIXED_PRICING",
                        priceMoney: {
                          amount: BigInt(params.priceAmount),
                          currency: "JPY",
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      });

      const objects = response.objects || [];
      const item = objects.find((o) => o.type === "ITEM");

      if (!item?.id) {
        throw new Error("Failed to create Square catalog item - missing item ID");
      }

      const variation = item.itemData?.variations?.[0];
      if (!variation?.id) {
        throw new Error("Failed to create Square catalog item - missing variation ID");
      }

      return {
        itemId: item.id,
        variationId: variation.id,
      };
    } catch (error) {
      console.error("Square catalog creation error:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to create Square catalog item: ${error.message}`);
      }
      throw new Error("Failed to create Square catalog item");
    }
  }

  async updateCatalogItem(
    itemId: string,
    params: Partial<CreateCatalogItemParams>,
  ): Promise<void> {
    await this.client.catalog.object.upsert({
      idempotencyKey: `UPDATE_${itemId}_${Date.now()}`,
      object: {
        type: "ITEM",
        id: itemId,
        itemData: {
          name: params.name,
          description: params.description,
        },
      },
    });
  }

  async deleteCatalogItem(itemId: string): Promise<void> {
    await this.client.catalog.batchDelete({
      objectIds: [itemId],
    });
  }
}

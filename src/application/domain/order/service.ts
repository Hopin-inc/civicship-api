import { injectable, inject } from 'tsyringe';
import { IContext } from '@/types/server';
import { Prisma } from '@prisma/client';
import { NmkrClient } from '@/infrastructure/libs/nmkr/api/client';
import InventoryService from '@/application/domain/product/inventory/service';
import OrderRepository from './data/repository';
import OrderConverter from './data/converter';
import { IOrderService } from './data/interface';

@injectable()
export default class OrderService implements IOrderService {
  constructor(
    @inject("OrderRepository") private readonly repository: OrderRepository,
    @inject("OrderConverter") private readonly converter: OrderConverter,
    @inject("NmkrClient") private readonly nmkrClient: NmkrClient,
    @inject("InventoryService") private readonly inventoryService: InventoryService,
  ) {}

  async validateAndReserveProduct(
    ctx: IContext,
    productId: string,
    quantity: number,
    tx: Prisma.TransactionClient
  ) {
    const product = await tx.product.findUnique({
      where: { id: productId },
      include: { nftProduct: true }
    });

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (product.type !== 'NFT') {
      throw new Error(`Product is not an NFT: ${productId}`);
    }

    if (!product.nftProduct) {
      throw new Error(`NFT product not found for product: ${productId}`);
    }

    if (!product.nftProduct.externalRef) {
      throw new Error(`NFT product missing externalRef: ${productId}`);
    }

    const inventory = await this.inventoryService.calculateInventory(ctx, productId);
    if (inventory.available < quantity) {
      throw new Error(`Insufficient inventory. Available: ${inventory.available}, Requested: ${quantity}`);
    }

    await this.inventoryService.reserveInventory(tx, [{ productId, quantity }]);

    return product;
  }

  async createOrderInTransaction(
    ctx: IContext,
    userId: string,
    productId: string,
    quantity: number,
    priceSnapshot: number,
    tx: Prisma.TransactionClient
  ) {
    const totalAmount = priceSnapshot * quantity;
    const orderData = this.converter.toPrismaCreateInput({
      userId,
      productId,
      quantity,
      priceSnapshot,
      totalAmount,
    });

    return tx.order.create({
      data: orderData,
      include: {
        items: {
          include: {
            product: {
              include: {
                nftProduct: true,
              },
            },
            nftMints: true,
          },
        },
        user: true,
      },
    });
  }

  async requestNmkrPayment(
    externalRef: string,
    quantity: number,
    priceSnapshot: string,
    customProperty: string,
    receiverAddress: string
  ) {
    return this.nmkrClient.getPaymentAddressForSpecificNftSale(
      externalRef,
      quantity,
      priceSnapshot,
      customProperty,
      receiverAddress
    );
  }

  async updateOrderWithExternalRef(ctx: IContext, orderId: string, externalRef: string) {
    return this.repository.update(ctx, orderId, 
      this.converter.toPrismaUpdateInput(externalRef)
    );
  }
}

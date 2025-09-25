import crypto from 'crypto';
import { ProductType, NftMintStatus } from '@prisma/client';
import TestDataSourceHelper from './test-data-source-helper';

export class NftTestHelper {
  static makeSignedWebhook(body: any, secret: string = 'test-hmac-secret'): string {
    const bodyString = JSON.stringify(body);
    const signature = crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
    return `sha256=${signature}`;
  }

  static async seedProducts(options: {
    maxSupply?: number | null;
    price?: number;
    count?: number;
  } = {}) {
    const { price = 1000, count = 1 } = options;
    const products: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const product = await TestDataSourceHelper.createProduct({
        name: `Test NFT Product ${i + 1}`,
        price,
        type: ProductType.NFT,
        nftProduct: {
          create: {
            externalRef: `test-external-ref-${i + 1}`,
            policyId: `test-policy-${i + 1}`
          }
        }
      });
      products.push(product);
    }
    return products;
  }

  static freezeTime(date: Date) {
    jest.useFakeTimers();
    jest.setSystemTime(date);
  }

  static unfreezeTime() {
    jest.useRealTimers();
  }

  static mockUuid(sequence: string[]) {
    let index = 0;
    jest.spyOn(crypto, 'randomUUID').mockImplementation(() => {
      const uuid = sequence[index % sequence.length];
      index++;
      return uuid as any;
    });
  }

  static createNmkrStub(mode: 'success' | 'timeout' | 'duplicate' | 'error' = 'success') {
    const mockClient = {
      getPaymentAddressForSpecificNftSale: jest.fn(),
    };

    switch (mode) {
      case 'success':
        mockClient.getPaymentAddressForSpecificNftSale.mockResolvedValue({
          paymentAddress: 'addr_test_success',
          paymentAddressId: 12345
        });
        break;
      case 'timeout':
        mockClient.getPaymentAddressForSpecificNftSale.mockRejectedValue(
          new Error('NMKR API timeout')
        );
        break;
      case 'duplicate':
        mockClient.getPaymentAddressForSpecificNftSale.mockResolvedValue({
          paymentAddress: 'addr_test_duplicate',
          paymentAddressId: 99999
        });
        break;
      case 'error':
        mockClient.getPaymentAddressForSpecificNftSale.mockRejectedValue(
          new Error('NMKR API error')
        );
        break;
    }
    return mockClient;
  }

  static async createTestOrder(options: {
    userId: string;
    productId: string;
    quantity?: number;
    status?: string;
  }) {
    const { userId, productId, quantity = 1, status = 'PENDING' } = options;
    
    return TestDataSourceHelper.createOrder({
      user: { connect: { id: userId } },
      status: status as any,
      totalAmount: quantity * 1000,
      items: {
        create: [{
          product: { connect: { id: productId } },
          quantity,
          priceSnapshot: 1000
        }]
      }
    });
  }

  static async createNftMint(options: {
    status?: NftMintStatus;
    orderItemId: string;
    nftWalletId: string;
    txHash?: string | null;
  }) {
    const { status = NftMintStatus.QUEUED, orderItemId, nftWalletId, txHash } = options;
    
    return TestDataSourceHelper.createNftMint({
      status,
      orderItem: { connect: { id: orderItemId } },
      nftWallet: { connect: { id: nftWalletId } },
      txHash
    });
  }
}

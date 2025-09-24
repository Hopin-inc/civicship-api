export class OrderValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export class InsufficientInventoryError extends Error {
  constructor(
    message: string, 
    public productId: string, 
    public available: number, 
    public requested: number
  ) {
    super(message);
    this.name = 'InsufficientInventoryError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(public productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundError';
  }
}

export class OrderValidationError extends Error {
  public readonly code: string;
  
  constructor(message: string, code: string = 'VALIDATION_ERROR', public field?: string) {
    super(message);
    this.name = 'OrderValidationError';
    this.code = code;
  }
}

export class NmkrApiError extends Error {
  public readonly code: string;
  
  constructor(message: string, code: string = 'NMKR_API_ERROR') {
    super(message);
    this.name = 'NmkrApiError';
    this.code = code;
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

export class PaymentTransactionError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PaymentTransactionError';
  }
}

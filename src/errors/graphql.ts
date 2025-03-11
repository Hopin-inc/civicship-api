import { GraphQLError, GraphQLErrorOptions } from "graphql";

export class ApolloError extends GraphQLError {
  constructor(message: string, code: string, options?: GraphQLErrorOptions) {
    super(message, {
      ...options,
      extensions: { code, ...(options?.extensions || {}) },
    });
    Object.defineProperty(this, "name", { value: "ApolloError" });
  }
}

export class ValidationError extends ApolloError {
  public invalidArgs?: string[];

  constructor(message: string, invalidArgs?: string[]) {
    super(message, "VALIDATION_ERROR");
    this.invalidArgs = invalidArgs;
    Object.defineProperty(this, "name", { value: "ValidationError" });
  }
}

export class AuthenticationError extends ApolloError {
  constructor(message: string = "Authentication failed") {
    super(message, "UNAUTHENTICATED");
    Object.defineProperty(this, "name", { value: "AuthenticationError" });
  }
}

export class AuthorizationError extends ApolloError {
  constructor(message: string = "Not authorized") {
    super(message, "FORBIDDEN");
    Object.defineProperty(this, "name", { value: "AuthorizationError" });
  }
}

export class NotFoundError extends ApolloError {
  public entityName?: string;
  public entityData?: Record<string, unknown>;

  constructor(entityName?: string, entityData?: Record<string, unknown>) {
    let message = entityName ? `${ entityName } not found` : "Resource not found";
    if (entityData) {
      const formattedData = Object.entries(entityData).map(([k, v]) => `${ k }: ${ v }`).join(", ");
      message += ` (${ formattedData })`;
    }
    super(message, "NOT_FOUND");
    this.entityName = entityName;
    this.entityData = entityData;
    Object.defineProperty(this, "name", { value: "NotFoundError" });
  }
}

export class DatabaseError extends ApolloError {
  constructor(message: string = "Database error occurred") {
    super(message, "DATABASE_ERROR");
    Object.defineProperty(this, "name", { value: "DatabaseError" });
  }
}

export class RateLimitError extends ApolloError {
  constructor(message: string = "Too many requests") {
    super(message, "RATE_LIMIT");
    Object.defineProperty(this, "name", { value: "RateLimitError" });
  }
}

export class InsufficientBalanceError extends ApolloError {
  public currentBalance: number;
  public requestedAmount: number;

  constructor(currentBalance: number, requestedAmount: number) {
    const message = `Insufficient balance: current balance ${ currentBalance } is less than requested amount ${ requestedAmount }`;
    super(message, "INSUFFICIENT_BALANCE");
    this.currentBalance = currentBalance;
    this.requestedAmount = requestedAmount;
    Object.defineProperty(this, "name", { value: "InsufficientBalanceError" });
  }
}

export class UtilityAlreadyUsedError extends ApolloError {
  public usedAt: Date;

  constructor(usedAt: Date) {
    const message = `Utility already used at ${ usedAt.toString() }`;
    super(message, "UTILITY_ALREADY_USED");
    this.usedAt = usedAt;
    Object.defineProperty(this, "name", { value: "UtilityAlreadyUsedError" });
  }
}

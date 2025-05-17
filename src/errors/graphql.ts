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
    let message = entityName ? `${entityName} not found` : "Resource not found";
    if (entityData) {
      const formattedData = Object.entries(entityData)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      message += ` (${formattedData})`;
    }
    super(message, "NOT_FOUND");
    this.entityName = entityName;
    this.entityData = entityData;
    Object.defineProperty(this, "name", { value: "NotFoundError" });
  }
}

export class DatabaseError extends ApolloError {
  constructor(message: string = "Database error occurred") {
    super(message, "INTERNAL_SERVER_ERROR");
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
    const message = `Insufficient balance: current balance ${currentBalance} is less than requested amount ${requestedAmount}`;
    super(message, "INSUFFICIENT_BALANCE");
    this.currentBalance = currentBalance;
    this.requestedAmount = requestedAmount;
    Object.defineProperty(this, "name", { value: "InsufficientBalanceError" });
  }
}

export class UtilityAlreadyUsedError extends ApolloError {
  public usedAt: Date;

  constructor(usedAt: Date) {
    const message = `Utility already used at ${usedAt.toString()}`;
    super(message, "UTILITY_ALREADY_USED");
    this.usedAt = usedAt;
    Object.defineProperty(this, "name", { value: "UtilityAlreadyUsedError" });
  }
}

export class ReservationFullError extends ApolloError {
  public capacity: number;
  public requested: number;

  constructor(capacity: number, requested: number) {
    const message = `Reservation is full: capacity ${capacity} is less than requested ${requested}`;
    super(message, "RESERVATION_FULL");
    this.capacity = capacity;
    this.requested = requested;
    Object.defineProperty(this, "name", { value: "ReservationFullError" });
  }
}

export class AlreadyJoinedError extends ApolloError {
  constructor(message: string = "You have already joined this reservation.") {
    super(message, "ALREADY_JOINED");
    Object.defineProperty(this, "name", { value: "AlreadyJoinedError" });
  }
}

export class ReservationConflictError extends ApolloError {
  constructor(message: string = "You already have a conflicting reservation.") {
    super(message, "RESERVATION_CONFLICT");
    Object.defineProperty(this, "name", { value: "ReservationConflictError" });
  }
}

export class AlreadyStartedReservationError extends ApolloError {
  constructor(message: string = "This reservation has already started.") {
    super(message, "ALREADY_STARTED_RESERVATION");
    Object.defineProperty(this, "name", { value: "AlreadyStartedReservationError" });
  }
}

export class AlreadyUsedClaimLinkError extends ApolloError {
  constructor(message: string = "This claim link has already been used.") {
    super(message, "ALREADY_USED_CLAIM_LINK");
    Object.defineProperty(this, "name", { value: "AlreadyUsedClaimLinkError" });
  }
}

export class ClaimLinkExpiredError extends ApolloError {
  constructor(message: string = "This claim link has expired.") {
    super(message, "CLAIM_LINK_EXPIRED");
    Object.defineProperty(this, "name", { value: "ClaimLinkExpiredError" });
  }
}

export class ReservationCancellationTimeoutError extends ApolloError {
  constructor(message: string = "Reservation can no longer be canceled within 24 hours of the event.") {
    super(message, "RESERVATION_CANCELLATION_TIMEOUT");
    Object.defineProperty(this, "name", { value: "ReservationCancellationTimeoutError" });
  }
}

export class ReservationAdvanceBookingRequiredError extends ApolloError {
  constructor(message: string = "Reservation must be made at least 7 days in advance.") {
    super(message, "RESERVATION_ADVANCE_BOOKING_REQUIRED");
    Object.defineProperty(this, "name", { value: "ReservationAdvanceBookingRequiredError" });
  }
}

export class ReservationNotAcceptedError extends ApolloError {
  constructor(message: string = "Reservation is not accepted yet.") {
    super(message, "RESERVATION_NOT_ACCEPTED");
    Object.defineProperty(this, "name", { value: "ReservationNotAcceptedError" });
  }
}

export class SlotNotScheduledError extends ApolloError {
  constructor(message: string = "This slot is not scheduled.") {
    super(message, "SLOT_NOT_SCHEDULED");
    Object.defineProperty(this, "name", { value: "SlotNotScheduledError" });
  }
}

export class NoAvailableParticipationSlotsError extends ApolloError {
  constructor(message: string = "No available participation slots.") {
    super(message, "NO_AVAILABLE_PARTICIPATION_SLOTS");
    Object.defineProperty(this, "name", { value: "NoAvailableParticipationSlotsError" });
  }
}

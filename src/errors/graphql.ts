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

// Wallet
export class InsufficientBalanceError extends ApolloError {
  public currentBalance: string;
  public requestedAmount: number;

  constructor(currentBalance: string, requestedAmount: number) {
    const message = `Insufficient balance: current balance ${currentBalance} is less than requested amount ${requestedAmount}`;
    super(message, "INSUFFICIENT_BALANCE");
    this.currentBalance = currentBalance;
    this.requestedAmount = requestedAmount;
    Object.defineProperty(this, "name", { value: "InsufficientBalanceError" });
  }
}

export class InvalidTransferMethodError extends ApolloError {
  constructor(message: string = "Use validateTransferMemberToMember()") {
    super(message, "INVALID_TRANSFER_METHOD");
    Object.defineProperty(this, "name", { value: "InvalidTransferMethodError" });
  }
}

export class MissingWalletInformationError extends ApolloError {
  public missingWallets: string[];

  constructor(missingWallets: string[]) {
    const message = `Wallet information is missing for points transfer: ${missingWallets.join(", ")}`;
    super(message, "MISSING_WALLET_INFORMATION");
    this.missingWallets = missingWallets;
    Object.defineProperty(this, "name", { value: "MissingWalletInformationError" });
  }
}

export class UnsupportedTransactionReasonError extends ApolloError {
  public reason: string;

  constructor(reason: string) {
    const message = `Unsupported TransactionReason: ${reason}`;
    super(message, "UNSUPPORTED_TRANSACTION_REASON");
    this.reason = reason;
    Object.defineProperty(this, "name", { value: "UnsupportedTransactionReasonError" });
  }
}

//Reservation
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

export class AlreadyStartedReservationError extends ApolloError {
  constructor(message: string = "This reservation has already started.") {
    super(message, "ALREADY_STARTED_RESERVATION");
    Object.defineProperty(this, "name", { value: "AlreadyStartedReservationError" });
  }
}

export class ReservationCancellationTimeoutError extends ApolloError {
  constructor(
    message: string = "Reservation can no longer be canceled within 24 hours of the event.",
  ) {
    super(message, "RESERVATION_CANCELLATION_TIMEOUT");
    Object.defineProperty(this, "name", { value: "ReservationCancellationTimeoutError" });
  }
}

export class ReservationAdvanceBookingRequiredError extends ApolloError {
  constructor(message: string = "Reservation must be made at least 1 day in advance.") {
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

export class TicketParticipantMismatchError extends ApolloError {
  public ticketCount: number;
  public participantCount: number;

  constructor(ticketCount: number, participantCount: number) {
    const message = `The number of tickets (${ticketCount}) does not match the number of participants (${participantCount})`;
    super(message, "TICKET_PARTICIPANT_MISMATCH");
    this.ticketCount = ticketCount;
    this.participantCount = participantCount;
    Object.defineProperty(this, "name", { value: "TicketParticipantMismatchError" });
  }
}

//Participation
export class AlreadyJoinedError extends ApolloError {
  constructor(message: string = "You have already joined this reservation.") {
    super(message, "ALREADY_JOINED");
    Object.defineProperty(this, "name", { value: "AlreadyJoinedError" });
  }
}

export class NoAvailableParticipationSlotsError extends ApolloError {
  constructor(message: string = "No available participation slots.") {
    super(message, "NO_AVAILABLE_PARTICIPATION_SLOTS");
    Object.defineProperty(this, "name", { value: "NoAvailableParticipationSlotsError" });
  }
}

export class PersonalRecordOnlyDeletableError extends ApolloError {
  constructor() {
    const message = "Only personal participation records can be deleted.";
    super(message, "PERSONAL_RECORD_ONLY_DELETABLE");
    Object.defineProperty(this, "name", { value: "PersonalRecordOnlyDeletableError" });
  }
}

//Evaluation
export class AlreadyEvaluatedError extends ApolloError {
  constructor(message: string = "This participation has already been evaluated.") {
    super(message, "ALREADY_EVALUATED");
    Object.defineProperty(this, "name", { value: "AlreadyEvaluatedError" });
  }
}

export class CannotEvaluateBeforeOpportunityStartError extends ApolloError {
  constructor(
    message: string = "You cannot evaluate this participation before the opportunity starts.",
  ) {
    super(message, "CANNOT_EVALUATE_BEFORE_OPPORTUNITY_START");
    Object.defineProperty(this, "name", { value: "CannotEvaluateBeforeOpportunityStartError" });
  }
}

//Ticket
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


export class InvalidReceiverAddressError extends ApolloError {
  public receiver: string;

  constructor(receiver: string, message = "Receiver address is invalid") {
    super(message, "MINT_INVALID_RECEIVER");
    this.receiver = receiver;
    Object.defineProperty(this, "name", { value: "InvalidReceiverAddressError" });
  }
}

export class NetworkMismatchError extends ApolloError {
  public receiver: string;
  public expectedNetwork: "testnet" | "mainnet";

  constructor(receiver: string, expectedNetwork: "testnet" | "mainnet") {
    const message = `Receiver address network mismatch (expected ${expectedNetwork})`;
    super(message, "MINT_NETWORK_MISMATCH");
    this.receiver = receiver;
    this.expectedNetwork = expectedNetwork;
    Object.defineProperty(this, "name", { value: "NetworkMismatchError" });
  }
}

export class InvalidProductKeyError extends ApolloError {
  public productKey: string;
  public pattern = "^[a-z0-9-]{1,24}$";

  constructor(productKey: string) {
    const message = `Invalid productKey format: "${productKey}" (must match ${/^([a-z0-9-]{1,24})$/})`;
    super(message, "MINT_INVALID_PRODUCT_KEY");
    this.productKey = productKey;
    Object.defineProperty(this, "name", { value: "InvalidProductKeyError" });
  }
}

export class AssetNameTooLongError extends ApolloError {
  public assetName: string;
  public bytes: number;
  public limitBytes = 32;

  constructor(assetName: string, bytes: number) {
    const message = `Asset name too long: ${bytes} bytes (limit ${32})`;
    super(message, "MINT_ASSET_NAME_TOO_LONG");
    this.assetName = assetName;
    this.bytes = bytes;
    Object.defineProperty(this, "name", { value: "AssetNameTooLongError" });
  }
}

export class MintAdapterFailureError extends ApolloError {
  public detail?: string;

  constructor(detail?: string) {
    super("Mint adapter failed", "MINT_ADAPTER_FAILURE");
    this.detail = detail;
    Object.defineProperty(this, "name", { value: "MintAdapterFailureError" });
  }
}

export class MintIdempotencyConflictError extends ApolloError {
  public policyId: string;
  public assetName?: string;

  constructor(policyId: string, assetName?: string) {
    const message = `Idempotency conflict on mint (${policyId}${assetName ? "." + assetName : ""})`;
    super(message, "MINT_IDEMPOTENCY_CONFLICT");
    this.policyId = policyId;
    this.assetName = assetName;
    Object.defineProperty(this, "name", { value: "MintIdempotencyConflictError" });
  }
}

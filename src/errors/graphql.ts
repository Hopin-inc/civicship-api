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

export abstract class OrderProcessingError extends ApolloError {
  public orderId?: string;

  constructor(message: string, code: string, orderId?: string) {
    super(message, code);
    this.orderId = orderId;
    Object.defineProperty(this, "name", { value: "OrderProcessingError" });
  }
}

export class InventoryUnavailableError extends OrderProcessingError {
  public productId: string;
  public communityId: string;

  constructor(productId: string, communityId: string, orderId?: string) {
    const message = `No available NFT instance found for product ${productId} in community ${communityId}`;
    super(message, "INVENTORY_UNAVAILABLE", orderId);
    this.productId = productId;
    this.communityId = communityId;
    Object.defineProperty(this, "name", { value: "InventoryUnavailableError" });
  }
}

export class PaymentSessionCreationError extends OrderProcessingError {
  public cause?: string;

  constructor(message: string = "Failed to create payment session", orderId?: string, cause?: unknown) {
    super(message, "PAYMENT_SESSION_CREATION_FAILED", orderId);
    this.cause = cause instanceof Error ? cause.message : String(cause);
    Object.defineProperty(this, "name", { value: "PaymentSessionCreationError" });
  }
}

export class OrderCancellationError extends OrderProcessingError {
  public cause?: string;

  constructor(orderId: string, cause?: unknown) {
    const message = `Failed to cancel order ${orderId}`;
    super(message, "ORDER_CANCELLATION_FAILED", orderId);
    this.cause = cause instanceof Error ? cause.message : String(cause);
    Object.defineProperty(this, "name", { value: "OrderCancellationError" });
  }
}

export class WebhookMetadataError extends OrderProcessingError {
  public rawMetadata?: string;

  constructor(message: string = "Invalid or missing webhook metadata", rawMetadata?: string) {
    super(message, "WEBHOOK_METADATA_INVALID");
    this.rawMetadata = rawMetadata;
    Object.defineProperty(this, "name", { value: "WebhookMetadataError" });
  }
}

export class NmkrMintingError extends OrderProcessingError {
  public orderItemId?: string;
  public mintId?: string;
  public nmkrErrorCode?: string;
  public cause?: string;

  constructor(
    message: string,
    orderId?: string,
    orderItemId?: string,
    mintId?: string,
    cause?: unknown,
    nmkrErrorCode?: string,
  ) {
    super(message, "NMKR_MINTING_FAILED", orderId);
    this.orderItemId = orderItemId;
    this.mintId = mintId;
    this.nmkrErrorCode = nmkrErrorCode;
    this.cause = cause instanceof Error ? cause.message : String(cause);
    Object.defineProperty(this, "name", { value: "NmkrMintingError" });
  }
}

export class NmkrTokenUnavailableError extends NmkrMintingError {
  public nftUid?: string;

  constructor(nftUid?: string, orderId?: string, orderItemId?: string, mintId?: string) {
    const message = nftUid 
      ? `NMKR token ${nftUid} is not available or does not exist`
      : "NMKR token is not available";
    super(message, orderId, orderItemId, mintId, undefined, "404");
    this.nftUid = nftUid;
    Object.defineProperty(this, "name", { value: "NmkrTokenUnavailableError" });
  }
}

export class NmkrInsufficientCreditsError extends NmkrMintingError {
  constructor(orderId?: string, orderItemId?: string, mintId?: string) {
    const message = "Insufficient credits in NMKR account";
    super(message, orderId, orderItemId, mintId, undefined, "402");
    Object.defineProperty(this, "name", { value: "NmkrInsufficientCreditsError" });
  }
}

export class PaymentStateTransitionError extends OrderProcessingError {
  public currentState?: string;
  public targetState?: string;

  constructor(
    message: string,
    orderId?: string,
    currentState?: string,
    targetState?: string,
  ) {
    super(message, "PAYMENT_STATE_TRANSITION_FAILED", orderId);
    this.currentState = currentState;
    this.targetState = targetState;
    Object.defineProperty(this, "name", { value: "PaymentStateTransitionError" });
  }
}

export class ProductNotFoundError extends ApolloError {
  public productId: string;

  constructor(productId: string) {
    super(`Product not found: ${productId}`, "PRODUCT_NOT_FOUND");
    this.productId = productId;
    Object.defineProperty(this, "name", { value: "ProductNotFoundError" });
  }
}

export class InventoryCalculationError extends ApolloError {
  public productId: string;
  public cause?: string;

  constructor(productId: string, cause: unknown) {
    super(`Inventory calculation failed for product: ${productId}`, "INVENTORY_CALCULATION_ERROR");
    this.productId = productId;
    this.cause = cause instanceof Error ? cause.message : String(cause);
    Object.defineProperty(this, "name", { value: "InventoryCalculationError" });
  }
}

export class OversellDetectedError extends ApolloError {
  public productId: string;
  public oversellAmount: number;
  public snapshot: any;

  constructor(productId: string, oversellAmount: number, snapshot: any) {
    super(`Oversell detected: ${oversellAmount} units for product ${productId}`, "OVERSELL_DETECTED");
    this.productId = productId;
    this.oversellAmount = oversellAmount;
    this.snapshot = snapshot;
    Object.defineProperty(this, "name", { value: "OversellDetectedError" });
  }
}

export class InsufficientInventoryError extends ApolloError {
  public productId: string;
  public requestedQuantity: number;
  public availableQuantity: number;

  constructor(productId: string, requestedQuantity: number, availableQuantity: number) {
    super(`Insufficient inventory for product ${productId}: requested ${requestedQuantity}, available ${availableQuantity}`, "INSUFFICIENT_INVENTORY");
    this.productId = productId;
    this.requestedQuantity = requestedQuantity;
    this.availableQuantity = availableQuantity;
    Object.defineProperty(this, "name", { value: "InsufficientInventoryError" });
  }
}

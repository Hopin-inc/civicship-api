import { IncentiveGrantFailureCode, Prisma } from "@prisma/client";
import { InsufficientBalanceError, NotFoundError, ValidationError } from "@/errors/graphql";

/**
 * Determines the appropriate failure code based on the error type.
 * Uses type-based detection (not string matching) for reliability.
 *
 * @param error - The error object to analyze
 * @returns Appropriate IncentiveGrantFailureCode
 */
export function determineFailureCode(error: unknown): IncentiveGrantFailureCode {
  // InsufficientBalanceError (type-safe detection)
  if (error instanceof InsufficientBalanceError) {
    return IncentiveGrantFailureCode.INSUFFICIENT_FUNDS;
  }

  // NotFoundError with "Wallet"
  if (error instanceof NotFoundError) {
    const message = error.message.toLowerCase();
    if (message.includes("wallet")) {
      return IncentiveGrantFailureCode.WALLET_NOT_FOUND;
    }
  }

  // Other ValidationErrors
  if (error instanceof ValidationError) {
    // Handle other validation errors if needed
  }

  // Prisma DB errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return IncentiveGrantFailureCode.DATABASE_ERROR;
  }

  // Timeout errors (if you have custom TimeoutError class)
  // if (error instanceof TimeoutError) {
  //   return IncentiveGrantFailureCode.TIMEOUT;
  // }

  // Default: unknown error
  return IncentiveGrantFailureCode.UNKNOWN;
}

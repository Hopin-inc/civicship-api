import { Prisma } from "@prisma/client";
import { GqlCommonError } from "@/types/graphql";

export async function handlePrismaError(error: unknown): Promise<GqlCommonError> {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return Promise.resolve({
      __typename: "AuthError",
      message: `${error.message}`,
      statusCode: 500,
    });
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return Promise.resolve({
      __typename: "ComplexQueryError",
      message: `Unknown request error: ${error.message}`,
      statusCode: 500,
    });
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return Promise.resolve({
      __typename: "ComplexQueryError",
      message: `Rust panic error: ${error.message}`,
      statusCode: 500,
    });
  }

  return Promise.resolve({
    __typename: "ComplexQueryError",
    message: "An unknown error occurred.",
    statusCode: 500,
  });
}

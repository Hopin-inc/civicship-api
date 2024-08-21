import { Prisma } from "@prisma/client";
import { GqlExecutionFailure } from "@/types/graphql";

export async function handleError(error: unknown): Promise<GqlExecutionFailure> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return Promise.resolve({
          __typename: "InvalidInputValueError",
          message: `Unique constraint failed on the field: ${error.meta?.target}`,
          fields: [{ name: error.meta?.target as string, message: "Unique constraint failed" }],
          statusCode: 400,
        });
      case "P2003":
        return Promise.resolve({
          __typename: "InvalidInputValueError",
          message: `Foreign key constraint failed on the field: ${error.meta?.field_name}`,
          fields: [
            { name: error.meta?.field_name as string, message: "Foreign key constraint failed" },
          ],
          statusCode: 400,
        });
      default:
        return Promise.resolve({
          __typename: "ComplexQueryError",
          message: `An unknown Prisma client error occurred: ${error.message}`,
          statusCode: 400,
        });
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return Promise.resolve({
      __typename: "InvalidInputValueError",
      message: `${error.message}`,
      fields: [],
      statusCode: 400,
    });
  }

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

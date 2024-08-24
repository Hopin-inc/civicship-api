import { Prisma } from "@prisma/client";
import { GqlCommonError } from "@/types/graphql";

export async function handleError(error: unknown): Promise<GqlCommonError> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P1001":
        return Promise.resolve({
          __typename: "DatabaseConnectionError",
          message: `Can't reach database server at ${error.meta?.database_host}:${error.meta?.database_port}. Please make sure your database server is running at ${error.meta?.database_host}:${error.meta?.database_port}.`,
          statusCode: 500,
        });
      case "P1002":
        return Promise.resolve({
          __typename: "DatabaseConnectionError",
          message: `The database server at ${error.meta?.database_host}:${error.meta?.database_port} was reached but timed out. Please try again. Please make sure your database server is running at ${error.meta?.database_host}:${error.meta?.database_port}.`,
          statusCode: 500,
        });
      case "P1008":
        return Promise.resolve({
          __typename: "DatabaseError",
          message: `Operations timed out after ${error.meta?.time}.`,
          statusCode: 500,
        });
      case "P1010":
        return Promise.resolve({
          __typename: "DatabaseConnectionError",
          message: `User ${error.meta?.database_user} was denied access on the database ${error.meta?.database_name}.`,
          statusCode: 403,
        });
      case "P1011":
        return Promise.resolve({
          __typename: "DatabaseConnectionError",
          message: `Error opening a TLS connection: ${error.message}.`,
          statusCode: 500,
        });
      case "P1017":
        return Promise.resolve({
          __typename: "DatabaseError",
          message: `Server has closed the connection.`,
          statusCode: 500,
        });
      case "P2034":
        return Promise.resolve({
          __typename: "TransactionWriteConflictError",
          message: `Transaction failed due to a write conflict or a deadlock. Please retry your transaction. Error details: ${error.message}`,
          statusCode: 500,
        });
      case "P2035":
        return Promise.resolve({
          __typename: "AssertionViolationError",
          message: `Assertion violation on the database: ${error.message}`,
          statusCode: 500,
        });
      case "P2036":
        return Promise.resolve({
          __typename: "ExternalConnectorError",
          message: `Error in external connector (id ${error.message})`,
          statusCode: 500,
        });
      case "P2037":
        return Promise.resolve({
          __typename: "TooManyConnectionsError",
          message: `Too many database connections opened: ${error.message}`,
          statusCode: 500,
        });
      default:
        return Promise.resolve({
          __typename: "ComplexQueryError",
          message: `An unknown Prisma client error occurred: ${error.message}`,
          statusCode: 500,
        });
    }
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

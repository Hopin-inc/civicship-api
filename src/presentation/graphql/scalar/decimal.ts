import { GraphQLScalarType, Kind } from "graphql";
import { Decimal } from "@prisma/client/runtime/library";

export const DecimalScalar = new GraphQLScalarType({
  name: "Decimal",
  description: "Custom scalar for high-precision decimal (serialized as string)",
  parseValue(value: unknown) {
    if (typeof value === "string" || typeof value === "number") {
      return new Decimal(value);
    }
    throw new Error("Invalid decimal");
  },
  serialize(value: unknown) {
    if (Decimal.isDecimal(value)) {
      return value.toString();
    }
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      return new Decimal(ast.value);
    }
    throw new Error("Invalid decimal literal");
  },
});

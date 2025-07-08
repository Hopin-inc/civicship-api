import { GraphQLScalarType, Kind } from "graphql";
import { Decimal } from "@prisma/client/runtime/library";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";

const DecimalScalar = new GraphQLScalarType({
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

const BigIntScalar = new GraphQLScalarType({
  name: "BigInt",
  description: "Custom scalar for bigint (serialized as string)",

  parseValue(value: unknown) {
    if (typeof value === "string" || typeof value === "number") {
      return BigInt(value);
    }
    throw new Error("Invalid BigInt");
  },

  serialize(value: unknown) {
    if (typeof value === "bigint") {
      return value.toString(); // GraphQLは bigint を直接返せないため string 化
    }
    if (typeof value === "number") {
      return BigInt(value).toString();
    }
    if (typeof value === "string") {
      return BigInt(value).toString();
    }
    throw new Error("Expected bigint, number, or string for serialization");
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.INT || ast.kind === Kind.STRING) {
      return BigInt(ast.value);
    }
    throw new Error("Invalid BigInt literal");
  },
});

const scalarResolvers = {
  Decimal: DecimalScalar,
  Upload: GraphQLUpload,
  BigInt: BigIntScalar,
};

export default scalarResolvers;

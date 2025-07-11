import { ApolloArmor } from "@escape.tech/graphql-armor";
import { GraphQLArmorConfig } from "@escape.tech/graphql-armor-types/dist/declarations/src";

const config: GraphQLArmorConfig = {
  costLimit: {
    enabled: true,
    maxCost: 5000, // GraphQL Armor plugin default
    objectCost: 2, // GraphQL Armor plugin default
    scalarCost: 1, // GraphQL Armor plugin default
    depthCostFactor: 1.5, // GraphQL Armor plugin default
  },
  maxDepth: {
    enabled: true,
    n: 12, // Keep portal-aligned value for depth limit
  },
  maxAliases: {
    enabled: true,
    n: 15, // GraphQL Armor plugin default
  },
  maxDirectives: {
    enabled: true,
    n: 50, // GraphQL Armor plugin default
  },
  maxTokens: {
    enabled: true,
    n: 1000, // GraphQL Armor plugin default
  },
  blockFieldSuggestion: {
    enabled: true, // Keep field suggestion blocking enabled
  },
};

const armor = new ApolloArmor(config);
export const armorProtection = armor.protect();

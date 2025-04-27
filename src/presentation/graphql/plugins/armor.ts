import { ApolloArmor } from "@escape.tech/graphql-armor";
import { GraphQLArmorConfig } from "@escape.tech/graphql-armor-types/dist/declarations/src";

const config: GraphQLArmorConfig = {
  costLimit: {
    enabled: true,
    maxCost: 5000, // Maximum allowed query cost
    objectCost: 2, // Default cost for object fields
    scalarCost: 1, // Default cost for scalar fields
    depthCostFactor: 1.5, // Cost increases with query depth
  },
  maxDepth: {
    enabled: true,
    n: 10, // Maximum allowed query depth
  },
  maxAliases: {
    enabled: true,
    n: 15, // Maximum number of aliases
  },
  maxDirectives: {
    enabled: true,
    n: 50, // Maximum number of directives
  },
  maxTokens: {
    enabled: true,
    n: 15000, // Maximum number of tokens (roughly equivalent to character limit)
  },
  blockFieldSuggestion: {
    enabled: true, // Disable field suggestion hints
  },
};

const armor = new ApolloArmor(config);
export const armorProtection = armor.protect();

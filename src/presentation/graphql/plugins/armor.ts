import { ApolloArmor } from "@escape.tech/graphql-armor";
import { GraphQLArmorConfig } from "@escape.tech/graphql-armor-types/dist/declarations/src";

// Limits below are aligned with civicship-portal's measurement engine
// (@escape.tech/graphql-armor-* shared with this server). Portal sets
// CLIENT_LIMITS at its observed max usage and BACKEND_LIMITS = CLIENT × 1.2,
// giving 20% headroom and a layered defense where build-time client checks
// fire before backend rejection. Cost formula parameters
// (objectCost / scalarCost / depthCostFactor) are kept at the GraphQL Armor
// defaults so portal's measurements remain bit-equivalent to backend
// enforcement.
const config: GraphQLArmorConfig = {
  costLimit: {
    enabled: true,
    maxCost: 3000, // portal-aligned (CLIENT 2500 × 1.2)
    objectCost: 2, // GraphQL Armor plugin default - keep parity with portal measurement
    scalarCost: 1, // GraphQL Armor plugin default - keep parity with portal measurement
    depthCostFactor: 1.5, // GraphQL Armor plugin default - keep parity with portal measurement
  },
  maxDepth: {
    enabled: true,
    n: 13, // portal-aligned (CLIENT 11 × 1.2 ≒ 13)
  },
  maxAliases: {
    enabled: true,
    n: 4, // portal-aligned (CLIENT 3 × 1.2 ≒ 4)
  },
  maxDirectives: {
    enabled: true,
    n: 9, // portal-aligned (CLIENT 7 × 1.2 ≒ 9)
  },
  maxTokens: {
    enabled: true,
    n: 480, // portal-aligned (CLIENT 400 × 1.2)
  },
  blockFieldSuggestion: {
    enabled: true, // Keep field suggestion blocking enabled
  },
};

const armor = new ApolloArmor(config);
export const armorProtection = armor.protect();

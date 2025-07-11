import { ApolloArmor } from "@escape.tech/graphql-armor";
import { GraphQLArmorConfig } from "@escape.tech/graphql-armor-types/dist/declarations/src";


const config: GraphQLArmorConfig = {
  costLimit: {
    enabled: true,
    maxCost: 200, // Aligned with portal ESLint cost-limit rule (was 5000)
    objectCost: 2, // Keep same as portal ESLint rule
    scalarCost: 1, // Keep same as portal ESLint rule
    depthCostFactor: 1.5, // Keep same as portal ESLint rule
  },
  maxDepth: {
    enabled: true,
    n: 9, // Aligned with portal ESLint selection-set-depth rule (was 20)
  },
  maxAliases: {
    enabled: true,
    n: 1, // Aligned with portal ESLint max-aliases rule (was 15)
  },
  maxDirectives: {
    enabled: true,
    n: 10, // Aligned with portal ESLint max-directives rule (was 50)
  },
  maxTokens: {
    enabled: true,
    n: 600, // Aligned with portal ESLint max-tokens rule (was 15000)
  },
  blockFieldSuggestion: {
    enabled: true, // Keep field suggestion blocking enabled
  },
};

const armor = new ApolloArmor(config);
export const armorProtection = armor.protect();

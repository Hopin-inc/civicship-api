import { ApolloArmor } from "@escape.tech/graphql-armor";

const armor = new ApolloArmor();
export const armorProtection = armor.protect();

// GraphQL Armor Default Protections:
//
// - Query Depth Limit: Restricts the maximum depth of GraphQL queries to prevent overly nested queries.
//   Default: 6
//
// - Query Cost Limit: Evaluates the complexity of queries and rejects those that are too complex.
//   Default maximum cost: 5000
//
// - Alias Count Limit: Limits the number of aliases that can be used in a single query.
//   Default: 15
//
// - Directive Count Limit: Limits the number of directives that can be used in a single query.
//   Default: 50
//
// - Character Limit: Restricts the maximum number of characters in a query to prevent excessively large queries.
//   Default: 15000
//
// - Field Suggestion Disabling: Disables suggestions for non-existent fields to prevent information disclosure.
//
// - Batch Request Disabling: Disables the ability to send multiple queries in a single request to prevent abuse.
//
// - Stack Trace Hiding: Hides stack traces in error messages to prevent leakage of internal implementation details.

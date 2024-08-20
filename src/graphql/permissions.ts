import {
  shield,
  // rule,
  allow,
} from "graphql-shield";

// const isAuthenticated = rule({ cache: "contextual" })(async (parent, args, { user }) => {
//   return !!user;
// });

export const permissions = shield({
  // User: {
  //   firstName: isAuthenticated,
  //   middleName: isAuthenticated,
  //   lastName: isAuthenticated,
  // },
}, {
  fallbackRule: allow,
});

import {
  shield,
  // rule,
  allow,
} from "graphql-shield";
// import { IContext } from "@/types/server";

// const isAuthenticated = rule({ cache: "contextual" })(async (_, __, { currentUser }: IContext) => {
//   return !!currentUser;
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

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { auth } from "@/libs/firebase";
import http from "http";
import { PrismaClientIssuer } from "@/prisma/client";
import { IContext } from "@/types/server";
import { SignInProvider } from "@/consts/utils";
import { userAuthInclude } from "@/domains/user/type";
import { membershipAuthSelect } from "@/domains/membership/type";
import { opportunityAuthSelect } from "@/domains/opportunity/type";
import { createLoaders } from "@/graphql/dataloader";

export const authHandler = (server: ApolloServer<IContext>) =>
  expressMiddleware(server, {
    context: async ({ req }) => {
      const issuer = new PrismaClientIssuer();
      const idToken = getIdTokenFromRequest(req);

      if (!idToken) {
        return {} satisfies IContext;
      }

      const decoded = await auth.verifyIdToken(idToken);
      const uid = decoded.uid;
      const platform = SignInProvider[decoded.firebase.sign_in_provider];

      const currentUser = await issuer.internal(async (tx) => {
        return tx.user.findFirst({
          where: {
            identities: {
              some: { uid },
            },
          },
          include: userAuthInclude,
        });
      });

      const memberships = await issuer.internal(async (tx) => {
        return tx.membership.findMany({
          where: { userId: uid },
          select: membershipAuthSelect,
        });
      });

      const opportunitiesCreatedBy = await issuer.internal(async (tx) => {
        return tx.opportunity.findMany({
          where: { createdBy: uid },
          select: opportunityAuthSelect,
        });
      });

      const loaders = createLoaders(issuer);

      return {
        uid,
        platform,
        currentUser,
        memberships,
        opportunitiesCreatedBy,
        loaders,
      } satisfies IContext;
    },
  });

function getIdTokenFromRequest(req: http.IncomingMessage) {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer\s+/, "");
}

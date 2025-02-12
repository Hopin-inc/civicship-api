import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { auth } from "@/libs/firebase";
import http from "http";
import { PrismaClientIssuer } from "@/prisma/client";
import { IContext } from "@/types/server";
import { SignInProvider } from "@/consts/utils";
import { authInclude } from "@/domains/user/type";
import { authSelect } from "@/domains/membership/type";

export const authHandler = (server: ApolloServer<IContext>) =>
  expressMiddleware(server, {
    context: async ({ req }) => {
      const issuer = new PrismaClientIssuer();
      const idToken = getIdTokenFromRequest(req);
      if (idToken) {
        const decoded = await auth.verifyIdToken(idToken);
        const uid = decoded?.uid;
        const platform = SignInProvider[decoded.firebase.sign_in_provider];
        const currentUser = await issuer.internal(async (tx) => {
          const user = await tx.user.findFirst({
            where: {
              identities: {
                some: { uid },
              },
            },
            include: authInclude,
          });

          if (!user) {
            return null;
          }

          const memberships = await tx.membership.findMany({
            where: { userId: user.id },
            select: authSelect,
          });

          return {
            ...user,
            memberships,
          };
        });
        console.log(currentUser);
        return { uid, platform, currentUser } satisfies IContext;
      } else {
        return {} satisfies IContext;
      }
    },
  });

const getIdTokenFromRequest = (req: http.IncomingMessage) => {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer (.*)/, "$1");
};

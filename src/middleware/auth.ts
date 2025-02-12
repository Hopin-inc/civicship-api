import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { auth } from "@/libs/firebase";
import http from "http";
import { PrismaClientIssuer } from "@/prisma/client";
import { IContext } from "@/types/server"; // IContext の型定義が必要
import { SignInProvider } from "@/consts/utils"; // これは IdentityPlatform に対応?
import { authInclude } from "@/domains/user/type";
import { authSelect } from "@/domains/membership/type";

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
          include: authInclude,
        });
      });

      const memberships = await issuer.internal(async (tx) => {
        return tx.membership.findMany({
          where: { userId: uid },
          select: authSelect,
        });
      });

      return { uid, platform, currentUser, memberships } satisfies IContext;
    },
  });

function getIdTokenFromRequest(req: http.IncomingMessage) {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer\s+/, "");
}

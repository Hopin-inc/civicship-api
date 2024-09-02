import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { auth } from "@/libs/firebase";
import http from "http";
import { prismaClient } from "@/prisma/client";
import { IContext } from "@/types/server";

export const authHandler = (server: ApolloServer<IContext>) => expressMiddleware(server, {
  context: async ({ req }) => {
    const idToken = getIdTokenFromRequest(req);
    if (idToken) {
      const decoded = await auth.verifyIdToken(idToken);
      const uid = decoded?.uid;
      const identity = await prismaClient.identity.findUnique({
        where: { uid },
        include: {
          user: true,
        },
      });
      const currentUser = identity?.user;
      return { uid, currentUser } satisfies IContext;
    } else {
      return {} satisfies IContext;
    }
  },
});

const getIdTokenFromRequest = (req: http.IncomingMessage) => {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer (.*)/, "$1");
};

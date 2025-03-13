import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { IContext } from "@/types/server";
import { SignInProvider } from "@/consts/utils";
import { userAuthInclude } from "@/application/user/data/type";
import { membershipAuthSelect } from "@/application/membership/data/type";
import { opportunityAuthSelect } from "@/application/opportunity/data/type";
import { createLoaders } from "@/presentation/graphql/dataloader";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { auth } from "@/infrastructure/libs/firebase";
import { opportunityInvitationAuthSelect } from "@/application/opportunityInvitation/data/type";

function getIdTokenFromRequest(req: http.IncomingMessage): string | undefined {
  const idToken: string | undefined = req.headers["authorization"];
  return idToken?.replace(/^Bearer\s+/, "");
}

export async function createContext({ req }: { req: http.IncomingMessage }): Promise<IContext> {
  const issuer = new PrismaClientIssuer();
  const idToken = getIdTokenFromRequest(req);

  if (!idToken) {
    return {} as IContext;
  }

  const decoded = await auth.verifyIdToken(idToken);
  const uid = decoded.uid;
  const platform = SignInProvider[decoded.firebase.sign_in_provider];

  const currentUser = await issuer.internal(async (tx) => {
    return tx.user.findFirst({
      where: { identities: { some: { uid } } },
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

  const opportunityInvitationCreatedBy = await issuer.internal(async (tx) => {
    return tx.opportunityInvitation.findMany({
      where: { createdBy: uid },
      select: opportunityInvitationAuthSelect,
    });
  });

  const loaders = createLoaders(issuer);

  return {
    uid,
    platform,
    currentUser,
    memberships,
    opportunitiesCreatedBy,
    opportunityInvitationCreatedBy,
    loaders,
  } satisfies IContext;
}

export function authHandler(server: ApolloServer<IContext>) {
  return expressMiddleware(server, { context: createContext });
}

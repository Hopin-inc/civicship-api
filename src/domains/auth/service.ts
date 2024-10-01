import { prismaClient } from "@/prisma/client";
import {
  GqlCurrentUserPayload,
} from "@/types/graphql";
import { auth } from "@/libs/firebase";

export default class AuthService {
  private static db = prismaClient;

  static async deleteUser(uid: string): Promise<GqlCurrentUserPayload> {
    const identity = await this.db.identity.findUnique({
      where: { uid },
      include: { user: true },
    });
    if (identity) {
      const { user } = identity;
      await auth.deleteUser(uid);
      await this.db.user.delete({
        where: { id: user.id },
      });
      return { user };
    } else {
      return {
        user: null
      };
    }
  }
}

import { prismaClient } from "@/prisma/client";
import {
  GqlCurrentUserPayload,
} from "@/types/graphql";

export default class AuthService {
  private static db = prismaClient;

  static async currentUser(uid?: string): Promise<GqlCurrentUserPayload> {
    const identity = await this.db.identity.findUnique({
      where: { uid },
      include: { user: true },
    });
    return {
      user: identity?.user,
    }
  }
}

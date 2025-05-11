import { User } from "@prisma/client";
import { GqlCurrentUserPayload, GqlIdentity, GqlUserDeletePayload } from "@/types/graphql";
import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";

export default class IdentityPresenter {
  static create(user: User): GqlCurrentUserPayload {
    return { user };
  }

  static delete(user: User | null): GqlUserDeletePayload {
    return { userId: user?.id };
  }

  static get(r: PrismaIdentityDetail): GqlIdentity {
    return r;
  }
}

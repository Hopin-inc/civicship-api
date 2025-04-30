import { User } from "@prisma/client";
import { GqlCurrentUserPayload, GqlUserDeletePayload } from "@/types/graphql";

export default class IdentityPresenter {
  static create(user: User): GqlCurrentUserPayload {
    return { user };
  }

  static delete(user: User | null): GqlUserDeletePayload {
    return { userId: user?.id };
  }
}

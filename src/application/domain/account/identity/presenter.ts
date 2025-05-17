import { User } from "@prisma/client";
import { GqlCurrentUserPayload, GqlIdentity, GqlUserDeletePayload } from "@/types/graphql";
import { PrismaIdentityDetail } from "@/application/domain/account/identity/data/type";

export default class IdentityPresenter {
  static create(user: User): GqlCurrentUserPayload {
    return {
      __typename: "CurrentUserPayload",
      user,
    };
  }

  static delete(user: User | null): GqlUserDeletePayload {
    return {
      __typename: "UserDeletePayload",
      userId: user?.id,
    };
  }

  static get(identity: PrismaIdentityDetail): GqlIdentity {
    return {
      __typename: "Identity",
      ...identity,
    };
  }
}

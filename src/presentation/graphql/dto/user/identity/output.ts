import { User } from "@prisma/client";
import { GqlCurrentUserPayload } from "@/types/graphql";

export default class IdentityResponseFormat {
  static create(user: User): GqlCurrentUserPayload {
    return { user };
  }

  static delete(user: User | null): GqlCurrentUserPayload {
    return { user };
  }
}

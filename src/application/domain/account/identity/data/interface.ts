import { Identity } from "@prisma/client";

export interface IIdentityRepository {
  find(uid: string): Promise<Identity | null>;
}

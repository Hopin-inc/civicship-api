import { User } from "@prisma/client";

export type Context = {
  user?: User,
};

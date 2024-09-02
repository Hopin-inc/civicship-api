import { User } from "@prisma/client";

type LoggedInUserInfo = {
  uid: string;
  currentUser: User | undefined;
};
export type IContext = (
  | Record<string, never>
  | LoggedInUserInfo
);

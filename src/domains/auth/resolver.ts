import AuthService from "@/domains/auth/service";
import { IContext } from "@/types/server";

const authResolver = {
  Query: {
    currentUser: async (_: unknown, __: unknown, ctx: IContext, ___: unknown) =>
      AuthService.currentUser(ctx.uid),
  },
};

export default authResolver;

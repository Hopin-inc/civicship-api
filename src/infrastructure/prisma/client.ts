import { PrismaClient, SysRole } from "@prisma/client";
import { IContext } from "@/types/server";
import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { AuthorizationError } from "@/errors/graphql";

type Transaction = Omit<PrismaClient, ITXClientDenyList>;
type CallbackFn<T> = (prisma: Transaction) => Promise<T>;

export const prismaClient = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "event" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});
prismaClient.$on("query", async ({ query, params }) => {
  console.info("Prisma: Query issued.", { query, params });
});
prismaClient.$on("error", async ({ message, target }) => {
  console.error("Prisma: Error occurred.", { message, target });
});

export class PrismaClientIssuer {
  private readonly client: PrismaClient;

  constructor() {
    this.client = prismaClient;
  }

  public internal<T>(callback: CallbackFn<T>): Promise<T> {
    return this.bypassRls(callback);
  }

  public public<T>(_ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    return this.bypassRls(callback);
  }

  public admin<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    if (ctx.currentUser?.sysRole === SysRole.SYS_ADMIN) {
      return this.bypassRls(callback);
    } else {
      throw new AuthorizationError("User must be admin");
    }
  }

  private bypassRls<T>(callback: CallbackFn<T>): Promise<T> {
    return this.client.$transaction(
      async (tx) => {
        return await callback(tx);
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );
  }
}

export interface Context {
  prisma: PrismaClient;
}

import { PrismaClient, SysRole } from "@prisma/client";
import { IContext } from "@/types/server";
import { ITXClientDenyList } from "@prisma/client/runtime/library";

// type CallbackFn = Parameters<typeof PrismaClient.prototype.$transaction>[0];
type Transaction = Omit<PrismaClient, ITXClientDenyList>;
type CallbackFn<T> = (prisma: Transaction) => Promise<T>

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

  public onlyBelongingOrganization<T>({ currentUser }: IContext, callback: CallbackFn<T>): Promise<T> {
    if (currentUser) {
      return this.client.$transaction(async (tx) => {
        await this.setRls(tx);
        await this.setRlsConfigUserId(tx, currentUser.id);
        return await callback(tx);
      });
    } else {
      throw new Error("No organization available!");
    }
  }

  public admin<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    if (ctx.currentUser?.sysRole === SysRole.SYS_ADMIN) {
      return this.bypassRls(callback);
    } else {
      throw new Error("Not admin!");
    }
  }

  private bypassRls<T>(callback: CallbackFn<T>): Promise<T> {
    return this.client.$transaction(async (tx) => {
      await this.setRls(tx, true);
      await this.setRlsConfigUserId(tx, null);
      return await callback(tx);
    });
  }

  private async setRlsConfigUserId(tx: Transaction, userId: string | null) {
    const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>(`SELECT set_config('app.rls_config.user_id', '${ userId ?? "" }', TRUE) as value;`);
    return value;
  }

  private async setRls(tx: Transaction, bypass: boolean = false) {
    const bypassConfig = bypass ? "on" : "off";
    const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>(`SELECT set_config('app.rls_bypass', '${ bypassConfig }', TRUE) as value;`);
    return value;
  }
}

export interface Context {
  prisma: PrismaClient;
}

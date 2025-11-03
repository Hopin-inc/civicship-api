import { PrismaClient } from "@prisma/client";
import { IContext } from "@/types/server";
import { ITXClientDenyList } from "@prisma/client/runtime/library";
import { AuthorizationError } from "@/errors/graphql";
import logger from "@/infrastructure/logging";
import { injectable } from "tsyringe";
import { getPerfAggregator } from "@/infrastructure/observability/als";

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
prismaClient.$on("query", async ({ query, params, duration }) => {
  const aggregator = getPerfAggregator();
  if (aggregator) {
    aggregator.add("db.query", duration, {
      query: query.substring(0, 100),
      duration,
    });
  }

  logger.debug("Prisma query executed", {
    query,
    params,
    duration,
  });

  if (duration > 1000) {
    logger.warn("Slow query detected", {
      query,
      params,
      duration,
    });
  }
});
prismaClient.$on("error", async ({ message, target }) => {
  logger.error("Prisma: Error occurred.", { message, target });
});

prismaClient.$use(async (params, next) => {
  const start = performance.now();
  const result = await next(params);
  const duration = performance.now() - start;

  const aggregator = getPerfAggregator();
  if (aggregator) {
    aggregator.add("db.operation", duration, {
      model: params.model,
      action: params.action,
      durationMs: Number(duration.toFixed(2)),
    });
  }

  return result;
});

@injectable()
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

  public async onlyBelongingCommunity<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    logger.debug("onlyBelongingCommunity invoked", {
      isAdmin: ctx.isAdmin,
      hasCurrentUser: !!ctx.currentUser,
    });

    if (ctx.isAdmin) {
      return this.public(ctx, callback);
    }

    const user = ctx.currentUser;
    if (user) {
      const startedAt = Date.now();
      try {
        return await this.client.$transaction(
          async (tx) => {
            await this.setRls(tx);
            await this.setRlsConfigUserId(tx, user.id);
            return await callback(tx);
          },
          {
            timeout: 10000,
          },
        );
      } finally {
        const duration = Date.now() - startedAt;
        if (duration > 3000) {
          logger.warn("Slow transaction (onlyBelongingCommunity)", { duration });
        } else {
          logger.debug("Transaction completed (onlyBelongingCommunity)", { duration });
        }
      }
    }

    throw new AuthorizationError("Not authenticated");
  }

  public admin<T>(ctx: IContext, callback: CallbackFn<T>): Promise<T> {
    if (ctx.currentUser?.sysRole === "SYS_ADMIN") {
      return this.bypassRls(callback);
    } else {
      throw new AuthorizationError("User must be admin");
    }
  }

  private async bypassRls<T>(callback: CallbackFn<T>): Promise<T> {
    const startedAt = Date.now();
    try {
      return await this.client.$transaction(
        async (tx) => {
          await this.setRls(tx, true);
          await this.setRlsConfigUserId(tx, null);
          return await callback(tx);
        },
        {
          timeout: 10000,
        },
      );
    } finally {
      const duration = Date.now() - startedAt;
      if (duration > 3000) {
        logger.warn("Slow transaction (bypassRls)", { duration });
      } else {
        logger.debug("Transaction completed (bypassRls)", { duration });
      }
    }
  }

  private async setRlsConfigUserId(tx: Transaction, userId: string | null) {
    const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>(
      `SELECT set_config('app.rls_config.user_id', '${userId ?? ""}', FALSE) as value;`,
    );
    return value;
  }

  private async setRls(tx: Transaction, bypass: boolean = false) {
    const bypassConfig = bypass ? "on" : "off";
    const [{ value }] = await tx.$queryRawUnsafe<[{ value: string }]>(
      `SELECT set_config('app.rls_bypass', '${bypassConfig}', FALSE) as value;`,
    );
    return value;
  }
}

export interface Context {
  prisma: PrismaClient;
}

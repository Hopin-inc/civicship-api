import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlTransactionsConnection,
  GqlWalletTransactionsArgs,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import TransactionUseCase from "@/application/domain/transaction/usecase";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import { PrismaClientIssuer } from "@/infrastructure/prisma/client";
import { createWalletUseCase } from "@/application/domain/account/wallet/provider";

const issuer = new PrismaClientIssuer();
const walletUseCase = createWalletUseCase(issuer);

const walletResolver = {
  Query: {
    wallets: async (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) =>
      walletUseCase.visitorBrowseWallets(args, ctx),
    wallet: async (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      return walletUseCase.userViewWallet(args, ctx);
    },
  },

  Wallet: {
    tickets: async (parent: GqlWallet, args: GqlQueryWalletArgs, ctx: IContext) => {
      return TicketUseCase.visitorBrowseTickets(ctx, {
        filter: { walletId: parent.id },
        ...args,
      });
    },
    transactions: async (
      parent: GqlWallet,
      args: GqlWalletTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      return TransactionUseCase.visitorBrowseTransactions(
        {
          filter: { fromWalletId: parent.id, toWalletId: parent.id, ...args },
        },
        ctx,
      );
    },
  },
};

export default walletResolver;

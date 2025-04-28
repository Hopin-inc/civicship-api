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
import "reflect-metadata";
import { container } from "tsyringe";
import WalletUseCase from "@/application/domain/account/wallet/usecase";

const walletUseCase = container.resolve(WalletUseCase);

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
      const ticketUseCase = container.resolve(TicketUseCase);
      return ticketUseCase.visitorBrowseTickets(ctx, {
        filter: { walletId: parent.id },
        ...args,
      });
    },
    transactions: async (
      parent: GqlWallet,
      args: GqlWalletTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      const transactionUseCase = container.resolve(TransactionUseCase);
      return transactionUseCase.visitorBrowseTransactions(
        {
          filter: { fromWalletId: parent.id, toWalletId: parent.id, ...args },
        },
        ctx,
      );
    },
  },
};

export default walletResolver;

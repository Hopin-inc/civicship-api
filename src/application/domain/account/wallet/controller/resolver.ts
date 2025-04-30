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

const walletResolver = {
  Query: {
    wallets: async (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) => {
      const usecase = container.resolve(WalletUseCase);
      return usecase.visitorBrowseWallets(args, ctx);
    },
    wallet: async (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      const usecase = container.resolve(WalletUseCase);
      return usecase.userViewWallet(args, ctx);
    },
  },

  Wallet: {
    tickets: async (parent: GqlWallet, args: GqlQueryWalletArgs, ctx: IContext) => {
      const usecase = container.resolve(TicketUseCase);
      return usecase.visitorBrowseTickets(ctx, {
        filter: { walletId: parent.id },
        ...args,
      });
    },
    transactions: async (
      parent: GqlWallet,
      args: GqlWalletTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      const usecase = container.resolve(TransactionUseCase);
      return usecase.visitorBrowseTransactions(
        {
          filter: { fromWalletId: parent.id, toWalletId: parent.id, ...args },
        },
        ctx,
      );
    },
  },
};

export default walletResolver;

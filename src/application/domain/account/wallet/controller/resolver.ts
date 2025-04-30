import {
  GqlQueryWalletsArgs,
  GqlQueryWalletArgs,
  GqlWallet,
  GqlWalletTransactionsArgs,
  GqlTransactionsConnection,
} from "@/types/graphql";
import { IContext } from "@/types/server";
import { injectable, inject } from "tsyringe";

import WalletUseCase from "@/application/domain/account/wallet/usecase";
import TicketUseCase from "@/application/domain/reward/ticket/usecase";
import TransactionUseCase from "@/application/domain/transaction/usecase";

@injectable()
export default class WalletResolver {
  constructor(
    @inject("WalletUseCase") private readonly walletUseCase: WalletUseCase,
    @inject("TicketUseCase") private readonly ticketUseCase: TicketUseCase,
    @inject("TransactionUseCase") private readonly transactionUseCase: TransactionUseCase,
  ) {}

  Query = {
    wallets: (_: unknown, args: GqlQueryWalletsArgs, ctx: IContext) => {
      return this.walletUseCase.visitorBrowseWallets(args, ctx);
    },
    wallet: (_: unknown, args: GqlQueryWalletArgs, ctx: IContext) => {
      return this.walletUseCase.userViewWallet(args, ctx);
    },
  };

  Wallet = {
    tickets: (parent: GqlWallet, args: GqlQueryWalletArgs, ctx: IContext) => {
      return this.ticketUseCase.visitorBrowseTickets(ctx, {
        filter: { walletId: parent.id },
        ...args,
      });
    },
    transactions: (
      parent: GqlWallet,
      args: GqlWalletTransactionsArgs,
      ctx: IContext,
    ): Promise<GqlTransactionsConnection> => {
      return this.transactionUseCase.visitorBrowseTransactions(
        {
          filter: { fromWalletId: parent.id, toWalletId: parent.id, ...args.filter },
          ...args,
        },
        ctx,
      );
    },
  };
}

import { IContext } from "@/types/server";
import { injectable } from "tsyringe";
import { PrismaNftWalletDetail } from "@/application/domain/account/nft-wallet/data/type";

@injectable()
export default class NftWalletResolver {
  NftWallet = {
    user: (parent: PrismaNftWalletDetail, _: unknown, ctx: IContext) => {
      return ctx.loaders.user.load(parent.userId);
    },
  };
}

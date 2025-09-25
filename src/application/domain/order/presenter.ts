import { injectable } from "tsyringe";
import { GqlOrderCreatePayload } from "@/types/graphql";

@injectable()
export default class OrderPresenter {
  static create(paymentUrl: string): GqlOrderCreatePayload {
    return {
      __typename: "OrderCreateSuccess",
      paymentLink: paymentUrl,
    };
  }
}

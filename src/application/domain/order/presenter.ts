import { injectable } from "tsyringe";
import { GqlOrderCreatePayload } from "@/types/graphql";

@injectable()
export default class OrderPresenter {
  static create(paymentUid: string): GqlOrderCreatePayload {
    return {
      __typename: "OrderCreateSuccess",
      paymentLink: `https://nmkr.io/pay/${paymentUid}`,
    };
  }
}

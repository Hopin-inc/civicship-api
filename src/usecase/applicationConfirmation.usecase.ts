import {
  GqlQueryApplicationConfirmationsArgs,
  GqlQueryApplicationConfirmationArgs,
  GqlMutationApplicationConfirmationCreateArgs,
  GqlApplicationConfirmationCreatePayload,
  GqlApplicationConfirmationsConnection,
  GqlApplicationConfirmation,
} from "@/types/graphql";
import ApplicationConfirmationService from "@/domains/applicationConfirmation/service";
import ApplicationConfirmationResponseFormat from "@/domains/applicationConfirmation/presenter/response";

export default class ApplicationConfirmationUseCase {
  static async userGetManyApplicationConfirmations({
    cursor,
    filter,
    sort,
    first,
  }: GqlQueryApplicationConfirmationsArgs): Promise<GqlApplicationConfirmationsConnection> {
    const take = first ?? 10;
    const data = await ApplicationConfirmationService.fetchApplicationConfirmations(
      { cursor, filter, sort },
      take,
    );
    const hasNextPage = data.totalCount > take;

    const confirmations: GqlApplicationConfirmation[] = data.slice(0, take).map((confirmation) => {
      return ApplicationConfirmationResponseFormat.get(confirmation);
    });
    return ApplicationConfirmationResponseFormat.query(confirmations, hasNextPage);
  }

  static async userGetApplicationConfirmation({
    id,
  }: GqlQueryApplicationConfirmationArgs): Promise<GqlApplicationConfirmation | null> {
    const confirmation = await ApplicationConfirmationService.getApplicationConfirmation({ id });
    if (!confirmation) {
      return null;
    }
    return ApplicationConfirmationResponseFormat.get(confirmation);
  }

  static async userCreateApplicationConfirmation({
    input,
  }: GqlMutationApplicationConfirmationCreateArgs): Promise<GqlApplicationConfirmationCreatePayload> {
    const confirmation = await ApplicationConfirmationService.applicationConfirmationCreate({
      input,
    });
    return ApplicationConfirmationResponseFormat.create(confirmation);
  }
}

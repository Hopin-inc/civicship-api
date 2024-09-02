import {
  GqlQueryApplicationConfirmationsArgs,
  GqlQueryApplicationConfirmationArgs,
  GqlMutationApplicationConfirmationCreateArgs,
} from "@/types/graphql";
import ApplicationConfirmationInputFormat from "@/domains/applicationConfirmation/presenter/input";
import ApplicationConfirmationRepository from "@/domains/applicationConfirmation/repository";

export default class ApplicationConfirmationService {
  static async fetchApplicationConfirmations(
    { filter, sort, cursor }: GqlQueryApplicationConfirmationsArgs,
    take: number,
  ) {
    const where = ApplicationConfirmationInputFormat.filter({ filter });
    const orderBy = ApplicationConfirmationInputFormat.sort({ sort });

    return await ApplicationConfirmationRepository.query(where, orderBy, take, cursor);
  }

  static async getApplicationConfirmation({ id }: GqlQueryApplicationConfirmationArgs) {
    return ApplicationConfirmationRepository.find(id);
  }

  static async applicationConfirmationCreate({
    input,
  }: GqlMutationApplicationConfirmationCreateArgs) {
    const data = ApplicationConfirmationInputFormat.create({ input });
    return ApplicationConfirmationRepository.create(data);
  }
}

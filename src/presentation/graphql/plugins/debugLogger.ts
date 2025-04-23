import { ApolloServerPlugin } from "@apollo/server";
import type { IContext } from "@/types/server";
import logger from "@/infrastructure/logging";

const debugLogger: ApolloServerPlugin<IContext> = {
  async requestDidStart() {
    return {
      async willSendResponse({ request, response }) {
        logger.debug("GraphQL Response: " + (request.operationName ?? "(OpNameUndefined)"), {
          request: {
            query: request.query,
            variables: request.variables,
          },
          response: {
            body: response.body,
          },
        });
      },
    };
  },
};

export default debugLogger;

import { IncomingMessage, ServerResponse } from "http";
import defaultProcessRequest from "graphql-upload/processRequest.mjs";
import logger from "@/infrastructure/logging";

interface ProcessRequestOptions {
  maxFieldSize?: number;
  maxFileSize?: number;
  maxFiles?: number;
}

interface GraphQLOperations {
  query?: string;
  variables?: {
    input?: {
      images?: Array<{
        file?: unknown;
        alt?: string;
        caption?: string;
      }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  operationName?: string;
  [key: string]: unknown;
}

export const customProcessRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  options: ProcessRequestOptions = {}
): Promise<GraphQLOperations | GraphQLOperations[]> => {
  try {
    logger.debug('[CustomProcessRequest] Processing GraphQL multipart request');
    
    const operations = await defaultProcessRequest(request, response, options);
    
    if (Array.isArray(operations)) {
      const filteredOperations = operations.map(filterNullFilesFromOperation);
      logger.debug(`[CustomProcessRequest] Processed ${operations.length} operations in batch`);
      return filteredOperations;
    } else {
      const filteredOperation = filterNullFilesFromOperation(operations);
      logger.debug('[CustomProcessRequest] Processed single operation');
      return filteredOperation;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "File missing in the request.") {
      logger.warn('[CustomProcessRequest] Intercepted "File missing in the request" error - this should not happen with proper filtering');
    }
    
    logger.error('[CustomProcessRequest] Error processing GraphQL multipart request:', error);
    throw error;
  }
};

function filterNullFilesFromOperation(operation: GraphQLOperations): GraphQLOperations {
  if (!operation.variables?.input?.images || !Array.isArray(operation.variables.input.images)) {
    return operation;
  }
  
  const originalLength = operation.variables.input.images.length;
  
  const filteredImages = operation.variables.input.images.filter((image: unknown) => {
    if (image && typeof image === 'object' && image !== null && 'file' in image) {
      const imageObj = image as { file: unknown };
      if (imageObj.file === null || imageObj.file === undefined) {
        logger.debug('[CustomProcessRequest] Filtering out null/undefined file from images array');
        return false;
      }
    }
    return true;
  });
  
  if (filteredImages.length !== originalLength) {
    logger.debug(`[CustomProcessRequest] Filtered ${originalLength - filteredImages.length} null files from GraphQL operation`);
    
    return {
      ...operation,
      variables: {
        ...operation.variables,
        input: {
          ...operation.variables.input,
          images: filteredImages
        }
      }
    };
  }
  
  return operation;
}

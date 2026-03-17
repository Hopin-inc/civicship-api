import { IncomingMessage, ServerResponse } from "http";
import defaultProcessRequest from "graphql-upload/processRequest.mjs";
import logger from "@/infrastructure/logging";
import Busboy from "busboy";

const SPEC_URL = "https://github.com/jaydenseric/graphql-multipart-request-spec";

/**
 * HTTP 400 error for malformed multipart requests.
 * Properties `status` and `expose` are recognised by graphqlUploadExpress
 * so the correct status code propagates to the client.
 */
class MultipartBadRequestError extends Error {
  status = 400;
  expose = true;
  constructor(message: string) {
    super(message);
    this.name = "MultipartBadRequestError";
  }
}

interface ProcessRequestOptions {
  maxFieldSize?: number;
  maxFileSize?: number;
  maxFiles?: number;
}

type MapShape = Record<string, string[]>;

interface GraphQLOperations {
  query?: string;
  variables?: Record<string, unknown>;
  operationName?: string;
  [key: string]: unknown;
}

interface LoggedDecision {
  fileKey: string;
  path: string;
  operationsValue: 'non-null' | null;
  hasRealFile: boolean;
  keep: boolean;
}

async function createReconstructedRequest(
  body: Buffer,
  originalRequest: IncomingMessage,
  updateContentLength: boolean = false
): Promise<IncomingMessage> {
  const { Readable } = await import('stream');
  const newRequest = new Readable({
    read() {
      this.push(body);
      this.push(null);
    }
  }) as IncomingMessage;

  newRequest.headers = { ...originalRequest.headers };
  newRequest.method = originalRequest.method;
  newRequest.url = originalRequest.url;
  
  if (updateContentLength) {
    newRequest.headers['content-length'] = body.length.toString();
  }

  return newRequest;
}


function getByPath(obj: Record<string, unknown> | unknown[], dotted: string): unknown {
  return dotted.split('.').reduce((acc: unknown, key: string) => {
    if (acc == null) return acc;
    const idx = /^\d+$/.test(key) ? Number(key) : key;
    return (acc as Record<string, unknown> | unknown[])[idx as keyof typeof acc];
  }, obj);
}

function sanitizeMap(map: MapShape, operations: GraphQLOperations | GraphQLOperations[], fileKeys: Set<string>): MapShape {
  logger.debug('[CustomProcessRequest] Sanitize map - before', { 
    mapBefore: map, 
    fileKeys: Array.from(fileKeys) 
  });
  
  const out: MapShape = {};
  const decisions: LoggedDecision[] = [];

  for (const [fileKey, paths] of Object.entries(map)) {
    const validPaths = paths.filter((path) => {
      const value = getByPath(operations, path);
      const hasOperationValue = Boolean(value);
      const hasRealFile = fileKeys.has(fileKey);
      const keep = hasOperationValue || hasRealFile;
      
      decisions.push({ 
        fileKey, 
        path, 
        operationsValue: value == null ? null : 'non-null', 
        hasRealFile,
        keep 
      });
      
      return keep;
    });
    
    if (validPaths.length > 0) {
      out[fileKey] = validPaths;
    }
  }

  logger.debug('[CustomProcessRequest] Sanitize map - after', { 
    decisions, 
    mapAfter: out 
  });
  
  return out;
}

export const customProcessRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  options: ProcessRequestOptions = {}
): Promise<GraphQLOperations | GraphQLOperations[]> => {
  const contentType = request.headers['content-type'] || '';
  
  logger.debug('[CustomProcessRequest] Processing request', {
    contentType,
    isMultipart: contentType.includes('multipart/form-data'),
    method: request.method,
    url: request.url
  });
  
  if (!contentType.includes('multipart/form-data')) {
    logger.debug('[CustomProcessRequest] Non-multipart request, using default processor');
    return defaultProcessRequest(request, response, options);
  }

  return new Promise((resolve, reject) => {
    const fileKeys = new Set<string>();
    const textFields = new Map<string, string>();
    const originalBodyChunks: Buffer[] = [];
    const fieldOrder: string[] = [];
    let operations: GraphQLOperations | GraphQLOperations[];
    let map: MapShape;

    request.on('data', (chunk: Buffer) => {
      originalBodyChunks.push(chunk);
    });

    const busboy = Busboy({ 
      headers: request.headers,
      limits: {
        fieldSize: options.maxFieldSize,
        fileSize: options.maxFileSize,
        files: options.maxFiles
      }
    });

    busboy.on('field', (name: string, value: string) => {
      fieldOrder.push(`field:${name}`);
      if (name === 'operations' || name === 'map') {
        textFields.set(name, value);
      }
    });

    busboy.on('file', (name: string, stream: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
      fieldOrder.push(`file:${name}`);
      fileKeys.add(name);
      stream.resume();
    });

    busboy.on('finish', async () => {
      try {
        const operationsStr = textFields.get('operations');
        const mapStr = textFields.get('map');

        // ── Validate required fields per graphql-multipart-request-spec ──

        if (!operationsStr) {
          return reject(
            new MultipartBadRequestError(`Missing multipart field 'operations' (${SPEC_URL})`),
          );
        }

        try {
          operations = JSON.parse(operationsStr);
        } catch {
          return reject(
            new MultipartBadRequestError("Invalid JSON in multipart field 'operations'"),
          );
        }

        // No 'map' field → treat as JSON-over-multipart (no file uploads)
        if (!mapStr) {
          logger.debug('[CustomProcessRequest] No map field, returning operations directly');
          return resolve(operations);
        }

        try {
          map = JSON.parse(mapStr);
        } catch {
          return reject(
            new MultipartBadRequestError("Invalid JSON in multipart field 'map'"),
          );
        }

        // Validate field order: files must follow 'map' per spec
        const mapIndex = fieldOrder.indexOf('field:map');
        const hasFilesBeforeMap = fieldOrder.some(
          (entry, i) => entry.startsWith('file:') && i < mapIndex,
        );
        if (hasFilesBeforeMap) {
          return reject(
            new MultipartBadRequestError(
              `Misordered multipart fields; files should follow 'map' (${SPEC_URL})`,
            ),
          );
        }

        // ── Sanitize map (remove entries whose variable value is null and no real file was sent) ──

        const sanitizedMap = sanitizeMap(map, operations, fileKeys);
        const removedCount = Object.keys(map).length - Object.keys(sanitizedMap).length;

        logger.debug('[CustomProcessRequest] Map sanitization complete', {
          originalMapKeys: Object.keys(map),
          sanitizedMapKeys: Object.keys(sanitizedMap),
          fileKeys: Array.from(fileKeys),
          removedCount
        });

        if (removedCount > 0) {
          if (Object.keys(sanitizedMap).length === 0) {
            logger.debug('[CustomProcessRequest] Converting to JSON (no real files detected)');
            return resolve(operations);
          }
          
          const originalBody = Buffer.concat(originalBodyChunks);
          const sanitizedMapStr = JSON.stringify(sanitizedMap);
          
          let updatedBody: Buffer;
          const mapFieldStart = originalBody.indexOf(Buffer.from('Content-Disposition: form-data; name="map"'));
          if (mapFieldStart === -1) {
            logger.warn('[CustomProcessRequest] Map field not found in multipart body, using original');
            updatedBody = originalBody;
          } else {
            const mapContentStart = originalBody.indexOf(Buffer.from('\r\n\r\n'), mapFieldStart) + 4;
            const mapContentEnd = originalBody.indexOf(Buffer.from('\r\n--'), mapContentStart);
            
            if (mapContentStart > 3 && mapContentEnd > mapContentStart) {
              const beforeMap = originalBody.subarray(0, mapContentStart);
              const afterMap = originalBody.subarray(mapContentEnd);
              const sanitizedMapBuffer = Buffer.from(sanitizedMapStr, 'utf8');
              
              updatedBody = Buffer.concat([beforeMap, sanitizedMapBuffer, afterMap]);
            } else {
              logger.warn('[CustomProcessRequest] Could not locate map content boundaries, using original');
              updatedBody = originalBody;
            }
          }
          
          const filteredRequest = await createReconstructedRequest(updatedBody, request, true);
          return resolve(await defaultProcessRequest(filteredRequest, response, options));
        } else {
          // No sanitization needed — pass through to default processor
          const originalBody = Buffer.concat(originalBodyChunks);
          const passthroughRequest = await createReconstructedRequest(originalBody, request);
          return resolve(await defaultProcessRequest(passthroughRequest, response, options));
        }
      } catch (error) {
        if (error instanceof MultipartBadRequestError) {
          return reject(error);
        }
        logger.error('[CustomProcessRequest] Error in busboy finish handler:', error);
        reject(error);
      }
    });

    busboy.on('error', (error: Error) => {
      logger.error('[CustomProcessRequest] Busboy error:', error);
      reject(error);
    });

    request.pipe(busboy);
  });
};

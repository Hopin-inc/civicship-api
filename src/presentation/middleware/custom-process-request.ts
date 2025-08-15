import { IncomingMessage, ServerResponse } from "http";
import defaultProcessRequest from "graphql-upload/processRequest.mjs";
import logger from "@/infrastructure/logging";
import Busboy from "busboy";

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
  
  logger.info('[CustomProcessRequest] Processing request', {
    contentType,
    isMultipart: contentType.includes('multipart/form-data'),
    method: request.method,
    url: request.url
  });
  
  if (!contentType.includes('multipart/form-data')) {
    logger.info('[CustomProcessRequest] Non-multipart request, using default processor');
    return defaultProcessRequest(request, response, options);
  }

  return new Promise((resolve, reject) => {
    const fileKeys = new Set<string>();
    const textFields = new Map<string, string>();
    const originalBodyChunks: Buffer[] = [];
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
      logger.debug('[CustomProcessRequest] Field detected', { 
        name, 
        size: value.length 
      });
      
      if (name === 'operations' || name === 'map') {
        textFields.set(name, value);
      }
    });

    busboy.on('file', (name: string, stream: NodeJS.ReadableStream, info: { filename: string; encoding: string; mimeType: string }) => {
      const { filename, mimeType } = info;
      
      const safeFilename = filename ? filename.substring(0, 50) + (filename.length > 50 ? '...' : '') : 'none';
      
      logger.info('[CustomProcessRequest] File detected', {
        name,
        filename: safeFilename,
        mimeType,
        hasFilename: Boolean(filename)
      });
      
      fileKeys.add(name);
      
      stream.resume();
    });

    busboy.on('finish', async () => {
      try {
        const operationsStr = textFields.get('operations');
        const mapStr = textFields.get('map');

        if (!operationsStr || !mapStr) {
          const originalBody = Buffer.concat(originalBodyChunks);
          const fallbackRequest = await createReconstructedRequest(originalBody, request);
          return resolve(await defaultProcessRequest(fallbackRequest, response, options));
        }

        try {
          operations = JSON.parse(operationsStr);
          map = JSON.parse(mapStr);
        } catch {
          const originalBody = Buffer.concat(originalBodyChunks);
          const fallbackRequest = await createReconstructedRequest(originalBody, request);
          return resolve(await defaultProcessRequest(fallbackRequest, response, options));
        }

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
            logger.info('[CustomProcessRequest] Converting to JSON (no real files detected)');
            return resolve(operations);
          }
          
          logger.info('[CustomProcessRequest] Filtering multipart request', {
            uploadCount: Object.keys(sanitizedMap).length,
            removedNullFiles: removedCount
          });
          
          const originalBody = Buffer.concat(originalBodyChunks);
          const sanitizedMapStr = JSON.stringify(sanitizedMap);
          
          logger.debug('[CustomProcessRequest] Starting multipart reconstruction', {
            originalSize: originalBody.length,
            sanitizedMapKeys: Object.keys(sanitizedMap),
            originalMapKeys: Object.keys(map)
          });
          
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
              
              logger.debug('[CustomProcessRequest] Multipart body reconstructed with Buffer operations', {
                originalSize: originalBody.length,
                updatedSize: updatedBody.length,
                mapFieldFound: true,
                beforeMapLength: beforeMap.length,
                afterMapLength: afterMap.length,
                sanitizedMapLength: sanitizedMapBuffer.length,
                mapContentStart,
                mapContentEnd,
                originalMapContent: originalBody.subarray(mapContentStart, mapContentEnd).toString('utf8'),
                sanitizedMapContent: sanitizedMapStr
              });
              
              const filePartCount = (updatedBody.toString('utf8').match(/Content-Disposition: form-data; name="file\d+"/g) || []).length;
              const originalFilePartCount = (originalBody.toString('utf8').match(/Content-Disposition: form-data; name="file\d+"/g) || []).length;
              logger.debug('[CustomProcessRequest] File parts verification', {
                filePartsInReconstructedBody: filePartCount,
                filePartsInOriginalBody: originalFilePartCount,
                expectedFileParts: Object.keys(sanitizedMap).length,
                filePartsPreserved: filePartCount === originalFilePartCount
              });
            } else {
              logger.warn('[CustomProcessRequest] Could not locate map content boundaries, using original');
              updatedBody = originalBody;
            }
          }
          
          const filteredRequest = await createReconstructedRequest(updatedBody, request, true);
          return resolve(await defaultProcessRequest(filteredRequest, response, options));
        } else {
          logger.info('[CustomProcessRequest] Passing through unmodified multipart request', {
            uploadCount: Object.keys(map).length
          });
          
          const originalBody = Buffer.concat(originalBodyChunks);
          const passthroughRequest = await createReconstructedRequest(originalBody, request);
          return resolve(await defaultProcessRequest(passthroughRequest, response, options));
        }
      } catch (error) {
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

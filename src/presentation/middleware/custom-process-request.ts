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


function getByPath(obj: Record<string, unknown> | unknown[], dotted: string): unknown {
  return dotted.split('.').reduce((acc: unknown, key: string) => {
    if (acc == null) return acc;
    const idx = /^\d+$/.test(key) ? Number(key) : key;
    return (acc as Record<string, unknown> | unknown[])[idx as keyof typeof acc];
  }, obj);
}

function sanitizeMap(map: MapShape, operations: GraphQLOperations | GraphQLOperations[], fileKeys: Set<string>): MapShape {
  logger.info('[CustomProcessRequest] Sanitize map - before', { 
    mapBefore: map, 
    fileKeys: Array.from(fileKeys) 
  });
  
  const out: MapShape = {};
  const decisions: any[] = [];

  for (const [fileKey, paths] of Object.entries(map)) {
    const validPaths = paths.filter((path) => {
      const value = getByPath(operations as Record<string, unknown>, path);
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

  logger.info('[CustomProcessRequest] Sanitize map - after', { 
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
  
  logger.info('[CustomProcessRequest] Request received details', { 
    contentType, 
    isMultipart: contentType.includes('multipart/form-data') 
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
      logger.info('[CustomProcessRequest] Field detected', { 
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
      
      logger.info('[CustomProcessRequest] File event details', { 
        name, 
        filename: safeFilename, 
        mimeType 
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
          const { Readable } = await import('stream');
          const fallbackRequest = new Readable({
            read() {
              this.push(originalBody);
              this.push(null);
            }
          }) as IncomingMessage;
          
          fallbackRequest.headers = { ...request.headers };
          fallbackRequest.method = request.method;
          fallbackRequest.url = request.url;
          
          return resolve(await defaultProcessRequest(fallbackRequest, response, options));
        }

        try {
          operations = JSON.parse(operationsStr);
          map = JSON.parse(mapStr);
        } catch {
          const originalBody = Buffer.concat(originalBodyChunks);
          const { Readable } = await import('stream');
          const fallbackRequest = new Readable({
            read() {
              this.push(originalBody);
              this.push(null);
            }
          }) as IncomingMessage;
          
          fallbackRequest.headers = { ...request.headers };
          fallbackRequest.method = request.method;
          fallbackRequest.url = request.url;
          
          return resolve(await defaultProcessRequest(fallbackRequest, response, options));
        }

        const sanitizedMap = sanitizeMap(map, operations, fileKeys);
        const removedCount = Object.keys(map).length - Object.keys(sanitizedMap).length;

        logger.info('[CustomProcessRequest] Map sanitization complete', {
          originalMapKeys: Object.keys(map),
          sanitizedMapKeys: Object.keys(sanitizedMap),
          fileKeys: Array.from(fileKeys),
          removedCount
        });

        if (removedCount > 0) {
          if (Object.keys(sanitizedMap).length === 0) {
            logger.info('[CustomProcessRequest] Converting to JSON (no real files detected)');
            logger.info('[CustomProcessRequest] Forward action', { 
              uploadCount: 0, 
              action: 'json-conversion' 
            });
            return resolve(operations);
          }
          
          logger.info('[CustomProcessRequest] Forwarding filtered multipart request', {
            uploadCount: Object.keys(sanitizedMap).length,
            removedNullFiles: removedCount
          });
          
          logger.info('[CustomProcessRequest] Forward action details', { 
            uploadCount: Object.keys(sanitizedMap).length, 
            action: 'filtered-multipart',
            removedNullFiles: removedCount
          });
          
          const originalBody = Buffer.concat(originalBodyChunks);
          const sanitizedMapStr = JSON.stringify(sanitizedMap);
          
          logger.info('[CustomProcessRequest] Starting multipart reconstruction', {
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
              
              logger.info('[CustomProcessRequest] Multipart body reconstructed with Buffer operations', {
                originalSize: originalBody.length,
                updatedSize: updatedBody.length,
                mapFieldFound: true,
                beforeMapLength: beforeMap.length,
                afterMapLength: afterMap.length,
                sanitizedMapLength: sanitizedMapBuffer.length,
                mapContentStart,
                mapContentEnd
              });
              
              const filePartCount = (updatedBody.toString('utf8').match(/Content-Disposition: form-data; name="file\d+"/g) || []).length;
              logger.info('[CustomProcessRequest] File parts verification', {
                filePartsInReconstructedBody: filePartCount,
                expectedFileParts: Object.keys(sanitizedMap).length
              });
            } else {
              logger.warn('[CustomProcessRequest] Could not locate map content boundaries, using original');
              updatedBody = originalBody;
            }
          }
          
          const { Readable } = await import('stream');
          const filteredRequest = new Readable({
            read() {
              this.push(updatedBody);
              this.push(null);
            }
          }) as IncomingMessage;
          
          filteredRequest.headers = { ...request.headers };
          filteredRequest.method = request.method;
          filteredRequest.url = request.url;
          filteredRequest.headers['content-length'] = updatedBody.length.toString();
          
          return resolve(await defaultProcessRequest(filteredRequest, response, options));
        } else {
          logger.info('[CustomProcessRequest] Passing through unmodified multipart request', {
            uploadCount: Object.keys(map).length
          });
          
          logger.info('[CustomProcessRequest] Forward action passthrough', { 
            uploadCount: Object.keys(map).length, 
            action: 'passthrough' 
          });
          
          const originalBody = Buffer.concat(originalBodyChunks);
          const { Readable } = await import('stream');
          const passthroughRequest = new Readable({
            read() {
              this.push(originalBody);
              this.push(null);
            }
          }) as IncomingMessage;
          
          passthroughRequest.headers = { ...request.headers };
          passthroughRequest.method = request.method;
          passthroughRequest.url = request.url;
          
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

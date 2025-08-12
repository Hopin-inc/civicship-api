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

const debug = process.env.LOG_GRAPHQL_UPLOAD_DEBUG === 'true';

function debugLog(obj: any) {
  if (debug) {
    logger.debug('[upload-debug]', obj);
  }
}

function getByPath(obj: Record<string, unknown> | unknown[], dotted: string): unknown {
  return dotted.split('.').reduce((acc: unknown, key: string) => {
    if (acc == null) return acc;
    const idx = /^\d+$/.test(key) ? Number(key) : key;
    return (acc as Record<string, unknown> | unknown[])[idx as keyof typeof acc];
  }, obj);
}

function sanitizeMap(map: MapShape, operations: GraphQLOperations | GraphQLOperations[], fileKeys: Set<string>): MapShape {
  debugLog({ 
    stage: 'sanitize:before', 
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

  debugLog({ 
    stage: 'sanitize:after', 
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
  
  debugLog({ 
    stage: 'received', 
    contentType, 
    isMultipart: contentType.includes('multipart/form-data') 
  });
  
  if (!contentType.includes('multipart/form-data')) {
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
      debugLog({ 
        stage: 'field', 
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
      
      debugLog({ 
        stage: 'file', 
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

        if (removedCount > 0) {
          if (Object.keys(sanitizedMap).length === 0) {
            debugLog({ 
              stage: 'forward', 
              uploadCount: 0, 
              action: 'json-conversion' 
            });
            return resolve(operations);
          }
          
          debugLog({ 
            stage: 'forward', 
            uploadCount: Object.keys(sanitizedMap).length, 
            action: 'filtered-multipart',
            removedNullFiles: removedCount
          });
          
          const originalBody = Buffer.concat(originalBodyChunks);
          const sanitizedMapStr = JSON.stringify(sanitizedMap);
          const mapFieldRegex = /(Content-Disposition: form-data; name="map"\r?\n\r?\n)[^]*?(\r?\n--)/;
          const updatedBody = originalBody.toString().replace(mapFieldRegex, `$1${sanitizedMapStr}$2`);
          
          const { Readable } = await import('stream');
          const filteredRequest = new Readable({
            read() {
              this.push(Buffer.from(updatedBody));
              this.push(null);
            }
          }) as IncomingMessage;
          
          filteredRequest.headers = { ...request.headers };
          filteredRequest.method = request.method;
          filteredRequest.url = request.url;
          filteredRequest.headers['content-length'] = Buffer.byteLength(updatedBody).toString();
          
          return resolve(await defaultProcessRequest(filteredRequest, response, options));
        } else {
          debugLog({ 
            stage: 'forward', 
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

import { IncomingMessage, ServerResponse } from "http";
import defaultProcessRequest from "graphql-upload/processRequest.mjs";
import logger from "@/infrastructure/logging";

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

function sanitizeMap(map: MapShape, operations: GraphQLOperations | GraphQLOperations[], fileFields: Set<string>): MapShape {
  const out: MapShape = {};
  for (const [fileKey, paths] of Object.entries(map)) {
    const validPaths = paths.filter((path) => {
      const value = getByPath(operations as Record<string, unknown>, path);
      return Boolean(value) || fileFields.has(fileKey);
    });
    if (validPaths.length > 0) {
      out[fileKey] = validPaths;
    }
  }
  return out;
}

export const customProcessRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
  options: ProcessRequestOptions = {}
): Promise<GraphQLOperations | GraphQLOperations[]> => {
  logger.debug('[CustomProcessRequest] Processing GraphQL multipart request with minimal preprocessing');
  
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    request.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    request.on('end', async () => {
      try {
        const body = Buffer.concat(chunks);
        const contentType = request.headers['content-type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
          return resolve(await defaultProcessRequest(request, response, options));
        }
        
        const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
        if (!boundary) {
          return resolve(await defaultProcessRequest(request, response, options));
        }
        
        const { textFields, fileFields } = parseMultipartBody(body, boundary);
        const operationsStr = textFields.get('operations');
        const mapStr = textFields.get('map');
        
        if (!operationsStr || !mapStr) {
          return resolve(await defaultProcessRequest(request, response, options));
        }
        
        let operations: GraphQLOperations | GraphQLOperations[];
        let map: MapShape;
        
        try {
          operations = JSON.parse(operationsStr);
          map = JSON.parse(mapStr);
        } catch {
          return resolve(await defaultProcessRequest(request, response, options));
        }
        
        const sanitizedMap = sanitizeMap(map, operations, fileFields);
        const removedCount = Object.keys(map).length - Object.keys(sanitizedMap).length;
        
        if (removedCount > 0) {
          logger.debug(`[CustomProcessRequest] Detected ${removedCount} null file entries`);
          
          if (Object.keys(sanitizedMap).length === 0) {
            logger.debug(`[CustomProcessRequest] No real files present - converting to JSON request`);
            return resolve(operations);
          }
          
          logger.debug(`[CustomProcessRequest] Mixed scenario: ${Object.keys(sanitizedMap).length} real files, ${removedCount} null entries filtered`);
          
          const sanitizedMapStr = JSON.stringify(sanitizedMap);
          const mapFieldRegex = /(Content-Disposition: form-data; name="map"\r?\n\r?\n)[^]*?(\r?\n--)/;
          const updatedBody = body.toString().replace(mapFieldRegex, `$1${sanitizedMapStr}$2`);
          
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
        }
        
        const { Readable } = await import('stream');
        const passthroughRequest = new Readable({
          read() {
            this.push(body);
            this.push(null);
          }
        }) as IncomingMessage;
        
        passthroughRequest.headers = { ...request.headers };
        passthroughRequest.method = request.method;
        passthroughRequest.url = request.url;
        
        return resolve(await defaultProcessRequest(passthroughRequest, response, options));
        
      } catch (error) {
        logger.error('[CustomProcessRequest] Error processing multipart request:', error);
        reject(error);
      }
    });
    
    request.on('error', reject);
  });
};

function parseMultipartBody(body: Buffer, boundary: string): { 
  textFields: Map<string, string>; 
  fileFields: Set<string> 
} {
  const textFields = new Map<string, string>();
  const fileFields = new Set<string>();
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  let start = 0;
  let end = body.indexOf(boundaryBuffer, start);
  
  while (end !== -1) {
    if (start > 0) {
      const partBuffer = body.slice(start, end);
      const headerEndIndex = partBuffer.indexOf('\r\n\r\n');
      
      if (headerEndIndex !== -1) {
        const headerSection = partBuffer.slice(0, headerEndIndex).toString();
        const bodySection = partBuffer.slice(headerEndIndex + 4, -2); // Remove trailing \r\n
        
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        if (nameMatch) {
          const fieldName = nameMatch[1];
          
          if (fieldName === 'operations' || fieldName === 'map') {
            textFields.set(fieldName, bodySection.toString());
          } else {
            const hasFilename = headerSection.includes('filename=');
            const hasContent = bodySection.length > 0;
            if (hasFilename || hasContent) {
              fileFields.add(fieldName);
            }
          }
        }
      }
    }
    
    start = end + boundaryBuffer.length;
    end = body.indexOf(boundaryBuffer, start);
  }
  
  return { textFields, fileFields };
}

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
          logger.debug(`[CustomProcessRequest] Detected ${removedCount} null file entries - converting to JSON request`);
          
          const jsonBody = JSON.stringify(operations);
          
          const { Readable } = await import('stream');
          const jsonRequest = new Readable({
            read() {
              this.push(Buffer.from(jsonBody));
              this.push(null);
            }
          }) as IncomingMessage;
          
          jsonRequest.headers = {
            ...request.headers,
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(jsonBody).toString()
          };
          delete jsonRequest.headers['content-type'];
          jsonRequest.headers['content-type'] = 'application/json';
          jsonRequest.method = request.method;
          jsonRequest.url = request.url;
          
          return resolve(operations);
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
            fileFields.add(fieldName);
          }
        }
      }
    }
    
    start = end + boundaryBuffer.length;
    end = body.indexOf(boundaryBuffer, start);
  }
  
  return { textFields, fileFields };
}

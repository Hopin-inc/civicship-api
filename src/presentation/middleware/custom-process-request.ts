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

function sanitizeMap(map: MapShape, operations: GraphQLOperations | GraphQLOperations[]): MapShape {
  const out: MapShape = {};
  for (const [fileKey, paths] of Object.entries(map)) {
    const validPaths = paths.filter((path) => {
      const value = getByPath(operations as Record<string, unknown>, path);
      return Boolean(value);
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
  logger.debug('[CustomProcessRequest] Processing GraphQL multipart request with sanitization');
  
  const chunks: Buffer[] = [];
  const originalRequest = request;
  
  return new Promise((resolve, reject) => {
    originalRequest.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    originalRequest.on('end', async () => {
      try {
        const body = Buffer.concat(chunks);
        const contentType = originalRequest.headers['content-type'] || '';
        
        if (!contentType.includes('multipart/form-data')) {
          return resolve(await defaultProcessRequest(originalRequest, response, options));
        }
        
        const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
        if (!boundary) {
          return resolve(await defaultProcessRequest(originalRequest, response, options));
        }
        
        const parts = parseMultipartBody(body, boundary);
        const operationsStr = parts.get('operations');
        const mapStr = parts.get('map');
        
        if (!operationsStr || !mapStr) {
          return resolve(await defaultProcessRequest(originalRequest, response, options));
        }
        
        let operations: GraphQLOperations | GraphQLOperations[];
        let map: MapShape;
        
        try {
          operations = JSON.parse(operationsStr);
          map = JSON.parse(mapStr);
        } catch {
          return resolve(await defaultProcessRequest(originalRequest, response, options));
        }
        
        const sanitizedMap = sanitizeMap(map, operations);
        const removedCount = Object.keys(map).length - Object.keys(sanitizedMap).length;
        
        if (removedCount > 0) {
          logger.debug(`[CustomProcessRequest] Sanitized map: removed ${removedCount} null file entries`);
          
          const newBody = reconstructMultipartBody(body, boundary, {
            operations: JSON.stringify(operations),
            map: JSON.stringify(sanitizedMap)
          });
          
          const { Readable } = await import('stream');
          const modifiedRequest = new Readable({
            read() {
              this.push(newBody);
              this.push(null);
            }
          }) as IncomingMessage;
          
          modifiedRequest.headers = { ...originalRequest.headers };
          modifiedRequest.method = originalRequest.method;
          modifiedRequest.url = originalRequest.url;
          modifiedRequest.headers['content-length'] = newBody.length.toString();
          
          return resolve(await defaultProcessRequest(modifiedRequest, response, options));
        }
        
        const { Readable } = await import('stream');
        const passthroughRequest = new Readable({
          read() {
            this.push(body);
            this.push(null);
          }
        }) as IncomingMessage;
        
        passthroughRequest.headers = { ...originalRequest.headers };
        passthroughRequest.method = originalRequest.method;
        passthroughRequest.url = originalRequest.url;
        
        return resolve(await defaultProcessRequest(passthroughRequest, response, options));
        
      } catch (error) {
        logger.error('[CustomProcessRequest] Error processing multipart request:', error);
        reject(error);
      }
    });
    
    originalRequest.on('error', reject);
  });
};

function parseMultipartBody(body: Buffer, boundary: string): Map<string, string> {
  const parts = new Map<string, string>();
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
        if (nameMatch && (nameMatch[1] === 'operations' || nameMatch[1] === 'map')) {
          parts.set(nameMatch[1], bodySection.toString());
        }
      }
    }
    
    start = end + boundaryBuffer.length;
    end = body.indexOf(boundaryBuffer, start);
  }
  
  return parts;
}

function reconstructMultipartBody(
  originalBody: Buffer, 
  boundary: string, 
  newFields: { operations: string; map: string }
): Buffer {
  const parts: Buffer[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}\r\n`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--\r\n`);
  
  parts.push(boundaryBuffer);
  parts.push(Buffer.from('Content-Disposition: form-data; name="operations"\r\n\r\n'));
  parts.push(Buffer.from(newFields.operations));
  parts.push(Buffer.from('\r\n'));
  
  parts.push(boundaryBuffer);
  parts.push(Buffer.from('Content-Disposition: form-data; name="map"\r\n\r\n'));
  parts.push(Buffer.from(newFields.map));
  parts.push(Buffer.from('\r\n'));
  
  const originalBoundaryBuffer = Buffer.from(`--${boundary}`);
  let start = 0;
  let end = originalBody.indexOf(originalBoundaryBuffer, start);
  
  while (end !== -1) {
    if (start > 0) {
      const partBuffer = originalBody.slice(start, end);
      const headerEndIndex = partBuffer.indexOf('\r\n\r\n');
      
      if (headerEndIndex !== -1) {
        const headerSection = partBuffer.slice(0, headerEndIndex).toString();
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        
        if (nameMatch && nameMatch[1] !== 'operations' && nameMatch[1] !== 'map') {
          parts.push(boundaryBuffer);
          parts.push(partBuffer.slice(0, -2)); // Remove trailing \r\n
          parts.push(Buffer.from('\r\n'));
        }
      }
    }
    
    start = end + originalBoundaryBuffer.length;
    end = originalBody.indexOf(originalBoundaryBuffer, start);
  }
  
  parts.push(endBoundaryBuffer);
  return Buffer.concat(parts);
}

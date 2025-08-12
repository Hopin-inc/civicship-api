import { Request, Response, NextFunction } from "express";
import logger from "@/infrastructure/logging";

interface ParsedMultipartData {
  operations?: {
    query: string;
    variables: any;
  };
  map?: Record<string, string[]>;
  files?: Record<string, any>;
}

export const multipartPreprocessor = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.is('multipart/form-data') || !req.path.includes('/graphql')) {
    return next();
  }

  try {
    logger.debug('[MultipartPreprocessor] Processing multipart request');
    
    const parsedData = await parseMultipartRequest(req);
    
    const filteredData = filterNullFiles(parsedData);
    
    if (filteredData.modified) {
      logger.debug('[MultipartPreprocessor] Null files detected and filtered');
      await reconstructMultipartRequest(req, filteredData.data);
    }
    
    next();
  } catch (error) {
    logger.error('[MultipartPreprocessor] Error processing multipart data:', error);
    next();
  }
};

async function parseMultipartRequest(req: Request): Promise<ParsedMultipartData> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const result: ParsedMultipartData = {};
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';
        const boundary = extractBoundary(contentType);
        
        if (!boundary) {
          return resolve(result);
        }
        
        const parts = parseMultipartBuffer(buffer, boundary);
        
        for (const part of parts) {
          if (part.name === 'operations') {
            result.operations = JSON.parse(part.value);
          } else if (part.name === 'map') {
            result.map = JSON.parse(part.value);
          } else if (part.filename) {
            if (!result.files) result.files = {};
            result.files[part.name] = {
              filename: part.filename,
              mimetype: part.mimetype,
              data: part.value
            };
          }
        }
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', reject);
  });
}

function filterNullFiles(data: ParsedMultipartData): { data: ParsedMultipartData; modified: boolean } {
  let modified = false;
  
  if (!data.operations?.variables?.input?.images) {
    return { data, modified };
  }
  
  const images = data.operations.variables.input.images;
  
  if (!Array.isArray(images)) {
    return { data, modified };
  }
  
  const originalLength = images.length;
  
  const filteredImages = images.filter((image: any) => {
    if (image && image.file === null) {
      logger.debug('[MultipartPreprocessor] Filtering out null file from images array');
      return false;
    }
    return true;
  });
  
  if (filteredImages.length !== originalLength) {
    modified = true;
    logger.debug(`[MultipartPreprocessor] Filtered ${originalLength - filteredImages.length} null files`);
    
    const updatedData = {
      ...data,
      operations: {
        ...data.operations,
        variables: {
          ...data.operations.variables,
          input: {
            ...data.operations.variables.input,
            images: filteredImages
          }
        }
      }
    };
    
    return { data: updatedData, modified };
  }
  
  return { data, modified };
}

async function reconstructMultipartRequest(req: Request, data: ParsedMultipartData): Promise<void> {
  const contentType = req.headers['content-type'] || '';
  const boundary = extractBoundary(contentType) || 'boundary';
  
  const newBody = buildMultipartBody(data, boundary);
  
  req.headers['content-length'] = newBody.length.toString();
  
  (req as any)._body = newBody;
  (req as any).body = newBody;
}

function extractBoundary(contentType: string): string | null {
  const match = contentType.match(/boundary=([^;]+)/);
  return match ? match[1].replace(/"/g, '') : null;
}

interface MultipartPart {
  name: string;
  value: any;
  filename?: string;
  mimetype?: string;
}

function parseMultipartBuffer(buffer: Buffer, boundary: string): MultipartPart[] {
  const parts: MultipartPart[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  
  let start = 0;
  let end = buffer.indexOf(boundaryBuffer, start);
  
  while (end !== -1) {
    if (start > 0) {
      const partBuffer = buffer.slice(start, end);
      const part = parseMultipartPart(partBuffer);
      if (part) {
        parts.push(part);
      }
    }
    
    start = end + boundaryBuffer.length;
    end = buffer.indexOf(boundaryBuffer, start);
  }
  
  return parts;
}

function parseMultipartPart(partBuffer: Buffer): MultipartPart | null {
  const headerEndIndex = partBuffer.indexOf('\r\n\r\n');
  if (headerEndIndex === -1) return null;
  
  const headerSection = partBuffer.slice(0, headerEndIndex).toString();
  const bodySection = partBuffer.slice(headerEndIndex + 4);
  
  const nameMatch = headerSection.match(/name="([^"]+)"/);
  const filenameMatch = headerSection.match(/filename="([^"]+)"/);
  const mimetypeMatch = headerSection.match(/Content-Type:\s*([^\r\n]+)/);
  
  if (!nameMatch) return null;
  
  return {
    name: nameMatch[1],
    value: filenameMatch ? bodySection : bodySection.toString().trim(),
    filename: filenameMatch ? filenameMatch[1] : undefined,
    mimetype: mimetypeMatch ? mimetypeMatch[1] : undefined
  };
}

function buildMultipartBody(data: ParsedMultipartData, boundary: string): Buffer {
  const parts: Buffer[] = [];
  const boundaryBuffer = Buffer.from(`--${boundary}\r\n`);
  const endBoundaryBuffer = Buffer.from(`--${boundary}--\r\n`);
  
  if (data.operations) {
    parts.push(boundaryBuffer);
    parts.push(Buffer.from('Content-Disposition: form-data; name="operations"\r\n\r\n'));
    parts.push(Buffer.from(JSON.stringify(data.operations)));
    parts.push(Buffer.from('\r\n'));
  }
  
  if (data.map && Object.keys(data.map).length > 0) {
    parts.push(boundaryBuffer);
    parts.push(Buffer.from('Content-Disposition: form-data; name="map"\r\n\r\n'));
    parts.push(Buffer.from(JSON.stringify(data.map)));
    parts.push(Buffer.from('\r\n'));
  }
  
  if (data.files) {
    for (const [fileKey, fileData] of Object.entries(data.files)) {
      parts.push(boundaryBuffer);
      parts.push(Buffer.from(`Content-Disposition: form-data; name="${fileKey}"; filename="${fileData.filename}"\r\n`));
      parts.push(Buffer.from(`Content-Type: ${fileData.mimetype}\r\n\r\n`));
      parts.push(Buffer.isBuffer(fileData.data) ? fileData.data : Buffer.from(fileData.data));
      parts.push(Buffer.from('\r\n'));
    }
  }
  
  parts.push(endBoundaryBuffer);
  
  return Buffer.concat(parts);
}

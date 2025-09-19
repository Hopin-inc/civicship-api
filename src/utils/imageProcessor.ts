import fs from 'fs';
import path from 'path';

export class ImageProcessor {
  static async convertImageToBase64(imagePath: string): Promise<string> {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      return imageBuffer.toString('base64');
    } catch (error) {
      throw new Error(`Failed to convert image to Base64: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  static getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/png';
    }
  }

  static generateSequentialName(index: number, prefix: string = 'test-image', extension: string = 'png'): string {
    const paddedIndex = index.toString().padStart(3, '0');
    return `${prefix}-${paddedIndex}.${extension}`;
  }
}

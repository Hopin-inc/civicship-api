import { gcsBucketName, storage } from "@/infrastructure/libs/storage";
import path from "path";
import { injectable } from "tsyringe";

type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
};

export interface DocumentUploadResult {
  bucket: string;
  folderPath: string;
  filename: string;
  url: string;
  ext: string;
  mime: string;
}

@injectable()
export default class DocumentService {
  async uploadDocument(
    file: unknown,
    folderPath: string,
  ): Promise<DocumentUploadResult | null> {
    if (!file) {
      return null;
    }

    // GraphQL Upload scalar is Promise-like at runtime
    const uploadFile = (await (file as Promise<unknown>)) as FileUpload;
    const { createReadStream, filename: rawFilename, mimetype: mime } = uploadFile;

    const ext = path.extname(rawFilename);
    const filename = `${Date.now()}_${rawFilename}`;
    const filepath = `${folderPath}/${filename}`;
    const gcsFile = storage.bucket(gcsBucketName).file(filepath);

    await new Promise<void>((resolve, reject) => {
      const stream = createReadStream();
      stream
        .pipe(
          gcsFile.createWriteStream({
            metadata: { contentType: mime },
            resumable: false,
          }),
        )
        .on("finish", resolve)
        .on("error", reject);
    });

    const url = `https://storage.googleapis.com/${gcsBucketName}/${filepath}`;

    return {
      bucket: gcsBucketName,
      folderPath,
      filename,
      url,
      ext,
      mime,
    };
  }
}

import { Prisma } from "@prisma/client";
import { GqlImageInput } from "@/types/graphql";
import { gcsBucketName, storage } from "@/infrastructure/libs/storage";
import path from "path";
import { injectable } from "tsyringe";

type FileUpload = {
  filename: string;
  mimetype: string;
  encoding: string;
  createReadStream: () => NodeJS.ReadableStream;
};

@injectable()
export default class ImageService {
  async uploadPublicImage(
    image: GqlImageInput,
    folderPath: string,
  ): Promise<Prisma.ImageCreateWithoutUsersInput> {
    const { file, alt, caption } = image;
    const uploadFile = (await file) as unknown as FileUpload;

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
      alt,
      caption,
      ext,
      mime,
      isPublic: true,
    } satisfies Prisma.ImageCreateWithoutUsersInput;
  }
}

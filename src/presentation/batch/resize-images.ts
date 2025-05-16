import { storage, getPublicUrl } from "@/infrastructure/libs/storage";
import sharp from "sharp";
import path from "path";
import { prismaClient } from "@/infrastructure/prisma/client";

const targetPrefix = "images/mobile/";
const width = 480;
const quality = 80;
// const bucket = storage.bucket(gcsBucketName);
const bucket = storage.bucket("test-bucket");

/**
 * `originalUrl IS NULL` の Image レコードを対象に、
 * オリジナル画像をリサイズ → GCS に軽量画像保存 → DB 更新（originalUrl, url）
 */
export async function resizeAllImages() {
  const images = await prismaClient.image.findMany({
    where: {
      originalUrl: null,
    },
    take: 10,
  });
  console.log(images);

  for (const image of images) {
    const filePath = `${image.folderPath}/${image.filename}`;
    if (filePath.includes("/mobile/")) continue;

    try {
      const resizedUrl = await resizeAndUploadMobileImage(filePath);

      await prismaClient.image.update({
        where: { id: image.id },
        data: {
          originalUrl: image.url,
          url: resizedUrl,
        },
      });

      console.log(`📝 Updated DB for image ID ${image.id}`);
    } catch (err) {
      console.error(`❌ Failed to process ${image.id} (${filePath})`, err);
    }
  }
}

/**
 * 指定された GCS 上の画像ファイルを、横幅480pxのJPEG形式にリサイズして
 * `/mobile/` フォルダに保存。保存後はその画像の public URL を返す。
 */
async function resizeAndUploadMobileImage(filePath: string): Promise<string> {
  const filename = path.basename(filePath);
  const targetPath = `${targetPrefix}${filename.replace(/\.\w+$/, ".jpg")}`;
  const targetFile = bucket.file(targetPath);

  const [exists] = await targetFile.exists();
  if (!exists) {
    const [buffer] = await bucket.file(filePath).download();

    const resized = await sharp(buffer).resize({ width }).jpeg({ quality }).toBuffer();

    await targetFile.save(resized, {
      contentType: "image/jpeg",
      public: true,
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    console.log(
      `✅ Uploaded: ${getPublicUrl(path.basename(targetPath), path.dirname(targetPath))}`,
    );
  } else {
    console.log(`🔁 Skip (already exists): ${targetPath}`);
  }

  return getPublicUrl(path.basename(targetPath), path.dirname(targetPath));
}

resizeAllImages()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Batch failed", err);
    process.exit(1);
  });

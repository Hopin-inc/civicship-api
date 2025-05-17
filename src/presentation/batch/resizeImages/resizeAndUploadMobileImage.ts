import { storage, getPublicUrl, gcsBucketName } from "@/infrastructure/libs/storage";
import sharp from "sharp";
import path from "path";
import { prismaClient } from "@/infrastructure/prisma/client";
import logger from "@/infrastructure/logging";

const targetPrefix = "images/mobile/";
const width = 480;
const quality = 80;
const bucket = storage.bucket(gcsBucketName);

/**
 * `originalUrl IS NULL` の Image レコードを対象に、
 * オリジナル画像をリサイズ → GCS に軽量画像保存 → DB 更新（originalUrl, url）
 */
export async function resizeAllImages(): Promise<{
  total: number;
  resizedCount: number;
  skippedCount: number;
  failureCount: number;
}> {
  const images = await prismaClient.image.findMany({
    where: {
      originalUrl: null,
    },
  });

  let resizedCount = 0;
  let skippedCount = 0;
  let failureCount = 0;

  for (const image of images) {
    if (
      !image.folderPath ||
      !image.filename ||
      image.folderPath.includes("field") ||
      image.filename.includes("field")
    ) {
      logger.warn(`⚠️ Skip invalid record: ${image.id}`);
      skippedCount++;
      continue;
    }

    const filePath = `${image.folderPath}/${image.filename}`;
    if (filePath.includes("/mobile/")) {
      logger.debug(`🔁 Already mobile: ${filePath}`);
      skippedCount++;
      continue;
    }

    try {
      const resizedUrl = await resizeAndUploadMobileImage(filePath);
      if (!resizedUrl) {
        logger.warn(`⚠️ Skip DB update: resize failed for ${image.id}`);
        skippedCount++;
        continue;
      }

      await prismaClient.image.update({
        where: { id: image.id },
        data: {
          originalUrl: image.url,
          url: resizedUrl,
        },
      });

      logger.debug(`📝 Updated DB for image ID ${image.id}`);
      resizedCount++;
    } catch (err) {
      logger.error(`❌ Failed to process ${image.id} (${filePath})`, err);
      failureCount++;
    }
  }

  const total = images.length;

  logger.info(
    `📦 Resize Summary: ${total} total / ✅ ${resizedCount} / 🔁 ${skippedCount} / ❌ ${failureCount}`,
  );

  return { total, resizedCount, skippedCount, failureCount };
}

/**
 * 指定された GCS 上の画像ファイルを、横幅480pxのJPEG形式にリサイズして
 * `/mobile/` フォルダに保存。保存後はその画像の public URL を返す。
 */
async function resizeAndUploadMobileImage(filePath: string): Promise<string | null> {
  const filename = path.basename(filePath);
  const targetPath = `${targetPrefix}${filename.replace(/\.\w+$/, ".jpg")}`;
  const targetFile = bucket.file(targetPath);
  const srcFile = bucket.file(filePath);

  const [srcExists] = await srcFile.exists();
  if (!srcExists) {
    logger.warn(`⚠️ Source not found: ${filePath}`);
    return null;
  }

  const [targetExists] = await targetFile.exists();
  if (targetExists) {
    logger.debug(`🔁 Skip (already exists): ${targetPath}`);
    return getPublicUrl(path.basename(targetPath), path.dirname(targetPath));
  }

  try {
    const [buffer] = await srcFile.download();
    const resized = await sharp(buffer).resize({ width }).jpeg({ quality }).toBuffer();

    await targetFile.save(resized, {
      contentType: "image/jpeg",
      metadata: {
        cacheControl: "public, max-age=31536000",
      },
    });

    logger.info(`✅ Uploaded: ${targetPath}`);
    return getPublicUrl(path.basename(targetPath), path.dirname(targetPath));
  } catch (err) {
    logger.error(`❌ Resize failed for ${filePath}`, err);
    return null;
  }
}

import { prismaClient } from "@/infrastructure/prisma/client";
import { gcsBucketName, getPublicUrl, storage } from "@/infrastructure/libs/storage";

const bucket = storage.bucket(gcsBucketName);

/**
 * 移動対象の安全な正規化（先頭・末尾スラッシュ除去）
 */
function normalizePath(str: string): string {
  return str.replace(/^\/+|\/+$/g, "");
}

/**
 * `folderPath` に `"undefined"` を含む Image レコードを
 * `images/original` に安全に移動し、DBも更新する
 */
export async function relocateUndefinedImages(): Promise<{
  total: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
}> {
  const images = await prismaClient.image.findMany({
    where: {
      folderPath: { contains: "undefined" },
    },
    orderBy: { createdAt: "desc" },
  });

  const total = images.length;
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  for (const image of images) {
    try {
      // --- パスの正規化 ---
      const cleanFolder = normalizePath(
        image.folderPath.replace(/^kyoso-dev-civicship-storage-public\//, ""),
      );
      const cleanFilename = normalizePath(image.filename);
      const oldPath = `${cleanFolder}/${cleanFilename}`;
      const newFolder = "images/original";
      const newPath = `${newFolder}/${cleanFilename}`;

      const oldFile = bucket.file(oldPath);
      const newFile = bucket.file(newPath);

      // --- ファイル存在チェック ---
      const [exists] = await oldFile.exists();
      if (!exists) {
        console.warn(`⚠️ Skip ${image.id} (missing GCS file): ${oldPath}`);
        skippedCount++;
        continue;
      }

      // --- ファイルコピー & 削除 ---
      await oldFile.copy(newFile);
      await oldFile.delete();

      // --- DB更新 ---
      const newUrl = getPublicUrl(cleanFilename, newFolder);
      await prismaClient.image.update({
        where: { id: image.id },
        data: {
          folderPath: newFolder,
          url: newUrl,
        },
      });

      console.log(`✅ Relocated ${image.id}: ${oldPath} → ${newPath}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed to relocate ${image.id}`, err);
      failureCount++;
    }
  }

  return {
    total,
    successCount,
    failureCount,
    skippedCount,
  };
}

import { relocateUndefinedImages } from "@/presentation/batch/resizeImages/relocateUndefinedImages";
import { resizeAllImages } from "@/presentation/batch/resizeImages/resizeAndUploadMobileImage";
import logger from "@/infrastructure/logging";

/**
 * メイン処理：順番に実行（進捗と件数をログ）
 */
export async function resizeImages() {
  logger.debug("🚚 Starting relocation of undefined images...");

  const result = await relocateUndefinedImages();
  logger.debug(
    `📦 Processed ${result.total} image(s): ` +
      `${result.successCount} succeeded, ` +
      `${result.failureCount} failed, ` +
      `${result.skippedCount} skipped.`,
  );

  logger.debug("🖼 Starting image resizing...");

  const resize = await resizeAllImages();
  logger.debug(
    `🖼 Processed ${resize.total} image(s): ` +
      `${resize.resizedCount} succeeded, ` +
      `${resize.failureCount} failed, ` +
      `${resize.skippedCount} skipped.`,
  );
}

import { relocateUndefinedImages } from "@/presentation/batch/resizeImages/relocateUndefinedImages";
import { resizeAllImages } from "@/presentation/batch/resizeImages/resizeAndUploadMobileImage";

/**
 * メイン処理：順番に実行（進捗と件数をログ）
 */
async function resizeImages() {
  console.log("🚚 Starting relocation of undefined images...");

  const result = await relocateUndefinedImages();
  console.log(
    `📦 Processed ${result.total} image(s): ` +
      `${result.successCount} succeeded, ` +
      `${result.failureCount} failed, ` +
      `${result.skippedCount} skipped.`,
  );

  console.log("🖼 Starting image resizing...");

  const resize = await resizeAllImages();
  console.log(
    `🖼 Processed ${resize.total} image(s): ` +
      `${resize.resizedCount} succeeded, ` +
      `${resize.failureCount} failed, ` +
      `${resize.skippedCount} skipped.`,
  );
}

resizeImages()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Batch failed", err);
    process.exit(1);
  });

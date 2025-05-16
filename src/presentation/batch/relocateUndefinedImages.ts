import { prismaClient } from "@/infrastructure/prisma/client";
import { gcsBucketName, getPublicUrl, storage } from "@/infrastructure/libs/storage";

const bucket = storage.bucket(gcsBucketName);

/**
 * `folderPath === "undefined/undefined"` の画像を images/original に移動し、DBも更新する
 */
export async function relocateUndefinedImages() {
  const images = await prismaClient.image.findMany({
    where: {
      folderPath: { contains: "undefined/undefined" },
    },
    orderBy: { createdAt: "asc" },
    take: 10,
  });

  console.log(images);

  for (const image of images) {
    const normalizedPath = image.folderPath.replace(/^kyoso-dev-civicship-storage-public\//, "");
    const oldPath = `${normalizedPath}/${image.filename}`;
    const newFolder = "images/original";
    const newPath = `${newFolder}/${image.filename}`;

    try {
      await bucket.file(oldPath).copy(bucket.file(newPath));
      await bucket.file(oldPath).delete();

      const newUrl = getPublicUrl(image.filename, newFolder);
      await prismaClient.image.update({
        where: { id: image.id },
        data: {
          folderPath: newFolder,
          url: newUrl,
        },
      });

      console.log(`✅ Relocated ${image.id}: ${oldPath} → ${newPath}`);
    } catch (err) {
      console.error(`❌ Failed to relocate ${image.id}`, err);
    }
  }
}

import path from "path";
import fs from "fs";
import { messagingApi } from "@line/bot-sdk";
import { DeployRichMenuContext, RichMenuDefinition } from "./types";
import {
  resolvePlaceholders,
  safeDeleteAlias,
  safeDeleteRichMenu,
  getRichMenuIdByAlias,
} from "./utils";
import logger from "@/infrastructure/logging";

function getMimeType(imagePath: string): string {
  const ext = path.extname(imagePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

export async function deployRichMenu(
  ctx: DeployRichMenuContext,
  menu: RichMenuDefinition,
): Promise<void> {
  const { lineClient, lineBlobClient, prisma, communityBasePath, liffBaseUrl, configId } = ctx;

  const resolvedMenu = resolvePlaceholders(menu, liffBaseUrl);

  const oldRichMenuId = await getRichMenuIdByAlias(lineClient, menu.alias);

  await safeDeleteAlias(lineClient, menu.alias);

  if (oldRichMenuId) {
    await safeDeleteRichMenu(lineClient, oldRichMenuId);
  }

  const richMenuRequest: messagingApi.RichMenuRequest = {
    size: resolvedMenu.size,
    selected: resolvedMenu.selected,
    name: resolvedMenu.name,
    chatBarText: resolvedMenu.chatBarText,
    areas: resolvedMenu.areas.map((area) => ({
      bounds: area.bounds,
      action: area.action as messagingApi.Action,
    })),
  };

  const createResponse = await lineClient.createRichMenu(richMenuRequest);
  const richMenuId = createResponse.richMenuId;

  logger.debug(`Created rich menu: ${menu.alias} -> ${richMenuId}`);

  const imagePath = path.resolve(communityBasePath, menu.imagePath);
  if (fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: getMimeType(imagePath) });

    logger.debug(`Uploading image for ${menu.alias}: ${imagePath}`);
    await lineBlobClient.setRichMenuImage(richMenuId, imageBlob);
    logger.debug(`Uploaded image for ${menu.alias}`);
  } else {
    logger.warn(`Image not found for ${menu.alias}: ${imagePath}`);
  }

  await lineClient.createRichMenuAlias({
    richMenuAliasId: menu.alias,
    richMenuId,
  });
  logger.debug(`Created alias: ${menu.alias} -> ${richMenuId}`);

  if (menu.roleEntryFor) {
    await prisma.communityLineRichMenuConfig.upsert({
      where: {
        configId_type: {
          configId,
          type: menu.roleEntryFor,
        },
      },
      update: {
        richMenuId,
      },
      create: {
        configId,
        type: menu.roleEntryFor,
        richMenuId,
      },
    });
    logger.debug(`Saved to DB: ${menu.alias} as ${menu.roleEntryFor}`);
  }

  if (menu.isDefault) {
    await lineClient.setDefaultRichMenu(richMenuId);
    logger.debug(`Set default rich menu: ${menu.alias}`);
  }
}

export async function deployRichMenus(
  ctx: DeployRichMenuContext,
  menus: RichMenuDefinition[],
): Promise<void> {
  for (const menu of menus) {
    await deployRichMenu(ctx, menu);
  }
}

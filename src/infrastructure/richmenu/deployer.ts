import path from "path";
import fs from "fs";
import { messagingApi } from "@line/bot-sdk";
import {
  DeployRichMenuContext,
  DeployMenuResult,
  DeploySummary,
  RichMenuDefinition,
} from "./types";
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
): Promise<DeployMenuResult> {
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

  logger.info(`Created rich menu: ${menu.alias} -> ${richMenuId}`);

  const imagePath = path.resolve(communityBasePath, menu.imagePath);
  if (fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = new Blob([imageBuffer], { type: getMimeType(imagePath) });

    logger.info(`Uploading image for ${menu.alias}: ${imagePath}`);
    await lineBlobClient.setRichMenuImage(richMenuId, imageBlob);
    logger.info(`Uploaded image for ${menu.alias}`);
  } else {
    logger.warn(`Image not found for ${menu.alias}: ${imagePath}`);
  }

  await lineClient.createRichMenuAlias({
    richMenuAliasId: menu.alias,
    richMenuId,
  });
  logger.info(`Created alias: ${menu.alias} -> ${richMenuId}`);

  let dbSaved = false;
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
    dbSaved = true;
    logger.info(`Saved to DB: ${menu.alias} as ${menu.roleEntryFor}`);
  }

  if (menu.isDefault) {
    await lineClient.setDefaultRichMenu(richMenuId);
    logger.info(`Set default rich menu: ${menu.alias}`);
  }

  return {
    alias: menu.alias,
    richMenuId,
    dbSaved,
    isDefault: menu.isDefault ?? false,
  };
}

export async function deployRichMenus(
  ctx: DeployRichMenuContext,
  menus: RichMenuDefinition[],
): Promise<DeployMenuResult[]> {
  const results: DeployMenuResult[] = [];

  for (const menu of menus) {
    const result = await deployRichMenu(ctx, menu);
    results.push(result);
  }

  return results;
}

export function writeSummary(
  community: string,
  results: DeployMenuResult[],
  outputPath: string,
): void {
  const summary: DeploySummary = {
    community,
    menus: results,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2));
  logger.info(`Written summary to ${outputPath}`);
}

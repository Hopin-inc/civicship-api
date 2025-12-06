import { messagingApi } from "@line/bot-sdk";
import { RichMenuDefinition, RichMenuArea } from "./types";
import logger from "@/infrastructure/logging";

export function resolvePlaceholders(
  menu: RichMenuDefinition,
  liffBaseUrl: string,
): RichMenuDefinition {
  const resolvedAreas: RichMenuArea[] = menu.areas.map((area) => {
    if (area.action.type === "uri") {
      return {
        ...area,
        action: {
          ...area.action,
          uri: area.action.uri.replace(/\$\{LIFF_BASE_URL\}/g, liffBaseUrl),
        },
      };
    }
    return area;
  });

  return {
    ...menu,
    areas: resolvedAreas,
  };
}

function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; statusCode?: number };
  return e.status === 404 || e.statusCode === 404;
}

export async function safeDeleteAlias(
  client: messagingApi.MessagingApiClient,
  alias: string,
): Promise<void> {
  try {
    await client.deleteRichMenuAlias(alias);
    logger.info(`Deleted alias: ${alias}`);
  } catch (e: unknown) {
    if (isNotFoundError(e)) {
      logger.info(`Alias "${alias}" not found, skipping deletion`);
      return;
    }
    throw e;
  }
}

export async function safeDeleteRichMenu(
  client: messagingApi.MessagingApiClient,
  richMenuId: string,
): Promise<void> {
  try {
    await client.deleteRichMenu(richMenuId);
    logger.info(`Deleted rich menu: ${richMenuId}`);
  } catch (e: unknown) {
    if (isNotFoundError(e)) {
      logger.info(`Rich menu "${richMenuId}" not found, skipping deletion`);
      return;
    }
    throw e;
  }
}

export async function getRichMenuIdByAlias(
  client: messagingApi.MessagingApiClient,
  alias: string,
): Promise<string | null> {
  try {
    const response = await client.getRichMenuAlias(alias);
    return response.richMenuId;
  } catch (e: unknown) {
    if (isNotFoundError(e)) {
      return null;
    }
    throw e;
  }
}

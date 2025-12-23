import "reflect-metadata";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { messagingApi } from "@line/bot-sdk";
import { getCommunityConfig, getAllCommunityIds } from "./index";
import { deployRichMenus } from "./deployer";
import { DeployRichMenuContext } from "./types";
import logger from "@/infrastructure/logging";

interface CliOptions {
  community?: string;
  all?: boolean;
  dryRun?: boolean;
  verbose?: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (const arg of args) {
    if (arg.startsWith("--community=")) {
      options.community = arg.split("=")[1];
    } else if (arg === "--all") {
      options.all = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--verbose") {
      options.verbose = true;
    }
  }

  return options;
}

async function getLineConfig(
  prisma: PrismaClient,
  communityId: string,
): Promise<{ accessToken: string; liffBaseUrl: string; configId: string }> {
  const config = await prisma.communityConfig.findUnique({
    where: { communityId },
    include: { lineConfig: true },
  });

  if (!config?.lineConfig) {
    throw new Error(`LINE config not found for community: ${communityId}`);
  }

  return {
    accessToken: config.lineConfig.accessToken,
    liffBaseUrl: config.lineConfig.liffBaseUrl,
    configId: config.lineConfig.id,
  };
}

async function deployCommunity(
  prisma: PrismaClient,
  communityId: string,
  dryRun: boolean,
  verbose: boolean,
): Promise<void> {
  const config = getCommunityConfig(communityId);
  if (!config) {
    throw new Error(`Community config not found: ${communityId}`);
  }

  const lineConfig = await getLineConfig(prisma, communityId);

  if (dryRun) {
    logger.debug(`[DRY RUN] Would deploy ${config.menus.length} menus for ${communityId}`);
    for (const menu of config.menus) {
      logger.debug(
        `  - ${menu.alias} (roleEntryFor: ${menu.roleEntryFor ?? "none"}, isDefault: ${menu.isDefault ?? false})`,
      );
      if (verbose) {
        logger.debug(`    imagePath: ${menu.imagePath}`);
        logger.debug(`    areas: ${menu.areas.length}`);
      }
    }
    return;
  }

  const lineClient = new messagingApi.MessagingApiClient({
    channelAccessToken: lineConfig.accessToken,
  });

  const lineBlobClient = new messagingApi.MessagingApiBlobClient({
    channelAccessToken: lineConfig.accessToken,
  });

  const communityBasePath = path.resolve(process.cwd(), "src/infrastructure/richmenu", communityId);

  const ctx: DeployRichMenuContext = {
    lineClient,
    lineBlobClient,
    prisma,
    communityBasePath,
    liffBaseUrl: lineConfig.liffBaseUrl,
    configId: lineConfig.configId,
  };

  logger.debug(`Deploying ${config.menus.length} menus for ${communityId}...`);

  await deployRichMenus(ctx, config.menus);

  logger.debug(`Deployment complete for ${communityId}`);
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (!options.community && !options.all) {
    console.error(
      "Usage: pnpm richmenu:deploy --community=<community_id> | --all [--dry-run] [--verbose]",
    );
    console.error("Available communities:", getAllCommunityIds().join(", "));
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const communitiesToDeploy = options.all
      ? getAllCommunityIds()
      : options.community
        ? [options.community]
        : [];

    for (const communityId of communitiesToDeploy) {
      await deployCommunity(prisma, communityId, options.dryRun ?? false, options.verbose ?? false);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    logger.error("Deployment failed", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    console.error(error);
  } else {
    logger.error("Deployment failed", { error: String(error) });
    console.error(error);
  }
  process.exit(1);
});

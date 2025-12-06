import { LineRichMenuType } from "@prisma/client";
import { messagingApi } from "@line/bot-sdk";
import { PrismaClient } from "@prisma/client";

type UriAction = {
  type: "uri";
  label?: string;
  uri: string;
};

type RichMenuSwitchAction = {
  type: "richmenuswitch";
  richMenuAliasId: string;
  data: string;
};

type PostbackAction = {
  type: "postback";
  label?: string;
  data: string;
};

export type RichMenuAction = UriAction | RichMenuSwitchAction | PostbackAction;

export interface RichMenuBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RichMenuArea {
  bounds: RichMenuBounds;
  action: RichMenuAction;
}

export interface RichMenuSize {
  width: number;
  height: number;
}

export interface RichMenuDefinition {
  size: RichMenuSize;
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: RichMenuArea[];
  alias: string;
  imagePath: string;
  roleEntryFor?: LineRichMenuType;
  isDefault?: boolean;
}

export interface CommunityRichMenuConfig {
  communityId: string;
  menus: RichMenuDefinition[];
}

export interface DeployRichMenuContext {
  lineClient: messagingApi.MessagingApiClient;
  lineBlobClient: messagingApi.MessagingApiBlobClient;
  prisma: PrismaClient;
  communityBasePath: string;
  liffBaseUrl: string;
  configId: string;
}

export interface DeployMenuResult {
  alias: string;
  richMenuId: string;
  dbSaved: boolean;
  isDefault: boolean;
}

export interface DeploySummary {
  community: string;
  menus: DeployMenuResult[];
  timestamp: string;
}

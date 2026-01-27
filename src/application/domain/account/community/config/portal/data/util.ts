import { GqlEnableFeature } from "@/types/graphql";

type FeaturesType =
  | "places"
  | "opportunities"
  | "points"
  | "tickets"
  | "articles"
  | "prefectures"
  | "credentials"
  | "justDaoIt"
  | "quests"
  | "languageSwitcher";

const FEATURE_ENUM_TO_STRING: Record<GqlEnableFeature, FeaturesType> = {
  [GqlEnableFeature.Point]: "points",
  [GqlEnableFeature.Ticket]: "tickets",
  [GqlEnableFeature.Opportunity]: "opportunities",
  [GqlEnableFeature.Quest]: "quests",
  [GqlEnableFeature.Credential]: "credentials",
  [GqlEnableFeature.Place]: "places",
  [GqlEnableFeature.Article]: "articles",
  [GqlEnableFeature.LanguageSwitcher]: "languageSwitcher",
  [GqlEnableFeature.JustDaoIt]: "justDaoIt",
  [GqlEnableFeature.Prefecture]: "prefectures",
};

const FEATURE_STRING_TO_ENUM: Record<FeaturesType, GqlEnableFeature> = {
  points: GqlEnableFeature.Point,
  tickets: GqlEnableFeature.Ticket,
  opportunities: GqlEnableFeature.Opportunity,
  quests: GqlEnableFeature.Quest,
  credentials: GqlEnableFeature.Credential,
  places: GqlEnableFeature.Place,
  articles: GqlEnableFeature.Article,
  languageSwitcher: GqlEnableFeature.LanguageSwitcher,
  justDaoIt: GqlEnableFeature.JustDaoIt,
  prefectures: GqlEnableFeature.Prefecture,
};

export function featureEnumToString(feature: GqlEnableFeature): FeaturesType {
  return FEATURE_ENUM_TO_STRING[feature];
}

export function featureStringToEnum(feature: string): GqlEnableFeature | null {
  return FEATURE_STRING_TO_ENUM[feature as FeaturesType] ?? null;
}

export function featureEnumsToStrings(features: GqlEnableFeature[]): FeaturesType[] {
  return features.map(featureEnumToString);
}

export function featureStringsToEnums(features: string[]): GqlEnableFeature[] {
  return features.map(featureStringToEnum).filter((f): f is GqlEnableFeature => f !== null);
}

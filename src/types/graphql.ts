import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { User, Community, Membership, MembershipHistory, Wallet, CurrentPointView, AccumulatedPointView, Opportunity, OpportunitySlot, Place, Participation, ParticipationStatusHistory, Article, Utility, Ticket, TicketIssuer, TicketClaimLink, TicketStatusHistory, Transaction, City, State } from '@prisma/client/index.d';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: bigint; output: bigint; }
  Datetime: { input: Date; output: Date; }
  Decimal: { input: string; output: string; }
  JSON: { input: any; output: any; }
  Upload: { input: typeof import('graphql-upload/GraphQLUpload.mjs'); output: typeof import('graphql-upload/GraphQLUpload.mjs'); }
};

export type GqlAccumulatedPointView = {
  __typename?: 'AccumulatedPointView';
  accumulatedPoint: Scalars['BigInt']['output'];
  walletId?: Maybe<Scalars['String']['output']>;
};

export type GqlApproveReportPayload = GqlApproveReportSuccess;

export type GqlApproveReportSuccess = {
  __typename?: 'ApproveReportSuccess';
  report: GqlReport;
};

export type GqlArticle = {
  __typename?: 'Article';
  authors?: Maybe<Array<GqlUser>>;
  body?: Maybe<Scalars['String']['output']>;
  category: GqlArticleCategory;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  introduction: Scalars['String']['output'];
  opportunities?: Maybe<Array<GqlOpportunity>>;
  publishStatus: GqlPublishStatus;
  publishedAt?: Maybe<Scalars['Datetime']['output']>;
  relatedUsers?: Maybe<Array<GqlUser>>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export const GqlArticleCategory = {
  ActivityReport: 'ACTIVITY_REPORT',
  Interview: 'INTERVIEW'
} as const;

export type GqlArticleCategory = typeof GqlArticleCategory[keyof typeof GqlArticleCategory];
export type GqlArticleCreateInput = {
  authorIds: Array<Scalars['ID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  category: GqlArticleCategory;
  introduction: Scalars['String']['input'];
  publishStatus: GqlPublishStatus;
  relatedOpportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  thumbnail?: InputMaybe<GqlImageInput>;
  title: Scalars['String']['input'];
};

export type GqlArticleCreatePayload = GqlArticleCreateSuccess;

export type GqlArticleCreateSuccess = {
  __typename?: 'ArticleCreateSuccess';
  article: GqlArticle;
};

export type GqlArticleDeletePayload = GqlArticleDeleteSuccess;

export type GqlArticleDeleteSuccess = {
  __typename?: 'ArticleDeleteSuccess';
  articleId: Scalars['ID']['output'];
};

export type GqlArticleEdge = GqlEdge & {
  __typename?: 'ArticleEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlArticle>;
};

export type GqlArticleFilterInput = {
  and?: InputMaybe<Array<GqlArticleFilterInput>>;
  authors?: InputMaybe<Array<Scalars['ID']['input']>>;
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['Datetime']['input']>;
  dateTo?: InputMaybe<Scalars['Datetime']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<GqlArticleFilterInput>;
  or?: InputMaybe<Array<GqlArticleFilterInput>>;
  publishStatus?: InputMaybe<Array<GqlPublishStatus>>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  stateCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlArticleSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  publishedAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlArticleUpdateContentInput = {
  authorIds: Array<Scalars['ID']['input']>;
  body?: InputMaybe<Scalars['String']['input']>;
  category: GqlArticleCategory;
  introduction: Scalars['String']['input'];
  publishStatus: GqlPublishStatus;
  publishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  relatedOpportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  thumbnail?: InputMaybe<GqlImageInput>;
  title: Scalars['String']['input'];
};

export type GqlArticleUpdateContentPayload = GqlArticleUpdateContentSuccess;

export type GqlArticleUpdateContentSuccess = {
  __typename?: 'ArticleUpdateContentSuccess';
  article: GqlArticle;
};

export type GqlArticlesConnection = {
  __typename?: 'ArticlesConnection';
  edges?: Maybe<Array<Maybe<GqlArticleEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlAuthZDirectiveCompositeRulesInput = {
  and?: InputMaybe<Array<InputMaybe<GqlAuthZRules>>>;
  not?: InputMaybe<GqlAuthZRules>;
  or?: InputMaybe<Array<InputMaybe<GqlAuthZRules>>>;
};

export type GqlAuthZDirectiveDeepCompositeRulesInput = {
  and?: InputMaybe<Array<InputMaybe<GqlAuthZDirectiveDeepCompositeRulesInput>>>;
  id?: InputMaybe<GqlAuthZRules>;
  not?: InputMaybe<GqlAuthZDirectiveDeepCompositeRulesInput>;
  or?: InputMaybe<Array<InputMaybe<GqlAuthZDirectiveDeepCompositeRulesInput>>>;
};

export const GqlAuthZRules = {
  CanManageOpportunity: 'CanManageOpportunity',
  IsAdmin: 'IsAdmin',
  IsCommunityManager: 'IsCommunityManager',
  IsCommunityMember: 'IsCommunityMember',
  IsCommunityOwner: 'IsCommunityOwner',
  IsSelf: 'IsSelf',
  IsUser: 'IsUser'
} as const;

export type GqlAuthZRules = typeof GqlAuthZRules[keyof typeof GqlAuthZRules];
export type GqlCheckCommunityPermissionInput = {
  communityId: Scalars['ID']['input'];
};

export type GqlCheckIsSelfPermissionInput = {
  userId: Scalars['ID']['input'];
};

export type GqlCheckOpportunityPermissionInput = {
  communityId: Scalars['ID']['input'];
  opportunityId: Scalars['ID']['input'];
};

export type GqlCitiesConnection = {
  __typename?: 'CitiesConnection';
  edges: Array<GqlCityEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlCitiesInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCitiesSortInput = {
  code?: InputMaybe<GqlSortDirection>;
};

export type GqlCity = {
  __typename?: 'City';
  code: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  state?: Maybe<GqlState>;
};

export type GqlCityEdge = GqlEdge & {
  __typename?: 'CityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlCity>;
};

export const GqlClaimLinkStatus = {
  Claimed: 'CLAIMED',
  Expired: 'EXPIRED',
  Issued: 'ISSUED'
} as const;

export type GqlClaimLinkStatus = typeof GqlClaimLinkStatus[keyof typeof GqlClaimLinkStatus];
export type GqlCommonDocumentOverrides = {
  __typename?: 'CommonDocumentOverrides';
  privacy?: Maybe<GqlCommunityDocument>;
  terms?: Maybe<GqlCommunityDocument>;
};

export type GqlCommonDocumentOverridesInput = {
  privacy?: InputMaybe<GqlCommunityDocumentInput>;
  terms?: InputMaybe<GqlCommunityDocumentInput>;
};

export type GqlCommunitiesConnection = {
  __typename?: 'CommunitiesConnection';
  edges?: Maybe<Array<GqlCommunityEdge>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlCommunity = {
  __typename?: 'Community';
  articles?: Maybe<Array<GqlArticle>>;
  bio?: Maybe<Scalars['String']['output']>;
  config?: Maybe<GqlCommunityConfig>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  establishedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  memberships?: Maybe<Array<GqlMembership>>;
  name?: Maybe<Scalars['String']['output']>;
  opportunities?: Maybe<Array<GqlOpportunity>>;
  participations?: Maybe<Array<GqlParticipation>>;
  places?: Maybe<Array<GqlPlace>>;
  pointName?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utilities?: Maybe<Array<GqlUtility>>;
  wallets?: Maybe<Array<GqlWallet>>;
  website?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunityConfig = {
  __typename?: 'CommunityConfig';
  firebaseConfig?: Maybe<GqlCommunityFirebaseConfig>;
  lineConfig?: Maybe<GqlCommunityLineConfig>;
  signupBonusConfig?: Maybe<GqlCommunitySignupBonusConfig>;
};

export type GqlCommunityConfigInput = {
  lineConfig?: InputMaybe<GqlCommunityLineConfigInput>;
  portalConfig?: InputMaybe<GqlCommunityPortalConfigInput>;
};

export type GqlCommunityCreateInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  config?: InputMaybe<GqlCommunityConfigInput>;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  originalId?: InputMaybe<Scalars['String']['input']>;
  pointName: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityCreatePayload = GqlCommunityCreateSuccess;

export type GqlCommunityCreateSuccess = {
  __typename?: 'CommunityCreateSuccess';
  community: GqlCommunity;
};

export type GqlCommunityDeletePayload = GqlCommunityDeleteSuccess;

export type GqlCommunityDeleteSuccess = {
  __typename?: 'CommunityDeleteSuccess';
  communityId: Scalars['String']['output'];
};

export type GqlCommunityDocument = {
  __typename?: 'CommunityDocument';
  id: Scalars['String']['output'];
  order?: Maybe<Scalars['Int']['output']>;
  path: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type GqlCommunityDocumentInput = {
  id: Scalars['String']['input'];
  order?: InputMaybe<Scalars['Int']['input']>;
  path: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type GqlCommunityEdge = GqlEdge & {
  __typename?: 'CommunityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlCommunity>;
};

export type GqlCommunityFilterInput = {
  cityCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  placeIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlCommunityFirebaseConfig = {
  __typename?: 'CommunityFirebaseConfig';
  tenantId?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunityLineConfig = {
  __typename?: 'CommunityLineConfig';
  accessToken?: Maybe<Scalars['String']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  channelSecret?: Maybe<Scalars['String']['output']>;
  liffAppId?: Maybe<Scalars['String']['output']>;
  liffBaseUrl?: Maybe<Scalars['String']['output']>;
  liffId?: Maybe<Scalars['String']['output']>;
  richMenus?: Maybe<Array<GqlCommunityLineRichMenuConfig>>;
};

export type GqlCommunityLineConfigInput = {
  accessToken: Scalars['String']['input'];
  channelId: Scalars['String']['input'];
  channelSecret: Scalars['String']['input'];
  liffAppId?: InputMaybe<Scalars['String']['input']>;
  liffBaseUrl: Scalars['String']['input'];
  liffId: Scalars['String']['input'];
  richMenus: Array<GqlCommunityLineRichMenuConfigInput>;
};

export type GqlCommunityLineRichMenuConfig = {
  __typename?: 'CommunityLineRichMenuConfig';
  richMenuId: Scalars['String']['output'];
  type: GqlLineRichMenuType;
};

export type GqlCommunityLineRichMenuConfigInput = {
  richMenuId: Scalars['String']['input'];
  type: GqlLineRichMenuType;
};

export type GqlCommunityPortalConfig = {
  __typename?: 'CommunityPortalConfig';
  adminRootPath: Scalars['String']['output'];
  commonDocumentOverrides?: Maybe<GqlCommonDocumentOverrides>;
  communityId: Scalars['String']['output'];
  description: Scalars['String']['output'];
  documents?: Maybe<Array<GqlCommunityDocument>>;
  domain: Scalars['String']['output'];
  enableFeatures: Array<Scalars['String']['output']>;
  faviconPrefix: Scalars['String']['output'];
  firebaseTenantId?: Maybe<Scalars['String']['output']>;
  liffAppId?: Maybe<Scalars['String']['output']>;
  liffBaseUrl?: Maybe<Scalars['String']['output']>;
  liffId?: Maybe<Scalars['String']['output']>;
  logoPath: Scalars['String']['output'];
  ogImagePath: Scalars['String']['output'];
  regionKey?: Maybe<Scalars['String']['output']>;
  regionName?: Maybe<Scalars['String']['output']>;
  rootPath: Scalars['String']['output'];
  shortDescription?: Maybe<Scalars['String']['output']>;
  squareLogoPath: Scalars['String']['output'];
  title: Scalars['String']['output'];
  tokenName: Scalars['String']['output'];
};

export type GqlCommunityPortalConfigInput = {
  adminRootPath?: InputMaybe<Scalars['String']['input']>;
  commonDocumentOverrides?: InputMaybe<GqlCommonDocumentOverridesInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  documents?: InputMaybe<Array<GqlCommunityDocumentInput>>;
  domain?: InputMaybe<Scalars['String']['input']>;
  enableFeatures?: InputMaybe<Array<Scalars['String']['input']>>;
  favicon?: InputMaybe<GqlImageInput>;
  /** @deprecated Use favicon instead */
  faviconPrefix?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<GqlImageInput>;
  /** @deprecated Use logo instead */
  logoPath?: InputMaybe<Scalars['String']['input']>;
  ogImage?: InputMaybe<GqlImageInput>;
  /** @deprecated Use ogImage instead */
  ogImagePath?: InputMaybe<Scalars['String']['input']>;
  regionKey?: InputMaybe<Scalars['String']['input']>;
  regionName?: InputMaybe<Scalars['String']['input']>;
  rootPath?: InputMaybe<Scalars['String']['input']>;
  shortDescription?: InputMaybe<Scalars['String']['input']>;
  squareLogo?: InputMaybe<GqlImageInput>;
  /** @deprecated Use squareLogo instead */
  squareLogoPath?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  tokenName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunitySignupBonusConfig = {
  __typename?: 'CommunitySignupBonusConfig';
  bonusPoint: Scalars['Int']['output'];
  isEnabled: Scalars['Boolean']['output'];
  message?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlCommunityUpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  pointName: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityUpdateProfilePayload = GqlCommunityUpdateProfileSuccess;

export type GqlCommunityUpdateProfileSuccess = {
  __typename?: 'CommunityUpdateProfileSuccess';
  community: GqlCommunity;
};

export type GqlCurrentPointView = {
  __typename?: 'CurrentPointView';
  currentPoint: Scalars['BigInt']['output'];
  walletId?: Maybe<Scalars['String']['output']>;
};

export const GqlCurrentPrefecture = {
  Ehime: 'EHIME',
  Kagawa: 'KAGAWA',
  Kochi: 'KOCHI',
  OutsideShikoku: 'OUTSIDE_SHIKOKU',
  Tokushima: 'TOKUSHIMA',
  Unknown: 'UNKNOWN'
} as const;

export type GqlCurrentPrefecture = typeof GqlCurrentPrefecture[keyof typeof GqlCurrentPrefecture];
export type GqlCurrentUserPayload = {
  __typename?: 'CurrentUserPayload';
  user?: Maybe<GqlUser>;
};

export type GqlDateTimeRangeFilter = {
  gt?: InputMaybe<Scalars['Datetime']['input']>;
  gte?: InputMaybe<Scalars['Datetime']['input']>;
  lt?: InputMaybe<Scalars['Datetime']['input']>;
  lte?: InputMaybe<Scalars['Datetime']['input']>;
};

export type GqlDidIssuanceRequest = {
  __typename?: 'DidIssuanceRequest';
  completedAt?: Maybe<Scalars['Datetime']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  didValue?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  processedAt?: Maybe<Scalars['Datetime']['output']>;
  requestedAt?: Maybe<Scalars['Datetime']['output']>;
  status: GqlDidIssuanceStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export const GqlDidIssuanceStatus = {
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Processing: 'PROCESSING'
} as const;

export type GqlDidIssuanceStatus = typeof GqlDidIssuanceStatus[keyof typeof GqlDidIssuanceStatus];
export type GqlEdge = {
  cursor: Scalars['String']['output'];
};

export type GqlError = {
  __typename?: 'Error';
  code: GqlErrorCode;
  message: Scalars['String']['output'];
};

export const GqlErrorCode = {
  AlreadyEvaluated: 'ALREADY_EVALUATED',
  AlreadyJoined: 'ALREADY_JOINED',
  AlreadyStartedReservation: 'ALREADY_STARTED_RESERVATION',
  AlreadyUsedClaimLink: 'ALREADY_USED_CLAIM_LINK',
  CannotEvaluateBeforeOpportunityStart: 'CANNOT_EVALUATE_BEFORE_OPPORTUNITY_START',
  ClaimLinkExpired: 'CLAIM_LINK_EXPIRED',
  ConcurrentRetryDetected: 'CONCURRENT_RETRY_DETECTED',
  Forbidden: 'FORBIDDEN',
  IncentiveDisabled: 'INCENTIVE_DISABLED',
  InsufficientBalance: 'INSUFFICIENT_BALANCE',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  InvalidGrantStatus: 'INVALID_GRANT_STATUS',
  InvalidTransferMethod: 'INVALID_TRANSFER_METHOD',
  MissingWalletInformation: 'MISSING_WALLET_INFORMATION',
  NotFound: 'NOT_FOUND',
  NoAvailableParticipationSlots: 'NO_AVAILABLE_PARTICIPATION_SLOTS',
  PersonalRecordOnlyDeletable: 'PERSONAL_RECORD_ONLY_DELETABLE',
  RateLimit: 'RATE_LIMIT',
  ReservationAdvanceBookingRequired: 'RESERVATION_ADVANCE_BOOKING_REQUIRED',
  ReservationCancellationTimeout: 'RESERVATION_CANCELLATION_TIMEOUT',
  ReservationFull: 'RESERVATION_FULL',
  ReservationNotAccepted: 'RESERVATION_NOT_ACCEPTED',
  SlotNotScheduled: 'SLOT_NOT_SCHEDULED',
  TicketParticipantMismatch: 'TICKET_PARTICIPANT_MISMATCH',
  Unauthenticated: 'UNAUTHENTICATED',
  Unknown: 'UNKNOWN',
  UnsupportedGrantType: 'UNSUPPORTED_GRANT_TYPE',
  UnsupportedTransactionReason: 'UNSUPPORTED_TRANSACTION_REASON',
  ValidationError: 'VALIDATION_ERROR',
  VoteTopicNotEditable: 'VOTE_TOPIC_NOT_EDITABLE'
} as const;

export type GqlErrorCode = typeof GqlErrorCode[keyof typeof GqlErrorCode];
export type GqlEvaluation = {
  __typename?: 'Evaluation';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  credentialUrl?: Maybe<Scalars['String']['output']>;
  evaluator?: Maybe<GqlUser>;
  histories?: Maybe<Array<GqlEvaluationHistory>>;
  id: Scalars['ID']['output'];
  issuedAt?: Maybe<Scalars['Datetime']['output']>;
  participation?: Maybe<GqlParticipation>;
  status: GqlEvaluationStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  vcIssuanceRequest?: Maybe<GqlVcIssuanceRequest>;
};

export type GqlEvaluationBulkCreateInput = {
  evaluations: Array<GqlEvaluationItem>;
};

export type GqlEvaluationBulkCreatePayload = GqlEvaluationBulkCreateSuccess;

export type GqlEvaluationBulkCreateSuccess = {
  __typename?: 'EvaluationBulkCreateSuccess';
  evaluations: Array<GqlEvaluation>;
};

export type GqlEvaluationCreateInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  participationId: Scalars['ID']['input'];
};

export type GqlEvaluationEdge = GqlEdge & {
  __typename?: 'EvaluationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlEvaluation>;
};

export type GqlEvaluationFilterInput = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  evaluatorId?: InputMaybe<Scalars['ID']['input']>;
  participationId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlEvaluationStatus>;
};

export type GqlEvaluationHistoriesConnection = {
  __typename?: 'EvaluationHistoriesConnection';
  edges: Array<GqlEvaluationHistoryEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlEvaluationHistory = {
  __typename?: 'EvaluationHistory';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  evaluation?: Maybe<GqlEvaluation>;
  id: Scalars['ID']['output'];
  status: GqlEvaluationStatus;
};

export type GqlEvaluationHistoryEdge = GqlEdge & {
  __typename?: 'EvaluationHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlEvaluationHistory>;
};

export type GqlEvaluationHistoryFilterInput = {
  createdByUserId?: InputMaybe<Scalars['ID']['input']>;
  evaluationId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlEvaluationStatus>;
};

export type GqlEvaluationHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlEvaluationItem = {
  comment?: InputMaybe<Scalars['String']['input']>;
  participationId: Scalars['ID']['input'];
  status: GqlEvaluationStatus;
};

export type GqlEvaluationSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export const GqlEvaluationStatus = {
  Failed: 'FAILED',
  Passed: 'PASSED',
  Pending: 'PENDING'
} as const;

export type GqlEvaluationStatus = typeof GqlEvaluationStatus[keyof typeof GqlEvaluationStatus];
export type GqlEvaluationsConnection = {
  __typename?: 'EvaluationsConnection';
  edges: Array<GqlEvaluationEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlGenerateReportInput = {
  communityId: Scalars['ID']['input'];
  parentRunId?: InputMaybe<Scalars['ID']['input']>;
  periodFrom: Scalars['Datetime']['input'];
  periodTo: Scalars['Datetime']['input'];
  variant: GqlReportVariant;
};

export type GqlGenerateReportPayload = GqlGenerateReportSuccess;

export type GqlGenerateReportSuccess = {
  __typename?: 'GenerateReportSuccess';
  report: GqlReport;
};

export type GqlIdentity = {
  __typename?: 'Identity';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  platform?: Maybe<GqlIdentityPlatform>;
  uid: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlIdentityCheckPhoneUserInput = {
  phoneUid: Scalars['String']['input'];
};

export type GqlIdentityCheckPhoneUserPayload = {
  __typename?: 'IdentityCheckPhoneUserPayload';
  membership?: Maybe<GqlMembership>;
  status: GqlPhoneUserStatus;
  user?: Maybe<GqlUser>;
};

export const GqlIdentityPlatform = {
  Facebook: 'FACEBOOK',
  Line: 'LINE',
  Phone: 'PHONE'
} as const;

export type GqlIdentityPlatform = typeof GqlIdentityPlatform[keyof typeof GqlIdentityPlatform];
export type GqlImageInput = {
  alt?: InputMaybe<Scalars['String']['input']>;
  caption?: InputMaybe<Scalars['String']['input']>;
  file?: InputMaybe<Scalars['Upload']['input']>;
};

export type GqlIncentiveGrant = {
  __typename?: 'IncentiveGrant';
  attemptCount: Scalars['Int']['output'];
  community?: Maybe<GqlCommunity>;
  createdAt: Scalars['Datetime']['output'];
  failureCode?: Maybe<GqlIncentiveGrantFailureCode>;
  id: Scalars['ID']['output'];
  lastAttemptedAt?: Maybe<Scalars['Datetime']['output']>;
  lastError?: Maybe<Scalars['String']['output']>;
  sourceId: Scalars['String']['output'];
  status: GqlIncentiveGrantStatus;
  transaction?: Maybe<GqlTransaction>;
  type: GqlIncentiveGrantType;
  updatedAt: Scalars['Datetime']['output'];
  user?: Maybe<GqlUser>;
};

export type GqlIncentiveGrantEdge = GqlEdge & {
  __typename?: 'IncentiveGrantEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlIncentiveGrant>;
};

export const GqlIncentiveGrantFailureCode = {
  DatabaseError: 'DATABASE_ERROR',
  InsufficientFunds: 'INSUFFICIENT_FUNDS',
  Timeout: 'TIMEOUT',
  Unknown: 'UNKNOWN',
  WalletNotFound: 'WALLET_NOT_FOUND'
} as const;

export type GqlIncentiveGrantFailureCode = typeof GqlIncentiveGrantFailureCode[keyof typeof GqlIncentiveGrantFailureCode];
export type GqlIncentiveGrantFilterInput = {
  and?: InputMaybe<Array<GqlIncentiveGrantFilterInput>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  not?: InputMaybe<GqlIncentiveGrantFilterInput>;
  or?: InputMaybe<Array<GqlIncentiveGrantFilterInput>>;
  status?: InputMaybe<GqlIncentiveGrantStatus>;
  type?: InputMaybe<GqlIncentiveGrantType>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlIncentiveGrantRetryInput = {
  incentiveGrantId: Scalars['ID']['input'];
};

export type GqlIncentiveGrantRetryPayload = GqlIncentiveGrantRetrySuccess;

export type GqlIncentiveGrantRetrySuccess = {
  __typename?: 'IncentiveGrantRetrySuccess';
  incentiveGrant: GqlIncentiveGrant;
  transaction?: Maybe<GqlTransaction>;
};

export type GqlIncentiveGrantSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export const GqlIncentiveGrantStatus = {
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Retrying: 'RETRYING'
} as const;

export type GqlIncentiveGrantStatus = typeof GqlIncentiveGrantStatus[keyof typeof GqlIncentiveGrantStatus];
export const GqlIncentiveGrantType = {
  Signup: 'SIGNUP'
} as const;

export type GqlIncentiveGrantType = typeof GqlIncentiveGrantType[keyof typeof GqlIncentiveGrantType];
export type GqlIncentiveGrantsConnection = {
  __typename?: 'IncentiveGrantsConnection';
  edges?: Maybe<Array<Maybe<GqlIncentiveGrantEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlLanguage = {
  En: 'EN',
  Ja: 'JA'
} as const;

export type GqlLanguage = typeof GqlLanguage[keyof typeof GqlLanguage];
export const GqlLineRichMenuType = {
  Admin: 'ADMIN',
  Public: 'PUBLIC',
  User: 'USER'
} as const;

export type GqlLineRichMenuType = typeof GqlLineRichMenuType[keyof typeof GqlLineRichMenuType];
export type GqlLinkPhoneAuthInput = {
  phoneUid: Scalars['String']['input'];
};

export type GqlLinkPhoneAuthPayload = {
  __typename?: 'LinkPhoneAuthPayload';
  success: Scalars['Boolean']['output'];
  user?: Maybe<GqlUser>;
};

export type GqlMembership = {
  __typename?: 'Membership';
  bio?: Maybe<Scalars['String']['output']>;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  headline?: Maybe<Scalars['String']['output']>;
  histories?: Maybe<Array<GqlMembershipHistory>>;
  reason: GqlMembershipStatusReason;
  role: GqlRole;
  status: GqlMembershipStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlMembershipCursorInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipEdge = GqlEdge & {
  __typename?: 'MembershipEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlMembership>;
};

export type GqlMembershipFilterInput = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Array<GqlRole>>;
  status?: InputMaybe<GqlMembershipStatus>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlMembershipHistory = {
  __typename?: 'MembershipHistory';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  membership: GqlMembership;
  reason: GqlMembershipStatusReason;
  role: GqlRole;
  status: GqlMembershipStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlMembershipInviteInput = {
  communityId: Scalars['ID']['input'];
  role?: InputMaybe<GqlRole>;
  userId: Scalars['ID']['input'];
};

export type GqlMembershipInvitePayload = GqlMembershipInviteSuccess;

export type GqlMembershipInviteSuccess = {
  __typename?: 'MembershipInviteSuccess';
  membership: GqlMembership;
};

export type GqlMembershipRemoveInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipRemovePayload = GqlMembershipRemoveSuccess;

export type GqlMembershipRemoveSuccess = {
  __typename?: 'MembershipRemoveSuccess';
  communityId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type GqlMembershipSetInvitationStatusInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipSetInvitationStatusPayload = GqlMembershipSetInvitationStatusSuccess;

export type GqlMembershipSetInvitationStatusSuccess = {
  __typename?: 'MembershipSetInvitationStatusSuccess';
  membership: GqlMembership;
};

export type GqlMembershipSetRoleInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipSetRolePayload = GqlMembershipSetRoleSuccess;

export type GqlMembershipSetRoleSuccess = {
  __typename?: 'MembershipSetRoleSuccess';
  membership: GqlMembership;
};

export type GqlMembershipSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlMembershipStatus = {
  Joined: 'JOINED',
  Left: 'LEFT',
  Pending: 'PENDING'
} as const;

export type GqlMembershipStatus = typeof GqlMembershipStatus[keyof typeof GqlMembershipStatus];
export const GqlMembershipStatusReason = {
  AcceptedInvitation: 'ACCEPTED_INVITATION',
  Assigned: 'ASSIGNED',
  CanceledInvitation: 'CANCELED_INVITATION',
  CreatedCommunity: 'CREATED_COMMUNITY',
  DeclinedInvitation: 'DECLINED_INVITATION',
  Invited: 'INVITED',
  Removed: 'REMOVED',
  Withdrawn: 'WITHDRAWN'
} as const;

export type GqlMembershipStatusReason = typeof GqlMembershipStatusReason[keyof typeof GqlMembershipStatusReason];
export type GqlMembershipWithdrawInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipWithdrawPayload = GqlMembershipWithdrawSuccess;

export type GqlMembershipWithdrawSuccess = {
  __typename?: 'MembershipWithdrawSuccess';
  communityId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type GqlMembershipsConnection = {
  __typename?: 'MembershipsConnection';
  edges?: Maybe<Array<Maybe<GqlMembershipEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlMutation = {
  __typename?: 'Mutation';
  approveReport?: Maybe<GqlApproveReportPayload>;
  articleCreate?: Maybe<GqlArticleCreatePayload>;
  articleDelete?: Maybe<GqlArticleDeletePayload>;
  articleUpdateContent?: Maybe<GqlArticleUpdateContentPayload>;
  communityCreate?: Maybe<GqlCommunityCreatePayload>;
  communityDelete?: Maybe<GqlCommunityDeletePayload>;
  communityUpdateProfile?: Maybe<GqlCommunityUpdateProfilePayload>;
  evaluationBulkCreate?: Maybe<GqlEvaluationBulkCreatePayload>;
  generateReport?: Maybe<GqlGenerateReportPayload>;
  identityCheckPhoneUser: GqlIdentityCheckPhoneUserPayload;
  incentiveGrantRetry?: Maybe<GqlIncentiveGrantRetryPayload>;
  linkPhoneAuth?: Maybe<GqlLinkPhoneAuthPayload>;
  membershipAcceptMyInvitation?: Maybe<GqlMembershipSetInvitationStatusPayload>;
  membershipAssignManager?: Maybe<GqlMembershipSetRolePayload>;
  membershipAssignMember?: Maybe<GqlMembershipSetRolePayload>;
  membershipAssignOwner?: Maybe<GqlMembershipSetRolePayload>;
  membershipCancelInvitation?: Maybe<GqlMembershipSetInvitationStatusPayload>;
  membershipDenyMyInvitation?: Maybe<GqlMembershipSetInvitationStatusPayload>;
  membershipInvite?: Maybe<GqlMembershipInvitePayload>;
  membershipRemove?: Maybe<GqlMembershipRemovePayload>;
  membershipWithdraw?: Maybe<GqlMembershipWithdrawPayload>;
  mutationEcho: Scalars['String']['output'];
  opportunityCreate?: Maybe<GqlOpportunityCreatePayload>;
  opportunityDelete?: Maybe<GqlOpportunityDeletePayload>;
  opportunitySetPublishStatus?: Maybe<GqlOpportunitySetPublishStatusPayload>;
  opportunitySlotCreate?: Maybe<GqlOpportunitySlotCreatePayload>;
  opportunitySlotSetHostingStatus?: Maybe<GqlOpportunitySlotSetHostingStatusPayload>;
  opportunitySlotsBulkUpdate?: Maybe<GqlOpportunitySlotsBulkUpdatePayload>;
  opportunityUpdateContent?: Maybe<GqlOpportunityUpdateContentPayload>;
  participationBulkCreate?: Maybe<GqlParticipationBulkCreatePayload>;
  participationCreatePersonalRecord?: Maybe<GqlParticipationCreatePersonalRecordPayload>;
  participationDeletePersonalRecord?: Maybe<GqlParticipationDeletePayload>;
  placeCreate?: Maybe<GqlPlaceCreatePayload>;
  placeDelete?: Maybe<GqlPlaceDeletePayload>;
  placeUpdate?: Maybe<GqlPlaceUpdatePayload>;
  publishReport?: Maybe<GqlPublishReportPayload>;
  rejectReport?: Maybe<GqlRejectReportPayload>;
  reservationAccept?: Maybe<GqlReservationSetStatusPayload>;
  reservationCancel?: Maybe<GqlReservationSetStatusPayload>;
  reservationCreate?: Maybe<GqlReservationCreatePayload>;
  reservationJoin?: Maybe<GqlReservationSetStatusPayload>;
  reservationReject?: Maybe<GqlReservationSetStatusPayload>;
  storePhoneAuthToken?: Maybe<GqlStorePhoneAuthTokenPayload>;
  submitReportFeedback?: Maybe<GqlSubmitReportFeedbackPayload>;
  ticketClaim?: Maybe<GqlTicketClaimPayload>;
  ticketIssue?: Maybe<GqlTicketIssuePayload>;
  ticketPurchase?: Maybe<GqlTicketPurchasePayload>;
  ticketRefund?: Maybe<GqlTicketRefundPayload>;
  ticketUse?: Maybe<GqlTicketUsePayload>;
  transactionDonateSelfPoint?: Maybe<GqlTransactionDonateSelfPointPayload>;
  transactionGrantCommunityPoint?: Maybe<GqlTransactionGrantCommunityPointPayload>;
  transactionIssueCommunityPoint?: Maybe<GqlTransactionIssueCommunityPointPayload>;
  transactionUpdateMetadata?: Maybe<GqlTransactionUpdateMetadataPayload>;
  updatePortalConfig: GqlCommunityPortalConfig;
  updateReportTemplate?: Maybe<GqlUpdateReportTemplatePayload>;
  updateSignupBonusConfig: GqlCommunitySignupBonusConfig;
  userDeleteMe?: Maybe<GqlUserDeletePayload>;
  userSignUp?: Maybe<GqlCurrentUserPayload>;
  userUpdateMyProfile?: Maybe<GqlUserUpdateProfilePayload>;
  utilityCreate?: Maybe<GqlUtilityCreatePayload>;
  utilityDelete?: Maybe<GqlUtilityDeletePayload>;
  utilitySetPublishStatus?: Maybe<GqlUtilitySetPublishStatusPayload>;
  utilityUpdateInfo?: Maybe<GqlUtilityUpdateInfoPayload>;
  /**
   * ユーザー: 投票実行。
   * 同一 topicId への再投票は **upsert で上書き** される（投票履歴は残らない）。
   * 投票の取消（withdraw）は現時点で未サポート。
   * eligibility と power は呼び出しごとに再チェックされ、NFT_COUNT の場合は呼び出し時点の保有数が新しい power として記録される。
   */
  voteCast: GqlVoteCastPayload;
  /**
   * 管理者: 投票テーマ・ゲート・ポリシー・選択肢を 1 トランザクションで一括作成。
   * Gate.type=NFT かつ PowerPolicy.type=NFT_COUNT の場合、両者の nftTokenId は
   * 一致していなければならない（バックエンドで検証、違反時は `VALIDATION_ERROR`）。
   * 詳細は VoteGate 型の説明を参照。
   */
  voteTopicCreate: GqlVoteTopicCreatePayload;
  /**
   * 管理者: 投票テーマ削除。UPCOMING フェーズ（投票開始前）のみ許可。
   * OPEN / CLOSED フェーズでは `VOTE_TOPIC_NOT_EDITABLE` エラーが返る。
   * gate / powerPolicy / options は onDelete: Cascade で自動削除される（UPCOMING 限定なので ballots は存在しない）。
   */
  voteTopicDelete: GqlVoteTopicDeletePayload;
  /**
   * 管理者: 投票テーマを更新する。UPCOMING フェーズ（投票開始前）のみ許可。
   * OPEN / CLOSED フェーズでは `VOTE_TOPIC_NOT_EDITABLE` エラーが返る。
   * options は全量置換される（UPCOMING なので投票0件が保証されており安全）。
   * gate / powerPolicy も同時に再設定可能。
   */
  voteTopicUpdate: GqlVoteTopicUpdatePayload;
};


export type GqlMutationApproveReportArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationArticleCreateArgs = {
  input: GqlArticleCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationArticleDeleteArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationArticleUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlArticleUpdateContentInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationCommunityCreateArgs = {
  input: GqlCommunityCreateInput;
};


export type GqlMutationCommunityDeleteArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationCommunityUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityUpdateProfileInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationEvaluationBulkCreateArgs = {
  input: GqlEvaluationBulkCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationGenerateReportArgs = {
  input: GqlGenerateReportInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationIdentityCheckPhoneUserArgs = {
  input: GqlIdentityCheckPhoneUserInput;
};


export type GqlMutationIncentiveGrantRetryArgs = {
  input: GqlIncentiveGrantRetryInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationLinkPhoneAuthArgs = {
  input: GqlLinkPhoneAuthInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationMembershipAcceptMyInvitationArgs = {
  input: GqlMembershipSetInvitationStatusInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationMembershipAssignManagerArgs = {
  input: GqlMembershipSetRoleInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationMembershipAssignMemberArgs = {
  input: GqlMembershipSetRoleInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationMembershipAssignOwnerArgs = {
  input: GqlMembershipSetRoleInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationMembershipCancelInvitationArgs = {
  input: GqlMembershipSetInvitationStatusInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationMembershipDenyMyInvitationArgs = {
  input: GqlMembershipSetInvitationStatusInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationMembershipInviteArgs = {
  input: GqlMembershipInviteInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationMembershipRemoveArgs = {
  input: GqlMembershipRemoveInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationMembershipWithdrawArgs = {
  input: GqlMembershipWithdrawInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationOpportunityCreateArgs = {
  input: GqlOpportunityCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationOpportunityDeleteArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationOpportunitySetPublishStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunitySetPublishStatusInput;
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationOpportunitySlotCreateArgs = {
  input: GqlOpportunitySlotCreateInput;
  opportunityId: Scalars['ID']['input'];
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationOpportunitySlotSetHostingStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunitySlotSetHostingStatusInput;
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationOpportunitySlotsBulkUpdateArgs = {
  input: GqlOpportunitySlotsBulkUpdateInput;
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationOpportunityUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunityUpdateContentInput;
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationParticipationBulkCreateArgs = {
  input: GqlParticipationBulkCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationParticipationCreatePersonalRecordArgs = {
  input: GqlParticipationCreatePersonalRecordInput;
};


export type GqlMutationParticipationDeletePersonalRecordArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationPlaceCreateArgs = {
  input: GqlPlaceCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationPlaceDeleteArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationPlaceUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlPlaceUpdateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationPublishReportArgs = {
  finalContent: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type GqlMutationRejectReportArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationReservationAcceptArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationReservationCancelArgs = {
  id: Scalars['ID']['input'];
  input: GqlReservationCancelInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationReservationCreateArgs = {
  input: GqlReservationCreateInput;
};


export type GqlMutationReservationJoinArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationReservationRejectArgs = {
  id: Scalars['ID']['input'];
  input: GqlReservationRejectInput;
  permission: GqlCheckOpportunityPermissionInput;
};


export type GqlMutationStorePhoneAuthTokenArgs = {
  input: GqlStorePhoneAuthTokenInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationSubmitReportFeedbackArgs = {
  input: GqlSubmitReportFeedbackInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationTicketClaimArgs = {
  input: GqlTicketClaimInput;
};


export type GqlMutationTicketIssueArgs = {
  input: GqlTicketIssueInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationTicketPurchaseArgs = {
  input: GqlTicketPurchaseInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationTicketRefundArgs = {
  id: Scalars['ID']['input'];
  input: GqlTicketRefundInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationTicketUseArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationTransactionDonateSelfPointArgs = {
  input: GqlTransactionDonateSelfPointInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationTransactionGrantCommunityPointArgs = {
  input: GqlTransactionGrantCommunityPointInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationTransactionIssueCommunityPointArgs = {
  input: GqlTransactionIssueCommunityPointInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationTransactionUpdateMetadataArgs = {
  communityPermission?: InputMaybe<GqlCheckCommunityPermissionInput>;
  id: Scalars['ID']['input'];
  input: GqlTransactionUpdateMetadataInput;
  permission?: InputMaybe<GqlCheckIsSelfPermissionInput>;
};


export type GqlMutationUpdatePortalConfigArgs = {
  input: GqlCommunityPortalConfigInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationUpdateReportTemplateArgs = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  input: GqlUpdateReportTemplateInput;
  variant: GqlReportVariant;
};


export type GqlMutationUpdateSignupBonusConfigArgs = {
  input: GqlUpdateSignupBonusConfigInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationUserDeleteMeArgs = {
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationUserSignUpArgs = {
  input: GqlUserSignUpInput;
};


export type GqlMutationUserUpdateMyProfileArgs = {
  input: GqlUserUpdateProfileInput;
  permission: GqlCheckIsSelfPermissionInput;
};


export type GqlMutationUtilityCreateArgs = {
  input: GqlUtilityCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationUtilityDeleteArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationUtilitySetPublishStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlUtilitySetPublishStatusInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationUtilityUpdateInfoArgs = {
  id: Scalars['ID']['input'];
  input: GqlUtilityUpdateInfoInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationVoteCastArgs = {
  input: GqlVoteCastInput;
};


export type GqlMutationVoteTopicCreateArgs = {
  input: GqlVoteTopicCreateInput;
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationVoteTopicDeleteArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationVoteTopicUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlVoteTopicUpdateInput;
  permission: GqlCheckCommunityPermissionInput;
};

/** ログインユーザーの投票資格と現状。再投票可能性の判定にも利用する。 */
export type GqlMyVoteEligibility = {
  __typename?: 'MyVoteEligibility';
  /**
   * **リクエスト時点**で計算される power。
   * VoteBallot.power（投票時スナップショット）とは別物で、NFT_COUNT ポリシー下では乖離しうる。
   */
  currentPower?: Maybe<Scalars['Int']['output']>;
  /**
   * 投票可能か。**投票済みでも再投票可能なら true** を返す
   * （期間内 & ゲート通過なら常に true。投票済みフラグは myBallot の有無で判定）。
   */
  eligible: Scalars['Boolean']['output'];
  /** ログインユーザーの投票（VoteTopic.myBallot と同じ値）。 */
  myBallot?: Maybe<GqlVoteBallot>;
  /**
   * eligible=false 時の理由コード。次のいずれか:
   * GATE_NOT_CONFIGURED / GATE_NFT_TOKEN_NOT_CONFIGURED / REQUIRED_NFT_NOT_FOUND /
   * NOT_A_MEMBER / INSUFFICIENT_ROLE / UNKNOWN_GATE_TYPE
   */
  reason?: Maybe<Scalars['String']['output']>;
};

export type GqlNestedPlaceConnectOrCreateInput = {
  create?: InputMaybe<GqlNestedPlaceCreateInput>;
  where?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlNestedPlaceCreateInput = {
  address: Scalars['String']['input'];
  cityCode: Scalars['ID']['input'];
  communityId?: InputMaybe<Scalars['ID']['input']>;
  googlePlaceId?: InputMaybe<Scalars['String']['input']>;
  isManual: Scalars['Boolean']['input'];
  latitude: Scalars['Decimal']['input'];
  longitude: Scalars['Decimal']['input'];
  mapLocation?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
};

export type GqlNestedPlacesBulkConnectOrCreateInput = {
  data?: InputMaybe<Array<GqlNestedPlaceConnectOrCreateInput>>;
};

export type GqlNestedPlacesBulkUpdateInput = {
  connectOrCreate?: InputMaybe<Array<GqlNestedPlaceConnectOrCreateInput>>;
  disconnect?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlNftInstance = {
  __typename?: 'NftInstance';
  community?: Maybe<GqlCommunity>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  instanceId: Scalars['String']['output'];
  json?: Maybe<Scalars['JSON']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  nftToken?: Maybe<GqlNftToken>;
  nftWallet?: Maybe<GqlNftWallet>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlNftInstanceEdge = GqlEdge & {
  __typename?: 'NftInstanceEdge';
  cursor: Scalars['String']['output'];
  node: GqlNftInstance;
};

export type GqlNftInstanceFilterInput = {
  and?: InputMaybe<Array<GqlNftInstanceFilterInput>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  hasDescription?: InputMaybe<Scalars['Boolean']['input']>;
  hasImage?: InputMaybe<Scalars['Boolean']['input']>;
  hasName?: InputMaybe<Scalars['Boolean']['input']>;
  nftTokenAddress?: InputMaybe<Array<Scalars['String']['input']>>;
  nftTokenType?: InputMaybe<Array<Scalars['String']['input']>>;
  nftWalletId?: InputMaybe<Array<Scalars['ID']['input']>>;
  not?: InputMaybe<GqlNftInstanceFilterInput>;
  or?: InputMaybe<Array<GqlNftInstanceFilterInput>>;
  userId?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlNftInstanceSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  instanceId?: InputMaybe<GqlSortDirection>;
  name?: InputMaybe<GqlSortDirection>;
};

export type GqlNftInstancesConnection = {
  __typename?: 'NftInstancesConnection';
  edges: Array<GqlNftInstanceEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlNftToken = {
  __typename?: 'NftToken';
  address: Scalars['String']['output'];
  /**
   * トークンを所有するコミュニティ。複数コミュニティで共用する場合や運用都合で未設定の場合は null。
   * portal 側の「このコミュニティに属する NftToken」一覧取得で参照される。
   */
  community?: Maybe<GqlCommunity>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  json?: Maybe<Scalars['JSON']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  symbol?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlNftTokenEdge = GqlEdge & {
  __typename?: 'NftTokenEdge';
  cursor: Scalars['String']['output'];
  node: GqlNftToken;
};

export type GqlNftTokenFilterInput = {
  address?: InputMaybe<Array<Scalars['String']['input']>>;
  and?: InputMaybe<Array<GqlNftTokenFilterInput>>;
  /**
   * 指定したコミュニティに直接紐付く NftToken に絞る（NftToken.community_id を直接参照）。
   * NftToken.communityId が NULL のトークンは除外される。
   */
  communityId?: InputMaybe<Scalars['ID']['input']>;
  not?: InputMaybe<GqlNftTokenFilterInput>;
  or?: InputMaybe<Array<GqlNftTokenFilterInput>>;
  type?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GqlNftTokenSortInput = {
  address?: InputMaybe<GqlSortDirection>;
  createdAt?: InputMaybe<GqlSortDirection>;
  name?: InputMaybe<GqlSortDirection>;
};

export type GqlNftTokensConnection = {
  __typename?: 'NftTokensConnection';
  edges: Array<GqlNftTokenEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlNftWallet = {
  __typename?: 'NftWallet';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
  walletAddress: Scalars['String']['output'];
};

export type GqlOpportunitiesConnection = {
  __typename?: 'OpportunitiesConnection';
  edges: Array<GqlOpportunityEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlOpportunity = {
  __typename?: 'Opportunity';
  articles?: Maybe<Array<GqlArticle>>;
  body?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  category: GqlOpportunityCategory;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  description: Scalars['String']['output'];
  earliestReservableAt?: Maybe<Scalars['Datetime']['output']>;
  feeRequired?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isReservableWithTicket?: Maybe<Scalars['Boolean']['output']>;
  place?: Maybe<GqlPlace>;
  pointsRequired?: Maybe<Scalars['Int']['output']>;
  pointsToEarn?: Maybe<Scalars['Int']['output']>;
  publishStatus: GqlPublishStatus;
  requireApproval: Scalars['Boolean']['output'];
  requiredUtilities?: Maybe<Array<GqlUtility>>;
  slots?: Maybe<Array<GqlOpportunitySlot>>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlOpportunitySlotsArgs = {
  filter?: InputMaybe<GqlOpportunitySlotFilterInput>;
  sort?: InputMaybe<GqlOpportunitySlotSortInput>;
};

export const GqlOpportunityCategory = {
  Activity: 'ACTIVITY',
  Event: 'EVENT',
  Quest: 'QUEST'
} as const;

export type GqlOpportunityCategory = typeof GqlOpportunityCategory[keyof typeof GqlOpportunityCategory];
export type GqlOpportunityCreateInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  category: GqlOpportunityCategory;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  description: Scalars['String']['input'];
  feeRequired?: InputMaybe<Scalars['Int']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  placeId?: InputMaybe<Scalars['ID']['input']>;
  pointsRequired?: InputMaybe<Scalars['Int']['input']>;
  pointsToEarn?: InputMaybe<Scalars['Int']['input']>;
  publishStatus: GqlPublishStatus;
  relatedArticleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  requireApproval: Scalars['Boolean']['input'];
  requiredUtilityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  slots?: InputMaybe<Array<GqlOpportunitySlotCreateInput>>;
  title: Scalars['String']['input'];
};

export type GqlOpportunityCreatePayload = GqlOpportunityCreateSuccess;

export type GqlOpportunityCreateSuccess = {
  __typename?: 'OpportunityCreateSuccess';
  opportunity: GqlOpportunity;
};

export type GqlOpportunityDeletePayload = GqlOpportunityDeleteSuccess;

export type GqlOpportunityDeleteSuccess = {
  __typename?: 'OpportunityDeleteSuccess';
  opportunityId: Scalars['ID']['output'];
};

export type GqlOpportunityEdge = GqlEdge & {
  __typename?: 'OpportunityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOpportunity>;
};

export type GqlOpportunityFilterInput = {
  and?: InputMaybe<Array<GqlOpportunityFilterInput>>;
  articleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  category?: InputMaybe<GqlOpportunityCategory>;
  cityCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  communityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  createdByUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  isReservableWithPoint?: InputMaybe<Scalars['Boolean']['input']>;
  isReservableWithTicket?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  not?: InputMaybe<GqlOpportunityFilterInput>;
  or?: InputMaybe<Array<GqlOpportunityFilterInput>>;
  placeIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  publishStatus?: InputMaybe<Array<GqlPublishStatus>>;
  requiredUtilityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  slotDateRange?: InputMaybe<GqlDateTimeRangeFilter>;
  slotHostingStatus?: InputMaybe<Array<GqlOpportunitySlotHostingStatus>>;
  slotRemainingCapacity?: InputMaybe<Scalars['Int']['input']>;
  stateCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlOpportunitySetPublishStatusInput = {
  publishStatus: GqlPublishStatus;
};

export type GqlOpportunitySetPublishStatusPayload = GqlOpportunitySetPublishStatusSuccess;

export type GqlOpportunitySetPublishStatusSuccess = {
  __typename?: 'OpportunitySetPublishStatusSuccess';
  opportunity: GqlOpportunity;
};

export type GqlOpportunitySlot = {
  __typename?: 'OpportunitySlot';
  capacity?: Maybe<Scalars['Int']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  endsAt: Scalars['Datetime']['output'];
  hostingStatus: GqlOpportunitySlotHostingStatus;
  id: Scalars['ID']['output'];
  isFullyEvaluated?: Maybe<Scalars['Boolean']['output']>;
  numEvaluated?: Maybe<Scalars['Int']['output']>;
  numParticipants?: Maybe<Scalars['Int']['output']>;
  opportunity?: Maybe<GqlOpportunity>;
  remainingCapacity?: Maybe<Scalars['Int']['output']>;
  reservations?: Maybe<Array<GqlReservation>>;
  startsAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  vcIssuanceRequests?: Maybe<Array<GqlVcIssuanceRequest>>;
};

export type GqlOpportunitySlotCreateInput = {
  capacity: Scalars['Int']['input'];
  endsAt: Scalars['Datetime']['input'];
  startsAt: Scalars['Datetime']['input'];
};

export type GqlOpportunitySlotCreatePayload = GqlOpportunitySlotCreateSuccess;

export type GqlOpportunitySlotCreateSuccess = {
  __typename?: 'OpportunitySlotCreateSuccess';
  slot: GqlOpportunitySlot;
};

export type GqlOpportunitySlotEdge = GqlEdge & {
  __typename?: 'OpportunitySlotEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOpportunitySlot>;
};

export type GqlOpportunitySlotFilterInput = {
  dateRange?: InputMaybe<GqlDateTimeRangeFilter>;
  hostingStatus?: InputMaybe<Array<GqlOpportunitySlotHostingStatus>>;
  opportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  ownerId?: InputMaybe<Scalars['ID']['input']>;
};

export const GqlOpportunitySlotHostingStatus = {
  Cancelled: 'CANCELLED',
  Completed: 'COMPLETED',
  Scheduled: 'SCHEDULED'
} as const;

export type GqlOpportunitySlotHostingStatus = typeof GqlOpportunitySlotHostingStatus[keyof typeof GqlOpportunitySlotHostingStatus];
export type GqlOpportunitySlotSetHostingStatusInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  comment?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  status: GqlOpportunitySlotHostingStatus;
};

export type GqlOpportunitySlotSetHostingStatusPayload = GqlOpportunitySlotSetHostingStatusSuccess;

export type GqlOpportunitySlotSetHostingStatusSuccess = {
  __typename?: 'OpportunitySlotSetHostingStatusSuccess';
  slot: GqlOpportunitySlot;
};

export type GqlOpportunitySlotSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  endsAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOpportunitySlotUpdateInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  endsAt: Scalars['Datetime']['input'];
  id: Scalars['ID']['input'];
  startsAt: Scalars['Datetime']['input'];
};

export type GqlOpportunitySlotsBulkUpdateInput = {
  create?: InputMaybe<Array<GqlOpportunitySlotCreateInput>>;
  delete?: InputMaybe<Array<Scalars['ID']['input']>>;
  opportunityId: Scalars['ID']['input'];
  update?: InputMaybe<Array<GqlOpportunitySlotUpdateInput>>;
};

export type GqlOpportunitySlotsBulkUpdatePayload = GqlOpportunitySlotsBulkUpdateSuccess;

export type GqlOpportunitySlotsBulkUpdateSuccess = {
  __typename?: 'OpportunitySlotsBulkUpdateSuccess';
  slots: Array<GqlOpportunitySlot>;
};

export type GqlOpportunitySlotsConnection = {
  __typename?: 'OpportunitySlotsConnection';
  edges?: Maybe<Array<Maybe<GqlOpportunitySlotEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlOpportunitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  earliestSlotStartsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOpportunityUpdateContentInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  category: GqlOpportunityCategory;
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  description: Scalars['String']['input'];
  feeRequired?: InputMaybe<Scalars['Int']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  placeId?: InputMaybe<Scalars['ID']['input']>;
  pointsRequired?: InputMaybe<Scalars['Int']['input']>;
  pointsToEarn?: InputMaybe<Scalars['Int']['input']>;
  publishStatus: GqlPublishStatus;
  relatedArticleIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  requireApproval: Scalars['Boolean']['input'];
  requiredUtilityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  title: Scalars['String']['input'];
};

export type GqlOpportunityUpdateContentPayload = GqlOpportunityUpdateContentSuccess;

export type GqlOpportunityUpdateContentSuccess = {
  __typename?: 'OpportunityUpdateContentSuccess';
  opportunity: GqlOpportunity;
};

export type GqlPageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type GqlPaging = {
  __typename?: 'Paging';
  skip: Scalars['Int']['output'];
  take: Scalars['Int']['output'];
};

export type GqlParticipation = {
  __typename?: 'Participation';
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  evaluation?: Maybe<GqlEvaluation>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  opportunitySlot?: Maybe<GqlOpportunitySlot>;
  reason: GqlParticipationStatusReason;
  reservation?: Maybe<GqlReservation>;
  source?: Maybe<GqlSource>;
  status: GqlParticipationStatus;
  statusHistories?: Maybe<Array<GqlParticipationStatusHistory>>;
  ticketStatusHistories?: Maybe<Array<GqlTicketStatusHistory>>;
  transactions?: Maybe<Array<GqlTransaction>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlParticipationBulkCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  slotId: Scalars['ID']['input'];
  userIds: Array<Scalars['ID']['input']>;
};

export type GqlParticipationBulkCreatePayload = GqlParticipationBulkCreateSuccess;

export type GqlParticipationBulkCreateSuccess = {
  __typename?: 'ParticipationBulkCreateSuccess';
  participations: Array<GqlParticipation>;
};

export type GqlParticipationCreatePersonalRecordInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
};

export type GqlParticipationCreatePersonalRecordPayload = GqlParticipationCreatePersonalRecordSuccess;

export type GqlParticipationCreatePersonalRecordSuccess = {
  __typename?: 'ParticipationCreatePersonalRecordSuccess';
  participation: GqlParticipation;
};

export type GqlParticipationDeletePayload = GqlParticipationDeleteSuccess;

export type GqlParticipationDeleteSuccess = {
  __typename?: 'ParticipationDeleteSuccess';
  participationId: Scalars['ID']['output'];
};

export type GqlParticipationEdge = GqlEdge & {
  __typename?: 'ParticipationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlParticipation>;
};

export type GqlParticipationFilterInput = {
  categories?: InputMaybe<Array<Scalars['String']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  dateFrom?: InputMaybe<Scalars['Datetime']['input']>;
  dateTo?: InputMaybe<Scalars['Datetime']['input']>;
  opportunityId?: InputMaybe<Scalars['ID']['input']>;
  opportunitySlotId?: InputMaybe<Scalars['ID']['input']>;
  reservationId?: InputMaybe<Scalars['ID']['input']>;
  stateCodes?: InputMaybe<Array<Scalars['ID']['input']>>;
  status?: InputMaybe<GqlParticipationStatus>;
  userIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlParticipationSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export const GqlParticipationStatus = {
  NotParticipating: 'NOT_PARTICIPATING',
  Participated: 'PARTICIPATED',
  Participating: 'PARTICIPATING',
  Pending: 'PENDING'
} as const;

export type GqlParticipationStatus = typeof GqlParticipationStatus[keyof typeof GqlParticipationStatus];
export type GqlParticipationStatusHistoriesConnection = {
  __typename?: 'ParticipationStatusHistoriesConnection';
  edges: Array<GqlParticipationStatusHistoryEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlParticipationStatusHistory = {
  __typename?: 'ParticipationStatusHistory';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  participation?: Maybe<GqlParticipation>;
  reason: GqlParticipationStatusReason;
  status: GqlParticipationStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlParticipationStatusHistoryEdge = GqlEdge & {
  __typename?: 'ParticipationStatusHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlParticipationStatusHistory>;
};

export type GqlParticipationStatusHistoryFilterInput = {
  createdById?: InputMaybe<Scalars['ID']['input']>;
  participationId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlParticipationStatus>;
};

export type GqlParticipationStatusHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlParticipationStatusReason = {
  OpportunityCanceled: 'OPPORTUNITY_CANCELED',
  PersonalRecord: 'PERSONAL_RECORD',
  ReservationAccepted: 'RESERVATION_ACCEPTED',
  ReservationApplied: 'RESERVATION_APPLIED',
  ReservationCanceled: 'RESERVATION_CANCELED',
  ReservationJoined: 'RESERVATION_JOINED',
  ReservationRejected: 'RESERVATION_REJECTED'
} as const;

export type GqlParticipationStatusReason = typeof GqlParticipationStatusReason[keyof typeof GqlParticipationStatusReason];
export const GqlParticipationType = {
  Hosted: 'HOSTED',
  Participated: 'PARTICIPATED'
} as const;

export type GqlParticipationType = typeof GqlParticipationType[keyof typeof GqlParticipationType];
export type GqlParticipationsConnection = {
  __typename?: 'ParticipationsConnection';
  edges: Array<GqlParticipationEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlPhoneUserStatus = {
  ExistingDifferentCommunity: 'EXISTING_DIFFERENT_COMMUNITY',
  ExistingSameCommunity: 'EXISTING_SAME_COMMUNITY',
  NewUser: 'NEW_USER'
} as const;

export type GqlPhoneUserStatus = typeof GqlPhoneUserStatus[keyof typeof GqlPhoneUserStatus];
export type GqlPlace = {
  __typename?: 'Place';
  accumulatedParticipants?: Maybe<Scalars['Int']['output']>;
  address: Scalars['String']['output'];
  city?: Maybe<GqlCity>;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  currentPublicOpportunityCount?: Maybe<Scalars['Int']['output']>;
  googlePlaceId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isManual?: Maybe<Scalars['Boolean']['output']>;
  latitude: Scalars['Decimal']['output'];
  longitude: Scalars['Decimal']['output'];
  mapLocation?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  opportunities?: Maybe<Array<GqlOpportunity>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlPlaceCreateInput = {
  address: Scalars['String']['input'];
  cityCode: Scalars['ID']['input'];
  communityId: Scalars['ID']['input'];
  googlePlaceId?: InputMaybe<Scalars['String']['input']>;
  isManual: Scalars['Boolean']['input'];
  latitude: Scalars['Decimal']['input'];
  longitude: Scalars['Decimal']['input'];
  mapLocation?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  opportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlPlaceCreatePayload = GqlPlaceCreateSuccess;

export type GqlPlaceCreateSuccess = {
  __typename?: 'PlaceCreateSuccess';
  place: GqlPlace;
};

export type GqlPlaceDeletePayload = GqlPlaceDeleteSuccess;

export type GqlPlaceDeleteSuccess = {
  __typename?: 'PlaceDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type GqlPlaceEdge = GqlEdge & {
  __typename?: 'PlaceEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlPlace>;
};

export type GqlPlaceFilterInput = {
  cityCode?: InputMaybe<Scalars['ID']['input']>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlPlaceSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlPlaceUpdateInput = {
  address: Scalars['String']['input'];
  cityCode: Scalars['ID']['input'];
  googlePlaceId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isManual: Scalars['Boolean']['input'];
  latitude: Scalars['Decimal']['input'];
  longitude: Scalars['Decimal']['input'];
  mapLocation?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
  opportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlPlaceUpdatePayload = GqlPlaceUpdateSuccess;

export type GqlPlaceUpdateSuccess = {
  __typename?: 'PlaceUpdateSuccess';
  place: GqlPlace;
};

export type GqlPlacesConnection = {
  __typename?: 'PlacesConnection';
  edges?: Maybe<Array<Maybe<GqlPlaceEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlPortfolio = {
  __typename?: 'Portfolio';
  category: GqlPortfolioCategory;
  date: Scalars['Datetime']['output'];
  evaluationStatus?: Maybe<GqlEvaluationStatus>;
  id: Scalars['ID']['output'];
  participants?: Maybe<Array<GqlUser>>;
  place?: Maybe<GqlPlace>;
  reservationStatus?: Maybe<GqlReservationStatus>;
  source: GqlPortfolioSource;
  thumbnailUrl?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export const GqlPortfolioCategory = {
  Activity: 'ACTIVITY',
  ActivityReport: 'ACTIVITY_REPORT',
  Event: 'EVENT',
  Interview: 'INTERVIEW',
  Quest: 'QUEST'
} as const;

export type GqlPortfolioCategory = typeof GqlPortfolioCategory[keyof typeof GqlPortfolioCategory];
export type GqlPortfolioEdge = GqlEdge & {
  __typename?: 'PortfolioEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlPortfolio>;
};

export type GqlPortfolioFilterInput = {
  communityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  dateRange?: InputMaybe<GqlDateTimeRangeFilter>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlPortfolioSortInput = {
  date?: InputMaybe<GqlSortDirection>;
};

export const GqlPortfolioSource = {
  Article: 'ARTICLE',
  Opportunity: 'OPPORTUNITY'
} as const;

export type GqlPortfolioSource = typeof GqlPortfolioSource[keyof typeof GqlPortfolioSource];
export type GqlPortfoliosConnection = {
  __typename?: 'PortfoliosConnection';
  edges: Array<GqlPortfolioEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlPublishReportPayload = GqlPublishReportSuccess;

export type GqlPublishReportSuccess = {
  __typename?: 'PublishReportSuccess';
  report: GqlReport;
};

export const GqlPublishStatus = {
  CommunityInternal: 'COMMUNITY_INTERNAL',
  Private: 'PRIVATE',
  Public: 'PUBLIC'
} as const;

export type GqlPublishStatus = typeof GqlPublishStatus[keyof typeof GqlPublishStatus];
export type GqlQuery = {
  __typename?: 'Query';
  article?: Maybe<GqlArticle>;
  articles: GqlArticlesConnection;
  cities: GqlCitiesConnection;
  communities: GqlCommunitiesConnection;
  community?: Maybe<GqlCommunity>;
  communityPortalConfig?: Maybe<GqlCommunityPortalConfig>;
  currentUser?: Maybe<GqlCurrentUserPayload>;
  echo: Scalars['String']['output'];
  evaluation?: Maybe<GqlEvaluation>;
  evaluationHistories: GqlEvaluationHistoriesConnection;
  evaluationHistory?: Maybe<GqlEvaluationHistory>;
  evaluations: GqlEvaluationsConnection;
  incentiveGrant?: Maybe<GqlIncentiveGrant>;
  incentiveGrants: GqlIncentiveGrantsConnection;
  membership?: Maybe<GqlMembership>;
  memberships: GqlMembershipsConnection;
  /**
   * ログインユーザーの投票資格確認。
   * 投票画面（単一トピックにフォーカス）で利用する想定。
   * 一覧画面では各ノードの VoteTopic.myEligibility を使う方が効率的。
   */
  myVoteEligibility: GqlMyVoteEligibility;
  myWallet?: Maybe<GqlWallet>;
  nftInstance?: Maybe<GqlNftInstance>;
  nftInstances: GqlNftInstancesConnection;
  nftToken?: Maybe<GqlNftToken>;
  nftTokens: GqlNftTokensConnection;
  opportunities: GqlOpportunitiesConnection;
  opportunity?: Maybe<GqlOpportunity>;
  opportunitySlot?: Maybe<GqlOpportunitySlot>;
  opportunitySlots: GqlOpportunitySlotsConnection;
  participation?: Maybe<GqlParticipation>;
  participationStatusHistories: GqlParticipationStatusHistoriesConnection;
  participationStatusHistory?: Maybe<GqlParticipationStatusHistory>;
  participations: GqlParticipationsConnection;
  place?: Maybe<GqlPlace>;
  places: GqlPlacesConnection;
  portfolios?: Maybe<Array<GqlPortfolio>>;
  report?: Maybe<GqlReport>;
  reportTemplate?: Maybe<GqlReportTemplate>;
  reportTemplateStats: GqlReportTemplateStats;
  reports: GqlReportsConnection;
  reservation?: Maybe<GqlReservation>;
  reservationHistories: GqlReservationHistoriesConnection;
  reservationHistory?: Maybe<GqlReservationHistory>;
  reservations: GqlReservationsConnection;
  signupBonusConfig?: Maybe<GqlCommunitySignupBonusConfig>;
  states: GqlStatesConnection;
  /**
   * L2 detail for a single community: summary card, stage distribution,
   * trailing-window trends, cohort retention, and a paginated member list.
   * Intended for answering "what are kibotcha's numbers?" in an external
   * report conversation.
   */
  sysAdminCommunityDetail: GqlSysAdminCommunityDetailPayload;
  /**
   * L1 overview: platform totals plus one row per community. Intended for
   * the "is any community stalling?" scan. Community fan-out is served
   * with N in-process calls (acceptable at today's community count —
   * switch to a GROUP BY implementation once the platform exceeds ~20
   * communities).
   */
  sysAdminDashboard: GqlSysAdminDashboardPayload;
  ticket?: Maybe<GqlTicket>;
  ticketClaimLink?: Maybe<GqlTicketClaimLink>;
  ticketClaimLinks: GqlTicketClaimLinksConnection;
  ticketIssuer?: Maybe<GqlTicketIssuer>;
  ticketIssuers: GqlTicketIssuersConnection;
  ticketStatusHistories: GqlTicketStatusHistoriesConnection;
  ticketStatusHistory?: Maybe<GqlTicketStatusHistory>;
  tickets: GqlTicketsConnection;
  transaction?: Maybe<GqlTransaction>;
  transactions: GqlTransactionsConnection;
  user?: Maybe<GqlUser>;
  users: GqlUsersConnection;
  utilities: GqlUtilitiesConnection;
  utility?: Maybe<GqlUtility>;
  vcIssuanceRequest?: Maybe<GqlVcIssuanceRequest>;
  vcIssuanceRequests: GqlVcIssuanceRequestsConnection;
  /**
   * Verify transactions against the Cardano blockchain.
   * - Retrieves Merkle proofs for specified transactions
   * - Recalculates root hash using proofs
   * - Compares with Cardano blockchain metadata
   * - Returns data integrity verification results
   */
  verifyTransactions?: Maybe<Array<GqlTransactionVerificationResult>>;
  /** 投票テーマ詳細（myBallot / myEligibility はフィールドリゾルバー経由で解決）。 */
  voteTopic?: Maybe<GqlVoteTopic>;
  /**
   * コミュニティの投票テーマ一覧（カーソルページネーション）。
   * 各ノードの myBallot / myEligibility は DataLoader 経由で解決され、N+1 は発生しない。
   */
  voteTopics: GqlVoteTopicsConnection;
  wallet?: Maybe<GqlWallet>;
  wallets: GqlWalletsConnection;
};


export type GqlQueryArticleArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlQueryArticlesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlArticleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlArticleSortInput>;
};


export type GqlQueryCitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlCitiesInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlCitiesSortInput>;
};


export type GqlQueryCommunitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlCommunityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlCommunitySortInput>;
};


export type GqlQueryCommunityArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryCommunityPortalConfigArgs = {
  communityId: Scalars['String']['input'];
};


export type GqlQueryEvaluationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryEvaluationHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlEvaluationHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlEvaluationHistorySortInput>;
};


export type GqlQueryEvaluationHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryEvaluationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlEvaluationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlEvaluationSortInput>;
};


export type GqlQueryIncentiveGrantArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryIncentiveGrantsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlIncentiveGrantFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlIncentiveGrantSortInput>;
};


export type GqlQueryMembershipArgs = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type GqlQueryMembershipsArgs = {
  cursor?: InputMaybe<GqlMembershipCursorInput>;
  filter?: InputMaybe<GqlMembershipFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlMembershipSortInput>;
};


export type GqlQueryMyVoteEligibilityArgs = {
  topicId: Scalars['ID']['input'];
};


export type GqlQueryNftInstanceArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryNftInstancesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlNftInstanceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlNftInstanceSortInput>;
};


export type GqlQueryNftTokenArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryNftTokensArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlNftTokenFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlNftTokenSortInput>;
};


export type GqlQueryOpportunitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunitySortInput>;
};


export type GqlQueryOpportunityArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlQueryOpportunitySlotArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryOpportunitySlotsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunitySlotFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunitySlotSortInput>;
};


export type GqlQueryParticipationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryParticipationStatusHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationStatusHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationStatusHistorySortInput>;
};


export type GqlQueryParticipationStatusHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryParticipationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationSortInput>;
};


export type GqlQueryPlaceArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryPlacesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlPlaceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlPlaceSortInput>;
};


export type GqlQueryPortfoliosArgs = {
  filter?: InputMaybe<GqlPortfolioFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlPortfolioSortInput>;
};


export type GqlQueryReportArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryReportTemplateArgs = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  variant: GqlReportVariant;
};


export type GqlQueryReportTemplateStatsArgs = {
  variant: GqlReportVariant;
  version?: InputMaybe<Scalars['Int']['input']>;
};


export type GqlQueryReportsArgs = {
  communityId: Scalars['ID']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  permission: GqlCheckCommunityPermissionInput;
  status?: InputMaybe<GqlReportStatus>;
  variant?: InputMaybe<GqlReportVariant>;
};


export type GqlQueryReservationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryReservationHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlReservationHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlReservationHistorySortInput>;
};


export type GqlQueryReservationHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryReservationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlReservationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlReservationSortInput>;
};


export type GqlQuerySignupBonusConfigArgs = {
  communityId: Scalars['ID']['input'];
};


export type GqlQueryStatesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlStatesInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type GqlQuerySysAdminCommunityDetailArgs = {
  input: GqlSysAdminCommunityDetailInput;
};


export type GqlQuerySysAdminDashboardArgs = {
  input?: InputMaybe<GqlSysAdminDashboardInput>;
};


export type GqlQueryTicketArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryTicketClaimLinkArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryTicketClaimLinksArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketClaimLinkFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketClaimLinkSortInput>;
};


export type GqlQueryTicketIssuerArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryTicketIssuersArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketIssuerFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketIssuerSortInput>;
};


export type GqlQueryTicketStatusHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketStatusHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketStatusHistorySortInput>;
};


export type GqlQueryTicketStatusHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryTicketsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketSortInput>;
};


export type GqlQueryTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryTransactionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTransactionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTransactionSortInput>;
};


export type GqlQueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryUsersArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlUserFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlUserSortInput>;
};


export type GqlQueryUtilitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlUtilityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlUtilitySortInput>;
};


export type GqlQueryUtilityArgs = {
  id: Scalars['ID']['input'];
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlQueryVcIssuanceRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryVcIssuanceRequestsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlVcIssuanceRequestFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlVcIssuanceRequestSortInput>;
};


export type GqlQueryVerifyTransactionsArgs = {
  txIds: Array<Scalars['ID']['input']>;
};


export type GqlQueryVoteTopicArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryVoteTopicsArgs = {
  communityId: Scalars['ID']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type GqlQueryWalletArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryWalletsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlWalletFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlWalletSortInput>;
};

export type GqlRejectReportPayload = GqlRejectReportSuccess;

export type GqlRejectReportSuccess = {
  __typename?: 'RejectReportSuccess';
  report: GqlReport;
};

export type GqlReport = {
  __typename?: 'Report';
  cacheReadTokens?: Maybe<Scalars['Int']['output']>;
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  feedbacks: GqlReportFeedbacksConnection;
  finalContent?: Maybe<Scalars['String']['output']>;
  generatedByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  inputTokens?: Maybe<Scalars['Int']['output']>;
  model?: Maybe<Scalars['String']['output']>;
  myFeedback?: Maybe<GqlReportFeedback>;
  outputMarkdown?: Maybe<Scalars['String']['output']>;
  outputTokens?: Maybe<Scalars['Int']['output']>;
  parentRun?: Maybe<GqlReport>;
  periodFrom: Scalars['Datetime']['output'];
  periodTo: Scalars['Datetime']['output'];
  publishedAt?: Maybe<Scalars['Datetime']['output']>;
  publishedByUser?: Maybe<GqlUser>;
  regenerateCount: Scalars['Int']['output'];
  regenerations: Array<GqlReport>;
  skipReason?: Maybe<Scalars['String']['output']>;
  status: GqlReportStatus;
  targetUser?: Maybe<GqlUser>;
  template?: Maybe<GqlReportTemplate>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  variant: GqlReportVariant;
};


export type GqlReportFeedbacksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type GqlReportEdge = GqlEdge & {
  __typename?: 'ReportEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlReport>;
};

export type GqlReportFeedback = {
  __typename?: 'ReportFeedback';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  feedbackType?: Maybe<GqlReportFeedbackType>;
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  reportId: Scalars['ID']['output'];
  sectionKey?: Maybe<Scalars['String']['output']>;
  user: GqlUser;
};

export type GqlReportFeedbackEdge = GqlEdge & {
  __typename?: 'ReportFeedbackEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlReportFeedback>;
};

export const GqlReportFeedbackType = {
  Accuracy: 'ACCURACY',
  Other: 'OTHER',
  Quality: 'QUALITY',
  Structure: 'STRUCTURE',
  Tone: 'TONE'
} as const;

export type GqlReportFeedbackType = typeof GqlReportFeedbackType[keyof typeof GqlReportFeedbackType];
export type GqlReportFeedbacksConnection = {
  __typename?: 'ReportFeedbacksConnection';
  edges?: Maybe<Array<Maybe<GqlReportFeedbackEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlReportStatus = {
  Approved: 'APPROVED',
  Draft: 'DRAFT',
  Published: 'PUBLISHED',
  Rejected: 'REJECTED',
  Skipped: 'SKIPPED',
  Superseded: 'SUPERSEDED'
} as const;

export type GqlReportStatus = typeof GqlReportStatus[keyof typeof GqlReportStatus];
export type GqlReportTemplate = {
  __typename?: 'ReportTemplate';
  community?: Maybe<GqlCommunity>;
  communityContext?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  experimentKey?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isEnabled: Scalars['Boolean']['output'];
  maxTokens: Scalars['Int']['output'];
  model: Scalars['String']['output'];
  scope: GqlReportTemplateScope;
  stopSequences: Array<Scalars['String']['output']>;
  systemPrompt: Scalars['String']['output'];
  temperature?: Maybe<Scalars['Float']['output']>;
  trafficWeight: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  updatedByUser?: Maybe<GqlUser>;
  userPromptTemplate: Scalars['String']['output'];
  variant: GqlReportVariant;
  version: Scalars['Int']['output'];
};

export const GqlReportTemplateScope = {
  Community: 'COMMUNITY',
  System: 'SYSTEM'
} as const;

export type GqlReportTemplateScope = typeof GqlReportTemplateScope[keyof typeof GqlReportTemplateScope];
export type GqlReportTemplateStats = {
  __typename?: 'ReportTemplateStats';
  avgJudgeScore?: Maybe<Scalars['Float']['output']>;
  avgRating?: Maybe<Scalars['Float']['output']>;
  correlationWarning: Scalars['Boolean']['output'];
  feedbackCount: Scalars['Int']['output'];
  judgeHumanCorrelation?: Maybe<Scalars['Float']['output']>;
  variant: GqlReportVariant;
  version?: Maybe<Scalars['Int']['output']>;
};

export const GqlReportVariant = {
  GrantApplication: 'GRANT_APPLICATION',
  MediaPr: 'MEDIA_PR',
  MemberNewsletter: 'MEMBER_NEWSLETTER',
  PersonalRecap: 'PERSONAL_RECAP',
  WeeklySummary: 'WEEKLY_SUMMARY'
} as const;

export type GqlReportVariant = typeof GqlReportVariant[keyof typeof GqlReportVariant];
export type GqlReportsConnection = {
  __typename?: 'ReportsConnection';
  edges?: Maybe<Array<Maybe<GqlReportEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlReservation = {
  __typename?: 'Reservation';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  histories?: Maybe<Array<GqlReservationHistory>>;
  id: Scalars['ID']['output'];
  opportunitySlot?: Maybe<GqlOpportunitySlot>;
  participantCountWithPoint?: Maybe<Scalars['Int']['output']>;
  participations?: Maybe<Array<GqlParticipation>>;
  status: GqlReservationStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlReservationCancelInput = {
  paymentMethod: GqlReservationPaymentMethod;
  ticketIdsIfExists?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlReservationCreateInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  opportunitySlotId: Scalars['ID']['input'];
  otherUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  participantCountWithPoint?: InputMaybe<Scalars['Int']['input']>;
  paymentMethod: GqlReservationPaymentMethod;
  ticketIdsIfNeed?: InputMaybe<Array<Scalars['ID']['input']>>;
  totalParticipantCount: Scalars['Int']['input'];
};

export type GqlReservationCreatePayload = GqlReservationCreateSuccess;

export type GqlReservationCreateSuccess = {
  __typename?: 'ReservationCreateSuccess';
  reservation: GqlReservation;
};

export type GqlReservationEdge = GqlEdge & {
  __typename?: 'ReservationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlReservation>;
};

export type GqlReservationFilterInput = {
  and?: InputMaybe<Array<GqlReservationFilterInput>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  createdByUserId?: InputMaybe<Scalars['ID']['input']>;
  evaluationStatus?: InputMaybe<GqlEvaluationStatus>;
  hostingStatus?: InputMaybe<Array<GqlOpportunitySlotHostingStatus>>;
  not?: InputMaybe<Array<GqlReservationFilterInput>>;
  opportunityId?: InputMaybe<Scalars['ID']['input']>;
  opportunityOwnerId?: InputMaybe<Scalars['ID']['input']>;
  opportunitySlotId?: InputMaybe<Scalars['ID']['input']>;
  or?: InputMaybe<Array<GqlReservationFilterInput>>;
  participationStatus?: InputMaybe<Array<GqlParticipationStatus>>;
  reservationStatus?: InputMaybe<Array<GqlReservationStatus>>;
};

export type GqlReservationHistoriesConnection = {
  __typename?: 'ReservationHistoriesConnection';
  edges: Array<GqlReservationHistoryEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlReservationHistory = {
  __typename?: 'ReservationHistory';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  reservation: GqlReservation;
  status: GqlReservationStatus;
};

export type GqlReservationHistoryEdge = GqlEdge & {
  __typename?: 'ReservationHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlReservationHistory>;
};

export type GqlReservationHistoryFilterInput = {
  createdByUserId?: InputMaybe<Scalars['ID']['input']>;
  reservationId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlReservationStatus>;
};

export type GqlReservationHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlReservationPaymentMethod = {
  Fee: 'FEE',
  Ticket: 'TICKET'
} as const;

export type GqlReservationPaymentMethod = typeof GqlReservationPaymentMethod[keyof typeof GqlReservationPaymentMethod];
export type GqlReservationRejectInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
};

export type GqlReservationSetStatusPayload = GqlReservationSetStatusSuccess;

export type GqlReservationSetStatusSuccess = {
  __typename?: 'ReservationSetStatusSuccess';
  reservation: GqlReservation;
};

export type GqlReservationSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export const GqlReservationStatus = {
  Accepted: 'ACCEPTED',
  Applied: 'APPLIED',
  Canceled: 'CANCELED',
  Rejected: 'REJECTED'
} as const;

export type GqlReservationStatus = typeof GqlReservationStatus[keyof typeof GqlReservationStatus];
export type GqlReservationsConnection = {
  __typename?: 'ReservationsConnection';
  edges: Array<GqlReservationEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlRole = {
  Manager: 'MANAGER',
  Member: 'MEMBER',
  Owner: 'OWNER'
} as const;

export type GqlRole = typeof GqlRole[keyof typeof GqlRole];
export const GqlSortDirection = {
  Asc: 'asc',
  Desc: 'desc'
} as const;

export type GqlSortDirection = typeof GqlSortDirection[keyof typeof GqlSortDirection];
export const GqlSource = {
  External: 'EXTERNAL',
  Internal: 'INTERNAL'
} as const;

export type GqlSource = typeof GqlSource[keyof typeof GqlSource];
export type GqlState = {
  __typename?: 'State';
  code: Scalars['ID']['output'];
  countryCode: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type GqlStateEdge = GqlEdge & {
  __typename?: 'StateEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlState>;
};

export type GqlStatesConnection = {
  __typename?: 'StatesConnection';
  edges: Array<GqlStateEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlStatesInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GqlStorePhoneAuthTokenInput = {
  authToken: Scalars['String']['input'];
  expiresIn: Scalars['Int']['input'];
  phoneUid: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
};

export type GqlStorePhoneAuthTokenPayload = {
  __typename?: 'StorePhoneAuthTokenPayload';
  expiresAt?: Maybe<Scalars['Datetime']['output']>;
  success: Scalars['Boolean']['output'];
};

export type GqlSubmitReportFeedbackInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  feedbackType?: InputMaybe<GqlReportFeedbackType>;
  rating: Scalars['Int']['input'];
  reportId: Scalars['ID']['input'];
  sectionKey?: InputMaybe<Scalars['String']['input']>;
};

export type GqlSubmitReportFeedbackPayload = GqlSubmitReportFeedbackSuccess;

export type GqlSubmitReportFeedbackSuccess = {
  __typename?: 'SubmitReportFeedbackSuccess';
  feedback: GqlReportFeedback;
};

/**
 * One bucket of the all-time DONATION chain-depth histogram. See
 * `SysAdminCommunityDetailPayload.chainDepthDistribution`.
 */
export type GqlSysAdminChainDepthBucket = {
  __typename?: 'SysAdminChainDepthBucket';
  /**
   * Number of all-time DONATION transactions whose `chain_depth`
   * falls into this bucket. Always non-negative.
   */
  count: Scalars['Int']['output'];
  /**
   * Chain-depth bucket key. Range 1..5; the 5 bucket aggregates
   * `chain_depth >= 5`. See `SysAdminCommunitySummaryCard
   * .maxChainDepthAllTime` for the underlying semantic.
   */
  depth: Scalars['Int']['output'];
};

/** One entry-month cohort's retention curve. */
export type GqlSysAdminCohortRetentionPoint = {
  __typename?: 'SysAdminCohortRetentionPoint';
  /** Entry month, first day JST (e.g. 2025-10-01T00:00+09:00). */
  cohortMonth: Scalars['Datetime']['output'];
  /** Cohort size at entry (status='JOINED' joiners in the month). */
  cohortSize: Scalars['Int']['output'];
  /**
   * Fraction of the cohort with a DONATION out in the SECOND month after
   * entry (m+1). null for an empty cohort or a cohort too recent to have
   * a completed m+1 window.
   */
  retentionM1?: Maybe<Scalars['Float']['output']>;
  /** Fraction active in m+3. */
  retentionM3?: Maybe<Scalars['Float']['output']>;
  /** Fraction active in m+6. */
  retentionM6?: Maybe<Scalars['Float']['output']>;
};

/**
 * API-side alert flags. Boolean only: the server owns the cross-field
 * judgement, the client just renders the badge.
 */
export type GqlSysAdminCommunityAlerts = {
  __typename?: 'SysAdminCommunityAlerts';
  /** Month-over-month communityActivityRate change <= -20%. */
  activeDrop: Scalars['Boolean']['output'];
  /** Latest-week churned_senders > retained_senders. */
  churnSpike: Scalars['Boolean']['output'];
  /** No t_memberships.created_at rows (status='JOINED') in the last 14 days. */
  noNewMembers: Scalars['Boolean']['output'];
};

export type GqlSysAdminCommunityDetailInput = {
  /** As-of timestamp (see SysAdminDashboardInput.asOf). */
  asOf?: InputMaybe<Scalars['Datetime']['input']>;
  /** Target community id. */
  communityId: Scalars['ID']['input'];
  /**
   * Opaque cursor for pagination. Internally a base64-encoded offset of
   * the prior page's position. Treat as opaque — pass back the cursor
   * returned by the previous response unchanged.
   */
  cursor?: InputMaybe<Scalars['String']['input']>;
  /**
   * Days since a member's most recent DONATION above which they are
   * classified as "dormant". Used to populate
   * `SysAdminCommunityDetailPayload.dormantCount`. See the same-named
   * field on SysAdminDashboardInput for the full semantic.
   *
   * Default 30 (≈ one month of silence). Effective range 1..365;
   * values outside are silently clamped on the server.
   */
  dormantThresholdDays?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Member list page size (default 50, max 1000). Raised from the
   * previous max of 200 so client-side aggregations that need every
   * member of a community (e.g. the "受領→送付 転換率" /
   * recipient-to-sender conversion rate, hub-persistence cohorts,
   * new-member retention breakdowns) can pull a single full page
   * without N round-trips. Communities larger than 1000 members
   * still need cursor pagination.
   */
  limit?: InputMaybe<Scalars['Int']['input']>;
  /** Stage-count thresholds for the stage distribution and tier counts. */
  segmentThresholds?: InputMaybe<GqlSysAdminSegmentThresholdsInput>;
  /** Member list filter. Defaults to `minSendRate = 0.7` (habitual only). */
  userFilter?: InputMaybe<GqlSysAdminUserListFilter>;
  /** Member list sort. Defaults to SEND_RATE DESC. */
  userSort?: InputMaybe<GqlSysAdminUserListSort>;
  /**
   * How many trailing JST months to include in the trend / cohort arrays.
   * Default 10.
   */
  windowMonths?: InputMaybe<Scalars['Int']['input']>;
};

/** Root payload for sysAdminCommunityDetail (L2). */
export type GqlSysAdminCommunityDetailPayload = {
  __typename?: 'SysAdminCommunityDetailPayload';
  /** Alert flags (same structure as L1, evaluated for this community). */
  alerts: GqlSysAdminCommunityAlerts;
  /** As-of timestamp echoed back. */
  asOf: Scalars['Datetime']['output'];
  /**
   * Distribution of DONATION `chain_depth` values across all-time
   * DONATION transactions in this community. Each bucket counts
   * distinct DONATION transactions whose `chain_depth` falls into
   * the bucket key (see `SysAdminCommunitySummaryCard.maxChainDepthAllTime`
   * for the depth semantic — depth 1 is a root donation, depth N+1
   * means the sender's most recent received DONATION had depth N).
   *
   * Buckets are `{depth: 1..5, count}`; the depth-5 bucket
   * aggregates all transactions with `chain_depth >= 5`. Buckets
   * are returned in ascending depth order, with every bucket
   * emitted (count = 0 for depths with no transactions) so the
   * client can render a contiguous histogram axis without
   * zero-padding logic. Adjust the ceiling upward (e.g., to 10+)
   * in a follow-up if real-data inspection of `maxChainDepthAllTime`
   * shows meaningful population in the 5+ bucket.
   *
   * Powers the L3 "/network" chain-depth histogram: visualizes
   * whether donations propagate deeply (multi-hop reciprocity, tail
   * populated) or shallowly (one-shot direct gifts, mass at depth 1).
   */
  chainDepthDistribution: Array<GqlSysAdminChainDepthBucket>;
  /**
   * One entry per entry month (length <= windowMonths), newest last.
   * `retentionM*` fields are null when the cohort is empty or too recent.
   */
  cohortRetention: Array<GqlSysAdminCohortRetentionPoint>;
  /** Community id. */
  communityId: Scalars['ID']['output'];
  /** Community display name. */
  communityName: Scalars['String']['output'];
  /**
   * Members who donated at some point but whose most recent
   * DONATION is older than `dormantThresholdDays` (default 30). See
   * the same-named field on `SysAdminCommunityOverview` for the
   * full semantic. Exposed at L2 so the user-scope card can show
   * the dormancy ratio directly without re-aggregating from the
   * member list.
   */
  dormantCount: Scalars['Int']['output'];
  /** Paginated member list — see type doc. */
  memberList: GqlSysAdminMemberList;
  /**
   * One entry per month (length <= windowMonths), newest last. Older
   * months with no MV data are omitted rather than zero-padded.
   */
  monthlyActivityTrend: Array<GqlSysAdminMonthlyActivityPoint>;
  /**
   * One entry per ISO week, newest last. Length approximates
   * `windowMonths * ~4.3` weeks; sparse weeks with no activity still emit
   * a row with zero counters.
   */
  retentionTrend: Array<GqlSysAdminRetentionTrendPoint>;
  /**
   * Stage distribution, classified server-side with the request's
   * thresholds. Computed over ALL members (independent of member-list
   * filter).
   */
  stages: GqlSysAdminStageDistribution;
  /** Summary card — see type doc. */
  summary: GqlSysAdminCommunitySummaryCard;
  /** Trailing window length in JST months (echoed back). */
  windowMonths: Scalars['Int']['output'];
};

/**
 * One row of the L1 all-community table. Designed for at-a-glance
 * intervention judgment: each row carries the raw counts the client
 * needs to derive rates, growth, alerts, sort keys, and filter
 * predicates without a second round-trip.
 *
 * Calendar-month metrics live on the L2 detail card
 * (SysAdminCommunitySummaryCard) — L1 is rolling-window only.
 */
export type GqlSysAdminCommunityOverview = {
  __typename?: 'SysAdminCommunityOverview';
  /** Community id. */
  communityId: Scalars['ID']['output'];
  /** Community display name (t_communities.name). */
  communityName: Scalars['String']['output'];
  /**
   * Members who donated at some point but whose most recent
   * DONATION is older than `dormantThresholdDays` (default 30).
   * Distinct from `segmentCounts.passiveCount` (= "latent", never
   * donated): operators care about the difference because the
   * intervention is different — re-engage the dormant, onboard the
   * latent.
   *
   * Computed as
   *   COUNT(DISTINCT user_id)
   *   WHERE the user has at least one historical DONATION in this
   *     community AND `MAX(donation.created_at) < asOf -
   *     dormantThresholdDays`
   *     AND status='JOINED' at asOf
   *
   * Invariants the client may assert:
   *   0 <= dormantCount <= totalMembers - segmentCounts.passiveCount
   *
   * The upper bound holds because dormant members are by
   * construction ever-donated, which `passiveCount` excludes.
   */
  dormantCount: Scalars['Int']['output'];
  /**
   * Number of members classified as a "hub" within the parametric
   * window (`windowDays`):
   *
   *   hubMemberCount = COUNT(member)
   *     WHERE windowUniqueDonationRecipients >= input.hubBreadthThreshold
   *
   * `windowUniqueDonationRecipients` is the count of DISTINCT users
   * this member sent a DONATION to during
   * `[asOf - windowDays JST日, asOf + 1 JST日)` — distinct from the
   * L2 `SysAdminMemberRow.uniqueDonationRecipients` field which is
   * tenure-wide. The window-scoped variant is computed on demand in
   * this aggregate but not exposed per-member at L1 (members
   * themselves are an L2 concern).
   *
   * Hub classification deliberately uses BREADTH only — a member
   * who reached `hubBreadthThreshold` distinct recipients during
   * the window necessarily transacted at least that many times,
   * making an explicit frequency floor redundant. This keeps the
   * threshold knobs to one (`hubBreadthThreshold`).
   *
   * Invariants (the client may assert these):
   *   hubMemberCount <= windowActivity.senderCount <= totalMembers
   *
   * The first holds because any hub member donated >= 3 times in
   * the window and is therefore a window sender; the second because
   * any window sender is a JOINED member at asOf.
   */
  hubMemberCount: Scalars['Int']['output'];
  /**
   * Latest completed monthly cohort and its M+1 activity. See
   * SysAdminLatestCohort.
   */
  latestCohort: GqlSysAdminLatestCohort;
  /**
   * Per-stage member counts (tier1 / tier2 / passive, cumulative
   * per the type doc) classified against input.segmentThresholds.
   */
  segmentCounts: GqlSysAdminSegmentCounts;
  /**
   * Tenure-bucket distribution of members at asOf. See
   * SysAdminTenureDistribution. Sum of buckets equals totalMembers.
   *
   * Lets the client surface community age structure at L1 without
   * drilling into the L2 member list (which would otherwise force
   * an N+1 round trip per community to compute distribution).
   */
  tenureDistribution: GqlSysAdminTenureDistribution;
  /**
   * Total status='JOINED' members as of asOf. Members whose
   * created_at is after asOf are excluded from the count.
   */
  totalMembers: Scalars['Int']['output'];
  /**
   * Latest completed-week retention signals for client-side churn
   * detection. See SysAdminWeeklyRetention.
   */
  weeklyRetention: GqlSysAdminWeeklyRetention;
  /** Rolling-window DONATION activity. See SysAdminWindowActivity. */
  windowActivity: GqlSysAdminWindowActivity;
};

/**
 * Summary card for a single community. Fronts the L2 detail screen and
 * answers "is this community improving?" in one row of numbers.
 */
export type GqlSysAdminCommunitySummaryCard = {
  __typename?: 'SysAdminCommunitySummaryCard';
  /**
   * Latest-month communityActivityRate (PRIMARY indicator — see module
   * docstring for the distinction vs userSendRate).
   */
  communityActivityRate: Scalars['Float']['output'];
  /**
   * 3-month trailing average of communityActivityRate, ending at the JST
   * calendar month containing asOf (inclusive). null when fewer than 3
   * months of data exist.
   */
  communityActivityRate3mAvg?: Maybe<Scalars['Float']['output']>;
  /** Community id. */
  communityId: Scalars['ID']['output'];
  /** Community display name. */
  communityName: Scalars['String']['output'];
  /** Oldest date with MV data for this community (JST calendar). */
  dataFrom?: Maybe<Scalars['Datetime']['output']>;
  /** Newest date with MV data for this community (JST calendar). */
  dataTo?: Maybe<Scalars['Datetime']['output']>;
  /**
   * Month-over-month % change in communityActivityRate (fraction, e.g.
   * -0.2 == -20%). null when the prior month has no data.
   */
  growthRateActivity?: Maybe<Scalars['Float']['output']>;
  /**
   * Maximum `chain_depth` observed in any DONATION, all-time, in
   * this community. null when no DONATION transactions exist.
   *
   * `chain_depth` semantics (set in transaction creation —
   * src/application/domain/transaction/service.ts:89, via
   * `findLatestReceivedTx`):
   *   - chain_depth = 1: a "root" donation. Either the sender
   *     had no prior received DONATION (= self-funded gift) or
   *     this is treated as the start of a chain.
   *   - chain_depth = N + 1: the sender's most recent received
   *     DONATION (parentTx) had `chain_depth = N`; the new
   *     donation propagates the chain by one step.
   *
   * Example trace: A donates to B → chain_depth 1.
   * B then donates to C, citing the receipt from A → chain_depth 2.
   * C donates to D similarly → chain_depth 3.
   *
   * `maxChainDepthAllTime = 1` therefore means "no propagation
   * ever happened" (every donation was a fresh root).
   * `maxChainDepthAllTime >= 2` means at least one
   * receive-then-pass-it-on event occurred.
   */
  maxChainDepthAllTime?: Maybe<Scalars['Int']['output']>;
  /** Cumulative members in tier2 or above under the supplied thresholds. */
  tier2Count: Scalars['Int']['output'];
  /** tier2Count / totalMembers (0.0–1.0). */
  tier2Pct: Scalars['Float']['output'];
  /**
   * Total DONATION points transferred, all-time (no window). Uses
   * t_transactions directly so the value is independent of MV retention.
   */
  totalDonationPointsAllTime: Scalars['Float']['output'];
  /** Total status='JOINED' members at asOf. */
  totalMembers: Scalars['Int']['output'];
};

/** Input for the L1 all-community overview (`sysAdminDashboard`). */
export type GqlSysAdminDashboardInput = {
  /**
   * As-of timestamp anchor. All trailing-window calculations are
   * anchored here:
   *   - parametric activity window: [asOf - windowDays, asOf + 1 JST日)
   *   - weekly retention: latest completed ISO week before asOf
   *   - latest cohort: (asOf JST月 - 2) so its M+1 window is fully past
   * Defaults to now when omitted.
   */
  asOf?: InputMaybe<Scalars['Datetime']['input']>;
  /**
   * Days since a member's most recent DONATION above which they are
   * classified as "dormant" — i.e. they donated at some point but
   * have gone quiet. Used to populate
   * `SysAdminCommunityOverview.dormantCount`.
   *
   * Distinct from `segmentCounts.passiveCount` (= "latent", never
   * donated): operators care about the difference because the
   * intervention is different (re-engage a sleeper vs onboard a
   * newcomer). A member with `MAX(donation.created_at) < asOf -
   * dormantThresholdDays` is dormant.
   *
   * Default 30 (≈ one month of silence). Effective range 1..365;
   * values outside are silently clamped on the server.
   */
  dormantThresholdDays?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Minimum number of distinct DONATION recipients within the
   * parametric window (`windowDays`) for a member to be classified
   * as a hub. Used to populate `SysAdminCommunityOverview.hubMemberCount`.
   *
   * Defaults to 3, meaning "sent DONATION to at least 3 different
   * people during the window". The threshold is on **unique
   * counterparties** (set cardinality), not transaction count, so a
   * member who donated 100 times to the same recipient does not
   * qualify on this axis alone.
   *
   * Effective range 1..1000; values outside are silently clamped on
   * the server.
   *
   * This is intentionally an absolute threshold rather than a
   * community-relative percentile: a percentile-based hub would
   * always classify ~N% of members as hubs by definition, defeating
   * cross-community comparison ("which communities have the highest
   * hub ratio?"). Community size differences are absorbed
   * client-side by displaying `hubMemberCount / totalMembers` rather
   * than the raw count.
   */
  hubBreadthThreshold?: InputMaybe<Scalars['Int']['input']>;
  /** Stage classification thresholds (see SysAdminSegmentThresholdsInput). */
  segmentThresholds?: InputMaybe<GqlSysAdminSegmentThresholdsInput>;
  /**
   * Length of the rolling activity window in JST days. Effective
   * range 7-90; values outside are silently clamped on the server.
   * Defaults to 28 (= 4 weeks, absorbs day-of-week variance).
   */
  windowDays?: InputMaybe<Scalars['Int']['input']>;
};

/** Root payload for sysAdminDashboard (L1). */
export type GqlSysAdminDashboardPayload = {
  __typename?: 'SysAdminDashboardPayload';
  /** As-of timestamp echoed back (UTC instant). */
  asOf: Scalars['Datetime']['output'];
  /** One row per community, in dashboard sort order. */
  communities: Array<GqlSysAdminCommunityOverview>;
  /** Platform-wide aggregate row. */
  platform: GqlSysAdminPlatformSummary;
};

/**
 * Most recently completed monthly cohort plus its M+1 activity.
 * "M+1" follows standard cohort-analysis convention: the calendar
 * month immediately after the joining month.
 *
 * The cohort is selected as (asOf's JST month - 2 months) so its
 * M+1 window — the JST month immediately preceding asOf's month —
 * is fully past. This avoids reporting an artificially low retention
 * during the in-progress month.
 *
 * Raw counts are returned; the client divides for the retention rate
 * and decides how to handle small-N cohorts via `size`.
 */
export type GqlSysAdminLatestCohort = {
  __typename?: 'SysAdminLatestCohort';
  /**
   * Of those cohort members, how many sent at least one DONATION
   * during the M+1 month.
   */
  activeAtM1: Scalars['Int']['output'];
  /**
   * Cohort size: status='JOINED' members whose created_at falls
   * within the cohort month. 0 when no one joined that month
   * (callers should treat M+1 retention as null in that case).
   */
  size: Scalars['Int']['output'];
};

/** Paginated member list for the L2 detail. */
export type GqlSysAdminMemberList = {
  __typename?: 'SysAdminMemberList';
  /** Whether more pages exist after this one. */
  hasNextPage: Scalars['Boolean']['output'];
  /**
   * Opaque cursor to pass back in `SysAdminCommunityDetailInput.cursor` to
   * fetch the next page. null when no further pages exist.
   */
  nextCursor?: Maybe<Scalars['String']['output']>;
  /**
   * Member rows for the current page, matching filter & sort applied
   * server-side.
   */
  users: Array<GqlSysAdminMemberRow>;
};

/**
 * One row of the L2 member list. Raw values only — stage classification
 * (habitual / regular / occasional / latent) is the client's concern so
 * server-side thresholds can be tuned without a schema change.
 */
export type GqlSysAdminMemberRow = {
  __typename?: 'SysAdminMemberRow';
  /**
   * Tenure in JST calendar days (floor, minimum 1). Daily-grain
   * counterpart to `monthsIn`. Useful when the client wants a
   * finer-grained activity rate than the monthly `userSendRate`,
   * or when grouping members into tenure buckets that don't align
   * with calendar-month boundaries.
   */
  daysIn: Scalars['Int']['output'];
  /**
   * Distinct JST days the member received at least one DONATION.
   * Daily-grain counterpart to `donationInMonths`. Receiver-side
   * counterpart to `donationOutDays`.
   */
  donationInDays: Scalars['Int']['output'];
  /**
   * Distinct months with at least one DONATION in. Receiver-side
   * counterpart to `donationOutMonths`. Combined with
   * `totalPointsIn`, identifies members who have been part of the
   * receiving side of the gift economy and over how broad a span.
   */
  donationInMonths: Scalars['Int']['output'];
  /**
   * Distinct JST days the member sent at least one DONATION.
   * Daily-grain counterpart to `donationOutMonths`. Combined with
   * `daysIn`, the client can compute `donationOutDays / daysIn` as
   * a daily-cadence rate, complementing the monthly `userSendRate`.
   */
  donationOutDays: Scalars['Int']['output'];
  /** Distinct months with at least one DONATION out. */
  donationOutMonths: Scalars['Int']['output'];
  /**
   * JST date (UTC-encoded at JST midnight) of this member's most
   * recent DONATION out in this community. null when the member has
   * never sent a DONATION (= latent on the sender axis).
   *
   * Powers the L3 "/members" dormancy list: clients sort dormant
   * members by `lastDonationAt ASC` to surface the longest-quiet
   * senders first, and compute days-since-last-donation as
   * `(asOf - lastDonationAt) / 1 day` for the per-row badge. Same
   * underlying signal as `dormantCount`'s threshold check
   * (`MAX(donation.created_at) < asOf - dormantThresholdDays`),
   * exposed as the raw timestamp so the client can derive multiple
   * derived views without a server-side recomputation per request.
   */
  lastDonationAt?: Maybe<Scalars['Datetime']['output']>;
  /** Tenure in JST calendar months (floor, minimum 1). */
  monthsIn: Scalars['Int']['output'];
  /** User display name (users.name). null when the user has no name set. */
  name?: Maybe<Scalars['String']['output']>;
  /**
   * All-time DONATION points received by this user in this community.
   * Receiver-side counterpart to `totalPointsOut`. Sums
   * `to_point_change` across DONATION transactions whose receiver
   * wallet belongs to this user in this community. Burn / system
   * sources (sender wallets without a user_id) are excluded so a
   * member who only received from a system grant scores 0 — same
   * scope as `totalPointsOut`.
   */
  totalPointsIn: Scalars['Float']['output'];
  /** All-time DONATION points sent by this user in this community. */
  totalPointsOut: Scalars['Float']['output'];
  /**
   * All-time count of distinct OTHER users this member has sent at
   * least one DONATION to in this community. The "network breadth"
   * half of the donor profile (paired with frequency-based
   * `userSendRate` and volume-based `totalPointsOut`):
   *
   *   breadth × frequency × volume → the client's per-member
   *   classification space (e.g. true hub vs single-target loyal vs
   *   rare-but-far-reaching).
   *
   * Counts unique counterparty user_id, not transaction count, so a
   * member who sent 100 donations to the same recipient still scores
   * 1. Excludes burn / system targets (recipient wallets without a
   * user_id).
   */
  uniqueDonationRecipients: Scalars['Int']['output'];
  /**
   * All-time count of distinct OTHER users that have sent at least
   * one DONATION to this member in this community. The receiver-side
   * counterpart to `uniqueDonationRecipients`. Counts unique sender
   * user_id, excludes burn / system sources (sender wallets without
   * a user_id) and self-donations (a user who somehow sent to their
   * own wallet does not increment the count). Used by the L2
   * dashboard to compute the "受領→送付 転換率" (recipient-to-sender
   * conversion rate) — share of DONATION recipients who have also
   * sent at least one DONATION — distinguishing reciprocal
   * participation networks from one-way distribution structures.
   */
  uniqueDonationSenders: Scalars['Int']['output'];
  /** User id. */
  userId: Scalars['ID']['output'];
  /**
   * Individual monthly-send rate: `donationOutMonths / monthsIn`, 0.0–1.0,
   * rounded to 3 decimals. INDIVIDUAL LTV variable (not the same as
   * communityActivityRate elsewhere in this schema).
   */
  userSendRate: Scalars['Float']['output'];
};

/** One month of community activity trend. */
export type GqlSysAdminMonthlyActivityPoint = {
  __typename?: 'SysAdminMonthlyActivityPoint';
  /**
   * Share of DONATION transactions that were part of a chain (chain_depth
   * > 0) in the month. 0.0–1.0.
   */
  chainPct?: Maybe<Scalars['Float']['output']>;
  /**
   * senderCount / month-end totalMembers. Read alongside newMembers: a
   * month with many new joiners can dip the rate even if absolute activity
   * grew.
   */
  communityActivityRate: Scalars['Float']['output'];
  /** Sum of DONATION points transferred in the month. */
  donationPointsSum: Scalars['Float']['output'];
  /**
   * Members who had no DONATION out in the trailing 30 days as of
   * the END of this month. Snapshot of the dormant base at
   * month-end. Pair with the NEXT month's `returnedMembers` to
   * compute the monthly recovery rate
   * (`returnedMembers[N] / dormantCount[N-1]`).
   *
   * Aligns with `SysAdminCommunityOverview.dormantCount` /
   * `SysAdminCommunityDetailPayload.dormantCount` semantics: an
   * ever-donated member whose most recent DONATION is older than
   * 30 days as of the month-end timestamp. The latest month's
   * value should equal `SysAdminCommunityDetailPayload.dormantCount`
   * when `asOf` falls at or near the JST month-end, modulo the
   * difference between the request's `dormantThresholdDays` input
   * (which the trend ignores in favor of a fixed 30-day window so
   * monthly returnedMembers / dormantCount stay comparable across
   * requests).
   */
  dormantCount: Scalars['Int']['output'];
  /** First day (JST) of the calendar month, e.g. 2025-10-01T00:00+09:00. */
  month: Scalars['Datetime']['output'];
  /** t_memberships.created_at (status='JOINED') rows falling in the month. */
  newMembers: Scalars['Int']['output'];
  /**
   * Members who were dormant at the END of the previous calendar
   * month but had at least one DONATION out in this month. Monthly
   * counterpart to `SysAdminRetentionTrendPoint.returnedSenders`.
   * null for the first month in the series (no prior month to
   * reference).
   *
   * "Dormant at the end of previous month" uses the same threshold
   * semantic as `SysAdminCommunityOverview.dormantCount` /
   * `SysAdminMonthlyActivityPoint.dormantCount` — no DONATION out in
   * the trailing 30 days as of the previous month-end. This may
   * diverge slightly from the sum of weekly `returnedSenders` over
   * the month because the weekly metric uses a 12-week look-back at
   * ISO-week granularity while this monthly metric uses the
   * 30-day-trailing dormant snapshot at month-end. The discrepancy
   * is week/month boundary alignment only.
   */
  returnedMembers?: Maybe<Scalars['Int']['output']>;
  /** Distinct DONATION senders in the month. */
  senderCount: Scalars['Int']['output'];
};

/**
 * Platform-wide headline, computed by summing across every community in
 * scope for the caller (which is every community since this query is
 * SYS_ADMIN-gated).
 */
export type GqlSysAdminPlatformSummary = {
  __typename?: 'SysAdminPlatformSummary';
  /** Number of communities included in the response. */
  communitiesCount: Scalars['Int']['output'];
  /**
   * Sum of DONATION points transferred during the JST calendar month
   * containing `asOf`, across every community.
   */
  latestMonthDonationPoints: Scalars['Float']['output'];
  /** Sum of status='JOINED' members across every community. */
  totalMembers: Scalars['Int']['output'];
};

/** One ISO week of retention signals. */
export type GqlSysAdminRetentionTrendPoint = {
  __typename?: 'SysAdminRetentionTrendPoint';
  /** Senders in the prior week who did NOT send this week. */
  churnedSenders: Scalars['Int']['output'];
  /**
   * Community activity rate for the week: distinct senders / totalMembers
   * as of week end. null when the community had zero members during the
   * week.
   */
  communityActivityRate?: Maybe<Scalars['Float']['output']>;
  /** New t_memberships.created_at rows (status='JOINED') this week. */
  newMembers: Scalars['Int']['output'];
  /**
   * Senders in both the prior week and this week (same-user on
   * donation_out_count > 0).
   */
  retainedSenders: Scalars['Int']['output'];
  /**
   * Senders this week who did NOT send last week but DID send some week
   * in the prior 12-week window.
   */
  returnedSenders: Scalars['Int']['output'];
  /** Monday 00:00 JST of the ISO week. */
  week: Scalars['Datetime']['output'];
};

/**
 * Stage-count snapshot for one community, computed by the server using the
 * client-supplied `SysAdminSegmentThresholdsInput`. Cumulative semantics:
 * `tier2Count` INCLUDES members counted in `tier1Count`.
 */
export type GqlSysAdminSegmentCounts = {
  __typename?: 'SysAdminSegmentCounts';
  /** Members with userSendRate > 0 (excludes latent). */
  activeCount: Scalars['Int']['output'];
  /** Members with donationOutMonths == 0 (latent / not-yet-participated). */
  passiveCount: Scalars['Int']['output'];
  /** Members with userSendRate >= tier1. */
  tier1Count: Scalars['Int']['output'];
  /** Members with userSendRate >= tier2 (includes tier1). */
  tier2Count: Scalars['Int']['output'];
  /** Total status='JOINED' members at asOf. */
  total: Scalars['Int']['output'];
};

/**
 * Stage classification thresholds, supplied by the client.
 * Thresholds define WHERE the boundary between stages sits, but naming
 * (habitual / regular / occasional / latent) remains fixed on the server.
 */
export type GqlSysAdminSegmentThresholdsInput = {
  /**
   * Minimum tenure a member must have before being eligible for
   * tier1 / tier2 classification. Expressed in calendar months for
   * ergonomic operator-facing semantics, but evaluated internally as
   * `daysIn >= minMonthsIn × 30` so a member who joined yesterday
   * but happens to straddle a calendar-month boundary cannot sneak
   * past the filter. Filters out the short-tenure artifact where a
   * brand-new member who donated once gets
   * `userSendRate = 1/1 = 1.0` and is auto-classified as habitual
   * despite no actual track record.
   *
   * Only affects `tier1Count` and `tier2Count`; `activeCount`
   * ("ever donated") and `passiveCount` ("never donated") are
   * semantically tenure-independent and remain unfiltered.
   *
   * Default 1 → roughly "must have been around at least 30 days".
   * Set to 3 for "must have been around 3+ months (~90 days)" so
   * the operator-facing reading of `tier1Count` matches the
   * intuitive meaning of "habitual sender".
   *
   * Effective range 1..120; values outside are silently clamped on
   * the server. The 30-day-per-month conversion matches
   * `tenureDistribution`'s bucket boundaries so the stage classifier
   * and the tenure-distribution chart agree on what "1 month" means.
   */
  minMonthsIn?: InputMaybe<Scalars['Int']['input']>;
  /**
   * Habitual stage threshold. A user with `userSendRate >= tier1` is
   * counted as "habitual" (i.e. sends donations in at least tier1 share
   * of their tenure). Default 0.7.
   */
  tier1?: InputMaybe<Scalars['Float']['input']>;
  /**
   * Regular stage threshold. `userSendRate >= tier2` AND `< tier1`
   * classifies as "regular". Default 0.4.
   */
  tier2?: InputMaybe<Scalars['Float']['input']>;
};

/** Sort direction for the member list. */
export const GqlSysAdminSortOrder = {
  /**
   * Ascending — smallest value first (e.g. SEND_RATE ASC puts latent
   * and occasional members before habitual).
   */
  Asc: 'ASC',
  /**
   * Descending — largest value first (e.g. SEND_RATE DESC puts habitual
   * members at the top). This is the default.
   */
  Desc: 'DESC'
} as const;

export type GqlSysAdminSortOrder = typeof GqlSysAdminSortOrder[keyof typeof GqlSysAdminSortOrder];
/**
 * Summary for one stage (habitual / regular / occasional / latent).
 * Stage membership is classified server-side using the thresholds supplied
 * in the request. `pointsContributionPct` is the share of total DONATION
 * points-out attributed to members in this stage, in the asOf month.
 */
export type GqlSysAdminStageBucket = {
  __typename?: 'SysAdminStageBucket';
  /** Average monthsIn across members in this stage. */
  avgMonthsIn: Scalars['Float']['output'];
  /** Average userSendRate across members in this stage (0.0–1.0). */
  avgSendRate: Scalars['Float']['output'];
  /** Number of members in this stage. */
  count: Scalars['Int']['output'];
  /** count / totalMembers (0.0–1.0). */
  pct: Scalars['Float']['output'];
  /**
   * Stage's share of this community's all-time DONATION points-out
   * (0.0–1.0). Numerator is the sum of `totalPointsOut` across the
   * stage's members; denominator is the same sum across all members.
   * 0 for the latent stage by definition.
   */
  pointsContributionPct: Scalars['Float']['output'];
};

/**
 * Four-stage distribution of the community's membership.
 * `pointsContributionPct` on `latent` is always 0 since latent members
 * haven't donated by definition.
 */
export type GqlSysAdminStageDistribution = {
  __typename?: 'SysAdminStageDistribution';
  /** userSendRate >= tier1. */
  habitual: GqlSysAdminStageBucket;
  /** donationOutMonths == 0. */
  latent: GqlSysAdminStageBucket;
  /** 0 < userSendRate < tier2. */
  occasional: GqlSysAdminStageBucket;
  /** tier2 <= userSendRate < tier1. */
  regular: GqlSysAdminStageBucket;
};

/**
 * Tenure-bucket distribution of a community's members at asOf,
 * classified on `daysIn` (JST calendar-day tenure). Lets the L1
 * dashboard surface community age structure (e.g. "lots of brand
 * new members, few established") without drilling into the L2
 * member list.
 *
 * Buckets are mutually exclusive and exhaustive; the sum equals
 * totalMembers. Boundaries are intentionally calendar-day rather
 * than month so a 28-day-tenure member doesn't get double-counted
 * into "1 month" purely because of `monthsIn`'s GREATEST(1, ...)
 * floor.
 */
export type GqlSysAdminTenureDistribution = {
  __typename?: 'SysAdminTenureDistribution';
  /**
   * Members with `daysIn >= 365` — long-time members. Combined
   * with `lt1Month`, signals the community's age structure.
   */
  gte12Months: Scalars['Int']['output'];
  /**
   * Members with `daysIn < 30` — newly joined cohort. Useful for
   * spotting communities flooded with new members where downstream
   * metrics (userSendRate, retention) are not yet meaningful.
   */
  lt1Month: Scalars['Int']['output'];
  /** Members with `30 <= daysIn < 90` — "still settling in" cohort. */
  m1to3Months: Scalars['Int']['output'];
  /** Members with `90 <= daysIn < 365` — established members. */
  m3to12Months: Scalars['Int']['output'];
  /**
   * Detailed monthly histogram for the L3 tenure deep-dive.
   *
   * Each entry counts currently-JOINED members whose tenure
   * (`floor(daysIn / 30)`) falls into the bucket. The 12 bucket
   * aggregates all members with tenure of 12 months or longer.
   * Returned in ascending bucket order (`monthsIn` 0..12), with
   * every bucket emitted (count = 0 for buckets with no members)
   * so the client can render a contiguous histogram axis without
   * zero-padding.
   *
   * Sum of `count` equals `totalMembers` minus members with a
   * negative tenure (data anomaly — should be impossible because
   * `daysIn` is floor-1-clamped at the SQL boundary, but the
   * contract notes the exclusion explicitly so the invariant is
   * documented).
   *
   * The existing 4 coarse buckets (`lt1Month` / `m1to3Months` /
   * `m3to12Months` / `gte12Months`) remain for L1 / L2 callers; the
   * monthly histogram is additional, not a replacement.
   */
  monthlyHistogram: Array<GqlSysAdminTenureHistogramBucket>;
};

/**
 * One bucket of the L3 tenure histogram. See
 * `SysAdminTenureDistribution.monthlyHistogram`.
 */
export type GqlSysAdminTenureHistogramBucket = {
  __typename?: 'SysAdminTenureHistogramBucket';
  /** Number of currently-JOINED members in this bucket. */
  count: Scalars['Int']['output'];
  /**
   * Tenure in JST calendar months, computed as `floor(daysIn / 30)`.
   * Range 0..12. The 12 bucket aggregates all members with tenure
   * of 12 months or longer; values 0..11 represent exact monthly
   * buckets.
   */
  monthsIn: Scalars['Int']['output'];
};

/**
 * Member-list filters for the L2 detail (`sysAdminCommunityDetail`).
 * All conditions AND together. Unspecified fields do not filter.
 */
export type GqlSysAdminUserListFilter = {
  /** Inclusive upper bound on userSendRate. */
  maxSendRate?: InputMaybe<Scalars['Float']['input']>;
  /** Inclusive lower bound on donationOutMonths. */
  minDonationOutMonths?: InputMaybe<Scalars['Int']['input']>;
  /** Inclusive lower bound on monthsIn (JST-calendar months). */
  minMonthsIn?: InputMaybe<Scalars['Int']['input']>;
  /** Inclusive lower bound on userSendRate. Default 0.7 (habitual only). */
  minSendRate?: InputMaybe<Scalars['Float']['input']>;
};

/**
 * Sort configuration for the L2 member list. Both fields are optional;
 * omitting either falls back to the default (SEND_RATE DESC) so the
 * "top habitual members first" view renders out of the box.
 */
export type GqlSysAdminUserListSort = {
  /**
   * Column to sort on. See SysAdminUserSortField for what each value
   * addresses. Default: SEND_RATE.
   */
  field?: InputMaybe<GqlSysAdminUserSortField>;
  /** Sort direction. Default: DESC. */
  order?: InputMaybe<GqlSysAdminSortOrder>;
};

/** Sortable columns on the member list. */
export const GqlSysAdminUserSortField = {
  /** donationOutMonths (distinct months with a DONATION out). */
  DonationOutMonths: 'DONATION_OUT_MONTHS',
  /** monthsIn (tenure in JST calendar months). */
  MonthsIn: 'MONTHS_IN',
  /** userSendRate (individual monthly-send rate, 0.0–1.0). */
  SendRate: 'SEND_RATE',
  /** totalPointsOut (lifetime DONATION points sent). */
  TotalPointsOut: 'TOTAL_POINTS_OUT'
} as const;

export type GqlSysAdminUserSortField = typeof GqlSysAdminUserSortField[keyof typeof GqlSysAdminUserSortField];
/**
 * DONATION sender retention against the most recently completed
 * ISO week (Monday 00:00 JST). Raw signals only; the client composes
 * churn alerts (e.g. churnedSenders > retainedSenders).
 */
export type GqlSysAdminWeeklyRetention = {
  __typename?: 'SysAdminWeeklyRetention';
  /**
   * Users who sent DONATION in the week-before-latest but NOT in
   * the latest completed week. "Lost this week, was engaged last week."
   */
  churnedSenders: Scalars['Int']['output'];
  /**
   * Users who sent DONATION in the latest completed week AND in
   * the week before it. "Engaged this week, was engaged last week."
   */
  retainedSenders: Scalars['Int']['output'];
};

/**
 * DONATION activity within the parametric window driven by
 * `SysAdminDashboardInput.windowDays`. Both the current window and
 * the immediately preceding window of equal length are returned so
 * the client can derive growth rates without a second query.
 *
 *   current  = [asOf - windowDays JST日, asOf + 1 JST日)
 *   previous = [asOf - 2 * windowDays, asOf - windowDays)
 */
export type GqlSysAdminWindowActivity = {
  __typename?: 'SysAdminWindowActivity';
  /**
   * New JOINED memberships (t_memberships.created_at within the
   * current window, status='JOINED').
   */
  newMemberCount: Scalars['Int']['output'];
  /** Same metric for the previous window. */
  newMemberCountPrev: Scalars['Int']['output'];
  /**
   * Users who sent at least one DONATION in BOTH the current window
   * AND the previous window (set intersection on user_id). Same
   * shape as SysAdminWeeklyRetention.retainedSenders but at
   * windowDays scale, enabling client-side leaky-bucket derivation:
   *
   *   newlyActivatedSenders = senderCount     - retainedSenders
   *   churnedSenders        = senderCountPrev - retainedSenders
   */
  retainedSenders: Scalars['Int']['output'];
  /**
   * Unique users with at least one outgoing DONATION transaction
   * during the current window (donation_out_count > 0 in
   * mv_user_transaction_daily).
   */
  senderCount: Scalars['Int']['output'];
  /** Same metric for the previous window of equal length. */
  senderCountPrev: Scalars['Int']['output'];
};

export const GqlSysRole = {
  SysAdmin: 'SYS_ADMIN',
  User: 'USER'
} as const;

export type GqlSysRole = typeof GqlSysRole[keyof typeof GqlSysRole];
export type GqlTicket = {
  __typename?: 'Ticket';
  claimLink?: Maybe<GqlTicketClaimLink>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  reason: GqlTicketStatusReason;
  status: GqlTicketStatus;
  ticketStatusHistories?: Maybe<Array<GqlTicketStatusHistory>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utility?: Maybe<GqlUtility>;
  wallet?: Maybe<GqlWallet>;
};

export type GqlTicketClaimInput = {
  ticketClaimLinkId: Scalars['ID']['input'];
};

export type GqlTicketClaimLink = {
  __typename?: 'TicketClaimLink';
  claimedAt?: Maybe<Scalars['Datetime']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  issuer?: Maybe<GqlTicketIssuer>;
  /** Max number of tickets a user can claim using this link */
  qty: Scalars['Int']['output'];
  status: GqlClaimLinkStatus;
  tickets?: Maybe<Array<GqlTicket>>;
};

export type GqlTicketClaimLinkEdge = GqlEdge & {
  __typename?: 'TicketClaimLinkEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTicketClaimLink>;
};

export type GqlTicketClaimLinkFilterInput = {
  hasAvailableTickets?: InputMaybe<Scalars['Boolean']['input']>;
  issuedTo?: InputMaybe<Scalars['ID']['input']>;
  issuerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlClaimLinkStatus>;
};

export type GqlTicketClaimLinkSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  status?: InputMaybe<GqlSortDirection>;
};

export type GqlTicketClaimLinksConnection = {
  __typename?: 'TicketClaimLinksConnection';
  edges?: Maybe<Array<Maybe<GqlTicketClaimLinkEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlTicketClaimPayload = GqlTicketClaimSuccess;

export type GqlTicketClaimSuccess = {
  __typename?: 'TicketClaimSuccess';
  tickets: Array<GqlTicket>;
};

export type GqlTicketEdge = GqlEdge & {
  __typename?: 'TicketEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTicket>;
};

export type GqlTicketFilterInput = {
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlTicketStatus>;
  utilityId?: InputMaybe<Scalars['ID']['input']>;
  walletId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlTicketIssueInput = {
  qtyToBeIssued: Scalars['Int']['input'];
  utilityId: Scalars['ID']['input'];
};

export type GqlTicketIssuePayload = GqlTicketIssueSuccess;

export type GqlTicketIssueSuccess = {
  __typename?: 'TicketIssueSuccess';
  issue: GqlTicketIssuer;
};

export type GqlTicketIssuer = {
  __typename?: 'TicketIssuer';
  claimLink?: Maybe<GqlTicketClaimLink>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  owner?: Maybe<GqlUser>;
  /** Maximum number of tickets claimable from this link */
  qtyToBeIssued: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utility?: Maybe<GqlUtility>;
};

export type GqlTicketIssuerEdge = GqlEdge & {
  __typename?: 'TicketIssuerEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTicketIssuer>;
};

export type GqlTicketIssuerFilterInput = {
  ownerId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlTicketIssuerSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTicketIssuersConnection = {
  __typename?: 'TicketIssuersConnection';
  edges?: Maybe<Array<Maybe<GqlTicketIssuerEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlTicketPurchaseInput = {
  communityId: Scalars['ID']['input'];
  pointsRequired: Scalars['Int']['input'];
  utilityId: Scalars['ID']['input'];
  walletId: Scalars['ID']['input'];
};

export type GqlTicketPurchasePayload = GqlTicketPurchaseSuccess;

export type GqlTicketPurchaseSuccess = {
  __typename?: 'TicketPurchaseSuccess';
  ticket: GqlTicket;
};

export type GqlTicketRefundInput = {
  communityId: Scalars['ID']['input'];
  pointsRequired: Scalars['Int']['input'];
  walletId: Scalars['ID']['input'];
};

export type GqlTicketRefundPayload = GqlTicketRefundSuccess;

export type GqlTicketRefundSuccess = {
  __typename?: 'TicketRefundSuccess';
  ticket: GqlTicket;
};

export type GqlTicketSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  status?: InputMaybe<GqlSortDirection>;
};

export const GqlTicketStatus = {
  Available: 'AVAILABLE',
  Disabled: 'DISABLED'
} as const;

export type GqlTicketStatus = typeof GqlTicketStatus[keyof typeof GqlTicketStatus];
export type GqlTicketStatusHistoriesConnection = {
  __typename?: 'TicketStatusHistoriesConnection';
  edges?: Maybe<Array<Maybe<GqlTicketStatusHistoryEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlTicketStatusHistory = {
  __typename?: 'TicketStatusHistory';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  reason: GqlTicketStatusReason;
  status: GqlTicketStatus;
  ticket?: Maybe<GqlTicket>;
  transaction?: Maybe<GqlTransaction>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlTicketStatusHistoryEdge = GqlEdge & {
  __typename?: 'TicketStatusHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTicketStatusHistory>;
};

export type GqlTicketStatusHistoryFilterInput = {
  createdById?: InputMaybe<Scalars['ID']['input']>;
  reason?: InputMaybe<GqlTicketStatusReason>;
  status?: InputMaybe<GqlTicketStatus>;
  ticketId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlTicketStatusHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlTicketStatusReason = {
  Canceled: 'CANCELED',
  Expired: 'EXPIRED',
  Gifted: 'GIFTED',
  Purchased: 'PURCHASED',
  Refunded: 'REFUNDED',
  Reserved: 'RESERVED',
  Used: 'USED'
} as const;

export type GqlTicketStatusReason = typeof GqlTicketStatusReason[keyof typeof GqlTicketStatusReason];
export type GqlTicketUsePayload = GqlTicketUseSuccess;

export type GqlTicketUseSuccess = {
  __typename?: 'TicketUseSuccess';
  ticket: GqlTicket;
};

export type GqlTicketsConnection = {
  __typename?: 'TicketsConnection';
  edges?: Maybe<Array<Maybe<GqlTicketEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlTransaction = {
  __typename?: 'Transaction';
  /**
   * ポイントの旅のステップを返します（最大10段階）。
   * 再帰CTEによる単一クエリで取得しますが、循環・異常データ対策のため深さ上限を10としています。
   * transactions などのリスト取得で chain を要求すると、各 Transaction ごとにこのクエリが実行されるため高コストになりえます。
   * transaction(id) での単体取得時のみ使用し、深さだけ必要な場合は chainDepth を使用してください。
   */
  chain?: Maybe<GqlTransactionChain>;
  chainDepth?: Maybe<Scalars['Int']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  fromPointChange?: Maybe<Scalars['Int']['output']>;
  fromWallet?: Maybe<GqlWallet>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  participation?: Maybe<GqlParticipation>;
  reason: GqlTransactionReason;
  reservation?: Maybe<GqlReservation>;
  ticketStatusHistories?: Maybe<Array<GqlTicketStatusHistory>>;
  toPointChange?: Maybe<Scalars['Int']['output']>;
  toWallet?: Maybe<GqlWallet>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

/**
 * ポイントの旅（chain）の全体像。
 * depth はチェーンの長さ（ステップ数）、steps は古い順（起点→現在）に並ぶ。
 */
export type GqlTransactionChain = {
  __typename?: 'TransactionChain';
  depth: Scalars['Int']['output'];
  steps: Array<GqlTransactionChainStep>;
};

/**
 * 参加者がコミュニティ（COMMUNITY wallet の所有者）である場合の表現。
 * id は Community.id。GRANT / ONBOARDING のような、community wallet から
 * 発行される transaction の起点ステップで登場する。
 */
export type GqlTransactionChainCommunity = GqlTransactionChainParticipant & {
  __typename?: 'TransactionChainCommunity';
  bio?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/**
 * chain の 1 ステップに登場する参加者（User または Community）。
 * 共通フィールドを束ねた interface。実体の判別は __typename で行う。
 */
export type GqlTransactionChainParticipant = {
  bio?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

/**
 * chain の1ステップ。ある transaction（ポイントの移動 1回分）に対応する。
 * from が送信元、to が送信先。どちらも User または Community を表す
 * TransactionChainParticipant interface で、__typename で判別できる。
 */
export type GqlTransactionChainStep = {
  __typename?: 'TransactionChainStep';
  createdAt: Scalars['Datetime']['output'];
  /**
   * 送信元の参加者。
   * - GRANT / ONBOARDING の起点ステップでは TransactionChainCommunity（community wallet 発）
   * - それ以外のステップは TransactionChainUser
   * - ウォレットが削除済み（退会済みユーザー等）の場合は null
   */
  from?: Maybe<GqlTransactionChainParticipant>;
  id: Scalars['ID']['output'];
  points: Scalars['Int']['output'];
  reason: GqlTransactionReason;
  /**
   * 送信先の参加者。
   * 現状の業務ロジックでは常に TransactionChainUser（MEMBER wallet 宛）。
   * ウォレットが削除済みの場合は null。
   */
  to?: Maybe<GqlTransactionChainParticipant>;
};

/**
 * 参加者がユーザー（MEMBER wallet の所有者）である場合の表現。
 * id は User.id。
 */
export type GqlTransactionChainUser = GqlTransactionChainParticipant & {
  __typename?: 'TransactionChainUser';
  bio?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type GqlTransactionDonateSelfPointInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  communityId: Scalars['ID']['input'];
  images?: InputMaybe<Array<GqlImageInput>>;
  toUserId: Scalars['ID']['input'];
  transferPoints: Scalars['Int']['input'];
};

export type GqlTransactionDonateSelfPointPayload = GqlTransactionDonateSelfPointSuccess;

export type GqlTransactionDonateSelfPointSuccess = {
  __typename?: 'TransactionDonateSelfPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionEdge = GqlEdge & {
  __typename?: 'TransactionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTransaction>;
};

export type GqlTransactionFilterInput = {
  and?: InputMaybe<Array<GqlTransactionFilterInput>>;
  communityId?: InputMaybe<Scalars['ID']['input']>;
  fromDidValue?: InputMaybe<Scalars['String']['input']>;
  fromUserId?: InputMaybe<Scalars['ID']['input']>;
  fromUserName?: InputMaybe<Scalars['String']['input']>;
  fromWalletId?: InputMaybe<Scalars['ID']['input']>;
  fromWalletType?: InputMaybe<GqlWalletType>;
  not?: InputMaybe<GqlTransactionFilterInput>;
  or?: InputMaybe<Array<GqlTransactionFilterInput>>;
  reason?: InputMaybe<GqlTransactionReason>;
  toDidValue?: InputMaybe<Scalars['String']['input']>;
  toUserId?: InputMaybe<Scalars['ID']['input']>;
  toUserName?: InputMaybe<Scalars['String']['input']>;
  toWalletId?: InputMaybe<Scalars['ID']['input']>;
  toWalletType?: InputMaybe<GqlWalletType>;
};

export type GqlTransactionGrantCommunityPointInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  toUserId: Scalars['ID']['input'];
  transferPoints: Scalars['Int']['input'];
};

export type GqlTransactionGrantCommunityPointPayload = GqlTransactionGrantCommunityPointSuccess;

export type GqlTransactionGrantCommunityPointSuccess = {
  __typename?: 'TransactionGrantCommunityPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionIssueCommunityPointInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  transferPoints: Scalars['Int']['input'];
};

export type GqlTransactionIssueCommunityPointPayload = GqlTransactionIssueCommunityPointSuccess;

export type GqlTransactionIssueCommunityPointSuccess = {
  __typename?: 'TransactionIssueCommunityPointSuccess';
  transaction: GqlTransaction;
};

export const GqlTransactionReason = {
  Donation: 'DONATION',
  Grant: 'GRANT',
  Onboarding: 'ONBOARDING',
  OpportunityReservationCanceled: 'OPPORTUNITY_RESERVATION_CANCELED',
  OpportunityReservationCreated: 'OPPORTUNITY_RESERVATION_CREATED',
  OpportunityReservationRejected: 'OPPORTUNITY_RESERVATION_REJECTED',
  PointIssued: 'POINT_ISSUED',
  PointReward: 'POINT_REWARD',
  TicketPurchased: 'TICKET_PURCHASED',
  TicketRefunded: 'TICKET_REFUNDED'
} as const;

export type GqlTransactionReason = typeof GqlTransactionReason[keyof typeof GqlTransactionReason];
export type GqlTransactionSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTransactionUpdateMetadataInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
};

export type GqlTransactionUpdateMetadataPayload = GqlTransactionUpdateMetadataSuccess;

export type GqlTransactionUpdateMetadataSuccess = {
  __typename?: 'TransactionUpdateMetadataSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionVerificationResult = {
  __typename?: 'TransactionVerificationResult';
  label: Scalars['Int']['output'];
  rootHash: Scalars['String']['output'];
  status: GqlVerificationStatus;
  transactionHash: Scalars['String']['output'];
  txId: Scalars['ID']['output'];
};

export type GqlTransactionsConnection = {
  __typename?: 'TransactionsConnection';
  edges?: Maybe<Array<Maybe<GqlTransactionEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlUpdateReportTemplateInput = {
  communityContext?: InputMaybe<Scalars['String']['input']>;
  experimentKey?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  maxTokens: Scalars['Int']['input'];
  model: Scalars['String']['input'];
  stopSequences?: InputMaybe<Array<Scalars['String']['input']>>;
  systemPrompt: Scalars['String']['input'];
  temperature?: InputMaybe<Scalars['Float']['input']>;
  trafficWeight?: InputMaybe<Scalars['Int']['input']>;
  userPromptTemplate: Scalars['String']['input'];
};

export type GqlUpdateReportTemplatePayload = GqlUpdateReportTemplateSuccess;

export type GqlUpdateReportTemplateSuccess = {
  __typename?: 'UpdateReportTemplateSuccess';
  reportTemplate: GqlReportTemplate;
};

export type GqlUpdateSignupBonusConfigInput = {
  bonusPoint: Scalars['Int']['input'];
  isEnabled: Scalars['Boolean']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUser = {
  __typename?: 'User';
  articlesAboutMe?: Maybe<Array<GqlArticle>>;
  articlesWrittenByMe?: Maybe<Array<GqlArticle>>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  currentPrefecture?: Maybe<GqlCurrentPrefecture>;
  didIssuanceRequests?: Maybe<Array<GqlDidIssuanceRequest>>;
  evaluationCreatedByMe?: Maybe<Array<GqlEvaluationHistory>>;
  evaluations?: Maybe<Array<GqlEvaluation>>;
  id: Scalars['ID']['output'];
  identities?: Maybe<Array<GqlIdentity>>;
  image?: Maybe<Scalars['String']['output']>;
  membershipChangedByMe?: Maybe<Array<GqlMembershipHistory>>;
  memberships?: Maybe<Array<GqlMembership>>;
  name: Scalars['String']['output'];
  nftInstances?: Maybe<GqlNftInstancesConnection>;
  nftWallet?: Maybe<GqlNftWallet>;
  opportunitiesCreatedByMe?: Maybe<Array<GqlOpportunity>>;
  participationStatusChangedByMe?: Maybe<Array<GqlParticipationStatusHistory>>;
  participations?: Maybe<Array<GqlParticipation>>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  portfolios?: Maybe<Array<GqlPortfolio>>;
  preferredLanguage?: Maybe<GqlLanguage>;
  reservationStatusChangedByMe?: Maybe<Array<GqlReservationHistory>>;
  reservations?: Maybe<Array<GqlReservation>>;
  slug?: Maybe<Scalars['String']['output']>;
  sysRole?: Maybe<GqlSysRole>;
  ticketStatusChangedByMe?: Maybe<Array<GqlTicketStatusHistory>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  urlFacebook?: Maybe<Scalars['String']['output']>;
  urlInstagram?: Maybe<Scalars['String']['output']>;
  urlTiktok?: Maybe<Scalars['String']['output']>;
  urlWebsite?: Maybe<Scalars['String']['output']>;
  urlX?: Maybe<Scalars['String']['output']>;
  urlYoutube?: Maybe<Scalars['String']['output']>;
  wallets?: Maybe<Array<GqlWallet>>;
};


export type GqlUserNftInstancesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlNftInstanceFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlNftInstanceSortInput>;
};


export type GqlUserPortfoliosArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlPortfolioFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlPortfolioSortInput>;
};

export type GqlUserDeletePayload = {
  __typename?: 'UserDeletePayload';
  userId?: Maybe<Scalars['ID']['output']>;
};

export type GqlUserEdge = GqlEdge & {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUser>;
};

export type GqlUserFilterInput = {
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  sysRole?: InputMaybe<GqlSysRole>;
};

export type GqlUserSignUpInput = {
  currentPrefecture: GqlCurrentPrefecture;
  image?: InputMaybe<GqlImageInput>;
  lineRefreshToken?: InputMaybe<Scalars['String']['input']>;
  lineTokenExpiresAt?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phoneAccessToken?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  phoneRefreshToken?: InputMaybe<Scalars['String']['input']>;
  phoneTokenExpiresAt?: InputMaybe<Scalars['String']['input']>;
  phoneUid?: InputMaybe<Scalars['String']['input']>;
  preferredLanguage?: InputMaybe<GqlLanguage>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlUserUpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  currentPrefecture?: InputMaybe<GqlCurrentPrefecture>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  preferredLanguage?: InputMaybe<GqlLanguage>;
  slug: Scalars['String']['input'];
  urlFacebook?: InputMaybe<Scalars['String']['input']>;
  urlInstagram?: InputMaybe<Scalars['String']['input']>;
  urlTiktok?: InputMaybe<Scalars['String']['input']>;
  urlWebsite?: InputMaybe<Scalars['String']['input']>;
  urlX?: InputMaybe<Scalars['String']['input']>;
  urlYoutube?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserUpdateProfilePayload = GqlUserUpdateProfileSuccess;

export type GqlUserUpdateProfileSuccess = {
  __typename?: 'UserUpdateProfileSuccess';
  user?: Maybe<GqlUser>;
};

export type GqlUsersConnection = {
  __typename?: 'UsersConnection';
  edges?: Maybe<Array<Maybe<GqlUserEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlUtilitiesConnection = {
  __typename?: 'UtilitiesConnection';
  edges?: Maybe<Array<Maybe<GqlUtilityEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlUtility = {
  __typename?: 'Utility';
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  owner?: Maybe<GqlUser>;
  pointsRequired: Scalars['Int']['output'];
  publishStatus: GqlPublishStatus;
  requiredForOpportunities?: Maybe<Array<GqlOpportunity>>;
  ticketIssuers?: Maybe<Array<GqlTicketIssuer>>;
  tickets?: Maybe<Array<GqlTicket>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlUtilityCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  name: Scalars['String']['input'];
  pointsRequired: Scalars['Int']['input'];
  requiredForOpportunityIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GqlUtilityCreatePayload = GqlUtilityCreateSuccess;

export type GqlUtilityCreateSuccess = {
  __typename?: 'UtilityCreateSuccess';
  utility: GqlUtility;
};

export type GqlUtilityDeletePayload = GqlUtilityDeleteSuccess;

export type GqlUtilityDeleteSuccess = {
  __typename?: 'UtilityDeleteSuccess';
  utilityId: Scalars['String']['output'];
};

export type GqlUtilityEdge = GqlEdge & {
  __typename?: 'UtilityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUtility>;
};

export type GqlUtilityFilterInput = {
  and?: InputMaybe<Array<GqlUtilityFilterInput>>;
  communityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  not?: InputMaybe<GqlUtilityFilterInput>;
  or?: InputMaybe<Array<GqlUtilityFilterInput>>;
  ownerIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  publishStatus?: InputMaybe<Array<GqlPublishStatus>>;
};

export type GqlUtilitySetPublishStatusInput = {
  publishStatus: GqlPublishStatus;
};

export type GqlUtilitySetPublishStatusPayload = GqlUtilitySetPublishStatusSuccess;

export type GqlUtilitySetPublishStatusSuccess = {
  __typename?: 'UtilitySetPublishStatusSuccess';
  utility: GqlUtility;
};

export type GqlUtilitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  pointsRequired?: InputMaybe<GqlSortDirection>;
};

export type GqlUtilityUpdateInfoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  name: Scalars['String']['input'];
  pointsRequired: Scalars['Int']['input'];
};

export type GqlUtilityUpdateInfoPayload = GqlUtilityUpdateInfoSuccess;

export type GqlUtilityUpdateInfoSuccess = {
  __typename?: 'UtilityUpdateInfoSuccess';
  utility: GqlUtility;
};

export const GqlValueType = {
  Float: 'FLOAT',
  Int: 'INT'
} as const;

export type GqlValueType = typeof GqlValueType[keyof typeof GqlValueType];
export type GqlVcIssuanceRequest = {
  __typename?: 'VcIssuanceRequest';
  completedAt?: Maybe<Scalars['Datetime']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  evaluation?: Maybe<GqlEvaluation>;
  id: Scalars['ID']['output'];
  processedAt?: Maybe<Scalars['Datetime']['output']>;
  requestedAt?: Maybe<Scalars['Datetime']['output']>;
  status: GqlVcIssuanceStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlVcIssuanceRequestEdge = GqlEdge & {
  __typename?: 'VcIssuanceRequestEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlVcIssuanceRequest>;
};

export type GqlVcIssuanceRequestFilterInput = {
  evaluationId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GqlVcIssuanceStatus>;
  userIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GqlVcIssuanceRequestSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlVcIssuanceRequestsConnection = {
  __typename?: 'VcIssuanceRequestsConnection';
  edges: Array<GqlVcIssuanceRequestEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlVcIssuanceStatus = {
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  Pending: 'PENDING',
  Processing: 'PROCESSING'
} as const;

export type GqlVcIssuanceStatus = typeof GqlVcIssuanceStatus[keyof typeof GqlVcIssuanceStatus];
export const GqlVerificationStatus = {
  Error: 'ERROR',
  NotVerified: 'NOT_VERIFIED',
  Pending: 'PENDING',
  Verified: 'VERIFIED'
} as const;

export type GqlVerificationStatus = typeof GqlVerificationStatus[keyof typeof GqlVerificationStatus];
/**
 * 個々の投票レコード。同一 (userId, topicId) に対し常に 1 レコード。
 * 再投票は upsert で上書きされるため**投票履歴は保持されない**。
 * 投票の取消（withdraw）は現時点で未サポート。
 */
export type GqlVoteBallot = {
  __typename?: 'VoteBallot';
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  option: GqlVoteOption;
  /**
   * 投票時点の power **スナップショット**。
   * NFT_COUNT ポリシーの場合、投票後に NFT 保有数が変化しても本フィールドは変わらない
   * （現時点の power は MyVoteEligibility.currentPower を参照）。
   */
  power: Scalars['Int']['output'];
  /** 再投票（upsert）時に現在時刻で更新される。初回投票時は null。 */
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlVoteCastInput = {
  optionId: Scalars['ID']['input'];
  topicId: Scalars['ID']['input'];
};

export type GqlVoteCastPayload = GqlVoteCastSuccess;

export type GqlVoteCastSuccess = {
  __typename?: 'VoteCastSuccess';
  ballot: GqlVoteBallot;
};

/**
 * 誰が投票できるか（資格ゲート）。
 * VotePowerPolicy（何票持つか）とは**独立に設定される**が、両方が NFT 系
 * （Gate.type=NFT かつ PowerPolicy.type=NFT_COUNT）の場合に限り、参照する
 * **nftTokenId は一致していなければならない**（バックエンドで検証、違反時は
 * `VALIDATION_ERROR`）。異なる token を指定した場合、A 保有者のうち B 非保有者が
 * eligible=true / currentPower=0 になる「投票しても効かない」状態が生じる設定ミスを防ぐため。
 *
 * 許容される組み合わせ:
 * - Gate=NFT(A) + Policy=NFT_COUNT(A)  典型的
 * - Gate=MEMBERSHIP + Policy=NFT_COUNT(A)  メンバー内で NFT ホルダーのみ重み付け（非ホルダーは power=0）
 * - Gate=NFT(A) + Policy=FLAT  A 保有者は一律 1 票
 * - Gate=MEMBERSHIP + Policy=FLAT  全員 1 票
 */
export type GqlVoteGate = {
  __typename?: 'VoteGate';
  id: Scalars['ID']['output'];
  /** type=NFT のときの参照 NftToken */
  nftToken?: Maybe<GqlNftToken>;
  /** type=MEMBERSHIP のときに要求する最低ロール（未指定時は MEMBER 以上） */
  requiredRole?: Maybe<GqlRole>;
  type: GqlVoteGateType;
};

export type GqlVoteGateInput = {
  /** type=NFT のとき必須。MEMBERSHIP のときは無視される。 */
  nftTokenId?: InputMaybe<Scalars['ID']['input']>;
  /** type=MEMBERSHIP のときに任意指定（未指定時は MEMBER 以上で可）。NFT のときは無視される。 */
  requiredRole?: InputMaybe<GqlRole>;
  type: GqlVoteGateType;
};

export const GqlVoteGateType = {
  Membership: 'MEMBERSHIP',
  Nft: 'NFT'
} as const;

export type GqlVoteGateType = typeof GqlVoteGateType[keyof typeof GqlVoteGateType];
/**
 * 投票選択肢。
 * voteCount / totalPower は投票・再投票時にトランザクション内で直接更新される**非正規化カラム**で、
 * 集計コストを O(1) に抑える。PowerPolicy=FLAT のとき voteCount == totalPower、
 * NFT_COUNT では乖離する。一般的には勝敗判定に totalPower、参加者数表示に voteCount を使う。
 */
export type GqlVoteOption = {
  __typename?: 'VoteOption';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  /**
   * 作成時（VoteOptionInput）に指定した値がそのまま保持される。
   * VoteTopic.options は本フィールドの昇順で返るため、UI 側で追加のソートは不要。
   */
  orderIndex: Scalars['Int']['output'];
  /** 票の重み合計（= Σ power）。endsAt 到達前は一般ユーザーに null（管理者は常に実値を参照可）。 */
  totalPower?: Maybe<Scalars['Int']['output']>;
  /** 投票した**人数**。endsAt 到達前は一般ユーザーに null（管理者は常に実値を参照可）。 */
  voteCount?: Maybe<Scalars['Int']['output']>;
};

export type GqlVoteOptionInput = {
  label: Scalars['String']['input'];
  /** 0 以上の整数。オプション間で重複不可。 */
  orderIndex: Scalars['Int']['input'];
};

/**
 * 投票の重み（1 人が何票持つか）を決めるポリシー。
 * VoteGate（投票可能か）とは独立に設定される。
 */
export type GqlVotePowerPolicy = {
  __typename?: 'VotePowerPolicy';
  id: Scalars['ID']['output'];
  /** type=NFT_COUNT のときに参照する NftToken（保有数を power とする） */
  nftToken?: Maybe<GqlNftToken>;
  type: GqlVotePowerPolicyType;
};

export type GqlVotePowerPolicyInput = {
  /** type=NFT_COUNT のとき必須。FLAT のときは無視される。 */
  nftTokenId?: InputMaybe<Scalars['ID']['input']>;
  type: GqlVotePowerPolicyType;
};

export const GqlVotePowerPolicyType = {
  Flat: 'FLAT',
  NftCount: 'NFT_COUNT'
} as const;

export type GqlVotePowerPolicyType = typeof GqlVotePowerPolicyType[keyof typeof GqlVotePowerPolicyType];
export type GqlVoteTopic = {
  __typename?: 'VoteTopic';
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endsAt: Scalars['Datetime']['output'];
  gate: GqlVoteGate;
  id: Scalars['ID']['output'];
  /**
   * ログインユーザーの投票（未ログイン・未投票は null）。
   * MyVoteEligibility.myBallot と同じ値を返すため、一覧画面ではこちらを利用することを推奨
   * （投票画面のように資格情報も必要な場合は myEligibility.myBallot を使う）。
   */
  myBallot?: Maybe<GqlVoteBallot>;
  /** ログインユーザーの投票資格情報（未ログインは null）。 */
  myEligibility?: Maybe<GqlMyVoteEligibility>;
  /** 投票選択肢。orderIndex 昇順で返る（UI 側でのソートは不要）。 */
  options: Array<GqlVoteOption>;
  /**
   * 現在フェーズ。**レスポンス時点でサーバ時刻から計算される値**であり DB カラムではない。
   * 詳細は VoteTopicPhase の説明を参照。
   */
  phase: GqlVoteTopicPhase;
  powerPolicy: GqlVotePowerPolicy;
  startsAt: Scalars['Datetime']['output'];
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlVoteTopicCreateInput = {
  communityId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  gate: GqlVoteGateInput;
  options: Array<GqlVoteOptionInput>;
  powerPolicy: GqlVotePowerPolicyInput;
  startsAt: Scalars['Datetime']['input'];
  title: Scalars['String']['input'];
};

export type GqlVoteTopicCreatePayload = GqlVoteTopicCreateSuccess;

export type GqlVoteTopicCreateSuccess = {
  __typename?: 'VoteTopicCreateSuccess';
  voteTopic: GqlVoteTopic;
};

export type GqlVoteTopicDeletePayload = GqlVoteTopicDeleteSuccess;

export type GqlVoteTopicDeleteSuccess = {
  __typename?: 'VoteTopicDeleteSuccess';
  voteTopicId: Scalars['ID']['output'];
};

export type GqlVoteTopicEdge = {
  __typename?: 'VoteTopicEdge';
  cursor: Scalars['String']['output'];
  node: GqlVoteTopic;
};

/**
 * 投票テーマの現在フェーズ。
 * startsAt / endsAt と現在時刻から**レスポンス時点で**計算される値で、DB カラムではない。
 * 長時間開いたままの画面（カウントダウン等）ではクライアント側で古くなるため、
 * 精密な期間判定には startsAt / endsAt を直接比較すること。一覧表示などでは phase を利用して構わない。
 */
export const GqlVoteTopicPhase = {
  Closed: 'CLOSED',
  Open: 'OPEN',
  Upcoming: 'UPCOMING'
} as const;

export type GqlVoteTopicPhase = typeof GqlVoteTopicPhase[keyof typeof GqlVoteTopicPhase];
/**
 * voteTopicUpdate 用の入力。**既存の全フィールドを置き換える**（部分更新は未サポート）。
 * options は delete → create で全量置換される。gate / powerPolicy も同様に再生成されるため、
 * 既存の id 値は保持されない点に注意。UPCOMING フェーズ限定で呼ばれるため、投票は存在しない前提。
 */
export type GqlVoteTopicUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  gate: GqlVoteGateInput;
  options: Array<GqlVoteOptionInput>;
  powerPolicy: GqlVotePowerPolicyInput;
  startsAt: Scalars['Datetime']['input'];
  title: Scalars['String']['input'];
};

export type GqlVoteTopicUpdatePayload = GqlVoteTopicUpdateSuccess;

export type GqlVoteTopicUpdateSuccess = {
  __typename?: 'VoteTopicUpdateSuccess';
  voteTopic: GqlVoteTopic;
};

export type GqlVoteTopicsConnection = {
  __typename?: 'VoteTopicsConnection';
  edges: Array<GqlVoteTopicEdge>;
  nodes: Array<GqlVoteTopic>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlWallet = {
  __typename?: 'Wallet';
  accumulatedPointView?: Maybe<GqlAccumulatedPointView>;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  currentPointView?: Maybe<GqlCurrentPointView>;
  id: Scalars['ID']['output'];
  tickets?: Maybe<Array<GqlTicket>>;
  /** @deprecated Use transactionsConnection for pagination support */
  transactions?: Maybe<Array<GqlTransaction>>;
  transactionsConnection?: Maybe<GqlTransactionsConnection>;
  type: GqlWalletType;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};


export type GqlWalletTransactionsConnectionArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTransactionSortInput>;
};

export type GqlWalletEdge = GqlEdge & {
  __typename?: 'WalletEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlWallet>;
};

export type GqlWalletFilterInput = {
  communityId?: InputMaybe<Scalars['ID']['input']>;
  type?: InputMaybe<GqlWalletType>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlWalletSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlWalletType = {
  Community: 'COMMUNITY',
  Member: 'MEMBER'
} as const;

export type GqlWalletType = typeof GqlWalletType[keyof typeof GqlWalletType];
export type GqlWalletsConnection = {
  __typename?: 'WalletsConnection';
  edges?: Maybe<Array<Maybe<GqlWalletEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping of union types */
export type GqlResolversUnionTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  ApproveReportPayload: ( Omit<GqlApproveReportSuccess, 'report'> & { report: _RefType['Report'] } );
  ArticleCreatePayload: ( Omit<GqlArticleCreateSuccess, 'article'> & { article: _RefType['Article'] } );
  ArticleDeletePayload: ( GqlArticleDeleteSuccess );
  ArticleUpdateContentPayload: ( Omit<GqlArticleUpdateContentSuccess, 'article'> & { article: _RefType['Article'] } );
  CommunityCreatePayload: ( Omit<GqlCommunityCreateSuccess, 'community'> & { community: _RefType['Community'] } );
  CommunityDeletePayload: ( GqlCommunityDeleteSuccess );
  CommunityUpdateProfilePayload: ( Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: _RefType['Community'] } );
  EvaluationBulkCreatePayload: ( Omit<GqlEvaluationBulkCreateSuccess, 'evaluations'> & { evaluations: Array<_RefType['Evaluation']> } );
  GenerateReportPayload: ( Omit<GqlGenerateReportSuccess, 'report'> & { report: _RefType['Report'] } );
  IncentiveGrantRetryPayload: ( Omit<GqlIncentiveGrantRetrySuccess, 'incentiveGrant' | 'transaction'> & { incentiveGrant: _RefType['IncentiveGrant'], transaction?: Maybe<_RefType['Transaction']> } );
  MembershipInvitePayload: ( Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipRemovePayload: ( GqlMembershipRemoveSuccess );
  MembershipSetInvitationStatusPayload: ( Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipSetRolePayload: ( Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipWithdrawPayload: ( GqlMembershipWithdrawSuccess );
  OpportunityCreatePayload: ( Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunityDeletePayload: ( GqlOpportunityDeleteSuccess );
  OpportunitySetPublishStatusPayload: ( Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunitySlotCreatePayload: ( Omit<GqlOpportunitySlotCreateSuccess, 'slot'> & { slot: _RefType['OpportunitySlot'] } );
  OpportunitySlotSetHostingStatusPayload: ( Omit<GqlOpportunitySlotSetHostingStatusSuccess, 'slot'> & { slot: _RefType['OpportunitySlot'] } );
  OpportunitySlotsBulkUpdatePayload: ( Omit<GqlOpportunitySlotsBulkUpdateSuccess, 'slots'> & { slots: Array<_RefType['OpportunitySlot']> } );
  OpportunityUpdateContentPayload: ( Omit<GqlOpportunityUpdateContentSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  ParticipationBulkCreatePayload: ( Omit<GqlParticipationBulkCreateSuccess, 'participations'> & { participations: Array<_RefType['Participation']> } );
  ParticipationCreatePersonalRecordPayload: ( Omit<GqlParticipationCreatePersonalRecordSuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationDeletePayload: ( GqlParticipationDeleteSuccess );
  PlaceCreatePayload: ( Omit<GqlPlaceCreateSuccess, 'place'> & { place: _RefType['Place'] } );
  PlaceDeletePayload: ( GqlPlaceDeleteSuccess );
  PlaceUpdatePayload: ( Omit<GqlPlaceUpdateSuccess, 'place'> & { place: _RefType['Place'] } );
  PublishReportPayload: ( Omit<GqlPublishReportSuccess, 'report'> & { report: _RefType['Report'] } );
  RejectReportPayload: ( Omit<GqlRejectReportSuccess, 'report'> & { report: _RefType['Report'] } );
  ReservationCreatePayload: ( Omit<GqlReservationCreateSuccess, 'reservation'> & { reservation: _RefType['Reservation'] } );
  ReservationSetStatusPayload: ( Omit<GqlReservationSetStatusSuccess, 'reservation'> & { reservation: _RefType['Reservation'] } );
  SubmitReportFeedbackPayload: ( Omit<GqlSubmitReportFeedbackSuccess, 'feedback'> & { feedback: _RefType['ReportFeedback'] } );
  TicketClaimPayload: ( Omit<GqlTicketClaimSuccess, 'tickets'> & { tickets: Array<_RefType['Ticket']> } );
  TicketIssuePayload: ( Omit<GqlTicketIssueSuccess, 'issue'> & { issue: _RefType['TicketIssuer'] } );
  TicketPurchasePayload: ( Omit<GqlTicketPurchaseSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TicketRefundPayload: ( Omit<GqlTicketRefundSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TicketUsePayload: ( Omit<GqlTicketUseSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TransactionDonateSelfPointPayload: ( Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionGrantCommunityPointPayload: ( Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionIssueCommunityPointPayload: ( Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionUpdateMetadataPayload: ( Omit<GqlTransactionUpdateMetadataSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UpdateReportTemplatePayload: ( Omit<GqlUpdateReportTemplateSuccess, 'reportTemplate'> & { reportTemplate: _RefType['ReportTemplate'] } );
  UserUpdateProfilePayload: ( Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UtilityCreatePayload: ( Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityDeletePayload: ( GqlUtilityDeleteSuccess );
  UtilitySetPublishStatusPayload: ( Omit<GqlUtilitySetPublishStatusSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityUpdateInfoPayload: ( Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  VoteCastPayload: ( GqlVoteCastSuccess );
  VoteTopicCreatePayload: ( Omit<GqlVoteTopicCreateSuccess, 'voteTopic'> & { voteTopic: _RefType['VoteTopic'] } );
  VoteTopicDeletePayload: ( GqlVoteTopicDeleteSuccess );
  VoteTopicUpdatePayload: ( Omit<GqlVoteTopicUpdateSuccess, 'voteTopic'> & { voteTopic: _RefType['VoteTopic'] } );
}>;

/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlArticleEdge, 'node'> & { node?: Maybe<_RefType['Article']> } ) | ( Omit<GqlCityEdge, 'node'> & { node?: Maybe<_RefType['City']> } ) | ( Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<_RefType['Community']> } ) | ( Omit<GqlEvaluationEdge, 'node'> & { node?: Maybe<_RefType['Evaluation']> } ) | ( Omit<GqlEvaluationHistoryEdge, 'node'> & { node?: Maybe<_RefType['EvaluationHistory']> } ) | ( Omit<GqlIncentiveGrantEdge, 'node'> & { node?: Maybe<_RefType['IncentiveGrant']> } ) | ( Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<_RefType['Membership']> } ) | ( Omit<GqlNftInstanceEdge, 'node'> & { node: _RefType['NftInstance'] } ) | ( Omit<GqlNftTokenEdge, 'node'> & { node: _RefType['NftToken'] } ) | ( Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<_RefType['Opportunity']> } ) | ( Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<_RefType['OpportunitySlot']> } ) | ( Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<_RefType['Participation']> } ) | ( Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['ParticipationStatusHistory']> } ) | ( Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<_RefType['Place']> } ) | ( Omit<GqlPortfolioEdge, 'node'> & { node?: Maybe<_RefType['Portfolio']> } ) | ( Omit<GqlReportEdge, 'node'> & { node?: Maybe<_RefType['Report']> } ) | ( Omit<GqlReportFeedbackEdge, 'node'> & { node?: Maybe<_RefType['ReportFeedback']> } ) | ( Omit<GqlReservationEdge, 'node'> & { node?: Maybe<_RefType['Reservation']> } ) | ( Omit<GqlReservationHistoryEdge, 'node'> & { node?: Maybe<_RefType['ReservationHistory']> } ) | ( Omit<GqlStateEdge, 'node'> & { node?: Maybe<_RefType['State']> } ) | ( Omit<GqlTicketClaimLinkEdge, 'node'> & { node?: Maybe<_RefType['TicketClaimLink']> } ) | ( Omit<GqlTicketEdge, 'node'> & { node?: Maybe<_RefType['Ticket']> } ) | ( Omit<GqlTicketIssuerEdge, 'node'> & { node?: Maybe<_RefType['TicketIssuer']> } ) | ( Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['TicketStatusHistory']> } ) | ( Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<_RefType['Transaction']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } ) | ( Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<_RefType['Utility']> } ) | ( Omit<GqlVcIssuanceRequestEdge, 'node'> & { node?: Maybe<_RefType['VcIssuanceRequest']> } ) | ( Omit<GqlWalletEdge, 'node'> & { node?: Maybe<_RefType['Wallet']> } );
  TransactionChainParticipant: ( GqlTransactionChainCommunity ) | ( GqlTransactionChainUser );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  AccumulatedPointView: ResolverTypeWrapper<AccumulatedPointView>;
  ApproveReportPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApproveReportPayload']>;
  ApproveReportSuccess: ResolverTypeWrapper<Omit<GqlApproveReportSuccess, 'report'> & { report: GqlResolversTypes['Report'] }>;
  Article: ResolverTypeWrapper<Article>;
  ArticleCategory: GqlArticleCategory;
  ArticleCreateInput: GqlArticleCreateInput;
  ArticleCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ArticleCreatePayload']>;
  ArticleCreateSuccess: ResolverTypeWrapper<Omit<GqlArticleCreateSuccess, 'article'> & { article: GqlResolversTypes['Article'] }>;
  ArticleDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ArticleDeletePayload']>;
  ArticleDeleteSuccess: ResolverTypeWrapper<GqlArticleDeleteSuccess>;
  ArticleEdge: ResolverTypeWrapper<Omit<GqlArticleEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Article']> }>;
  ArticleFilterInput: GqlArticleFilterInput;
  ArticleSortInput: GqlArticleSortInput;
  ArticleUpdateContentInput: GqlArticleUpdateContentInput;
  ArticleUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ArticleUpdateContentPayload']>;
  ArticleUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlArticleUpdateContentSuccess, 'article'> & { article: GqlResolversTypes['Article'] }>;
  ArticlesConnection: ResolverTypeWrapper<Omit<GqlArticlesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ArticleEdge']>>> }>;
  AuthZDirectiveCompositeRulesInput: GqlAuthZDirectiveCompositeRulesInput;
  AuthZDirectiveDeepCompositeRulesInput: GqlAuthZDirectiveDeepCompositeRulesInput;
  AuthZRules: GqlAuthZRules;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']['output']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CheckCommunityPermissionInput: GqlCheckCommunityPermissionInput;
  CheckIsSelfPermissionInput: GqlCheckIsSelfPermissionInput;
  CheckOpportunityPermissionInput: GqlCheckOpportunityPermissionInput;
  CitiesConnection: ResolverTypeWrapper<Omit<GqlCitiesConnection, 'edges'> & { edges: Array<GqlResolversTypes['CityEdge']> }>;
  CitiesInput: GqlCitiesInput;
  CitiesSortInput: GqlCitiesSortInput;
  City: ResolverTypeWrapper<City>;
  CityEdge: ResolverTypeWrapper<Omit<GqlCityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['City']> }>;
  ClaimLinkStatus: GqlClaimLinkStatus;
  CommonDocumentOverrides: ResolverTypeWrapper<GqlCommonDocumentOverrides>;
  CommonDocumentOverridesInput: GqlCommonDocumentOverridesInput;
  CommunitiesConnection: ResolverTypeWrapper<Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<GqlResolversTypes['CommunityEdge']>> }>;
  Community: ResolverTypeWrapper<Community>;
  CommunityConfig: ResolverTypeWrapper<GqlCommunityConfig>;
  CommunityConfigInput: GqlCommunityConfigInput;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityCreatePayload']>;
  CommunityCreateSuccess: ResolverTypeWrapper<Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CommunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityDeletePayload']>;
  CommunityDeleteSuccess: ResolverTypeWrapper<GqlCommunityDeleteSuccess>;
  CommunityDocument: ResolverTypeWrapper<GqlCommunityDocument>;
  CommunityDocumentInput: GqlCommunityDocumentInput;
  CommunityEdge: ResolverTypeWrapper<Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Community']> }>;
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunityFirebaseConfig: ResolverTypeWrapper<GqlCommunityFirebaseConfig>;
  CommunityLineConfig: ResolverTypeWrapper<GqlCommunityLineConfig>;
  CommunityLineConfigInput: GqlCommunityLineConfigInput;
  CommunityLineRichMenuConfig: ResolverTypeWrapper<GqlCommunityLineRichMenuConfig>;
  CommunityLineRichMenuConfigInput: GqlCommunityLineRichMenuConfigInput;
  CommunityPortalConfig: ResolverTypeWrapper<GqlCommunityPortalConfig>;
  CommunityPortalConfigInput: GqlCommunityPortalConfigInput;
  CommunitySignupBonusConfig: ResolverTypeWrapper<GqlCommunitySignupBonusConfig>;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityUpdateProfilePayload']>;
  CommunityUpdateProfileSuccess: ResolverTypeWrapper<Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CurrentPointView: ResolverTypeWrapper<CurrentPointView>;
  CurrentPrefecture: GqlCurrentPrefecture;
  CurrentUserPayload: ResolverTypeWrapper<Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  DateTimeRangeFilter: GqlDateTimeRangeFilter;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  Decimal: ResolverTypeWrapper<Scalars['Decimal']['output']>;
  DidIssuanceRequest: ResolverTypeWrapper<GqlDidIssuanceRequest>;
  DidIssuanceStatus: GqlDidIssuanceStatus;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  Error: ResolverTypeWrapper<GqlError>;
  ErrorCode: GqlErrorCode;
  Evaluation: ResolverTypeWrapper<Omit<GqlEvaluation, 'evaluator' | 'histories' | 'participation' | 'vcIssuanceRequest'> & { evaluator?: Maybe<GqlResolversTypes['User']>, histories?: Maybe<Array<GqlResolversTypes['EvaluationHistory']>>, participation?: Maybe<GqlResolversTypes['Participation']>, vcIssuanceRequest?: Maybe<GqlResolversTypes['VcIssuanceRequest']> }>;
  EvaluationBulkCreateInput: GqlEvaluationBulkCreateInput;
  EvaluationBulkCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EvaluationBulkCreatePayload']>;
  EvaluationBulkCreateSuccess: ResolverTypeWrapper<Omit<GqlEvaluationBulkCreateSuccess, 'evaluations'> & { evaluations: Array<GqlResolversTypes['Evaluation']> }>;
  EvaluationCreateInput: GqlEvaluationCreateInput;
  EvaluationEdge: ResolverTypeWrapper<Omit<GqlEvaluationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Evaluation']> }>;
  EvaluationFilterInput: GqlEvaluationFilterInput;
  EvaluationHistoriesConnection: ResolverTypeWrapper<Omit<GqlEvaluationHistoriesConnection, 'edges'> & { edges: Array<GqlResolversTypes['EvaluationHistoryEdge']> }>;
  EvaluationHistory: ResolverTypeWrapper<Omit<GqlEvaluationHistory, 'createdByUser' | 'evaluation'> & { createdByUser?: Maybe<GqlResolversTypes['User']>, evaluation?: Maybe<GqlResolversTypes['Evaluation']> }>;
  EvaluationHistoryEdge: ResolverTypeWrapper<Omit<GqlEvaluationHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['EvaluationHistory']> }>;
  EvaluationHistoryFilterInput: GqlEvaluationHistoryFilterInput;
  EvaluationHistorySortInput: GqlEvaluationHistorySortInput;
  EvaluationItem: GqlEvaluationItem;
  EvaluationSortInput: GqlEvaluationSortInput;
  EvaluationStatus: GqlEvaluationStatus;
  EvaluationsConnection: ResolverTypeWrapper<Omit<GqlEvaluationsConnection, 'edges'> & { edges: Array<GqlResolversTypes['EvaluationEdge']> }>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GenerateReportInput: GqlGenerateReportInput;
  GenerateReportPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GenerateReportPayload']>;
  GenerateReportSuccess: ResolverTypeWrapper<Omit<GqlGenerateReportSuccess, 'report'> & { report: GqlResolversTypes['Report'] }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Identity: ResolverTypeWrapper<Omit<GqlIdentity, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  IdentityCheckPhoneUserInput: GqlIdentityCheckPhoneUserInput;
  IdentityCheckPhoneUserPayload: ResolverTypeWrapper<Omit<GqlIdentityCheckPhoneUserPayload, 'membership' | 'user'> & { membership?: Maybe<GqlResolversTypes['Membership']>, user?: Maybe<GqlResolversTypes['User']> }>;
  IdentityPlatform: GqlIdentityPlatform;
  ImageInput: GqlImageInput;
  IncentiveGrant: ResolverTypeWrapper<Omit<GqlIncentiveGrant, 'community' | 'transaction' | 'user'> & { community?: Maybe<GqlResolversTypes['Community']>, transaction?: Maybe<GqlResolversTypes['Transaction']>, user?: Maybe<GqlResolversTypes['User']> }>;
  IncentiveGrantEdge: ResolverTypeWrapper<Omit<GqlIncentiveGrantEdge, 'node'> & { node?: Maybe<GqlResolversTypes['IncentiveGrant']> }>;
  IncentiveGrantFailureCode: GqlIncentiveGrantFailureCode;
  IncentiveGrantFilterInput: GqlIncentiveGrantFilterInput;
  IncentiveGrantRetryInput: GqlIncentiveGrantRetryInput;
  IncentiveGrantRetryPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IncentiveGrantRetryPayload']>;
  IncentiveGrantRetrySuccess: ResolverTypeWrapper<Omit<GqlIncentiveGrantRetrySuccess, 'incentiveGrant' | 'transaction'> & { incentiveGrant: GqlResolversTypes['IncentiveGrant'], transaction?: Maybe<GqlResolversTypes['Transaction']> }>;
  IncentiveGrantSortInput: GqlIncentiveGrantSortInput;
  IncentiveGrantStatus: GqlIncentiveGrantStatus;
  IncentiveGrantType: GqlIncentiveGrantType;
  IncentiveGrantsConnection: ResolverTypeWrapper<Omit<GqlIncentiveGrantsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['IncentiveGrantEdge']>>> }>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Language: GqlLanguage;
  LineRichMenuType: GqlLineRichMenuType;
  LinkPhoneAuthInput: GqlLinkPhoneAuthInput;
  LinkPhoneAuthPayload: ResolverTypeWrapper<Omit<GqlLinkPhoneAuthPayload, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  Membership: ResolverTypeWrapper<Membership>;
  MembershipCursorInput: GqlMembershipCursorInput;
  MembershipEdge: ResolverTypeWrapper<Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Membership']> }>;
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipHistory: ResolverTypeWrapper<MembershipHistory>;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipInvitePayload']>;
  MembershipInviteSuccess: ResolverTypeWrapper<Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipRemoveInput: GqlMembershipRemoveInput;
  MembershipRemovePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipRemovePayload']>;
  MembershipRemoveSuccess: ResolverTypeWrapper<GqlMembershipRemoveSuccess>;
  MembershipSetInvitationStatusInput: GqlMembershipSetInvitationStatusInput;
  MembershipSetInvitationStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipSetInvitationStatusPayload']>;
  MembershipSetInvitationStatusSuccess: ResolverTypeWrapper<Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipSetRoleInput: GqlMembershipSetRoleInput;
  MembershipSetRolePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipSetRolePayload']>;
  MembershipSetRoleSuccess: ResolverTypeWrapper<Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipSortInput: GqlMembershipSortInput;
  MembershipStatus: GqlMembershipStatus;
  MembershipStatusReason: GqlMembershipStatusReason;
  MembershipWithdrawInput: GqlMembershipWithdrawInput;
  MembershipWithdrawPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipWithdrawPayload']>;
  MembershipWithdrawSuccess: ResolverTypeWrapper<GqlMembershipWithdrawSuccess>;
  MembershipsConnection: ResolverTypeWrapper<Omit<GqlMembershipsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>> }>;
  Mutation: ResolverTypeWrapper<{}>;
  MyVoteEligibility: ResolverTypeWrapper<GqlMyVoteEligibility>;
  NestedPlaceConnectOrCreateInput: GqlNestedPlaceConnectOrCreateInput;
  NestedPlaceCreateInput: GqlNestedPlaceCreateInput;
  NestedPlacesBulkConnectOrCreateInput: GqlNestedPlacesBulkConnectOrCreateInput;
  NestedPlacesBulkUpdateInput: GqlNestedPlacesBulkUpdateInput;
  NftInstance: ResolverTypeWrapper<Omit<GqlNftInstance, 'community' | 'nftToken' | 'nftWallet'> & { community?: Maybe<GqlResolversTypes['Community']>, nftToken?: Maybe<GqlResolversTypes['NftToken']>, nftWallet?: Maybe<GqlResolversTypes['NftWallet']> }>;
  NftInstanceEdge: ResolverTypeWrapper<Omit<GqlNftInstanceEdge, 'node'> & { node: GqlResolversTypes['NftInstance'] }>;
  NftInstanceFilterInput: GqlNftInstanceFilterInput;
  NftInstanceSortInput: GqlNftInstanceSortInput;
  NftInstancesConnection: ResolverTypeWrapper<Omit<GqlNftInstancesConnection, 'edges'> & { edges: Array<GqlResolversTypes['NftInstanceEdge']> }>;
  NftToken: ResolverTypeWrapper<Omit<GqlNftToken, 'community'> & { community?: Maybe<GqlResolversTypes['Community']> }>;
  NftTokenEdge: ResolverTypeWrapper<Omit<GqlNftTokenEdge, 'node'> & { node: GqlResolversTypes['NftToken'] }>;
  NftTokenFilterInput: GqlNftTokenFilterInput;
  NftTokenSortInput: GqlNftTokenSortInput;
  NftTokensConnection: ResolverTypeWrapper<Omit<GqlNftTokensConnection, 'edges'> & { edges: Array<GqlResolversTypes['NftTokenEdge']> }>;
  NftWallet: ResolverTypeWrapper<Omit<GqlNftWallet, 'user'> & { user: GqlResolversTypes['User'] }>;
  OpportunitiesConnection: ResolverTypeWrapper<Omit<GqlOpportunitiesConnection, 'edges'> & { edges: Array<GqlResolversTypes['OpportunityEdge']> }>;
  Opportunity: ResolverTypeWrapper<Opportunity>;
  OpportunityCategory: GqlOpportunityCategory;
  OpportunityCreateInput: GqlOpportunityCreateInput;
  OpportunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityCreatePayload']>;
  OpportunityCreateSuccess: ResolverTypeWrapper<Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityDeletePayload']>;
  OpportunityDeleteSuccess: ResolverTypeWrapper<GqlOpportunityDeleteSuccess>;
  OpportunityEdge: ResolverTypeWrapper<Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Opportunity']> }>;
  OpportunityFilterInput: GqlOpportunityFilterInput;
  OpportunitySetPublishStatusInput: GqlOpportunitySetPublishStatusInput;
  OpportunitySetPublishStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySetPublishStatusPayload']>;
  OpportunitySetPublishStatusSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunitySlot: ResolverTypeWrapper<OpportunitySlot>;
  OpportunitySlotCreateInput: GqlOpportunitySlotCreateInput;
  OpportunitySlotCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySlotCreatePayload']>;
  OpportunitySlotCreateSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySlotCreateSuccess, 'slot'> & { slot: GqlResolversTypes['OpportunitySlot'] }>;
  OpportunitySlotEdge: ResolverTypeWrapper<Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<GqlResolversTypes['OpportunitySlot']> }>;
  OpportunitySlotFilterInput: GqlOpportunitySlotFilterInput;
  OpportunitySlotHostingStatus: GqlOpportunitySlotHostingStatus;
  OpportunitySlotSetHostingStatusInput: GqlOpportunitySlotSetHostingStatusInput;
  OpportunitySlotSetHostingStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySlotSetHostingStatusPayload']>;
  OpportunitySlotSetHostingStatusSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySlotSetHostingStatusSuccess, 'slot'> & { slot: GqlResolversTypes['OpportunitySlot'] }>;
  OpportunitySlotSortInput: GqlOpportunitySlotSortInput;
  OpportunitySlotUpdateInput: GqlOpportunitySlotUpdateInput;
  OpportunitySlotsBulkUpdateInput: GqlOpportunitySlotsBulkUpdateInput;
  OpportunitySlotsBulkUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySlotsBulkUpdatePayload']>;
  OpportunitySlotsBulkUpdateSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySlotsBulkUpdateSuccess, 'slots'> & { slots: Array<GqlResolversTypes['OpportunitySlot']> }>;
  OpportunitySlotsConnection: ResolverTypeWrapper<Omit<GqlOpportunitySlotsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OpportunitySlotEdge']>>> }>;
  OpportunitySortInput: GqlOpportunitySortInput;
  OpportunityUpdateContentInput: GqlOpportunityUpdateContentInput;
  OpportunityUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityUpdateContentPayload']>;
  OpportunityUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlOpportunityUpdateContentSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Participation: ResolverTypeWrapper<Participation>;
  ParticipationBulkCreateInput: GqlParticipationBulkCreateInput;
  ParticipationBulkCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationBulkCreatePayload']>;
  ParticipationBulkCreateSuccess: ResolverTypeWrapper<Omit<GqlParticipationBulkCreateSuccess, 'participations'> & { participations: Array<GqlResolversTypes['Participation']> }>;
  ParticipationCreatePersonalRecordInput: GqlParticipationCreatePersonalRecordInput;
  ParticipationCreatePersonalRecordPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationCreatePersonalRecordPayload']>;
  ParticipationCreatePersonalRecordSuccess: ResolverTypeWrapper<Omit<GqlParticipationCreatePersonalRecordSuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationDeletePayload']>;
  ParticipationDeleteSuccess: ResolverTypeWrapper<GqlParticipationDeleteSuccess>;
  ParticipationEdge: ResolverTypeWrapper<Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Participation']> }>;
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatus: GqlParticipationStatus;
  ParticipationStatusHistoriesConnection: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationStatusHistoryEdge']> }>;
  ParticipationStatusHistory: ResolverTypeWrapper<ParticipationStatusHistory>;
  ParticipationStatusHistoryEdge: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['ParticipationStatusHistory']> }>;
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationStatusReason: GqlParticipationStatusReason;
  ParticipationType: GqlParticipationType;
  ParticipationsConnection: ResolverTypeWrapper<Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationEdge']> }>;
  PhoneUserStatus: GqlPhoneUserStatus;
  Place: ResolverTypeWrapper<Place>;
  PlaceCreateInput: GqlPlaceCreateInput;
  PlaceCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PlaceCreatePayload']>;
  PlaceCreateSuccess: ResolverTypeWrapper<Omit<GqlPlaceCreateSuccess, 'place'> & { place: GqlResolversTypes['Place'] }>;
  PlaceDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PlaceDeletePayload']>;
  PlaceDeleteSuccess: ResolverTypeWrapper<GqlPlaceDeleteSuccess>;
  PlaceEdge: ResolverTypeWrapper<Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Place']> }>;
  PlaceFilterInput: GqlPlaceFilterInput;
  PlaceSortInput: GqlPlaceSortInput;
  PlaceUpdateInput: GqlPlaceUpdateInput;
  PlaceUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PlaceUpdatePayload']>;
  PlaceUpdateSuccess: ResolverTypeWrapper<Omit<GqlPlaceUpdateSuccess, 'place'> & { place: GqlResolversTypes['Place'] }>;
  PlacesConnection: ResolverTypeWrapper<Omit<GqlPlacesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['PlaceEdge']>>> }>;
  Portfolio: ResolverTypeWrapper<Omit<GqlPortfolio, 'participants' | 'place'> & { participants?: Maybe<Array<GqlResolversTypes['User']>>, place?: Maybe<GqlResolversTypes['Place']> }>;
  PortfolioCategory: GqlPortfolioCategory;
  PortfolioEdge: ResolverTypeWrapper<Omit<GqlPortfolioEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Portfolio']> }>;
  PortfolioFilterInput: GqlPortfolioFilterInput;
  PortfolioSortInput: GqlPortfolioSortInput;
  PortfolioSource: GqlPortfolioSource;
  PortfoliosConnection: ResolverTypeWrapper<Omit<GqlPortfoliosConnection, 'edges'> & { edges: Array<GqlResolversTypes['PortfolioEdge']> }>;
  PublishReportPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PublishReportPayload']>;
  PublishReportSuccess: ResolverTypeWrapper<Omit<GqlPublishReportSuccess, 'report'> & { report: GqlResolversTypes['Report'] }>;
  PublishStatus: GqlPublishStatus;
  Query: ResolverTypeWrapper<{}>;
  RejectReportPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['RejectReportPayload']>;
  RejectReportSuccess: ResolverTypeWrapper<Omit<GqlRejectReportSuccess, 'report'> & { report: GqlResolversTypes['Report'] }>;
  Report: ResolverTypeWrapper<Omit<GqlReport, 'community' | 'feedbacks' | 'generatedByUser' | 'myFeedback' | 'parentRun' | 'publishedByUser' | 'regenerations' | 'targetUser' | 'template'> & { community: GqlResolversTypes['Community'], feedbacks: GqlResolversTypes['ReportFeedbacksConnection'], generatedByUser?: Maybe<GqlResolversTypes['User']>, myFeedback?: Maybe<GqlResolversTypes['ReportFeedback']>, parentRun?: Maybe<GqlResolversTypes['Report']>, publishedByUser?: Maybe<GqlResolversTypes['User']>, regenerations: Array<GqlResolversTypes['Report']>, targetUser?: Maybe<GqlResolversTypes['User']>, template?: Maybe<GqlResolversTypes['ReportTemplate']> }>;
  ReportEdge: ResolverTypeWrapper<Omit<GqlReportEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Report']> }>;
  ReportFeedback: ResolverTypeWrapper<Omit<GqlReportFeedback, 'user'> & { user: GqlResolversTypes['User'] }>;
  ReportFeedbackEdge: ResolverTypeWrapper<Omit<GqlReportFeedbackEdge, 'node'> & { node?: Maybe<GqlResolversTypes['ReportFeedback']> }>;
  ReportFeedbackType: GqlReportFeedbackType;
  ReportFeedbacksConnection: ResolverTypeWrapper<Omit<GqlReportFeedbacksConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ReportFeedbackEdge']>>> }>;
  ReportStatus: GqlReportStatus;
  ReportTemplate: ResolverTypeWrapper<Omit<GqlReportTemplate, 'community' | 'updatedByUser'> & { community?: Maybe<GqlResolversTypes['Community']>, updatedByUser?: Maybe<GqlResolversTypes['User']> }>;
  ReportTemplateScope: GqlReportTemplateScope;
  ReportTemplateStats: ResolverTypeWrapper<GqlReportTemplateStats>;
  ReportVariant: GqlReportVariant;
  ReportsConnection: ResolverTypeWrapper<Omit<GqlReportsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ReportEdge']>>> }>;
  Reservation: ResolverTypeWrapper<Omit<GqlReservation, 'createdByUser' | 'histories' | 'opportunitySlot' | 'participations'> & { createdByUser?: Maybe<GqlResolversTypes['User']>, histories?: Maybe<Array<GqlResolversTypes['ReservationHistory']>>, opportunitySlot?: Maybe<GqlResolversTypes['OpportunitySlot']>, participations?: Maybe<Array<GqlResolversTypes['Participation']>> }>;
  ReservationCancelInput: GqlReservationCancelInput;
  ReservationCreateInput: GqlReservationCreateInput;
  ReservationCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ReservationCreatePayload']>;
  ReservationCreateSuccess: ResolverTypeWrapper<Omit<GqlReservationCreateSuccess, 'reservation'> & { reservation: GqlResolversTypes['Reservation'] }>;
  ReservationEdge: ResolverTypeWrapper<Omit<GqlReservationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Reservation']> }>;
  ReservationFilterInput: GqlReservationFilterInput;
  ReservationHistoriesConnection: ResolverTypeWrapper<Omit<GqlReservationHistoriesConnection, 'edges'> & { edges: Array<GqlResolversTypes['ReservationHistoryEdge']> }>;
  ReservationHistory: ResolverTypeWrapper<Omit<GqlReservationHistory, 'createdByUser' | 'reservation'> & { createdByUser?: Maybe<GqlResolversTypes['User']>, reservation: GqlResolversTypes['Reservation'] }>;
  ReservationHistoryEdge: ResolverTypeWrapper<Omit<GqlReservationHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['ReservationHistory']> }>;
  ReservationHistoryFilterInput: GqlReservationHistoryFilterInput;
  ReservationHistorySortInput: GqlReservationHistorySortInput;
  ReservationPaymentMethod: GqlReservationPaymentMethod;
  ReservationRejectInput: GqlReservationRejectInput;
  ReservationSetStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ReservationSetStatusPayload']>;
  ReservationSetStatusSuccess: ResolverTypeWrapper<Omit<GqlReservationSetStatusSuccess, 'reservation'> & { reservation: GqlResolversTypes['Reservation'] }>;
  ReservationSortInput: GqlReservationSortInput;
  ReservationStatus: GqlReservationStatus;
  ReservationsConnection: ResolverTypeWrapper<Omit<GqlReservationsConnection, 'edges'> & { edges: Array<GqlResolversTypes['ReservationEdge']> }>;
  Role: GqlRole;
  SortDirection: GqlSortDirection;
  Source: GqlSource;
  State: ResolverTypeWrapper<State>;
  StateEdge: ResolverTypeWrapper<Omit<GqlStateEdge, 'node'> & { node?: Maybe<GqlResolversTypes['State']> }>;
  StatesConnection: ResolverTypeWrapper<Omit<GqlStatesConnection, 'edges'> & { edges: Array<GqlResolversTypes['StateEdge']> }>;
  StatesInput: GqlStatesInput;
  StorePhoneAuthTokenInput: GqlStorePhoneAuthTokenInput;
  StorePhoneAuthTokenPayload: ResolverTypeWrapper<GqlStorePhoneAuthTokenPayload>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubmitReportFeedbackInput: GqlSubmitReportFeedbackInput;
  SubmitReportFeedbackPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['SubmitReportFeedbackPayload']>;
  SubmitReportFeedbackSuccess: ResolverTypeWrapper<Omit<GqlSubmitReportFeedbackSuccess, 'feedback'> & { feedback: GqlResolversTypes['ReportFeedback'] }>;
  SysAdminChainDepthBucket: ResolverTypeWrapper<GqlSysAdminChainDepthBucket>;
  SysAdminCohortRetentionPoint: ResolverTypeWrapper<GqlSysAdminCohortRetentionPoint>;
  SysAdminCommunityAlerts: ResolverTypeWrapper<GqlSysAdminCommunityAlerts>;
  SysAdminCommunityDetailInput: GqlSysAdminCommunityDetailInput;
  SysAdminCommunityDetailPayload: ResolverTypeWrapper<GqlSysAdminCommunityDetailPayload>;
  SysAdminCommunityOverview: ResolverTypeWrapper<GqlSysAdminCommunityOverview>;
  SysAdminCommunitySummaryCard: ResolverTypeWrapper<GqlSysAdminCommunitySummaryCard>;
  SysAdminDashboardInput: GqlSysAdminDashboardInput;
  SysAdminDashboardPayload: ResolverTypeWrapper<GqlSysAdminDashboardPayload>;
  SysAdminLatestCohort: ResolverTypeWrapper<GqlSysAdminLatestCohort>;
  SysAdminMemberList: ResolverTypeWrapper<GqlSysAdminMemberList>;
  SysAdminMemberRow: ResolverTypeWrapper<GqlSysAdminMemberRow>;
  SysAdminMonthlyActivityPoint: ResolverTypeWrapper<GqlSysAdminMonthlyActivityPoint>;
  SysAdminPlatformSummary: ResolverTypeWrapper<GqlSysAdminPlatformSummary>;
  SysAdminRetentionTrendPoint: ResolverTypeWrapper<GqlSysAdminRetentionTrendPoint>;
  SysAdminSegmentCounts: ResolverTypeWrapper<GqlSysAdminSegmentCounts>;
  SysAdminSegmentThresholdsInput: GqlSysAdminSegmentThresholdsInput;
  SysAdminSortOrder: GqlSysAdminSortOrder;
  SysAdminStageBucket: ResolverTypeWrapper<GqlSysAdminStageBucket>;
  SysAdminStageDistribution: ResolverTypeWrapper<GqlSysAdminStageDistribution>;
  SysAdminTenureDistribution: ResolverTypeWrapper<GqlSysAdminTenureDistribution>;
  SysAdminTenureHistogramBucket: ResolverTypeWrapper<GqlSysAdminTenureHistogramBucket>;
  SysAdminUserListFilter: GqlSysAdminUserListFilter;
  SysAdminUserListSort: GqlSysAdminUserListSort;
  SysAdminUserSortField: GqlSysAdminUserSortField;
  SysAdminWeeklyRetention: ResolverTypeWrapper<GqlSysAdminWeeklyRetention>;
  SysAdminWindowActivity: ResolverTypeWrapper<GqlSysAdminWindowActivity>;
  SysRole: GqlSysRole;
  Ticket: ResolverTypeWrapper<Ticket>;
  TicketClaimInput: GqlTicketClaimInput;
  TicketClaimLink: ResolverTypeWrapper<TicketClaimLink>;
  TicketClaimLinkEdge: ResolverTypeWrapper<Omit<GqlTicketClaimLinkEdge, 'node'> & { node?: Maybe<GqlResolversTypes['TicketClaimLink']> }>;
  TicketClaimLinkFilterInput: GqlTicketClaimLinkFilterInput;
  TicketClaimLinkSortInput: GqlTicketClaimLinkSortInput;
  TicketClaimLinksConnection: ResolverTypeWrapper<Omit<GqlTicketClaimLinksConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TicketClaimLinkEdge']>>> }>;
  TicketClaimPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketClaimPayload']>;
  TicketClaimSuccess: ResolverTypeWrapper<Omit<GqlTicketClaimSuccess, 'tickets'> & { tickets: Array<GqlResolversTypes['Ticket']> }>;
  TicketEdge: ResolverTypeWrapper<Omit<GqlTicketEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Ticket']> }>;
  TicketFilterInput: GqlTicketFilterInput;
  TicketIssueInput: GqlTicketIssueInput;
  TicketIssuePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketIssuePayload']>;
  TicketIssueSuccess: ResolverTypeWrapper<Omit<GqlTicketIssueSuccess, 'issue'> & { issue: GqlResolversTypes['TicketIssuer'] }>;
  TicketIssuer: ResolverTypeWrapper<TicketIssuer>;
  TicketIssuerEdge: ResolverTypeWrapper<Omit<GqlTicketIssuerEdge, 'node'> & { node?: Maybe<GqlResolversTypes['TicketIssuer']> }>;
  TicketIssuerFilterInput: GqlTicketIssuerFilterInput;
  TicketIssuerSortInput: GqlTicketIssuerSortInput;
  TicketIssuersConnection: ResolverTypeWrapper<Omit<GqlTicketIssuersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TicketIssuerEdge']>>> }>;
  TicketPurchaseInput: GqlTicketPurchaseInput;
  TicketPurchasePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketPurchasePayload']>;
  TicketPurchaseSuccess: ResolverTypeWrapper<Omit<GqlTicketPurchaseSuccess, 'ticket'> & { ticket: GqlResolversTypes['Ticket'] }>;
  TicketRefundInput: GqlTicketRefundInput;
  TicketRefundPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketRefundPayload']>;
  TicketRefundSuccess: ResolverTypeWrapper<Omit<GqlTicketRefundSuccess, 'ticket'> & { ticket: GqlResolversTypes['Ticket'] }>;
  TicketSortInput: GqlTicketSortInput;
  TicketStatus: GqlTicketStatus;
  TicketStatusHistoriesConnection: ResolverTypeWrapper<Omit<GqlTicketStatusHistoriesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TicketStatusHistoryEdge']>>> }>;
  TicketStatusHistory: ResolverTypeWrapper<TicketStatusHistory>;
  TicketStatusHistoryEdge: ResolverTypeWrapper<Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['TicketStatusHistory']> }>;
  TicketStatusHistoryFilterInput: GqlTicketStatusHistoryFilterInput;
  TicketStatusHistorySortInput: GqlTicketStatusHistorySortInput;
  TicketStatusReason: GqlTicketStatusReason;
  TicketUsePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketUsePayload']>;
  TicketUseSuccess: ResolverTypeWrapper<Omit<GqlTicketUseSuccess, 'ticket'> & { ticket: GqlResolversTypes['Ticket'] }>;
  TicketsConnection: ResolverTypeWrapper<Omit<GqlTicketsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TicketEdge']>>> }>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionChain: ResolverTypeWrapper<Omit<GqlTransactionChain, 'steps'> & { steps: Array<GqlResolversTypes['TransactionChainStep']> }>;
  TransactionChainCommunity: ResolverTypeWrapper<GqlTransactionChainCommunity>;
  TransactionChainParticipant: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['TransactionChainParticipant']>;
  TransactionChainStep: ResolverTypeWrapper<Omit<GqlTransactionChainStep, 'from' | 'to'> & { from?: Maybe<GqlResolversTypes['TransactionChainParticipant']>, to?: Maybe<GqlResolversTypes['TransactionChainParticipant']> }>;
  TransactionChainUser: ResolverTypeWrapper<GqlTransactionChainUser>;
  TransactionDonateSelfPointInput: GqlTransactionDonateSelfPointInput;
  TransactionDonateSelfPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionDonateSelfPointPayload']>;
  TransactionDonateSelfPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionEdge: ResolverTypeWrapper<Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Transaction']> }>;
  TransactionFilterInput: GqlTransactionFilterInput;
  TransactionGrantCommunityPointInput: GqlTransactionGrantCommunityPointInput;
  TransactionGrantCommunityPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionGrantCommunityPointPayload']>;
  TransactionGrantCommunityPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionIssueCommunityPointInput: GqlTransactionIssueCommunityPointInput;
  TransactionIssueCommunityPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionIssueCommunityPointPayload']>;
  TransactionIssueCommunityPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionReason: GqlTransactionReason;
  TransactionSortInput: GqlTransactionSortInput;
  TransactionUpdateMetadataInput: GqlTransactionUpdateMetadataInput;
  TransactionUpdateMetadataPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionUpdateMetadataPayload']>;
  TransactionUpdateMetadataSuccess: ResolverTypeWrapper<Omit<GqlTransactionUpdateMetadataSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionVerificationResult: ResolverTypeWrapper<GqlTransactionVerificationResult>;
  TransactionsConnection: ResolverTypeWrapper<Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>> }>;
  UpdateReportTemplateInput: GqlUpdateReportTemplateInput;
  UpdateReportTemplatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UpdateReportTemplatePayload']>;
  UpdateReportTemplateSuccess: ResolverTypeWrapper<Omit<GqlUpdateReportTemplateSuccess, 'reportTemplate'> & { reportTemplate: GqlResolversTypes['ReportTemplate'] }>;
  UpdateSignupBonusConfigInput: GqlUpdateSignupBonusConfigInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']['output']>;
  User: ResolverTypeWrapper<User>;
  UserDeletePayload: ResolverTypeWrapper<GqlUserDeletePayload>;
  UserEdge: ResolverTypeWrapper<Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversTypes['User']> }>;
  UserFilterInput: GqlUserFilterInput;
  UserSignUpInput: GqlUserSignUpInput;
  UserSortInput: GqlUserSortInput;
  UserUpdateProfileInput: GqlUserUpdateProfileInput;
  UserUpdateProfilePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateProfilePayload']>;
  UserUpdateProfileSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UsersConnection: ResolverTypeWrapper<Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>> }>;
  UtilitiesConnection: ResolverTypeWrapper<Omit<GqlUtilitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UtilityEdge']>>> }>;
  Utility: ResolverTypeWrapper<Utility>;
  UtilityCreateInput: GqlUtilityCreateInput;
  UtilityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityCreatePayload']>;
  UtilityCreateSuccess: ResolverTypeWrapper<Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: GqlResolversTypes['Utility'] }>;
  UtilityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityDeletePayload']>;
  UtilityDeleteSuccess: ResolverTypeWrapper<GqlUtilityDeleteSuccess>;
  UtilityEdge: ResolverTypeWrapper<Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Utility']> }>;
  UtilityFilterInput: GqlUtilityFilterInput;
  UtilitySetPublishStatusInput: GqlUtilitySetPublishStatusInput;
  UtilitySetPublishStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilitySetPublishStatusPayload']>;
  UtilitySetPublishStatusSuccess: ResolverTypeWrapper<Omit<GqlUtilitySetPublishStatusSuccess, 'utility'> & { utility: GqlResolversTypes['Utility'] }>;
  UtilitySortInput: GqlUtilitySortInput;
  UtilityUpdateInfoInput: GqlUtilityUpdateInfoInput;
  UtilityUpdateInfoPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityUpdateInfoPayload']>;
  UtilityUpdateInfoSuccess: ResolverTypeWrapper<Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: GqlResolversTypes['Utility'] }>;
  ValueType: GqlValueType;
  VcIssuanceRequest: ResolverTypeWrapper<Omit<GqlVcIssuanceRequest, 'evaluation' | 'user'> & { evaluation?: Maybe<GqlResolversTypes['Evaluation']>, user?: Maybe<GqlResolversTypes['User']> }>;
  VcIssuanceRequestEdge: ResolverTypeWrapper<Omit<GqlVcIssuanceRequestEdge, 'node'> & { node?: Maybe<GqlResolversTypes['VcIssuanceRequest']> }>;
  VcIssuanceRequestFilterInput: GqlVcIssuanceRequestFilterInput;
  VcIssuanceRequestSortInput: GqlVcIssuanceRequestSortInput;
  VcIssuanceRequestsConnection: ResolverTypeWrapper<Omit<GqlVcIssuanceRequestsConnection, 'edges'> & { edges: Array<GqlResolversTypes['VcIssuanceRequestEdge']> }>;
  VcIssuanceStatus: GqlVcIssuanceStatus;
  VerificationStatus: GqlVerificationStatus;
  VoteBallot: ResolverTypeWrapper<GqlVoteBallot>;
  VoteCastInput: GqlVoteCastInput;
  VoteCastPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['VoteCastPayload']>;
  VoteCastSuccess: ResolverTypeWrapper<GqlVoteCastSuccess>;
  VoteGate: ResolverTypeWrapper<Omit<GqlVoteGate, 'nftToken'> & { nftToken?: Maybe<GqlResolversTypes['NftToken']> }>;
  VoteGateInput: GqlVoteGateInput;
  VoteGateType: GqlVoteGateType;
  VoteOption: ResolverTypeWrapper<GqlVoteOption>;
  VoteOptionInput: GqlVoteOptionInput;
  VotePowerPolicy: ResolverTypeWrapper<Omit<GqlVotePowerPolicy, 'nftToken'> & { nftToken?: Maybe<GqlResolversTypes['NftToken']> }>;
  VotePowerPolicyInput: GqlVotePowerPolicyInput;
  VotePowerPolicyType: GqlVotePowerPolicyType;
  VoteTopic: ResolverTypeWrapper<Omit<GqlVoteTopic, 'community' | 'gate' | 'powerPolicy'> & { community: GqlResolversTypes['Community'], gate: GqlResolversTypes['VoteGate'], powerPolicy: GqlResolversTypes['VotePowerPolicy'] }>;
  VoteTopicCreateInput: GqlVoteTopicCreateInput;
  VoteTopicCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['VoteTopicCreatePayload']>;
  VoteTopicCreateSuccess: ResolverTypeWrapper<Omit<GqlVoteTopicCreateSuccess, 'voteTopic'> & { voteTopic: GqlResolversTypes['VoteTopic'] }>;
  VoteTopicDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['VoteTopicDeletePayload']>;
  VoteTopicDeleteSuccess: ResolverTypeWrapper<GqlVoteTopicDeleteSuccess>;
  VoteTopicEdge: ResolverTypeWrapper<Omit<GqlVoteTopicEdge, 'node'> & { node: GqlResolversTypes['VoteTopic'] }>;
  VoteTopicPhase: GqlVoteTopicPhase;
  VoteTopicUpdateInput: GqlVoteTopicUpdateInput;
  VoteTopicUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['VoteTopicUpdatePayload']>;
  VoteTopicUpdateSuccess: ResolverTypeWrapper<Omit<GqlVoteTopicUpdateSuccess, 'voteTopic'> & { voteTopic: GqlResolversTypes['VoteTopic'] }>;
  VoteTopicsConnection: ResolverTypeWrapper<Omit<GqlVoteTopicsConnection, 'edges' | 'nodes'> & { edges: Array<GqlResolversTypes['VoteTopicEdge']>, nodes: Array<GqlResolversTypes['VoteTopic']> }>;
  Wallet: ResolverTypeWrapper<Wallet>;
  WalletEdge: ResolverTypeWrapper<Omit<GqlWalletEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Wallet']> }>;
  WalletFilterInput: GqlWalletFilterInput;
  WalletSortInput: GqlWalletSortInput;
  WalletType: GqlWalletType;
  WalletsConnection: ResolverTypeWrapper<Omit<GqlWalletsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['WalletEdge']>>> }>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlResolversParentTypes = ResolversObject<{
  AccumulatedPointView: AccumulatedPointView;
  ApproveReportPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApproveReportPayload'];
  ApproveReportSuccess: Omit<GqlApproveReportSuccess, 'report'> & { report: GqlResolversParentTypes['Report'] };
  Article: Article;
  ArticleCreateInput: GqlArticleCreateInput;
  ArticleCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ArticleCreatePayload'];
  ArticleCreateSuccess: Omit<GqlArticleCreateSuccess, 'article'> & { article: GqlResolversParentTypes['Article'] };
  ArticleDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ArticleDeletePayload'];
  ArticleDeleteSuccess: GqlArticleDeleteSuccess;
  ArticleEdge: Omit<GqlArticleEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Article']> };
  ArticleFilterInput: GqlArticleFilterInput;
  ArticleSortInput: GqlArticleSortInput;
  ArticleUpdateContentInput: GqlArticleUpdateContentInput;
  ArticleUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ArticleUpdateContentPayload'];
  ArticleUpdateContentSuccess: Omit<GqlArticleUpdateContentSuccess, 'article'> & { article: GqlResolversParentTypes['Article'] };
  ArticlesConnection: Omit<GqlArticlesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ArticleEdge']>>> };
  AuthZDirectiveCompositeRulesInput: GqlAuthZDirectiveCompositeRulesInput;
  AuthZDirectiveDeepCompositeRulesInput: GqlAuthZDirectiveDeepCompositeRulesInput;
  BigInt: Scalars['BigInt']['output'];
  Boolean: Scalars['Boolean']['output'];
  CheckCommunityPermissionInput: GqlCheckCommunityPermissionInput;
  CheckIsSelfPermissionInput: GqlCheckIsSelfPermissionInput;
  CheckOpportunityPermissionInput: GqlCheckOpportunityPermissionInput;
  CitiesConnection: Omit<GqlCitiesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['CityEdge']> };
  CitiesInput: GqlCitiesInput;
  CitiesSortInput: GqlCitiesSortInput;
  City: City;
  CityEdge: Omit<GqlCityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['City']> };
  CommonDocumentOverrides: GqlCommonDocumentOverrides;
  CommonDocumentOverridesInput: GqlCommonDocumentOverridesInput;
  CommunitiesConnection: Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<GqlResolversParentTypes['CommunityEdge']>> };
  Community: Community;
  CommunityConfig: GqlCommunityConfig;
  CommunityConfigInput: GqlCommunityConfigInput;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityCreatePayload'];
  CommunityCreateSuccess: Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CommunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityDeletePayload'];
  CommunityDeleteSuccess: GqlCommunityDeleteSuccess;
  CommunityDocument: GqlCommunityDocument;
  CommunityDocumentInput: GqlCommunityDocumentInput;
  CommunityEdge: Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Community']> };
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunityFirebaseConfig: GqlCommunityFirebaseConfig;
  CommunityLineConfig: GqlCommunityLineConfig;
  CommunityLineConfigInput: GqlCommunityLineConfigInput;
  CommunityLineRichMenuConfig: GqlCommunityLineRichMenuConfig;
  CommunityLineRichMenuConfigInput: GqlCommunityLineRichMenuConfigInput;
  CommunityPortalConfig: GqlCommunityPortalConfig;
  CommunityPortalConfigInput: GqlCommunityPortalConfigInput;
  CommunitySignupBonusConfig: GqlCommunitySignupBonusConfig;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityUpdateProfilePayload'];
  CommunityUpdateProfileSuccess: Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CurrentPointView: CurrentPointView;
  CurrentUserPayload: Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  DateTimeRangeFilter: GqlDateTimeRangeFilter;
  Datetime: Scalars['Datetime']['output'];
  Decimal: Scalars['Decimal']['output'];
  DidIssuanceRequest: GqlDidIssuanceRequest;
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Error: GqlError;
  Evaluation: Omit<GqlEvaluation, 'evaluator' | 'histories' | 'participation' | 'vcIssuanceRequest'> & { evaluator?: Maybe<GqlResolversParentTypes['User']>, histories?: Maybe<Array<GqlResolversParentTypes['EvaluationHistory']>>, participation?: Maybe<GqlResolversParentTypes['Participation']>, vcIssuanceRequest?: Maybe<GqlResolversParentTypes['VcIssuanceRequest']> };
  EvaluationBulkCreateInput: GqlEvaluationBulkCreateInput;
  EvaluationBulkCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EvaluationBulkCreatePayload'];
  EvaluationBulkCreateSuccess: Omit<GqlEvaluationBulkCreateSuccess, 'evaluations'> & { evaluations: Array<GqlResolversParentTypes['Evaluation']> };
  EvaluationCreateInput: GqlEvaluationCreateInput;
  EvaluationEdge: Omit<GqlEvaluationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Evaluation']> };
  EvaluationFilterInput: GqlEvaluationFilterInput;
  EvaluationHistoriesConnection: Omit<GqlEvaluationHistoriesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['EvaluationHistoryEdge']> };
  EvaluationHistory: Omit<GqlEvaluationHistory, 'createdByUser' | 'evaluation'> & { createdByUser?: Maybe<GqlResolversParentTypes['User']>, evaluation?: Maybe<GqlResolversParentTypes['Evaluation']> };
  EvaluationHistoryEdge: Omit<GqlEvaluationHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['EvaluationHistory']> };
  EvaluationHistoryFilterInput: GqlEvaluationHistoryFilterInput;
  EvaluationHistorySortInput: GqlEvaluationHistorySortInput;
  EvaluationItem: GqlEvaluationItem;
  EvaluationSortInput: GqlEvaluationSortInput;
  EvaluationsConnection: Omit<GqlEvaluationsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['EvaluationEdge']> };
  Float: Scalars['Float']['output'];
  GenerateReportInput: GqlGenerateReportInput;
  GenerateReportPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GenerateReportPayload'];
  GenerateReportSuccess: Omit<GqlGenerateReportSuccess, 'report'> & { report: GqlResolversParentTypes['Report'] };
  ID: Scalars['ID']['output'];
  Identity: Omit<GqlIdentity, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  IdentityCheckPhoneUserInput: GqlIdentityCheckPhoneUserInput;
  IdentityCheckPhoneUserPayload: Omit<GqlIdentityCheckPhoneUserPayload, 'membership' | 'user'> & { membership?: Maybe<GqlResolversParentTypes['Membership']>, user?: Maybe<GqlResolversParentTypes['User']> };
  ImageInput: GqlImageInput;
  IncentiveGrant: Omit<GqlIncentiveGrant, 'community' | 'transaction' | 'user'> & { community?: Maybe<GqlResolversParentTypes['Community']>, transaction?: Maybe<GqlResolversParentTypes['Transaction']>, user?: Maybe<GqlResolversParentTypes['User']> };
  IncentiveGrantEdge: Omit<GqlIncentiveGrantEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['IncentiveGrant']> };
  IncentiveGrantFilterInput: GqlIncentiveGrantFilterInput;
  IncentiveGrantRetryInput: GqlIncentiveGrantRetryInput;
  IncentiveGrantRetryPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IncentiveGrantRetryPayload'];
  IncentiveGrantRetrySuccess: Omit<GqlIncentiveGrantRetrySuccess, 'incentiveGrant' | 'transaction'> & { incentiveGrant: GqlResolversParentTypes['IncentiveGrant'], transaction?: Maybe<GqlResolversParentTypes['Transaction']> };
  IncentiveGrantSortInput: GqlIncentiveGrantSortInput;
  IncentiveGrantsConnection: Omit<GqlIncentiveGrantsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['IncentiveGrantEdge']>>> };
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  LinkPhoneAuthInput: GqlLinkPhoneAuthInput;
  LinkPhoneAuthPayload: Omit<GqlLinkPhoneAuthPayload, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  Membership: Membership;
  MembershipCursorInput: GqlMembershipCursorInput;
  MembershipEdge: Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Membership']> };
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipHistory: MembershipHistory;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipInvitePayload'];
  MembershipInviteSuccess: Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipRemoveInput: GqlMembershipRemoveInput;
  MembershipRemovePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipRemovePayload'];
  MembershipRemoveSuccess: GqlMembershipRemoveSuccess;
  MembershipSetInvitationStatusInput: GqlMembershipSetInvitationStatusInput;
  MembershipSetInvitationStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipSetInvitationStatusPayload'];
  MembershipSetInvitationStatusSuccess: Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipSetRoleInput: GqlMembershipSetRoleInput;
  MembershipSetRolePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipSetRolePayload'];
  MembershipSetRoleSuccess: Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipSortInput: GqlMembershipSortInput;
  MembershipWithdrawInput: GqlMembershipWithdrawInput;
  MembershipWithdrawPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipWithdrawPayload'];
  MembershipWithdrawSuccess: GqlMembershipWithdrawSuccess;
  MembershipsConnection: Omit<GqlMembershipsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['MembershipEdge']>>> };
  Mutation: {};
  MyVoteEligibility: GqlMyVoteEligibility;
  NestedPlaceConnectOrCreateInput: GqlNestedPlaceConnectOrCreateInput;
  NestedPlaceCreateInput: GqlNestedPlaceCreateInput;
  NestedPlacesBulkConnectOrCreateInput: GqlNestedPlacesBulkConnectOrCreateInput;
  NestedPlacesBulkUpdateInput: GqlNestedPlacesBulkUpdateInput;
  NftInstance: Omit<GqlNftInstance, 'community' | 'nftToken' | 'nftWallet'> & { community?: Maybe<GqlResolversParentTypes['Community']>, nftToken?: Maybe<GqlResolversParentTypes['NftToken']>, nftWallet?: Maybe<GqlResolversParentTypes['NftWallet']> };
  NftInstanceEdge: Omit<GqlNftInstanceEdge, 'node'> & { node: GqlResolversParentTypes['NftInstance'] };
  NftInstanceFilterInput: GqlNftInstanceFilterInput;
  NftInstanceSortInput: GqlNftInstanceSortInput;
  NftInstancesConnection: Omit<GqlNftInstancesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['NftInstanceEdge']> };
  NftToken: Omit<GqlNftToken, 'community'> & { community?: Maybe<GqlResolversParentTypes['Community']> };
  NftTokenEdge: Omit<GqlNftTokenEdge, 'node'> & { node: GqlResolversParentTypes['NftToken'] };
  NftTokenFilterInput: GqlNftTokenFilterInput;
  NftTokenSortInput: GqlNftTokenSortInput;
  NftTokensConnection: Omit<GqlNftTokensConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['NftTokenEdge']> };
  NftWallet: Omit<GqlNftWallet, 'user'> & { user: GqlResolversParentTypes['User'] };
  OpportunitiesConnection: Omit<GqlOpportunitiesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['OpportunityEdge']> };
  Opportunity: Opportunity;
  OpportunityCreateInput: GqlOpportunityCreateInput;
  OpportunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityCreatePayload'];
  OpportunityCreateSuccess: Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityDeletePayload'];
  OpportunityDeleteSuccess: GqlOpportunityDeleteSuccess;
  OpportunityEdge: Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Opportunity']> };
  OpportunityFilterInput: GqlOpportunityFilterInput;
  OpportunitySetPublishStatusInput: GqlOpportunitySetPublishStatusInput;
  OpportunitySetPublishStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySetPublishStatusPayload'];
  OpportunitySetPublishStatusSuccess: Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunitySlot: OpportunitySlot;
  OpportunitySlotCreateInput: GqlOpportunitySlotCreateInput;
  OpportunitySlotCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySlotCreatePayload'];
  OpportunitySlotCreateSuccess: Omit<GqlOpportunitySlotCreateSuccess, 'slot'> & { slot: GqlResolversParentTypes['OpportunitySlot'] };
  OpportunitySlotEdge: Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['OpportunitySlot']> };
  OpportunitySlotFilterInput: GqlOpportunitySlotFilterInput;
  OpportunitySlotSetHostingStatusInput: GqlOpportunitySlotSetHostingStatusInput;
  OpportunitySlotSetHostingStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySlotSetHostingStatusPayload'];
  OpportunitySlotSetHostingStatusSuccess: Omit<GqlOpportunitySlotSetHostingStatusSuccess, 'slot'> & { slot: GqlResolversParentTypes['OpportunitySlot'] };
  OpportunitySlotSortInput: GqlOpportunitySlotSortInput;
  OpportunitySlotUpdateInput: GqlOpportunitySlotUpdateInput;
  OpportunitySlotsBulkUpdateInput: GqlOpportunitySlotsBulkUpdateInput;
  OpportunitySlotsBulkUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySlotsBulkUpdatePayload'];
  OpportunitySlotsBulkUpdateSuccess: Omit<GqlOpportunitySlotsBulkUpdateSuccess, 'slots'> & { slots: Array<GqlResolversParentTypes['OpportunitySlot']> };
  OpportunitySlotsConnection: Omit<GqlOpportunitySlotsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OpportunitySlotEdge']>>> };
  OpportunitySortInput: GqlOpportunitySortInput;
  OpportunityUpdateContentInput: GqlOpportunityUpdateContentInput;
  OpportunityUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityUpdateContentPayload'];
  OpportunityUpdateContentSuccess: Omit<GqlOpportunityUpdateContentSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Participation: Participation;
  ParticipationBulkCreateInput: GqlParticipationBulkCreateInput;
  ParticipationBulkCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationBulkCreatePayload'];
  ParticipationBulkCreateSuccess: Omit<GqlParticipationBulkCreateSuccess, 'participations'> & { participations: Array<GqlResolversParentTypes['Participation']> };
  ParticipationCreatePersonalRecordInput: GqlParticipationCreatePersonalRecordInput;
  ParticipationCreatePersonalRecordPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationCreatePersonalRecordPayload'];
  ParticipationCreatePersonalRecordSuccess: Omit<GqlParticipationCreatePersonalRecordSuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationDeletePayload'];
  ParticipationDeleteSuccess: GqlParticipationDeleteSuccess;
  ParticipationEdge: Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Participation']> };
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatusHistoriesConnection: Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationStatusHistoryEdge']> };
  ParticipationStatusHistory: ParticipationStatusHistory;
  ParticipationStatusHistoryEdge: Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['ParticipationStatusHistory']> };
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationsConnection: Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationEdge']> };
  Place: Place;
  PlaceCreateInput: GqlPlaceCreateInput;
  PlaceCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PlaceCreatePayload'];
  PlaceCreateSuccess: Omit<GqlPlaceCreateSuccess, 'place'> & { place: GqlResolversParentTypes['Place'] };
  PlaceDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PlaceDeletePayload'];
  PlaceDeleteSuccess: GqlPlaceDeleteSuccess;
  PlaceEdge: Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Place']> };
  PlaceFilterInput: GqlPlaceFilterInput;
  PlaceSortInput: GqlPlaceSortInput;
  PlaceUpdateInput: GqlPlaceUpdateInput;
  PlaceUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PlaceUpdatePayload'];
  PlaceUpdateSuccess: Omit<GqlPlaceUpdateSuccess, 'place'> & { place: GqlResolversParentTypes['Place'] };
  PlacesConnection: Omit<GqlPlacesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['PlaceEdge']>>> };
  Portfolio: Omit<GqlPortfolio, 'participants' | 'place'> & { participants?: Maybe<Array<GqlResolversParentTypes['User']>>, place?: Maybe<GqlResolversParentTypes['Place']> };
  PortfolioEdge: Omit<GqlPortfolioEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Portfolio']> };
  PortfolioFilterInput: GqlPortfolioFilterInput;
  PortfolioSortInput: GqlPortfolioSortInput;
  PortfoliosConnection: Omit<GqlPortfoliosConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['PortfolioEdge']> };
  PublishReportPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PublishReportPayload'];
  PublishReportSuccess: Omit<GqlPublishReportSuccess, 'report'> & { report: GqlResolversParentTypes['Report'] };
  Query: {};
  RejectReportPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['RejectReportPayload'];
  RejectReportSuccess: Omit<GqlRejectReportSuccess, 'report'> & { report: GqlResolversParentTypes['Report'] };
  Report: Omit<GqlReport, 'community' | 'feedbacks' | 'generatedByUser' | 'myFeedback' | 'parentRun' | 'publishedByUser' | 'regenerations' | 'targetUser' | 'template'> & { community: GqlResolversParentTypes['Community'], feedbacks: GqlResolversParentTypes['ReportFeedbacksConnection'], generatedByUser?: Maybe<GqlResolversParentTypes['User']>, myFeedback?: Maybe<GqlResolversParentTypes['ReportFeedback']>, parentRun?: Maybe<GqlResolversParentTypes['Report']>, publishedByUser?: Maybe<GqlResolversParentTypes['User']>, regenerations: Array<GqlResolversParentTypes['Report']>, targetUser?: Maybe<GqlResolversParentTypes['User']>, template?: Maybe<GqlResolversParentTypes['ReportTemplate']> };
  ReportEdge: Omit<GqlReportEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Report']> };
  ReportFeedback: Omit<GqlReportFeedback, 'user'> & { user: GqlResolversParentTypes['User'] };
  ReportFeedbackEdge: Omit<GqlReportFeedbackEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['ReportFeedback']> };
  ReportFeedbacksConnection: Omit<GqlReportFeedbacksConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ReportFeedbackEdge']>>> };
  ReportTemplate: Omit<GqlReportTemplate, 'community' | 'updatedByUser'> & { community?: Maybe<GqlResolversParentTypes['Community']>, updatedByUser?: Maybe<GqlResolversParentTypes['User']> };
  ReportTemplateStats: GqlReportTemplateStats;
  ReportsConnection: Omit<GqlReportsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ReportEdge']>>> };
  Reservation: Omit<GqlReservation, 'createdByUser' | 'histories' | 'opportunitySlot' | 'participations'> & { createdByUser?: Maybe<GqlResolversParentTypes['User']>, histories?: Maybe<Array<GqlResolversParentTypes['ReservationHistory']>>, opportunitySlot?: Maybe<GqlResolversParentTypes['OpportunitySlot']>, participations?: Maybe<Array<GqlResolversParentTypes['Participation']>> };
  ReservationCancelInput: GqlReservationCancelInput;
  ReservationCreateInput: GqlReservationCreateInput;
  ReservationCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ReservationCreatePayload'];
  ReservationCreateSuccess: Omit<GqlReservationCreateSuccess, 'reservation'> & { reservation: GqlResolversParentTypes['Reservation'] };
  ReservationEdge: Omit<GqlReservationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Reservation']> };
  ReservationFilterInput: GqlReservationFilterInput;
  ReservationHistoriesConnection: Omit<GqlReservationHistoriesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ReservationHistoryEdge']> };
  ReservationHistory: Omit<GqlReservationHistory, 'createdByUser' | 'reservation'> & { createdByUser?: Maybe<GqlResolversParentTypes['User']>, reservation: GqlResolversParentTypes['Reservation'] };
  ReservationHistoryEdge: Omit<GqlReservationHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['ReservationHistory']> };
  ReservationHistoryFilterInput: GqlReservationHistoryFilterInput;
  ReservationHistorySortInput: GqlReservationHistorySortInput;
  ReservationRejectInput: GqlReservationRejectInput;
  ReservationSetStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ReservationSetStatusPayload'];
  ReservationSetStatusSuccess: Omit<GqlReservationSetStatusSuccess, 'reservation'> & { reservation: GqlResolversParentTypes['Reservation'] };
  ReservationSortInput: GqlReservationSortInput;
  ReservationsConnection: Omit<GqlReservationsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ReservationEdge']> };
  State: State;
  StateEdge: Omit<GqlStateEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['State']> };
  StatesConnection: Omit<GqlStatesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['StateEdge']> };
  StatesInput: GqlStatesInput;
  StorePhoneAuthTokenInput: GqlStorePhoneAuthTokenInput;
  StorePhoneAuthTokenPayload: GqlStorePhoneAuthTokenPayload;
  String: Scalars['String']['output'];
  SubmitReportFeedbackInput: GqlSubmitReportFeedbackInput;
  SubmitReportFeedbackPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['SubmitReportFeedbackPayload'];
  SubmitReportFeedbackSuccess: Omit<GqlSubmitReportFeedbackSuccess, 'feedback'> & { feedback: GqlResolversParentTypes['ReportFeedback'] };
  SysAdminChainDepthBucket: GqlSysAdminChainDepthBucket;
  SysAdminCohortRetentionPoint: GqlSysAdminCohortRetentionPoint;
  SysAdminCommunityAlerts: GqlSysAdminCommunityAlerts;
  SysAdminCommunityDetailInput: GqlSysAdminCommunityDetailInput;
  SysAdminCommunityDetailPayload: GqlSysAdminCommunityDetailPayload;
  SysAdminCommunityOverview: GqlSysAdminCommunityOverview;
  SysAdminCommunitySummaryCard: GqlSysAdminCommunitySummaryCard;
  SysAdminDashboardInput: GqlSysAdminDashboardInput;
  SysAdminDashboardPayload: GqlSysAdminDashboardPayload;
  SysAdminLatestCohort: GqlSysAdminLatestCohort;
  SysAdminMemberList: GqlSysAdminMemberList;
  SysAdminMemberRow: GqlSysAdminMemberRow;
  SysAdminMonthlyActivityPoint: GqlSysAdminMonthlyActivityPoint;
  SysAdminPlatformSummary: GqlSysAdminPlatformSummary;
  SysAdminRetentionTrendPoint: GqlSysAdminRetentionTrendPoint;
  SysAdminSegmentCounts: GqlSysAdminSegmentCounts;
  SysAdminSegmentThresholdsInput: GqlSysAdminSegmentThresholdsInput;
  SysAdminStageBucket: GqlSysAdminStageBucket;
  SysAdminStageDistribution: GqlSysAdminStageDistribution;
  SysAdminTenureDistribution: GqlSysAdminTenureDistribution;
  SysAdminTenureHistogramBucket: GqlSysAdminTenureHistogramBucket;
  SysAdminUserListFilter: GqlSysAdminUserListFilter;
  SysAdminUserListSort: GqlSysAdminUserListSort;
  SysAdminWeeklyRetention: GqlSysAdminWeeklyRetention;
  SysAdminWindowActivity: GqlSysAdminWindowActivity;
  Ticket: Ticket;
  TicketClaimInput: GqlTicketClaimInput;
  TicketClaimLink: TicketClaimLink;
  TicketClaimLinkEdge: Omit<GqlTicketClaimLinkEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['TicketClaimLink']> };
  TicketClaimLinkFilterInput: GqlTicketClaimLinkFilterInput;
  TicketClaimLinkSortInput: GqlTicketClaimLinkSortInput;
  TicketClaimLinksConnection: Omit<GqlTicketClaimLinksConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TicketClaimLinkEdge']>>> };
  TicketClaimPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketClaimPayload'];
  TicketClaimSuccess: Omit<GqlTicketClaimSuccess, 'tickets'> & { tickets: Array<GqlResolversParentTypes['Ticket']> };
  TicketEdge: Omit<GqlTicketEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Ticket']> };
  TicketFilterInput: GqlTicketFilterInput;
  TicketIssueInput: GqlTicketIssueInput;
  TicketIssuePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketIssuePayload'];
  TicketIssueSuccess: Omit<GqlTicketIssueSuccess, 'issue'> & { issue: GqlResolversParentTypes['TicketIssuer'] };
  TicketIssuer: TicketIssuer;
  TicketIssuerEdge: Omit<GqlTicketIssuerEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['TicketIssuer']> };
  TicketIssuerFilterInput: GqlTicketIssuerFilterInput;
  TicketIssuerSortInput: GqlTicketIssuerSortInput;
  TicketIssuersConnection: Omit<GqlTicketIssuersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TicketIssuerEdge']>>> };
  TicketPurchaseInput: GqlTicketPurchaseInput;
  TicketPurchasePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketPurchasePayload'];
  TicketPurchaseSuccess: Omit<GqlTicketPurchaseSuccess, 'ticket'> & { ticket: GqlResolversParentTypes['Ticket'] };
  TicketRefundInput: GqlTicketRefundInput;
  TicketRefundPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketRefundPayload'];
  TicketRefundSuccess: Omit<GqlTicketRefundSuccess, 'ticket'> & { ticket: GqlResolversParentTypes['Ticket'] };
  TicketSortInput: GqlTicketSortInput;
  TicketStatusHistoriesConnection: Omit<GqlTicketStatusHistoriesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TicketStatusHistoryEdge']>>> };
  TicketStatusHistory: TicketStatusHistory;
  TicketStatusHistoryEdge: Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['TicketStatusHistory']> };
  TicketStatusHistoryFilterInput: GqlTicketStatusHistoryFilterInput;
  TicketStatusHistorySortInput: GqlTicketStatusHistorySortInput;
  TicketUsePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketUsePayload'];
  TicketUseSuccess: Omit<GqlTicketUseSuccess, 'ticket'> & { ticket: GqlResolversParentTypes['Ticket'] };
  TicketsConnection: Omit<GqlTicketsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TicketEdge']>>> };
  Transaction: Transaction;
  TransactionChain: Omit<GqlTransactionChain, 'steps'> & { steps: Array<GqlResolversParentTypes['TransactionChainStep']> };
  TransactionChainCommunity: GqlTransactionChainCommunity;
  TransactionChainParticipant: GqlResolversInterfaceTypes<GqlResolversParentTypes>['TransactionChainParticipant'];
  TransactionChainStep: Omit<GqlTransactionChainStep, 'from' | 'to'> & { from?: Maybe<GqlResolversParentTypes['TransactionChainParticipant']>, to?: Maybe<GqlResolversParentTypes['TransactionChainParticipant']> };
  TransactionChainUser: GqlTransactionChainUser;
  TransactionDonateSelfPointInput: GqlTransactionDonateSelfPointInput;
  TransactionDonateSelfPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionDonateSelfPointPayload'];
  TransactionDonateSelfPointSuccess: Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionEdge: Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Transaction']> };
  TransactionFilterInput: GqlTransactionFilterInput;
  TransactionGrantCommunityPointInput: GqlTransactionGrantCommunityPointInput;
  TransactionGrantCommunityPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionGrantCommunityPointPayload'];
  TransactionGrantCommunityPointSuccess: Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionIssueCommunityPointInput: GqlTransactionIssueCommunityPointInput;
  TransactionIssueCommunityPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionIssueCommunityPointPayload'];
  TransactionIssueCommunityPointSuccess: Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionSortInput: GqlTransactionSortInput;
  TransactionUpdateMetadataInput: GqlTransactionUpdateMetadataInput;
  TransactionUpdateMetadataPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionUpdateMetadataPayload'];
  TransactionUpdateMetadataSuccess: Omit<GqlTransactionUpdateMetadataSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionVerificationResult: GqlTransactionVerificationResult;
  TransactionsConnection: Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TransactionEdge']>>> };
  UpdateReportTemplateInput: GqlUpdateReportTemplateInput;
  UpdateReportTemplatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UpdateReportTemplatePayload'];
  UpdateReportTemplateSuccess: Omit<GqlUpdateReportTemplateSuccess, 'reportTemplate'> & { reportTemplate: GqlResolversParentTypes['ReportTemplate'] };
  UpdateSignupBonusConfigInput: GqlUpdateSignupBonusConfigInput;
  Upload: Scalars['Upload']['output'];
  User: User;
  UserDeletePayload: GqlUserDeletePayload;
  UserEdge: Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['User']> };
  UserFilterInput: GqlUserFilterInput;
  UserSignUpInput: GqlUserSignUpInput;
  UserSortInput: GqlUserSortInput;
  UserUpdateProfileInput: GqlUserUpdateProfileInput;
  UserUpdateProfilePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateProfilePayload'];
  UserUpdateProfileSuccess: Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  UsersConnection: Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['UserEdge']>>> };
  UtilitiesConnection: Omit<GqlUtilitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['UtilityEdge']>>> };
  Utility: Utility;
  UtilityCreateInput: GqlUtilityCreateInput;
  UtilityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityCreatePayload'];
  UtilityCreateSuccess: Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: GqlResolversParentTypes['Utility'] };
  UtilityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityDeletePayload'];
  UtilityDeleteSuccess: GqlUtilityDeleteSuccess;
  UtilityEdge: Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Utility']> };
  UtilityFilterInput: GqlUtilityFilterInput;
  UtilitySetPublishStatusInput: GqlUtilitySetPublishStatusInput;
  UtilitySetPublishStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilitySetPublishStatusPayload'];
  UtilitySetPublishStatusSuccess: Omit<GqlUtilitySetPublishStatusSuccess, 'utility'> & { utility: GqlResolversParentTypes['Utility'] };
  UtilitySortInput: GqlUtilitySortInput;
  UtilityUpdateInfoInput: GqlUtilityUpdateInfoInput;
  UtilityUpdateInfoPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityUpdateInfoPayload'];
  UtilityUpdateInfoSuccess: Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: GqlResolversParentTypes['Utility'] };
  VcIssuanceRequest: Omit<GqlVcIssuanceRequest, 'evaluation' | 'user'> & { evaluation?: Maybe<GqlResolversParentTypes['Evaluation']>, user?: Maybe<GqlResolversParentTypes['User']> };
  VcIssuanceRequestEdge: Omit<GqlVcIssuanceRequestEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['VcIssuanceRequest']> };
  VcIssuanceRequestFilterInput: GqlVcIssuanceRequestFilterInput;
  VcIssuanceRequestSortInput: GqlVcIssuanceRequestSortInput;
  VcIssuanceRequestsConnection: Omit<GqlVcIssuanceRequestsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['VcIssuanceRequestEdge']> };
  VoteBallot: GqlVoteBallot;
  VoteCastInput: GqlVoteCastInput;
  VoteCastPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['VoteCastPayload'];
  VoteCastSuccess: GqlVoteCastSuccess;
  VoteGate: Omit<GqlVoteGate, 'nftToken'> & { nftToken?: Maybe<GqlResolversParentTypes['NftToken']> };
  VoteGateInput: GqlVoteGateInput;
  VoteOption: GqlVoteOption;
  VoteOptionInput: GqlVoteOptionInput;
  VotePowerPolicy: Omit<GqlVotePowerPolicy, 'nftToken'> & { nftToken?: Maybe<GqlResolversParentTypes['NftToken']> };
  VotePowerPolicyInput: GqlVotePowerPolicyInput;
  VoteTopic: Omit<GqlVoteTopic, 'community' | 'gate' | 'powerPolicy'> & { community: GqlResolversParentTypes['Community'], gate: GqlResolversParentTypes['VoteGate'], powerPolicy: GqlResolversParentTypes['VotePowerPolicy'] };
  VoteTopicCreateInput: GqlVoteTopicCreateInput;
  VoteTopicCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['VoteTopicCreatePayload'];
  VoteTopicCreateSuccess: Omit<GqlVoteTopicCreateSuccess, 'voteTopic'> & { voteTopic: GqlResolversParentTypes['VoteTopic'] };
  VoteTopicDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['VoteTopicDeletePayload'];
  VoteTopicDeleteSuccess: GqlVoteTopicDeleteSuccess;
  VoteTopicEdge: Omit<GqlVoteTopicEdge, 'node'> & { node: GqlResolversParentTypes['VoteTopic'] };
  VoteTopicUpdateInput: GqlVoteTopicUpdateInput;
  VoteTopicUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['VoteTopicUpdatePayload'];
  VoteTopicUpdateSuccess: Omit<GqlVoteTopicUpdateSuccess, 'voteTopic'> & { voteTopic: GqlResolversParentTypes['VoteTopic'] };
  VoteTopicsConnection: Omit<GqlVoteTopicsConnection, 'edges' | 'nodes'> & { edges: Array<GqlResolversParentTypes['VoteTopicEdge']>, nodes: Array<GqlResolversParentTypes['VoteTopic']> };
  Wallet: Wallet;
  WalletEdge: Omit<GqlWalletEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Wallet']> };
  WalletFilterInput: GqlWalletFilterInput;
  WalletSortInput: GqlWalletSortInput;
  WalletsConnection: Omit<GqlWalletsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['WalletEdge']>>> };
}>;

export type GqlAuthzDirectiveArgs = {
  compositeRules?: Maybe<Array<Maybe<GqlAuthZDirectiveCompositeRulesInput>>>;
  deepCompositeRules?: Maybe<Array<Maybe<GqlAuthZDirectiveDeepCompositeRulesInput>>>;
  rules?: Maybe<Array<Maybe<GqlAuthZRules>>>;
};

export type GqlAuthzDirectiveResolver<Result, Parent, ContextType = any, Args = GqlAuthzDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type GqlRequireRoleDirectiveArgs = {
  role: GqlRole;
};

export type GqlRequireRoleDirectiveResolver<Result, Parent, ContextType = any, Args = GqlRequireRoleDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type GqlAccumulatedPointViewResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['AccumulatedPointView'] = GqlResolversParentTypes['AccumulatedPointView']> = ResolversObject<{
  accumulatedPoint?: Resolver<GqlResolversTypes['BigInt'], ParentType, ContextType>;
  walletId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApproveReportPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ApproveReportPayload'] = GqlResolversParentTypes['ApproveReportPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApproveReportSuccess', ParentType, ContextType>;
}>;

export type GqlApproveReportSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ApproveReportSuccess'] = GqlResolversParentTypes['ApproveReportSuccess']> = ResolversObject<{
  report?: Resolver<GqlResolversTypes['Report'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Article'] = GqlResolversParentTypes['Article']> = ResolversObject<{
  authors?: Resolver<Maybe<Array<GqlResolversTypes['User']>>, ParentType, ContextType>;
  body?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<GqlResolversTypes['ArticleCategory'], ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  introduction?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunities?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  publishStatus?: Resolver<GqlResolversTypes['PublishStatus'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  relatedUsers?: Resolver<Maybe<Array<GqlResolversTypes['User']>>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleCreatePayload'] = GqlResolversParentTypes['ArticleCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleCreateSuccess', ParentType, ContextType>;
}>;

export type GqlArticleCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleCreateSuccess'] = GqlResolversParentTypes['ArticleCreateSuccess']> = ResolversObject<{
  article?: Resolver<GqlResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleDeletePayload'] = GqlResolversParentTypes['ArticleDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlArticleDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleDeleteSuccess'] = GqlResolversParentTypes['ArticleDeleteSuccess']> = ResolversObject<{
  articleId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleEdge'] = GqlResolversParentTypes['ArticleEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleUpdateContentPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleUpdateContentPayload'] = GqlResolversParentTypes['ArticleUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlArticleUpdateContentSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleUpdateContentSuccess'] = GqlResolversParentTypes['ArticleUpdateContentSuccess']> = ResolversObject<{
  article?: Resolver<GqlResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticlesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticlesConnection'] = GqlResolversParentTypes['ArticlesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['ArticleEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlBigIntScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export type GqlCitiesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CitiesConnection'] = GqlResolversParentTypes['CitiesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['CityEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['City'] = GqlResolversParentTypes['City']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<GqlResolversTypes['State']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCityEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CityEdge'] = GqlResolversParentTypes['CityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['City']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommonDocumentOverridesResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommonDocumentOverrides'] = GqlResolversParentTypes['CommonDocumentOverrides']> = ResolversObject<{
  privacy?: Resolver<Maybe<GqlResolversTypes['CommunityDocument']>, ParentType, ContextType>;
  terms?: Resolver<Maybe<GqlResolversTypes['CommunityDocument']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunitiesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunitiesConnection'] = GqlResolversParentTypes['CommunitiesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<GqlResolversTypes['CommunityEdge']>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Community'] = GqlResolversParentTypes['Community']> = ResolversObject<{
  articles?: Resolver<Maybe<Array<GqlResolversTypes['Article']>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  config?: Resolver<Maybe<GqlResolversTypes['CommunityConfig']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  establishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  memberships?: Resolver<Maybe<Array<GqlResolversTypes['Membership']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  opportunities?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  places?: Resolver<Maybe<Array<GqlResolversTypes['Place']>>, ParentType, ContextType>;
  pointName?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utilities?: Resolver<Maybe<Array<GqlResolversTypes['Utility']>>, ParentType, ContextType>;
  wallets?: Resolver<Maybe<Array<GqlResolversTypes['Wallet']>>, ParentType, ContextType>;
  website?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityConfigResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityConfig'] = GqlResolversParentTypes['CommunityConfig']> = ResolversObject<{
  firebaseConfig?: Resolver<Maybe<GqlResolversTypes['CommunityFirebaseConfig']>, ParentType, ContextType>;
  lineConfig?: Resolver<Maybe<GqlResolversTypes['CommunityLineConfig']>, ParentType, ContextType>;
  signupBonusConfig?: Resolver<Maybe<GqlResolversTypes['CommunitySignupBonusConfig']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityCreatePayload'] = GqlResolversParentTypes['CommunityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CommunityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlCommunityCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityCreateSuccess'] = GqlResolversParentTypes['CommunityCreateSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityDeletePayload'] = GqlResolversParentTypes['CommunityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CommunityDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlCommunityDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityDeleteSuccess'] = GqlResolversParentTypes['CommunityDeleteSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityDocumentResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityDocument'] = GqlResolversParentTypes['CommunityDocument']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  order?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  path?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityEdge'] = GqlResolversParentTypes['CommunityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityFirebaseConfigResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityFirebaseConfig'] = GqlResolversParentTypes['CommunityFirebaseConfig']> = ResolversObject<{
  tenantId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityLineConfigResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityLineConfig'] = GqlResolversParentTypes['CommunityLineConfig']> = ResolversObject<{
  accessToken?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  channelId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  channelSecret?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  liffAppId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  liffBaseUrl?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  liffId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  richMenus?: Resolver<Maybe<Array<GqlResolversTypes['CommunityLineRichMenuConfig']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityLineRichMenuConfigResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityLineRichMenuConfig'] = GqlResolversParentTypes['CommunityLineRichMenuConfig']> = ResolversObject<{
  richMenuId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['LineRichMenuType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityPortalConfigResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityPortalConfig'] = GqlResolversParentTypes['CommunityPortalConfig']> = ResolversObject<{
  adminRootPath?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  commonDocumentOverrides?: Resolver<Maybe<GqlResolversTypes['CommonDocumentOverrides']>, ParentType, ContextType>;
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  documents?: Resolver<Maybe<Array<GqlResolversTypes['CommunityDocument']>>, ParentType, ContextType>;
  domain?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  enableFeatures?: Resolver<Array<GqlResolversTypes['String']>, ParentType, ContextType>;
  faviconPrefix?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  firebaseTenantId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  liffAppId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  liffBaseUrl?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  liffId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  logoPath?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  ogImagePath?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  regionKey?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  regionName?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  rootPath?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  shortDescription?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  squareLogoPath?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  tokenName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunitySignupBonusConfigResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunitySignupBonusConfig'] = GqlResolversParentTypes['CommunitySignupBonusConfig']> = ResolversObject<{
  bonusPoint?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  isEnabled?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  message?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityUpdateProfilePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityUpdateProfilePayload'] = GqlResolversParentTypes['CommunityUpdateProfilePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CommunityUpdateProfileSuccess', ParentType, ContextType>;
}>;

export type GqlCommunityUpdateProfileSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityUpdateProfileSuccess'] = GqlResolversParentTypes['CommunityUpdateProfileSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentPointViewResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CurrentPointView'] = GqlResolversParentTypes['CurrentPointView']> = ResolversObject<{
  currentPoint?: Resolver<GqlResolversTypes['BigInt'], ParentType, ContextType>;
  walletId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentUserPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CurrentUserPayload'] = GqlResolversParentTypes['CurrentUserPayload']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlDatetimeScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Datetime'], any> {
  name: 'Datetime';
}

export interface GqlDecimalScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Decimal'], any> {
  name: 'Decimal';
}

export type GqlDidIssuanceRequestResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['DidIssuanceRequest'] = GqlResolversParentTypes['DidIssuanceRequest']> = ResolversObject<{
  completedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  didValue?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  processedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  requestedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['DidIssuanceStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Edge'] = GqlResolversParentTypes['Edge']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleEdge' | 'CityEdge' | 'CommunityEdge' | 'EvaluationEdge' | 'EvaluationHistoryEdge' | 'IncentiveGrantEdge' | 'MembershipEdge' | 'NftInstanceEdge' | 'NftTokenEdge' | 'OpportunityEdge' | 'OpportunitySlotEdge' | 'ParticipationEdge' | 'ParticipationStatusHistoryEdge' | 'PlaceEdge' | 'PortfolioEdge' | 'ReportEdge' | 'ReportFeedbackEdge' | 'ReservationEdge' | 'ReservationHistoryEdge' | 'StateEdge' | 'TicketClaimLinkEdge' | 'TicketEdge' | 'TicketIssuerEdge' | 'TicketStatusHistoryEdge' | 'TransactionEdge' | 'UserEdge' | 'UtilityEdge' | 'VcIssuanceRequestEdge' | 'WalletEdge', ParentType, ContextType>;
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlErrorResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Error'] = GqlResolversParentTypes['Error']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ErrorCode'], ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Evaluation'] = GqlResolversParentTypes['Evaluation']> = ResolversObject<{
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  credentialUrl?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  evaluator?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  histories?: Resolver<Maybe<Array<GqlResolversTypes['EvaluationHistory']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  issuedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['EvaluationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  vcIssuanceRequest?: Resolver<Maybe<GqlResolversTypes['VcIssuanceRequest']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationBulkCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationBulkCreatePayload'] = GqlResolversParentTypes['EvaluationBulkCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'EvaluationBulkCreateSuccess', ParentType, ContextType>;
}>;

export type GqlEvaluationBulkCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationBulkCreateSuccess'] = GqlResolversParentTypes['EvaluationBulkCreateSuccess']> = ResolversObject<{
  evaluations?: Resolver<Array<GqlResolversTypes['Evaluation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationEdge'] = GqlResolversParentTypes['EvaluationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Evaluation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationHistoriesConnection'] = GqlResolversParentTypes['EvaluationHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['EvaluationHistoryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationHistory'] = GqlResolversParentTypes['EvaluationHistory']> = ResolversObject<{
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  evaluation?: Resolver<Maybe<GqlResolversTypes['Evaluation']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['EvaluationStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationHistoryEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationHistoryEdge'] = GqlResolversParentTypes['EvaluationHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['EvaluationHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEvaluationsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['EvaluationsConnection'] = GqlResolversParentTypes['EvaluationsConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['EvaluationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGenerateReportPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['GenerateReportPayload'] = GqlResolversParentTypes['GenerateReportPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'GenerateReportSuccess', ParentType, ContextType>;
}>;

export type GqlGenerateReportSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['GenerateReportSuccess'] = GqlResolversParentTypes['GenerateReportSuccess']> = ResolversObject<{
  report?: Resolver<GqlResolversTypes['Report'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIdentityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Identity'] = GqlResolversParentTypes['Identity']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  platform?: Resolver<Maybe<GqlResolversTypes['IdentityPlatform']>, ParentType, ContextType>;
  uid?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIdentityCheckPhoneUserPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['IdentityCheckPhoneUserPayload'] = GqlResolversParentTypes['IdentityCheckPhoneUserPayload']> = ResolversObject<{
  membership?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['PhoneUserStatus'], ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIncentiveGrantResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['IncentiveGrant'] = GqlResolversParentTypes['IncentiveGrant']> = ResolversObject<{
  attemptCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  failureCode?: Resolver<Maybe<GqlResolversTypes['IncentiveGrantFailureCode']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  lastAttemptedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  lastError?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  sourceId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['IncentiveGrantStatus'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['IncentiveGrantType'], ParentType, ContextType>;
  updatedAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIncentiveGrantEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['IncentiveGrantEdge'] = GqlResolversParentTypes['IncentiveGrantEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['IncentiveGrant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIncentiveGrantRetryPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['IncentiveGrantRetryPayload'] = GqlResolversParentTypes['IncentiveGrantRetryPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'IncentiveGrantRetrySuccess', ParentType, ContextType>;
}>;

export type GqlIncentiveGrantRetrySuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['IncentiveGrantRetrySuccess'] = GqlResolversParentTypes['IncentiveGrantRetrySuccess']> = ResolversObject<{
  incentiveGrant?: Resolver<GqlResolversTypes['IncentiveGrant'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIncentiveGrantsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['IncentiveGrantsConnection'] = GqlResolversParentTypes['IncentiveGrantsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['IncentiveGrantEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlJsonScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type GqlLinkPhoneAuthPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['LinkPhoneAuthPayload'] = GqlResolversParentTypes['LinkPhoneAuthPayload']> = ResolversObject<{
  success?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Membership'] = GqlResolversParentTypes['Membership']> = ResolversObject<{
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  headline?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  histories?: Resolver<Maybe<Array<GqlResolversTypes['MembershipHistory']>>, ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['MembershipStatusReason'], ParentType, ContextType>;
  role?: Resolver<GqlResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['MembershipStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipEdge'] = GqlResolversParentTypes['MembershipEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipHistory'] = GqlResolversParentTypes['MembershipHistory']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['MembershipStatusReason'], ParentType, ContextType>;
  role?: Resolver<GqlResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['MembershipStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipInvitePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipInvitePayload'] = GqlResolversParentTypes['MembershipInvitePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MembershipInviteSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipInviteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipInviteSuccess'] = GqlResolversParentTypes['MembershipInviteSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipRemovePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipRemovePayload'] = GqlResolversParentTypes['MembershipRemovePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MembershipRemoveSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipRemoveSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipRemoveSuccess'] = GqlResolversParentTypes['MembershipRemoveSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSetInvitationStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetInvitationStatusPayload'] = GqlResolversParentTypes['MembershipSetInvitationStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MembershipSetInvitationStatusSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSetInvitationStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetInvitationStatusSuccess'] = GqlResolversParentTypes['MembershipSetInvitationStatusSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSetRolePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetRolePayload'] = GqlResolversParentTypes['MembershipSetRolePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MembershipSetRoleSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSetRoleSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetRoleSuccess'] = GqlResolversParentTypes['MembershipSetRoleSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipWithdrawPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipWithdrawPayload'] = GqlResolversParentTypes['MembershipWithdrawPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MembershipWithdrawSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipWithdrawSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipWithdrawSuccess'] = GqlResolversParentTypes['MembershipWithdrawSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipsConnection'] = GqlResolversParentTypes['MembershipsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMutationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Mutation'] = GqlResolversParentTypes['Mutation']> = ResolversObject<{
  approveReport?: Resolver<Maybe<GqlResolversTypes['ApproveReportPayload']>, ParentType, ContextType, RequireFields<GqlMutationApproveReportArgs, 'id'>>;
  articleCreate?: Resolver<Maybe<GqlResolversTypes['ArticleCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleCreateArgs, 'input' | 'permission'>>;
  articleDelete?: Resolver<Maybe<GqlResolversTypes['ArticleDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleDeleteArgs, 'id' | 'permission'>>;
  articleUpdateContent?: Resolver<Maybe<GqlResolversTypes['ArticleUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleUpdateContentArgs, 'id' | 'input' | 'permission'>>;
  communityCreate?: Resolver<Maybe<GqlResolversTypes['CommunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityCreateArgs, 'input'>>;
  communityDelete?: Resolver<Maybe<GqlResolversTypes['CommunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityDeleteArgs, 'id' | 'permission'>>;
  communityUpdateProfile?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityUpdateProfileArgs, 'id' | 'input' | 'permission'>>;
  evaluationBulkCreate?: Resolver<Maybe<GqlResolversTypes['EvaluationBulkCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationEvaluationBulkCreateArgs, 'input' | 'permission'>>;
  generateReport?: Resolver<Maybe<GqlResolversTypes['GenerateReportPayload']>, ParentType, ContextType, RequireFields<GqlMutationGenerateReportArgs, 'input' | 'permission'>>;
  identityCheckPhoneUser?: Resolver<GqlResolversTypes['IdentityCheckPhoneUserPayload'], ParentType, ContextType, RequireFields<GqlMutationIdentityCheckPhoneUserArgs, 'input'>>;
  incentiveGrantRetry?: Resolver<Maybe<GqlResolversTypes['IncentiveGrantRetryPayload']>, ParentType, ContextType, RequireFields<GqlMutationIncentiveGrantRetryArgs, 'input' | 'permission'>>;
  linkPhoneAuth?: Resolver<Maybe<GqlResolversTypes['LinkPhoneAuthPayload']>, ParentType, ContextType, RequireFields<GqlMutationLinkPhoneAuthArgs, 'input' | 'permission'>>;
  membershipAcceptMyInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAcceptMyInvitationArgs, 'input' | 'permission'>>;
  membershipAssignManager?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignManagerArgs, 'input' | 'permission'>>;
  membershipAssignMember?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignMemberArgs, 'input' | 'permission'>>;
  membershipAssignOwner?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignOwnerArgs, 'input' | 'permission'>>;
  membershipCancelInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipCancelInvitationArgs, 'input' | 'permission'>>;
  membershipDenyMyInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipDenyMyInvitationArgs, 'input' | 'permission'>>;
  membershipInvite?: Resolver<Maybe<GqlResolversTypes['MembershipInvitePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipInviteArgs, 'input' | 'permission'>>;
  membershipRemove?: Resolver<Maybe<GqlResolversTypes['MembershipRemovePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipRemoveArgs, 'input' | 'permission'>>;
  membershipWithdraw?: Resolver<Maybe<GqlResolversTypes['MembershipWithdrawPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipWithdrawArgs, 'input' | 'permission'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunityCreate?: Resolver<Maybe<GqlResolversTypes['OpportunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityCreateArgs, 'input' | 'permission'>>;
  opportunityDelete?: Resolver<Maybe<GqlResolversTypes['OpportunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityDeleteArgs, 'id' | 'permission'>>;
  opportunitySetPublishStatus?: Resolver<Maybe<GqlResolversTypes['OpportunitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySetPublishStatusArgs, 'id' | 'input' | 'permission'>>;
  opportunitySlotCreate?: Resolver<Maybe<GqlResolversTypes['OpportunitySlotCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySlotCreateArgs, 'input' | 'opportunityId' | 'permission'>>;
  opportunitySlotSetHostingStatus?: Resolver<Maybe<GqlResolversTypes['OpportunitySlotSetHostingStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySlotSetHostingStatusArgs, 'id' | 'input' | 'permission'>>;
  opportunitySlotsBulkUpdate?: Resolver<Maybe<GqlResolversTypes['OpportunitySlotsBulkUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySlotsBulkUpdateArgs, 'input' | 'permission'>>;
  opportunityUpdateContent?: Resolver<Maybe<GqlResolversTypes['OpportunityUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityUpdateContentArgs, 'id' | 'input' | 'permission'>>;
  participationBulkCreate?: Resolver<Maybe<GqlResolversTypes['ParticipationBulkCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationBulkCreateArgs, 'input' | 'permission'>>;
  participationCreatePersonalRecord?: Resolver<Maybe<GqlResolversTypes['ParticipationCreatePersonalRecordPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationCreatePersonalRecordArgs, 'input'>>;
  participationDeletePersonalRecord?: Resolver<Maybe<GqlResolversTypes['ParticipationDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDeletePersonalRecordArgs, 'id' | 'permission'>>;
  placeCreate?: Resolver<Maybe<GqlResolversTypes['PlaceCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationPlaceCreateArgs, 'input' | 'permission'>>;
  placeDelete?: Resolver<Maybe<GqlResolversTypes['PlaceDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationPlaceDeleteArgs, 'id' | 'permission'>>;
  placeUpdate?: Resolver<Maybe<GqlResolversTypes['PlaceUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationPlaceUpdateArgs, 'id' | 'input' | 'permission'>>;
  publishReport?: Resolver<Maybe<GqlResolversTypes['PublishReportPayload']>, ParentType, ContextType, RequireFields<GqlMutationPublishReportArgs, 'finalContent' | 'id'>>;
  rejectReport?: Resolver<Maybe<GqlResolversTypes['RejectReportPayload']>, ParentType, ContextType, RequireFields<GqlMutationRejectReportArgs, 'id'>>;
  reservationAccept?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationAcceptArgs, 'id' | 'permission'>>;
  reservationCancel?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationCancelArgs, 'id' | 'input' | 'permission'>>;
  reservationCreate?: Resolver<Maybe<GqlResolversTypes['ReservationCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationCreateArgs, 'input'>>;
  reservationJoin?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationJoinArgs, 'id'>>;
  reservationReject?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationRejectArgs, 'id' | 'input' | 'permission'>>;
  storePhoneAuthToken?: Resolver<Maybe<GqlResolversTypes['StorePhoneAuthTokenPayload']>, ParentType, ContextType, RequireFields<GqlMutationStorePhoneAuthTokenArgs, 'input' | 'permission'>>;
  submitReportFeedback?: Resolver<Maybe<GqlResolversTypes['SubmitReportFeedbackPayload']>, ParentType, ContextType, RequireFields<GqlMutationSubmitReportFeedbackArgs, 'input' | 'permission'>>;
  ticketClaim?: Resolver<Maybe<GqlResolversTypes['TicketClaimPayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketClaimArgs, 'input'>>;
  ticketIssue?: Resolver<Maybe<GqlResolversTypes['TicketIssuePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketIssueArgs, 'input' | 'permission'>>;
  ticketPurchase?: Resolver<Maybe<GqlResolversTypes['TicketPurchasePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketPurchaseArgs, 'input' | 'permission'>>;
  ticketRefund?: Resolver<Maybe<GqlResolversTypes['TicketRefundPayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketRefundArgs, 'id' | 'input' | 'permission'>>;
  ticketUse?: Resolver<Maybe<GqlResolversTypes['TicketUsePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketUseArgs, 'id' | 'permission'>>;
  transactionDonateSelfPoint?: Resolver<Maybe<GqlResolversTypes['TransactionDonateSelfPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionDonateSelfPointArgs, 'input' | 'permission'>>;
  transactionGrantCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionGrantCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionGrantCommunityPointArgs, 'input' | 'permission'>>;
  transactionIssueCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionIssueCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionIssueCommunityPointArgs, 'input' | 'permission'>>;
  transactionUpdateMetadata?: Resolver<Maybe<GqlResolversTypes['TransactionUpdateMetadataPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionUpdateMetadataArgs, 'id' | 'input'>>;
  updatePortalConfig?: Resolver<GqlResolversTypes['CommunityPortalConfig'], ParentType, ContextType, RequireFields<GqlMutationUpdatePortalConfigArgs, 'input' | 'permission'>>;
  updateReportTemplate?: Resolver<Maybe<GqlResolversTypes['UpdateReportTemplatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateReportTemplateArgs, 'input' | 'variant'>>;
  updateSignupBonusConfig?: Resolver<GqlResolversTypes['CommunitySignupBonusConfig'], ParentType, ContextType, RequireFields<GqlMutationUpdateSignupBonusConfigArgs, 'input' | 'permission'>>;
  userDeleteMe?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteMeArgs, 'permission'>>;
  userSignUp?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserSignUpArgs, 'input'>>;
  userUpdateMyProfile?: Resolver<Maybe<GqlResolversTypes['UserUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateMyProfileArgs, 'input' | 'permission'>>;
  utilityCreate?: Resolver<Maybe<GqlResolversTypes['UtilityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityCreateArgs, 'input' | 'permission'>>;
  utilityDelete?: Resolver<Maybe<GqlResolversTypes['UtilityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityDeleteArgs, 'id' | 'permission'>>;
  utilitySetPublishStatus?: Resolver<Maybe<GqlResolversTypes['UtilitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilitySetPublishStatusArgs, 'id' | 'input' | 'permission'>>;
  utilityUpdateInfo?: Resolver<Maybe<GqlResolversTypes['UtilityUpdateInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityUpdateInfoArgs, 'id' | 'input' | 'permission'>>;
  voteCast?: Resolver<GqlResolversTypes['VoteCastPayload'], ParentType, ContextType, RequireFields<GqlMutationVoteCastArgs, 'input'>>;
  voteTopicCreate?: Resolver<GqlResolversTypes['VoteTopicCreatePayload'], ParentType, ContextType, RequireFields<GqlMutationVoteTopicCreateArgs, 'input' | 'permission'>>;
  voteTopicDelete?: Resolver<GqlResolversTypes['VoteTopicDeletePayload'], ParentType, ContextType, RequireFields<GqlMutationVoteTopicDeleteArgs, 'id' | 'permission'>>;
  voteTopicUpdate?: Resolver<GqlResolversTypes['VoteTopicUpdatePayload'], ParentType, ContextType, RequireFields<GqlMutationVoteTopicUpdateArgs, 'id' | 'input' | 'permission'>>;
}>;

export type GqlMyVoteEligibilityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MyVoteEligibility'] = GqlResolversParentTypes['MyVoteEligibility']> = ResolversObject<{
  currentPower?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  eligible?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  myBallot?: Resolver<Maybe<GqlResolversTypes['VoteBallot']>, ParentType, ContextType>;
  reason?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftInstanceResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftInstance'] = GqlResolversParentTypes['NftInstance']> = ResolversObject<{
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  instanceId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  json?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  nftToken?: Resolver<Maybe<GqlResolversTypes['NftToken']>, ParentType, ContextType>;
  nftWallet?: Resolver<Maybe<GqlResolversTypes['NftWallet']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftInstanceEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftInstanceEdge'] = GqlResolversParentTypes['NftInstanceEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<GqlResolversTypes['NftInstance'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftInstancesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftInstancesConnection'] = GqlResolversParentTypes['NftInstancesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['NftInstanceEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftTokenResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftToken'] = GqlResolversParentTypes['NftToken']> = ResolversObject<{
  address?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  json?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  symbol?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftTokenEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftTokenEdge'] = GqlResolversParentTypes['NftTokenEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<GqlResolversTypes['NftToken'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftTokensConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftTokensConnection'] = GqlResolversParentTypes['NftTokensConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['NftTokenEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlNftWalletResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftWallet'] = GqlResolversParentTypes['NftWallet']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  walletAddress?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitiesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitiesConnection'] = GqlResolversParentTypes['OpportunitiesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['OpportunityEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Opportunity'] = GqlResolversParentTypes['Opportunity']> = ResolversObject<{
  articles?: Resolver<Maybe<Array<GqlResolversTypes['Article']>>, ParentType, ContextType>;
  body?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  capacity?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  category?: Resolver<GqlResolversTypes['OpportunityCategory'], ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  earliestReservableAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  feeRequired?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  isReservableWithTicket?: Resolver<Maybe<GqlResolversTypes['Boolean']>, ParentType, ContextType>;
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType>;
  pointsRequired?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  pointsToEarn?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  publishStatus?: Resolver<GqlResolversTypes['PublishStatus'], ParentType, ContextType>;
  requireApproval?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  requiredUtilities?: Resolver<Maybe<Array<GqlResolversTypes['Utility']>>, ParentType, ContextType>;
  slots?: Resolver<Maybe<Array<GqlResolversTypes['OpportunitySlot']>>, ParentType, ContextType, Partial<GqlOpportunitySlotsArgs>>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityCreatePayload'] = GqlResolversParentTypes['OpportunityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityCreateSuccess'] = GqlResolversParentTypes['OpportunityCreateSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityDeletePayload'] = GqlResolversParentTypes['OpportunityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunityDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityDeleteSuccess'] = GqlResolversParentTypes['OpportunityDeleteSuccess']> = ResolversObject<{
  opportunityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityEdge'] = GqlResolversParentTypes['OpportunityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySetPublishStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySetPublishStatusPayload'] = GqlResolversParentTypes['OpportunitySetPublishStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunitySetPublishStatusSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunitySetPublishStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySetPublishStatusSuccess'] = GqlResolversParentTypes['OpportunitySetPublishStatusSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlot'] = GqlResolversParentTypes['OpportunitySlot']> = ResolversObject<{
  capacity?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  hostingStatus?: Resolver<GqlResolversTypes['OpportunitySlotHostingStatus'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  isFullyEvaluated?: Resolver<Maybe<GqlResolversTypes['Boolean']>, ParentType, ContextType>;
  numEvaluated?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  numParticipants?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  remainingCapacity?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  reservations?: Resolver<Maybe<Array<GqlResolversTypes['Reservation']>>, ParentType, ContextType>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  vcIssuanceRequests?: Resolver<Maybe<Array<GqlResolversTypes['VcIssuanceRequest']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotCreatePayload'] = GqlResolversParentTypes['OpportunitySlotCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunitySlotCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunitySlotCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotCreateSuccess'] = GqlResolversParentTypes['OpportunitySlotCreateSuccess']> = ResolversObject<{
  slot?: Resolver<GqlResolversTypes['OpportunitySlot'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotEdge'] = GqlResolversParentTypes['OpportunitySlotEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotSetHostingStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotSetHostingStatusPayload'] = GqlResolversParentTypes['OpportunitySlotSetHostingStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunitySlotSetHostingStatusSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunitySlotSetHostingStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotSetHostingStatusSuccess'] = GqlResolversParentTypes['OpportunitySlotSetHostingStatusSuccess']> = ResolversObject<{
  slot?: Resolver<GqlResolversTypes['OpportunitySlot'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotsBulkUpdatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotsBulkUpdatePayload'] = GqlResolversParentTypes['OpportunitySlotsBulkUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunitySlotsBulkUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunitySlotsBulkUpdateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotsBulkUpdateSuccess'] = GqlResolversParentTypes['OpportunitySlotsBulkUpdateSuccess']> = ResolversObject<{
  slots?: Resolver<Array<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotsConnection'] = GqlResolversParentTypes['OpportunitySlotsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['OpportunitySlotEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityUpdateContentPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityUpdateContentPayload'] = GqlResolversParentTypes['OpportunityUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'OpportunityUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityUpdateContentSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityUpdateContentSuccess'] = GqlResolversParentTypes['OpportunityUpdateContentSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPageInfoResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PageInfo'] = GqlResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPagingResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Paging'] = GqlResolversParentTypes['Paging']> = ResolversObject<{
  skip?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  take?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Participation'] = GqlResolversParentTypes['Participation']> = ResolversObject<{
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  evaluation?: Resolver<Maybe<GqlResolversTypes['Evaluation']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  opportunitySlot?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['ParticipationStatusReason'], ParentType, ContextType>;
  reservation?: Resolver<Maybe<GqlResolversTypes['Reservation']>, ParentType, ContextType>;
  source?: Resolver<Maybe<GqlResolversTypes['Source']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ParticipationStatus'], ParentType, ContextType>;
  statusHistories?: Resolver<Maybe<Array<GqlResolversTypes['ParticipationStatusHistory']>>, ParentType, ContextType>;
  ticketStatusHistories?: Resolver<Maybe<Array<GqlResolversTypes['TicketStatusHistory']>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationBulkCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationBulkCreatePayload'] = GqlResolversParentTypes['ParticipationBulkCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ParticipationBulkCreateSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationBulkCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationBulkCreateSuccess'] = GqlResolversParentTypes['ParticipationBulkCreateSuccess']> = ResolversObject<{
  participations?: Resolver<Array<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationCreatePersonalRecordPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationCreatePersonalRecordPayload'] = GqlResolversParentTypes['ParticipationCreatePersonalRecordPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ParticipationCreatePersonalRecordSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationCreatePersonalRecordSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationCreatePersonalRecordSuccess'] = GqlResolversParentTypes['ParticipationCreatePersonalRecordSuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationDeletePayload'] = GqlResolversParentTypes['ParticipationDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ParticipationDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationDeleteSuccess'] = GqlResolversParentTypes['ParticipationDeleteSuccess']> = ResolversObject<{
  participationId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationEdge'] = GqlResolversParentTypes['ParticipationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoriesConnection'] = GqlResolversParentTypes['ParticipationStatusHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ParticipationStatusHistoryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistory'] = GqlResolversParentTypes['ParticipationStatusHistory']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['ParticipationStatusReason'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ParticipationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoryEdge'] = GqlResolversParentTypes['ParticipationStatusHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationsConnection'] = GqlResolversParentTypes['ParticipationsConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ParticipationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Place'] = GqlResolversParentTypes['Place']> = ResolversObject<{
  accumulatedParticipants?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  address?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  city?: Resolver<Maybe<GqlResolversTypes['City']>, ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  currentPublicOpportunityCount?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  googlePlaceId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  isManual?: Resolver<Maybe<GqlResolversTypes['Boolean']>, ParentType, ContextType>;
  latitude?: Resolver<GqlResolversTypes['Decimal'], ParentType, ContextType>;
  longitude?: Resolver<GqlResolversTypes['Decimal'], ParentType, ContextType>;
  mapLocation?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunities?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceCreatePayload'] = GqlResolversParentTypes['PlaceCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'PlaceCreateSuccess', ParentType, ContextType>;
}>;

export type GqlPlaceCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceCreateSuccess'] = GqlResolversParentTypes['PlaceCreateSuccess']> = ResolversObject<{
  place?: Resolver<GqlResolversTypes['Place'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceDeletePayload'] = GqlResolversParentTypes['PlaceDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'PlaceDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlPlaceDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceDeleteSuccess'] = GqlResolversParentTypes['PlaceDeleteSuccess']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceEdge'] = GqlResolversParentTypes['PlaceEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceUpdatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceUpdatePayload'] = GqlResolversParentTypes['PlaceUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'PlaceUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlPlaceUpdateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceUpdateSuccess'] = GqlResolversParentTypes['PlaceUpdateSuccess']> = ResolversObject<{
  place?: Resolver<GqlResolversTypes['Place'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlacesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlacesConnection'] = GqlResolversParentTypes['PlacesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['PlaceEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPortfolioResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Portfolio'] = GqlResolversParentTypes['Portfolio']> = ResolversObject<{
  category?: Resolver<GqlResolversTypes['PortfolioCategory'], ParentType, ContextType>;
  date?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  evaluationStatus?: Resolver<Maybe<GqlResolversTypes['EvaluationStatus']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participants?: Resolver<Maybe<Array<GqlResolversTypes['User']>>, ParentType, ContextType>;
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType>;
  reservationStatus?: Resolver<Maybe<GqlResolversTypes['ReservationStatus']>, ParentType, ContextType>;
  source?: Resolver<GqlResolversTypes['PortfolioSource'], ParentType, ContextType>;
  thumbnailUrl?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPortfolioEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PortfolioEdge'] = GqlResolversParentTypes['PortfolioEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Portfolio']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPortfoliosConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PortfoliosConnection'] = GqlResolversParentTypes['PortfoliosConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['PortfolioEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPublishReportPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PublishReportPayload'] = GqlResolversParentTypes['PublishReportPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'PublishReportSuccess', ParentType, ContextType>;
}>;

export type GqlPublishReportSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PublishReportSuccess'] = GqlResolversParentTypes['PublishReportSuccess']> = ResolversObject<{
  report?: Resolver<GqlResolversTypes['Report'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlQueryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Query'] = GqlResolversParentTypes['Query']> = ResolversObject<{
  article?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType, RequireFields<GqlQueryArticleArgs, 'id' | 'permission'>>;
  articles?: Resolver<GqlResolversTypes['ArticlesConnection'], ParentType, ContextType, Partial<GqlQueryArticlesArgs>>;
  cities?: Resolver<GqlResolversTypes['CitiesConnection'], ParentType, ContextType, Partial<GqlQueryCitiesArgs>>;
  communities?: Resolver<GqlResolversTypes['CommunitiesConnection'], ParentType, ContextType, Partial<GqlQueryCommunitiesArgs>>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType, RequireFields<GqlQueryCommunityArgs, 'id'>>;
  communityPortalConfig?: Resolver<Maybe<GqlResolversTypes['CommunityPortalConfig']>, ParentType, ContextType, RequireFields<GqlQueryCommunityPortalConfigArgs, 'communityId'>>;
  currentUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  echo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  evaluation?: Resolver<Maybe<GqlResolversTypes['Evaluation']>, ParentType, ContextType, RequireFields<GqlQueryEvaluationArgs, 'id'>>;
  evaluationHistories?: Resolver<GqlResolversTypes['EvaluationHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryEvaluationHistoriesArgs>>;
  evaluationHistory?: Resolver<Maybe<GqlResolversTypes['EvaluationHistory']>, ParentType, ContextType, RequireFields<GqlQueryEvaluationHistoryArgs, 'id'>>;
  evaluations?: Resolver<GqlResolversTypes['EvaluationsConnection'], ParentType, ContextType, Partial<GqlQueryEvaluationsArgs>>;
  incentiveGrant?: Resolver<Maybe<GqlResolversTypes['IncentiveGrant']>, ParentType, ContextType, RequireFields<GqlQueryIncentiveGrantArgs, 'id'>>;
  incentiveGrants?: Resolver<GqlResolversTypes['IncentiveGrantsConnection'], ParentType, ContextType, Partial<GqlQueryIncentiveGrantsArgs>>;
  membership?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType, RequireFields<GqlQueryMembershipArgs, 'communityId' | 'userId'>>;
  memberships?: Resolver<GqlResolversTypes['MembershipsConnection'], ParentType, ContextType, Partial<GqlQueryMembershipsArgs>>;
  myVoteEligibility?: Resolver<GqlResolversTypes['MyVoteEligibility'], ParentType, ContextType, RequireFields<GqlQueryMyVoteEligibilityArgs, 'topicId'>>;
  myWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  nftInstance?: Resolver<Maybe<GqlResolversTypes['NftInstance']>, ParentType, ContextType, RequireFields<GqlQueryNftInstanceArgs, 'id'>>;
  nftInstances?: Resolver<GqlResolversTypes['NftInstancesConnection'], ParentType, ContextType, Partial<GqlQueryNftInstancesArgs>>;
  nftToken?: Resolver<Maybe<GqlResolversTypes['NftToken']>, ParentType, ContextType, RequireFields<GqlQueryNftTokenArgs, 'id'>>;
  nftTokens?: Resolver<GqlResolversTypes['NftTokensConnection'], ParentType, ContextType, Partial<GqlQueryNftTokensArgs>>;
  opportunities?: Resolver<GqlResolversTypes['OpportunitiesConnection'], ParentType, ContextType, Partial<GqlQueryOpportunitiesArgs>>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType, RequireFields<GqlQueryOpportunityArgs, 'id' | 'permission'>>;
  opportunitySlot?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType, RequireFields<GqlQueryOpportunitySlotArgs, 'id'>>;
  opportunitySlots?: Resolver<GqlResolversTypes['OpportunitySlotsConnection'], ParentType, ContextType, Partial<GqlQueryOpportunitySlotsArgs>>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType, RequireFields<GqlQueryParticipationArgs, 'id'>>;
  participationStatusHistories?: Resolver<GqlResolversTypes['ParticipationStatusHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryParticipationStatusHistoriesArgs>>;
  participationStatusHistory?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistory']>, ParentType, ContextType, RequireFields<GqlQueryParticipationStatusHistoryArgs, 'id'>>;
  participations?: Resolver<GqlResolversTypes['ParticipationsConnection'], ParentType, ContextType, Partial<GqlQueryParticipationsArgs>>;
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType, RequireFields<GqlQueryPlaceArgs, 'id'>>;
  places?: Resolver<GqlResolversTypes['PlacesConnection'], ParentType, ContextType, Partial<GqlQueryPlacesArgs>>;
  portfolios?: Resolver<Maybe<Array<GqlResolversTypes['Portfolio']>>, ParentType, ContextType, Partial<GqlQueryPortfoliosArgs>>;
  report?: Resolver<Maybe<GqlResolversTypes['Report']>, ParentType, ContextType, RequireFields<GqlQueryReportArgs, 'id'>>;
  reportTemplate?: Resolver<Maybe<GqlResolversTypes['ReportTemplate']>, ParentType, ContextType, RequireFields<GqlQueryReportTemplateArgs, 'variant'>>;
  reportTemplateStats?: Resolver<GqlResolversTypes['ReportTemplateStats'], ParentType, ContextType, RequireFields<GqlQueryReportTemplateStatsArgs, 'variant'>>;
  reports?: Resolver<GqlResolversTypes['ReportsConnection'], ParentType, ContextType, RequireFields<GqlQueryReportsArgs, 'communityId' | 'permission'>>;
  reservation?: Resolver<Maybe<GqlResolversTypes['Reservation']>, ParentType, ContextType, RequireFields<GqlQueryReservationArgs, 'id'>>;
  reservationHistories?: Resolver<GqlResolversTypes['ReservationHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryReservationHistoriesArgs>>;
  reservationHistory?: Resolver<Maybe<GqlResolversTypes['ReservationHistory']>, ParentType, ContextType, RequireFields<GqlQueryReservationHistoryArgs, 'id'>>;
  reservations?: Resolver<GqlResolversTypes['ReservationsConnection'], ParentType, ContextType, Partial<GqlQueryReservationsArgs>>;
  signupBonusConfig?: Resolver<Maybe<GqlResolversTypes['CommunitySignupBonusConfig']>, ParentType, ContextType, RequireFields<GqlQuerySignupBonusConfigArgs, 'communityId'>>;
  states?: Resolver<GqlResolversTypes['StatesConnection'], ParentType, ContextType, Partial<GqlQueryStatesArgs>>;
  sysAdminCommunityDetail?: Resolver<GqlResolversTypes['SysAdminCommunityDetailPayload'], ParentType, ContextType, RequireFields<GqlQuerySysAdminCommunityDetailArgs, 'input'>>;
  sysAdminDashboard?: Resolver<GqlResolversTypes['SysAdminDashboardPayload'], ParentType, ContextType, Partial<GqlQuerySysAdminDashboardArgs>>;
  ticket?: Resolver<Maybe<GqlResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<GqlQueryTicketArgs, 'id'>>;
  ticketClaimLink?: Resolver<Maybe<GqlResolversTypes['TicketClaimLink']>, ParentType, ContextType, RequireFields<GqlQueryTicketClaimLinkArgs, 'id'>>;
  ticketClaimLinks?: Resolver<GqlResolversTypes['TicketClaimLinksConnection'], ParentType, ContextType, Partial<GqlQueryTicketClaimLinksArgs>>;
  ticketIssuer?: Resolver<Maybe<GqlResolversTypes['TicketIssuer']>, ParentType, ContextType, RequireFields<GqlQueryTicketIssuerArgs, 'id'>>;
  ticketIssuers?: Resolver<GqlResolversTypes['TicketIssuersConnection'], ParentType, ContextType, Partial<GqlQueryTicketIssuersArgs>>;
  ticketStatusHistories?: Resolver<GqlResolversTypes['TicketStatusHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryTicketStatusHistoriesArgs>>;
  ticketStatusHistory?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistory']>, ParentType, ContextType, RequireFields<GqlQueryTicketStatusHistoryArgs, 'id'>>;
  tickets?: Resolver<GqlResolversTypes['TicketsConnection'], ParentType, ContextType, Partial<GqlQueryTicketsArgs>>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<GqlQueryTransactionArgs, 'id'>>;
  transactions?: Resolver<GqlResolversTypes['TransactionsConnection'], ParentType, ContextType, Partial<GqlQueryTransactionsArgs>>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlQueryUserArgs, 'id'>>;
  users?: Resolver<GqlResolversTypes['UsersConnection'], ParentType, ContextType, Partial<GqlQueryUsersArgs>>;
  utilities?: Resolver<GqlResolversTypes['UtilitiesConnection'], ParentType, ContextType, Partial<GqlQueryUtilitiesArgs>>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType, RequireFields<GqlQueryUtilityArgs, 'id' | 'permission'>>;
  vcIssuanceRequest?: Resolver<Maybe<GqlResolversTypes['VcIssuanceRequest']>, ParentType, ContextType, RequireFields<GqlQueryVcIssuanceRequestArgs, 'id'>>;
  vcIssuanceRequests?: Resolver<GqlResolversTypes['VcIssuanceRequestsConnection'], ParentType, ContextType, Partial<GqlQueryVcIssuanceRequestsArgs>>;
  verifyTransactions?: Resolver<Maybe<Array<GqlResolversTypes['TransactionVerificationResult']>>, ParentType, ContextType, RequireFields<GqlQueryVerifyTransactionsArgs, 'txIds'>>;
  voteTopic?: Resolver<Maybe<GqlResolversTypes['VoteTopic']>, ParentType, ContextType, RequireFields<GqlQueryVoteTopicArgs, 'id'>>;
  voteTopics?: Resolver<GqlResolversTypes['VoteTopicsConnection'], ParentType, ContextType, RequireFields<GqlQueryVoteTopicsArgs, 'communityId'>>;
  wallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType, RequireFields<GqlQueryWalletArgs, 'id'>>;
  wallets?: Resolver<GqlResolversTypes['WalletsConnection'], ParentType, ContextType, Partial<GqlQueryWalletsArgs>>;
}>;

export type GqlRejectReportPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['RejectReportPayload'] = GqlResolversParentTypes['RejectReportPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'RejectReportSuccess', ParentType, ContextType>;
}>;

export type GqlRejectReportSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['RejectReportSuccess'] = GqlResolversParentTypes['RejectReportSuccess']> = ResolversObject<{
  report?: Resolver<GqlResolversTypes['Report'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Report'] = GqlResolversParentTypes['Report']> = ResolversObject<{
  cacheReadTokens?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  feedbacks?: Resolver<GqlResolversTypes['ReportFeedbacksConnection'], ParentType, ContextType, Partial<GqlReportFeedbacksArgs>>;
  finalContent?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  generatedByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  inputTokens?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  model?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  myFeedback?: Resolver<Maybe<GqlResolversTypes['ReportFeedback']>, ParentType, ContextType>;
  outputMarkdown?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  outputTokens?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  parentRun?: Resolver<Maybe<GqlResolversTypes['Report']>, ParentType, ContextType>;
  periodFrom?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  periodTo?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  publishedByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  regenerateCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  regenerations?: Resolver<Array<GqlResolversTypes['Report']>, ParentType, ContextType>;
  skipReason?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ReportStatus'], ParentType, ContextType>;
  targetUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  template?: Resolver<Maybe<GqlResolversTypes['ReportTemplate']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  variant?: Resolver<GqlResolversTypes['ReportVariant'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportEdge'] = GqlResolversParentTypes['ReportEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Report']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportFeedbackResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportFeedback'] = GqlResolversParentTypes['ReportFeedback']> = ResolversObject<{
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  feedbackType?: Resolver<Maybe<GqlResolversTypes['ReportFeedbackType']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  rating?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  reportId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  sectionKey?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportFeedbackEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportFeedbackEdge'] = GqlResolversParentTypes['ReportFeedbackEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['ReportFeedback']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportFeedbacksConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportFeedbacksConnection'] = GqlResolversParentTypes['ReportFeedbacksConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['ReportFeedbackEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportTemplateResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportTemplate'] = GqlResolversParentTypes['ReportTemplate']> = ResolversObject<{
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  communityContext?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  experimentKey?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  isEnabled?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  maxTokens?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  model?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  scope?: Resolver<GqlResolversTypes['ReportTemplateScope'], ParentType, ContextType>;
  stopSequences?: Resolver<Array<GqlResolversTypes['String']>, ParentType, ContextType>;
  systemPrompt?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  temperature?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  trafficWeight?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  updatedByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  userPromptTemplate?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  variant?: Resolver<GqlResolversTypes['ReportVariant'], ParentType, ContextType>;
  version?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportTemplateStatsResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportTemplateStats'] = GqlResolversParentTypes['ReportTemplateStats']> = ResolversObject<{
  avgJudgeScore?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  avgRating?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  correlationWarning?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  feedbackCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  judgeHumanCorrelation?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  variant?: Resolver<GqlResolversTypes['ReportVariant'], ParentType, ContextType>;
  version?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReportsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReportsConnection'] = GqlResolversParentTypes['ReportsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['ReportEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Reservation'] = GqlResolversParentTypes['Reservation']> = ResolversObject<{
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  histories?: Resolver<Maybe<Array<GqlResolversTypes['ReservationHistory']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  opportunitySlot?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
  participantCountWithPoint?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ReservationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationCreatePayload'] = GqlResolversParentTypes['ReservationCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ReservationCreateSuccess', ParentType, ContextType>;
}>;

export type GqlReservationCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationCreateSuccess'] = GqlResolversParentTypes['ReservationCreateSuccess']> = ResolversObject<{
  reservation?: Resolver<GqlResolversTypes['Reservation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationEdge'] = GqlResolversParentTypes['ReservationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Reservation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationHistoriesConnection'] = GqlResolversParentTypes['ReservationHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ReservationHistoryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationHistory'] = GqlResolversParentTypes['ReservationHistory']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  reservation?: Resolver<GqlResolversTypes['Reservation'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ReservationStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationHistoryEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationHistoryEdge'] = GqlResolversParentTypes['ReservationHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['ReservationHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationSetStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationSetStatusPayload'] = GqlResolversParentTypes['ReservationSetStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ReservationSetStatusSuccess', ParentType, ContextType>;
}>;

export type GqlReservationSetStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationSetStatusSuccess'] = GqlResolversParentTypes['ReservationSetStatusSuccess']> = ResolversObject<{
  reservation?: Resolver<GqlResolversTypes['Reservation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlReservationsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ReservationsConnection'] = GqlResolversParentTypes['ReservationsConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ReservationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlStateResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['State'] = GqlResolversParentTypes['State']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  countryCode?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlStateEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['StateEdge'] = GqlResolversParentTypes['StateEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['State']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlStatesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['StatesConnection'] = GqlResolversParentTypes['StatesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['StateEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlStorePhoneAuthTokenPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['StorePhoneAuthTokenPayload'] = GqlResolversParentTypes['StorePhoneAuthTokenPayload']> = ResolversObject<{
  expiresAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  success?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSubmitReportFeedbackPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SubmitReportFeedbackPayload'] = GqlResolversParentTypes['SubmitReportFeedbackPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'SubmitReportFeedbackSuccess', ParentType, ContextType>;
}>;

export type GqlSubmitReportFeedbackSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SubmitReportFeedbackSuccess'] = GqlResolversParentTypes['SubmitReportFeedbackSuccess']> = ResolversObject<{
  feedback?: Resolver<GqlResolversTypes['ReportFeedback'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminChainDepthBucketResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminChainDepthBucket'] = GqlResolversParentTypes['SysAdminChainDepthBucket']> = ResolversObject<{
  count?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  depth?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminCohortRetentionPointResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminCohortRetentionPoint'] = GqlResolversParentTypes['SysAdminCohortRetentionPoint']> = ResolversObject<{
  cohortMonth?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  cohortSize?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  retentionM1?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  retentionM3?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  retentionM6?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminCommunityAlertsResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminCommunityAlerts'] = GqlResolversParentTypes['SysAdminCommunityAlerts']> = ResolversObject<{
  activeDrop?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  churnSpike?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  noNewMembers?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminCommunityDetailPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminCommunityDetailPayload'] = GqlResolversParentTypes['SysAdminCommunityDetailPayload']> = ResolversObject<{
  alerts?: Resolver<GqlResolversTypes['SysAdminCommunityAlerts'], ParentType, ContextType>;
  asOf?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  chainDepthDistribution?: Resolver<Array<GqlResolversTypes['SysAdminChainDepthBucket']>, ParentType, ContextType>;
  cohortRetention?: Resolver<Array<GqlResolversTypes['SysAdminCohortRetentionPoint']>, ParentType, ContextType>;
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  communityName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  dormantCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  memberList?: Resolver<GqlResolversTypes['SysAdminMemberList'], ParentType, ContextType>;
  monthlyActivityTrend?: Resolver<Array<GqlResolversTypes['SysAdminMonthlyActivityPoint']>, ParentType, ContextType>;
  retentionTrend?: Resolver<Array<GqlResolversTypes['SysAdminRetentionTrendPoint']>, ParentType, ContextType>;
  stages?: Resolver<GqlResolversTypes['SysAdminStageDistribution'], ParentType, ContextType>;
  summary?: Resolver<GqlResolversTypes['SysAdminCommunitySummaryCard'], ParentType, ContextType>;
  windowMonths?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminCommunityOverviewResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminCommunityOverview'] = GqlResolversParentTypes['SysAdminCommunityOverview']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  communityName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  dormantCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  hubMemberCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  latestCohort?: Resolver<GqlResolversTypes['SysAdminLatestCohort'], ParentType, ContextType>;
  segmentCounts?: Resolver<GqlResolversTypes['SysAdminSegmentCounts'], ParentType, ContextType>;
  tenureDistribution?: Resolver<GqlResolversTypes['SysAdminTenureDistribution'], ParentType, ContextType>;
  totalMembers?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  weeklyRetention?: Resolver<GqlResolversTypes['SysAdminWeeklyRetention'], ParentType, ContextType>;
  windowActivity?: Resolver<GqlResolversTypes['SysAdminWindowActivity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminCommunitySummaryCardResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminCommunitySummaryCard'] = GqlResolversParentTypes['SysAdminCommunitySummaryCard']> = ResolversObject<{
  communityActivityRate?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  communityActivityRate3mAvg?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  communityName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  dataFrom?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  dataTo?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  growthRateActivity?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  maxChainDepthAllTime?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  tier2Count?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  tier2Pct?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  totalDonationPointsAllTime?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  totalMembers?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminDashboardPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminDashboardPayload'] = GqlResolversParentTypes['SysAdminDashboardPayload']> = ResolversObject<{
  asOf?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  communities?: Resolver<Array<GqlResolversTypes['SysAdminCommunityOverview']>, ParentType, ContextType>;
  platform?: Resolver<GqlResolversTypes['SysAdminPlatformSummary'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminLatestCohortResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminLatestCohort'] = GqlResolversParentTypes['SysAdminLatestCohort']> = ResolversObject<{
  activeAtM1?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  size?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminMemberListResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminMemberList'] = GqlResolversParentTypes['SysAdminMemberList']> = ResolversObject<{
  hasNextPage?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  nextCursor?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  users?: Resolver<Array<GqlResolversTypes['SysAdminMemberRow']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminMemberRowResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminMemberRow'] = GqlResolversParentTypes['SysAdminMemberRow']> = ResolversObject<{
  daysIn?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  donationInDays?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  donationInMonths?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  donationOutDays?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  donationOutMonths?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  lastDonationAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  monthsIn?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  totalPointsIn?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  totalPointsOut?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  uniqueDonationRecipients?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  uniqueDonationSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  userSendRate?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminMonthlyActivityPointResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminMonthlyActivityPoint'] = GqlResolversParentTypes['SysAdminMonthlyActivityPoint']> = ResolversObject<{
  chainPct?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  communityActivityRate?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  donationPointsSum?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  dormantCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  month?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  newMembers?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  returnedMembers?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  senderCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminPlatformSummaryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminPlatformSummary'] = GqlResolversParentTypes['SysAdminPlatformSummary']> = ResolversObject<{
  communitiesCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  latestMonthDonationPoints?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  totalMembers?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminRetentionTrendPointResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminRetentionTrendPoint'] = GqlResolversParentTypes['SysAdminRetentionTrendPoint']> = ResolversObject<{
  churnedSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  communityActivityRate?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  newMembers?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  retainedSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  returnedSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  week?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminSegmentCountsResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminSegmentCounts'] = GqlResolversParentTypes['SysAdminSegmentCounts']> = ResolversObject<{
  activeCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  passiveCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  tier1Count?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  tier2Count?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminStageBucketResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminStageBucket'] = GqlResolversParentTypes['SysAdminStageBucket']> = ResolversObject<{
  avgMonthsIn?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  avgSendRate?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  count?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  pct?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  pointsContributionPct?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminStageDistributionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminStageDistribution'] = GqlResolversParentTypes['SysAdminStageDistribution']> = ResolversObject<{
  habitual?: Resolver<GqlResolversTypes['SysAdminStageBucket'], ParentType, ContextType>;
  latent?: Resolver<GqlResolversTypes['SysAdminStageBucket'], ParentType, ContextType>;
  occasional?: Resolver<GqlResolversTypes['SysAdminStageBucket'], ParentType, ContextType>;
  regular?: Resolver<GqlResolversTypes['SysAdminStageBucket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminTenureDistributionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminTenureDistribution'] = GqlResolversParentTypes['SysAdminTenureDistribution']> = ResolversObject<{
  gte12Months?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  lt1Month?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  m1to3Months?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  m3to12Months?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  monthlyHistogram?: Resolver<Array<GqlResolversTypes['SysAdminTenureHistogramBucket']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminTenureHistogramBucketResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminTenureHistogramBucket'] = GqlResolversParentTypes['SysAdminTenureHistogramBucket']> = ResolversObject<{
  count?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  monthsIn?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminWeeklyRetentionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminWeeklyRetention'] = GqlResolversParentTypes['SysAdminWeeklyRetention']> = ResolversObject<{
  churnedSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  retainedSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlSysAdminWindowActivityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['SysAdminWindowActivity'] = GqlResolversParentTypes['SysAdminWindowActivity']> = ResolversObject<{
  newMemberCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  newMemberCountPrev?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  retainedSenders?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  senderCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  senderCountPrev?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Ticket'] = GqlResolversParentTypes['Ticket']> = ResolversObject<{
  claimLink?: Resolver<Maybe<GqlResolversTypes['TicketClaimLink']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TicketStatusReason'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['TicketStatus'], ParentType, ContextType>;
  ticketStatusHistories?: Resolver<Maybe<Array<GqlResolversTypes['TicketStatusHistory']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  wallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketClaimLinkResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketClaimLink'] = GqlResolversParentTypes['TicketClaimLink']> = ResolversObject<{
  claimedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  issuer?: Resolver<Maybe<GqlResolversTypes['TicketIssuer']>, ParentType, ContextType>;
  qty?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ClaimLinkStatus'], ParentType, ContextType>;
  tickets?: Resolver<Maybe<Array<GqlResolversTypes['Ticket']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketClaimLinkEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketClaimLinkEdge'] = GqlResolversParentTypes['TicketClaimLinkEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['TicketClaimLink']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketClaimLinksConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketClaimLinksConnection'] = GqlResolversParentTypes['TicketClaimLinksConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TicketClaimLinkEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketClaimPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketClaimPayload'] = GqlResolversParentTypes['TicketClaimPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TicketClaimSuccess', ParentType, ContextType>;
}>;

export type GqlTicketClaimSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketClaimSuccess'] = GqlResolversParentTypes['TicketClaimSuccess']> = ResolversObject<{
  tickets?: Resolver<Array<GqlResolversTypes['Ticket']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketEdge'] = GqlResolversParentTypes['TicketEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Ticket']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketIssuePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketIssuePayload'] = GqlResolversParentTypes['TicketIssuePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TicketIssueSuccess', ParentType, ContextType>;
}>;

export type GqlTicketIssueSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketIssueSuccess'] = GqlResolversParentTypes['TicketIssueSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['TicketIssuer'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketIssuerResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketIssuer'] = GqlResolversParentTypes['TicketIssuer']> = ResolversObject<{
  claimLink?: Resolver<Maybe<GqlResolversTypes['TicketClaimLink']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  owner?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  qtyToBeIssued?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketIssuerEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketIssuerEdge'] = GqlResolversParentTypes['TicketIssuerEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['TicketIssuer']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketIssuersConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketIssuersConnection'] = GqlResolversParentTypes['TicketIssuersConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TicketIssuerEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketPurchasePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketPurchasePayload'] = GqlResolversParentTypes['TicketPurchasePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TicketPurchaseSuccess', ParentType, ContextType>;
}>;

export type GqlTicketPurchaseSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketPurchaseSuccess'] = GqlResolversParentTypes['TicketPurchaseSuccess']> = ResolversObject<{
  ticket?: Resolver<GqlResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketRefundPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketRefundPayload'] = GqlResolversParentTypes['TicketRefundPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TicketRefundSuccess', ParentType, ContextType>;
}>;

export type GqlTicketRefundSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketRefundSuccess'] = GqlResolversParentTypes['TicketRefundSuccess']> = ResolversObject<{
  ticket?: Resolver<GqlResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistoriesConnection'] = GqlResolversParentTypes['TicketStatusHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TicketStatusHistoryEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistory'] = GqlResolversParentTypes['TicketStatusHistory']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TicketStatusReason'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['TicketStatus'], ParentType, ContextType>;
  ticket?: Resolver<Maybe<GqlResolversTypes['Ticket']>, ParentType, ContextType>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoryEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistoryEdge'] = GqlResolversParentTypes['TicketStatusHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketUsePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketUsePayload'] = GqlResolversParentTypes['TicketUsePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TicketUseSuccess', ParentType, ContextType>;
}>;

export type GqlTicketUseSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketUseSuccess'] = GqlResolversParentTypes['TicketUseSuccess']> = ResolversObject<{
  ticket?: Resolver<GqlResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketsConnection'] = GqlResolversParentTypes['TicketsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TicketEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Transaction'] = GqlResolversParentTypes['Transaction']> = ResolversObject<{
  chain?: Resolver<Maybe<GqlResolversTypes['TransactionChain']>, ParentType, ContextType>;
  chainDepth?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  fromPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  fromWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TransactionReason'], ParentType, ContextType>;
  reservation?: Resolver<Maybe<GqlResolversTypes['Reservation']>, ParentType, ContextType>;
  ticketStatusHistories?: Resolver<Maybe<Array<GqlResolversTypes['TicketStatusHistory']>>, ParentType, ContextType>;
  toPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  toWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionChainResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionChain'] = GqlResolversParentTypes['TransactionChain']> = ResolversObject<{
  depth?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  steps?: Resolver<Array<GqlResolversTypes['TransactionChainStep']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionChainCommunityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionChainCommunity'] = GqlResolversParentTypes['TransactionChainCommunity']> = ResolversObject<{
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionChainParticipantResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionChainParticipant'] = GqlResolversParentTypes['TransactionChainParticipant']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TransactionChainCommunity' | 'TransactionChainUser', ParentType, ContextType>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlTransactionChainStepResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionChainStep'] = GqlResolversParentTypes['TransactionChainStep']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  from?: Resolver<Maybe<GqlResolversTypes['TransactionChainParticipant']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  points?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TransactionReason'], ParentType, ContextType>;
  to?: Resolver<Maybe<GqlResolversTypes['TransactionChainParticipant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionChainUserResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionChainUser'] = GqlResolversParentTypes['TransactionChainUser']> = ResolversObject<{
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionDonateSelfPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionDonateSelfPointPayload'] = GqlResolversParentTypes['TransactionDonateSelfPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TransactionDonateSelfPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionDonateSelfPointSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionDonateSelfPointSuccess'] = GqlResolversParentTypes['TransactionDonateSelfPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionEdge'] = GqlResolversParentTypes['TransactionEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionGrantCommunityPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionGrantCommunityPointPayload'] = GqlResolversParentTypes['TransactionGrantCommunityPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TransactionGrantCommunityPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionGrantCommunityPointSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionGrantCommunityPointSuccess'] = GqlResolversParentTypes['TransactionGrantCommunityPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionIssueCommunityPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionIssueCommunityPointPayload'] = GqlResolversParentTypes['TransactionIssueCommunityPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TransactionIssueCommunityPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionIssueCommunityPointSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionIssueCommunityPointSuccess'] = GqlResolversParentTypes['TransactionIssueCommunityPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionUpdateMetadataPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionUpdateMetadataPayload'] = GqlResolversParentTypes['TransactionUpdateMetadataPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'TransactionUpdateMetadataSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionUpdateMetadataSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionUpdateMetadataSuccess'] = GqlResolversParentTypes['TransactionUpdateMetadataSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionVerificationResultResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionVerificationResult'] = GqlResolversParentTypes['TransactionVerificationResult']> = ResolversObject<{
  label?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  rootHash?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['VerificationStatus'], ParentType, ContextType>;
  transactionHash?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  txId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionsConnection'] = GqlResolversParentTypes['TransactionsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateReportTemplatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UpdateReportTemplatePayload'] = GqlResolversParentTypes['UpdateReportTemplatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UpdateReportTemplateSuccess', ParentType, ContextType>;
}>;

export type GqlUpdateReportTemplateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UpdateReportTemplateSuccess'] = GqlResolversParentTypes['UpdateReportTemplateSuccess']> = ResolversObject<{
  reportTemplate?: Resolver<GqlResolversTypes['ReportTemplate'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlUploadScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type GqlUserResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['User'] = GqlResolversParentTypes['User']> = ResolversObject<{
  articlesAboutMe?: Resolver<Maybe<Array<GqlResolversTypes['Article']>>, ParentType, ContextType>;
  articlesWrittenByMe?: Resolver<Maybe<Array<GqlResolversTypes['Article']>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  currentPrefecture?: Resolver<Maybe<GqlResolversTypes['CurrentPrefecture']>, ParentType, ContextType>;
  didIssuanceRequests?: Resolver<Maybe<Array<GqlResolversTypes['DidIssuanceRequest']>>, ParentType, ContextType>;
  evaluationCreatedByMe?: Resolver<Maybe<Array<GqlResolversTypes['EvaluationHistory']>>, ParentType, ContextType>;
  evaluations?: Resolver<Maybe<Array<GqlResolversTypes['Evaluation']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  identities?: Resolver<Maybe<Array<GqlResolversTypes['Identity']>>, ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  membershipChangedByMe?: Resolver<Maybe<Array<GqlResolversTypes['MembershipHistory']>>, ParentType, ContextType>;
  memberships?: Resolver<Maybe<Array<GqlResolversTypes['Membership']>>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  nftInstances?: Resolver<Maybe<GqlResolversTypes['NftInstancesConnection']>, ParentType, ContextType, Partial<GqlUserNftInstancesArgs>>;
  nftWallet?: Resolver<Maybe<GqlResolversTypes['NftWallet']>, ParentType, ContextType>;
  opportunitiesCreatedByMe?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  participationStatusChangedByMe?: Resolver<Maybe<Array<GqlResolversTypes['ParticipationStatusHistory']>>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  portfolios?: Resolver<Maybe<Array<GqlResolversTypes['Portfolio']>>, ParentType, ContextType, Partial<GqlUserPortfoliosArgs>>;
  preferredLanguage?: Resolver<Maybe<GqlResolversTypes['Language']>, ParentType, ContextType>;
  reservationStatusChangedByMe?: Resolver<Maybe<Array<GqlResolversTypes['ReservationHistory']>>, ParentType, ContextType>;
  reservations?: Resolver<Maybe<Array<GqlResolversTypes['Reservation']>>, ParentType, ContextType>;
  slug?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  sysRole?: Resolver<Maybe<GqlResolversTypes['SysRole']>, ParentType, ContextType>;
  ticketStatusChangedByMe?: Resolver<Maybe<Array<GqlResolversTypes['TicketStatusHistory']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  urlFacebook?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlInstagram?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlTiktok?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlWebsite?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlX?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlYoutube?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  wallets?: Resolver<Maybe<Array<GqlResolversTypes['Wallet']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserDeletePayload'] = GqlResolversParentTypes['UserDeletePayload']> = ResolversObject<{
  userId?: Resolver<Maybe<GqlResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserEdge'] = GqlResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateProfilePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserUpdateProfilePayload'] = GqlResolversParentTypes['UserUpdateProfilePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UserUpdateProfileSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateProfileSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserUpdateProfileSuccess'] = GqlResolversParentTypes['UserUpdateProfileSuccess']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUsersConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UsersConnection'] = GqlResolversParentTypes['UsersConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilitiesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilitiesConnection'] = GqlResolversParentTypes['UtilitiesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['UtilityEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Utility'] = GqlResolversParentTypes['Utility']> = ResolversObject<{
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  owner?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  pointsRequired?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  publishStatus?: Resolver<GqlResolversTypes['PublishStatus'], ParentType, ContextType>;
  requiredForOpportunities?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  ticketIssuers?: Resolver<Maybe<Array<GqlResolversTypes['TicketIssuer']>>, ParentType, ContextType>;
  tickets?: Resolver<Maybe<Array<GqlResolversTypes['Ticket']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityCreatePayload'] = GqlResolversParentTypes['UtilityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UtilityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityCreateSuccess'] = GqlResolversParentTypes['UtilityCreateSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityDeletePayload'] = GqlResolversParentTypes['UtilityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UtilityDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityDeleteSuccess'] = GqlResolversParentTypes['UtilityDeleteSuccess']> = ResolversObject<{
  utilityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityEdge'] = GqlResolversParentTypes['UtilityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilitySetPublishStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilitySetPublishStatusPayload'] = GqlResolversParentTypes['UtilitySetPublishStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UtilitySetPublishStatusSuccess', ParentType, ContextType>;
}>;

export type GqlUtilitySetPublishStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilitySetPublishStatusSuccess'] = GqlResolversParentTypes['UtilitySetPublishStatusSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityUpdateInfoPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityUpdateInfoPayload'] = GqlResolversParentTypes['UtilityUpdateInfoPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'UtilityUpdateInfoSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityUpdateInfoSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityUpdateInfoSuccess'] = GqlResolversParentTypes['UtilityUpdateInfoSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVcIssuanceRequestResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VcIssuanceRequest'] = GqlResolversParentTypes['VcIssuanceRequest']> = ResolversObject<{
  completedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  evaluation?: Resolver<Maybe<GqlResolversTypes['Evaluation']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  processedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  requestedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['VcIssuanceStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVcIssuanceRequestEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VcIssuanceRequestEdge'] = GqlResolversParentTypes['VcIssuanceRequestEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['VcIssuanceRequest']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVcIssuanceRequestsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VcIssuanceRequestsConnection'] = GqlResolversParentTypes['VcIssuanceRequestsConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['VcIssuanceRequestEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteBallotResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteBallot'] = GqlResolversParentTypes['VoteBallot']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  option?: Resolver<GqlResolversTypes['VoteOption'], ParentType, ContextType>;
  power?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteCastPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteCastPayload'] = GqlResolversParentTypes['VoteCastPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'VoteCastSuccess', ParentType, ContextType>;
}>;

export type GqlVoteCastSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteCastSuccess'] = GqlResolversParentTypes['VoteCastSuccess']> = ResolversObject<{
  ballot?: Resolver<GqlResolversTypes['VoteBallot'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteGateResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteGate'] = GqlResolversParentTypes['VoteGate']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  nftToken?: Resolver<Maybe<GqlResolversTypes['NftToken']>, ParentType, ContextType>;
  requiredRole?: Resolver<Maybe<GqlResolversTypes['Role']>, ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['VoteGateType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteOptionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteOption'] = GqlResolversParentTypes['VoteOption']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  label?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  orderIndex?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  totalPower?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  voteCount?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVotePowerPolicyResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VotePowerPolicy'] = GqlResolversParentTypes['VotePowerPolicy']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  nftToken?: Resolver<Maybe<GqlResolversTypes['NftToken']>, ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['VotePowerPolicyType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteTopicResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopic'] = GqlResolversParentTypes['VoteTopic']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  gate?: Resolver<GqlResolversTypes['VoteGate'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  myBallot?: Resolver<Maybe<GqlResolversTypes['VoteBallot']>, ParentType, ContextType>;
  myEligibility?: Resolver<Maybe<GqlResolversTypes['MyVoteEligibility']>, ParentType, ContextType>;
  options?: Resolver<Array<GqlResolversTypes['VoteOption']>, ParentType, ContextType>;
  phase?: Resolver<GqlResolversTypes['VoteTopicPhase'], ParentType, ContextType>;
  powerPolicy?: Resolver<GqlResolversTypes['VotePowerPolicy'], ParentType, ContextType>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteTopicCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicCreatePayload'] = GqlResolversParentTypes['VoteTopicCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'VoteTopicCreateSuccess', ParentType, ContextType>;
}>;

export type GqlVoteTopicCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicCreateSuccess'] = GqlResolversParentTypes['VoteTopicCreateSuccess']> = ResolversObject<{
  voteTopic?: Resolver<GqlResolversTypes['VoteTopic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteTopicDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicDeletePayload'] = GqlResolversParentTypes['VoteTopicDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'VoteTopicDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlVoteTopicDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicDeleteSuccess'] = GqlResolversParentTypes['VoteTopicDeleteSuccess']> = ResolversObject<{
  voteTopicId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteTopicEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicEdge'] = GqlResolversParentTypes['VoteTopicEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<GqlResolversTypes['VoteTopic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteTopicUpdatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicUpdatePayload'] = GqlResolversParentTypes['VoteTopicUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'VoteTopicUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlVoteTopicUpdateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicUpdateSuccess'] = GqlResolversParentTypes['VoteTopicUpdateSuccess']> = ResolversObject<{
  voteTopic?: Resolver<GqlResolversTypes['VoteTopic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlVoteTopicsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['VoteTopicsConnection'] = GqlResolversParentTypes['VoteTopicsConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['VoteTopicEdge']>, ParentType, ContextType>;
  nodes?: Resolver<Array<GqlResolversTypes['VoteTopic']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Wallet'] = GqlResolversParentTypes['Wallet']> = ResolversObject<{
  accumulatedPointView?: Resolver<Maybe<GqlResolversTypes['AccumulatedPointView']>, ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  currentPointView?: Resolver<Maybe<GqlResolversTypes['CurrentPointView']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  tickets?: Resolver<Maybe<Array<GqlResolversTypes['Ticket']>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
  transactionsConnection?: Resolver<Maybe<GqlResolversTypes['TransactionsConnection']>, ParentType, ContextType, Partial<GqlWalletTransactionsConnectionArgs>>;
  type?: Resolver<GqlResolversTypes['WalletType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['WalletEdge'] = GqlResolversParentTypes['WalletEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['WalletsConnection'] = GqlResolversParentTypes['WalletsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['WalletEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlResolvers<ContextType = any> = ResolversObject<{
  AccumulatedPointView?: GqlAccumulatedPointViewResolvers<ContextType>;
  ApproveReportPayload?: GqlApproveReportPayloadResolvers<ContextType>;
  ApproveReportSuccess?: GqlApproveReportSuccessResolvers<ContextType>;
  Article?: GqlArticleResolvers<ContextType>;
  ArticleCreatePayload?: GqlArticleCreatePayloadResolvers<ContextType>;
  ArticleCreateSuccess?: GqlArticleCreateSuccessResolvers<ContextType>;
  ArticleDeletePayload?: GqlArticleDeletePayloadResolvers<ContextType>;
  ArticleDeleteSuccess?: GqlArticleDeleteSuccessResolvers<ContextType>;
  ArticleEdge?: GqlArticleEdgeResolvers<ContextType>;
  ArticleUpdateContentPayload?: GqlArticleUpdateContentPayloadResolvers<ContextType>;
  ArticleUpdateContentSuccess?: GqlArticleUpdateContentSuccessResolvers<ContextType>;
  ArticlesConnection?: GqlArticlesConnectionResolvers<ContextType>;
  BigInt?: GraphQLScalarType;
  CitiesConnection?: GqlCitiesConnectionResolvers<ContextType>;
  City?: GqlCityResolvers<ContextType>;
  CityEdge?: GqlCityEdgeResolvers<ContextType>;
  CommonDocumentOverrides?: GqlCommonDocumentOverridesResolvers<ContextType>;
  CommunitiesConnection?: GqlCommunitiesConnectionResolvers<ContextType>;
  Community?: GqlCommunityResolvers<ContextType>;
  CommunityConfig?: GqlCommunityConfigResolvers<ContextType>;
  CommunityCreatePayload?: GqlCommunityCreatePayloadResolvers<ContextType>;
  CommunityCreateSuccess?: GqlCommunityCreateSuccessResolvers<ContextType>;
  CommunityDeletePayload?: GqlCommunityDeletePayloadResolvers<ContextType>;
  CommunityDeleteSuccess?: GqlCommunityDeleteSuccessResolvers<ContextType>;
  CommunityDocument?: GqlCommunityDocumentResolvers<ContextType>;
  CommunityEdge?: GqlCommunityEdgeResolvers<ContextType>;
  CommunityFirebaseConfig?: GqlCommunityFirebaseConfigResolvers<ContextType>;
  CommunityLineConfig?: GqlCommunityLineConfigResolvers<ContextType>;
  CommunityLineRichMenuConfig?: GqlCommunityLineRichMenuConfigResolvers<ContextType>;
  CommunityPortalConfig?: GqlCommunityPortalConfigResolvers<ContextType>;
  CommunitySignupBonusConfig?: GqlCommunitySignupBonusConfigResolvers<ContextType>;
  CommunityUpdateProfilePayload?: GqlCommunityUpdateProfilePayloadResolvers<ContextType>;
  CommunityUpdateProfileSuccess?: GqlCommunityUpdateProfileSuccessResolvers<ContextType>;
  CurrentPointView?: GqlCurrentPointViewResolvers<ContextType>;
  CurrentUserPayload?: GqlCurrentUserPayloadResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  Decimal?: GraphQLScalarType;
  DidIssuanceRequest?: GqlDidIssuanceRequestResolvers<ContextType>;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Evaluation?: GqlEvaluationResolvers<ContextType>;
  EvaluationBulkCreatePayload?: GqlEvaluationBulkCreatePayloadResolvers<ContextType>;
  EvaluationBulkCreateSuccess?: GqlEvaluationBulkCreateSuccessResolvers<ContextType>;
  EvaluationEdge?: GqlEvaluationEdgeResolvers<ContextType>;
  EvaluationHistoriesConnection?: GqlEvaluationHistoriesConnectionResolvers<ContextType>;
  EvaluationHistory?: GqlEvaluationHistoryResolvers<ContextType>;
  EvaluationHistoryEdge?: GqlEvaluationHistoryEdgeResolvers<ContextType>;
  EvaluationsConnection?: GqlEvaluationsConnectionResolvers<ContextType>;
  GenerateReportPayload?: GqlGenerateReportPayloadResolvers<ContextType>;
  GenerateReportSuccess?: GqlGenerateReportSuccessResolvers<ContextType>;
  Identity?: GqlIdentityResolvers<ContextType>;
  IdentityCheckPhoneUserPayload?: GqlIdentityCheckPhoneUserPayloadResolvers<ContextType>;
  IncentiveGrant?: GqlIncentiveGrantResolvers<ContextType>;
  IncentiveGrantEdge?: GqlIncentiveGrantEdgeResolvers<ContextType>;
  IncentiveGrantRetryPayload?: GqlIncentiveGrantRetryPayloadResolvers<ContextType>;
  IncentiveGrantRetrySuccess?: GqlIncentiveGrantRetrySuccessResolvers<ContextType>;
  IncentiveGrantsConnection?: GqlIncentiveGrantsConnectionResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  LinkPhoneAuthPayload?: GqlLinkPhoneAuthPayloadResolvers<ContextType>;
  Membership?: GqlMembershipResolvers<ContextType>;
  MembershipEdge?: GqlMembershipEdgeResolvers<ContextType>;
  MembershipHistory?: GqlMembershipHistoryResolvers<ContextType>;
  MembershipInvitePayload?: GqlMembershipInvitePayloadResolvers<ContextType>;
  MembershipInviteSuccess?: GqlMembershipInviteSuccessResolvers<ContextType>;
  MembershipRemovePayload?: GqlMembershipRemovePayloadResolvers<ContextType>;
  MembershipRemoveSuccess?: GqlMembershipRemoveSuccessResolvers<ContextType>;
  MembershipSetInvitationStatusPayload?: GqlMembershipSetInvitationStatusPayloadResolvers<ContextType>;
  MembershipSetInvitationStatusSuccess?: GqlMembershipSetInvitationStatusSuccessResolvers<ContextType>;
  MembershipSetRolePayload?: GqlMembershipSetRolePayloadResolvers<ContextType>;
  MembershipSetRoleSuccess?: GqlMembershipSetRoleSuccessResolvers<ContextType>;
  MembershipWithdrawPayload?: GqlMembershipWithdrawPayloadResolvers<ContextType>;
  MembershipWithdrawSuccess?: GqlMembershipWithdrawSuccessResolvers<ContextType>;
  MembershipsConnection?: GqlMembershipsConnectionResolvers<ContextType>;
  Mutation?: GqlMutationResolvers<ContextType>;
  MyVoteEligibility?: GqlMyVoteEligibilityResolvers<ContextType>;
  NftInstance?: GqlNftInstanceResolvers<ContextType>;
  NftInstanceEdge?: GqlNftInstanceEdgeResolvers<ContextType>;
  NftInstancesConnection?: GqlNftInstancesConnectionResolvers<ContextType>;
  NftToken?: GqlNftTokenResolvers<ContextType>;
  NftTokenEdge?: GqlNftTokenEdgeResolvers<ContextType>;
  NftTokensConnection?: GqlNftTokensConnectionResolvers<ContextType>;
  NftWallet?: GqlNftWalletResolvers<ContextType>;
  OpportunitiesConnection?: GqlOpportunitiesConnectionResolvers<ContextType>;
  Opportunity?: GqlOpportunityResolvers<ContextType>;
  OpportunityCreatePayload?: GqlOpportunityCreatePayloadResolvers<ContextType>;
  OpportunityCreateSuccess?: GqlOpportunityCreateSuccessResolvers<ContextType>;
  OpportunityDeletePayload?: GqlOpportunityDeletePayloadResolvers<ContextType>;
  OpportunityDeleteSuccess?: GqlOpportunityDeleteSuccessResolvers<ContextType>;
  OpportunityEdge?: GqlOpportunityEdgeResolvers<ContextType>;
  OpportunitySetPublishStatusPayload?: GqlOpportunitySetPublishStatusPayloadResolvers<ContextType>;
  OpportunitySetPublishStatusSuccess?: GqlOpportunitySetPublishStatusSuccessResolvers<ContextType>;
  OpportunitySlot?: GqlOpportunitySlotResolvers<ContextType>;
  OpportunitySlotCreatePayload?: GqlOpportunitySlotCreatePayloadResolvers<ContextType>;
  OpportunitySlotCreateSuccess?: GqlOpportunitySlotCreateSuccessResolvers<ContextType>;
  OpportunitySlotEdge?: GqlOpportunitySlotEdgeResolvers<ContextType>;
  OpportunitySlotSetHostingStatusPayload?: GqlOpportunitySlotSetHostingStatusPayloadResolvers<ContextType>;
  OpportunitySlotSetHostingStatusSuccess?: GqlOpportunitySlotSetHostingStatusSuccessResolvers<ContextType>;
  OpportunitySlotsBulkUpdatePayload?: GqlOpportunitySlotsBulkUpdatePayloadResolvers<ContextType>;
  OpportunitySlotsBulkUpdateSuccess?: GqlOpportunitySlotsBulkUpdateSuccessResolvers<ContextType>;
  OpportunitySlotsConnection?: GqlOpportunitySlotsConnectionResolvers<ContextType>;
  OpportunityUpdateContentPayload?: GqlOpportunityUpdateContentPayloadResolvers<ContextType>;
  OpportunityUpdateContentSuccess?: GqlOpportunityUpdateContentSuccessResolvers<ContextType>;
  PageInfo?: GqlPageInfoResolvers<ContextType>;
  Paging?: GqlPagingResolvers<ContextType>;
  Participation?: GqlParticipationResolvers<ContextType>;
  ParticipationBulkCreatePayload?: GqlParticipationBulkCreatePayloadResolvers<ContextType>;
  ParticipationBulkCreateSuccess?: GqlParticipationBulkCreateSuccessResolvers<ContextType>;
  ParticipationCreatePersonalRecordPayload?: GqlParticipationCreatePersonalRecordPayloadResolvers<ContextType>;
  ParticipationCreatePersonalRecordSuccess?: GqlParticipationCreatePersonalRecordSuccessResolvers<ContextType>;
  ParticipationDeletePayload?: GqlParticipationDeletePayloadResolvers<ContextType>;
  ParticipationDeleteSuccess?: GqlParticipationDeleteSuccessResolvers<ContextType>;
  ParticipationEdge?: GqlParticipationEdgeResolvers<ContextType>;
  ParticipationStatusHistoriesConnection?: GqlParticipationStatusHistoriesConnectionResolvers<ContextType>;
  ParticipationStatusHistory?: GqlParticipationStatusHistoryResolvers<ContextType>;
  ParticipationStatusHistoryEdge?: GqlParticipationStatusHistoryEdgeResolvers<ContextType>;
  ParticipationsConnection?: GqlParticipationsConnectionResolvers<ContextType>;
  Place?: GqlPlaceResolvers<ContextType>;
  PlaceCreatePayload?: GqlPlaceCreatePayloadResolvers<ContextType>;
  PlaceCreateSuccess?: GqlPlaceCreateSuccessResolvers<ContextType>;
  PlaceDeletePayload?: GqlPlaceDeletePayloadResolvers<ContextType>;
  PlaceDeleteSuccess?: GqlPlaceDeleteSuccessResolvers<ContextType>;
  PlaceEdge?: GqlPlaceEdgeResolvers<ContextType>;
  PlaceUpdatePayload?: GqlPlaceUpdatePayloadResolvers<ContextType>;
  PlaceUpdateSuccess?: GqlPlaceUpdateSuccessResolvers<ContextType>;
  PlacesConnection?: GqlPlacesConnectionResolvers<ContextType>;
  Portfolio?: GqlPortfolioResolvers<ContextType>;
  PortfolioEdge?: GqlPortfolioEdgeResolvers<ContextType>;
  PortfoliosConnection?: GqlPortfoliosConnectionResolvers<ContextType>;
  PublishReportPayload?: GqlPublishReportPayloadResolvers<ContextType>;
  PublishReportSuccess?: GqlPublishReportSuccessResolvers<ContextType>;
  Query?: GqlQueryResolvers<ContextType>;
  RejectReportPayload?: GqlRejectReportPayloadResolvers<ContextType>;
  RejectReportSuccess?: GqlRejectReportSuccessResolvers<ContextType>;
  Report?: GqlReportResolvers<ContextType>;
  ReportEdge?: GqlReportEdgeResolvers<ContextType>;
  ReportFeedback?: GqlReportFeedbackResolvers<ContextType>;
  ReportFeedbackEdge?: GqlReportFeedbackEdgeResolvers<ContextType>;
  ReportFeedbacksConnection?: GqlReportFeedbacksConnectionResolvers<ContextType>;
  ReportTemplate?: GqlReportTemplateResolvers<ContextType>;
  ReportTemplateStats?: GqlReportTemplateStatsResolvers<ContextType>;
  ReportsConnection?: GqlReportsConnectionResolvers<ContextType>;
  Reservation?: GqlReservationResolvers<ContextType>;
  ReservationCreatePayload?: GqlReservationCreatePayloadResolvers<ContextType>;
  ReservationCreateSuccess?: GqlReservationCreateSuccessResolvers<ContextType>;
  ReservationEdge?: GqlReservationEdgeResolvers<ContextType>;
  ReservationHistoriesConnection?: GqlReservationHistoriesConnectionResolvers<ContextType>;
  ReservationHistory?: GqlReservationHistoryResolvers<ContextType>;
  ReservationHistoryEdge?: GqlReservationHistoryEdgeResolvers<ContextType>;
  ReservationSetStatusPayload?: GqlReservationSetStatusPayloadResolvers<ContextType>;
  ReservationSetStatusSuccess?: GqlReservationSetStatusSuccessResolvers<ContextType>;
  ReservationsConnection?: GqlReservationsConnectionResolvers<ContextType>;
  State?: GqlStateResolvers<ContextType>;
  StateEdge?: GqlStateEdgeResolvers<ContextType>;
  StatesConnection?: GqlStatesConnectionResolvers<ContextType>;
  StorePhoneAuthTokenPayload?: GqlStorePhoneAuthTokenPayloadResolvers<ContextType>;
  SubmitReportFeedbackPayload?: GqlSubmitReportFeedbackPayloadResolvers<ContextType>;
  SubmitReportFeedbackSuccess?: GqlSubmitReportFeedbackSuccessResolvers<ContextType>;
  SysAdminChainDepthBucket?: GqlSysAdminChainDepthBucketResolvers<ContextType>;
  SysAdminCohortRetentionPoint?: GqlSysAdminCohortRetentionPointResolvers<ContextType>;
  SysAdminCommunityAlerts?: GqlSysAdminCommunityAlertsResolvers<ContextType>;
  SysAdminCommunityDetailPayload?: GqlSysAdminCommunityDetailPayloadResolvers<ContextType>;
  SysAdminCommunityOverview?: GqlSysAdminCommunityOverviewResolvers<ContextType>;
  SysAdminCommunitySummaryCard?: GqlSysAdminCommunitySummaryCardResolvers<ContextType>;
  SysAdminDashboardPayload?: GqlSysAdminDashboardPayloadResolvers<ContextType>;
  SysAdminLatestCohort?: GqlSysAdminLatestCohortResolvers<ContextType>;
  SysAdminMemberList?: GqlSysAdminMemberListResolvers<ContextType>;
  SysAdminMemberRow?: GqlSysAdminMemberRowResolvers<ContextType>;
  SysAdminMonthlyActivityPoint?: GqlSysAdminMonthlyActivityPointResolvers<ContextType>;
  SysAdminPlatformSummary?: GqlSysAdminPlatformSummaryResolvers<ContextType>;
  SysAdminRetentionTrendPoint?: GqlSysAdminRetentionTrendPointResolvers<ContextType>;
  SysAdminSegmentCounts?: GqlSysAdminSegmentCountsResolvers<ContextType>;
  SysAdminStageBucket?: GqlSysAdminStageBucketResolvers<ContextType>;
  SysAdminStageDistribution?: GqlSysAdminStageDistributionResolvers<ContextType>;
  SysAdminTenureDistribution?: GqlSysAdminTenureDistributionResolvers<ContextType>;
  SysAdminTenureHistogramBucket?: GqlSysAdminTenureHistogramBucketResolvers<ContextType>;
  SysAdminWeeklyRetention?: GqlSysAdminWeeklyRetentionResolvers<ContextType>;
  SysAdminWindowActivity?: GqlSysAdminWindowActivityResolvers<ContextType>;
  Ticket?: GqlTicketResolvers<ContextType>;
  TicketClaimLink?: GqlTicketClaimLinkResolvers<ContextType>;
  TicketClaimLinkEdge?: GqlTicketClaimLinkEdgeResolvers<ContextType>;
  TicketClaimLinksConnection?: GqlTicketClaimLinksConnectionResolvers<ContextType>;
  TicketClaimPayload?: GqlTicketClaimPayloadResolvers<ContextType>;
  TicketClaimSuccess?: GqlTicketClaimSuccessResolvers<ContextType>;
  TicketEdge?: GqlTicketEdgeResolvers<ContextType>;
  TicketIssuePayload?: GqlTicketIssuePayloadResolvers<ContextType>;
  TicketIssueSuccess?: GqlTicketIssueSuccessResolvers<ContextType>;
  TicketIssuer?: GqlTicketIssuerResolvers<ContextType>;
  TicketIssuerEdge?: GqlTicketIssuerEdgeResolvers<ContextType>;
  TicketIssuersConnection?: GqlTicketIssuersConnectionResolvers<ContextType>;
  TicketPurchasePayload?: GqlTicketPurchasePayloadResolvers<ContextType>;
  TicketPurchaseSuccess?: GqlTicketPurchaseSuccessResolvers<ContextType>;
  TicketRefundPayload?: GqlTicketRefundPayloadResolvers<ContextType>;
  TicketRefundSuccess?: GqlTicketRefundSuccessResolvers<ContextType>;
  TicketStatusHistoriesConnection?: GqlTicketStatusHistoriesConnectionResolvers<ContextType>;
  TicketStatusHistory?: GqlTicketStatusHistoryResolvers<ContextType>;
  TicketStatusHistoryEdge?: GqlTicketStatusHistoryEdgeResolvers<ContextType>;
  TicketUsePayload?: GqlTicketUsePayloadResolvers<ContextType>;
  TicketUseSuccess?: GqlTicketUseSuccessResolvers<ContextType>;
  TicketsConnection?: GqlTicketsConnectionResolvers<ContextType>;
  Transaction?: GqlTransactionResolvers<ContextType>;
  TransactionChain?: GqlTransactionChainResolvers<ContextType>;
  TransactionChainCommunity?: GqlTransactionChainCommunityResolvers<ContextType>;
  TransactionChainParticipant?: GqlTransactionChainParticipantResolvers<ContextType>;
  TransactionChainStep?: GqlTransactionChainStepResolvers<ContextType>;
  TransactionChainUser?: GqlTransactionChainUserResolvers<ContextType>;
  TransactionDonateSelfPointPayload?: GqlTransactionDonateSelfPointPayloadResolvers<ContextType>;
  TransactionDonateSelfPointSuccess?: GqlTransactionDonateSelfPointSuccessResolvers<ContextType>;
  TransactionEdge?: GqlTransactionEdgeResolvers<ContextType>;
  TransactionGrantCommunityPointPayload?: GqlTransactionGrantCommunityPointPayloadResolvers<ContextType>;
  TransactionGrantCommunityPointSuccess?: GqlTransactionGrantCommunityPointSuccessResolvers<ContextType>;
  TransactionIssueCommunityPointPayload?: GqlTransactionIssueCommunityPointPayloadResolvers<ContextType>;
  TransactionIssueCommunityPointSuccess?: GqlTransactionIssueCommunityPointSuccessResolvers<ContextType>;
  TransactionUpdateMetadataPayload?: GqlTransactionUpdateMetadataPayloadResolvers<ContextType>;
  TransactionUpdateMetadataSuccess?: GqlTransactionUpdateMetadataSuccessResolvers<ContextType>;
  TransactionVerificationResult?: GqlTransactionVerificationResultResolvers<ContextType>;
  TransactionsConnection?: GqlTransactionsConnectionResolvers<ContextType>;
  UpdateReportTemplatePayload?: GqlUpdateReportTemplatePayloadResolvers<ContextType>;
  UpdateReportTemplateSuccess?: GqlUpdateReportTemplateSuccessResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  User?: GqlUserResolvers<ContextType>;
  UserDeletePayload?: GqlUserDeletePayloadResolvers<ContextType>;
  UserEdge?: GqlUserEdgeResolvers<ContextType>;
  UserUpdateProfilePayload?: GqlUserUpdateProfilePayloadResolvers<ContextType>;
  UserUpdateProfileSuccess?: GqlUserUpdateProfileSuccessResolvers<ContextType>;
  UsersConnection?: GqlUsersConnectionResolvers<ContextType>;
  UtilitiesConnection?: GqlUtilitiesConnectionResolvers<ContextType>;
  Utility?: GqlUtilityResolvers<ContextType>;
  UtilityCreatePayload?: GqlUtilityCreatePayloadResolvers<ContextType>;
  UtilityCreateSuccess?: GqlUtilityCreateSuccessResolvers<ContextType>;
  UtilityDeletePayload?: GqlUtilityDeletePayloadResolvers<ContextType>;
  UtilityDeleteSuccess?: GqlUtilityDeleteSuccessResolvers<ContextType>;
  UtilityEdge?: GqlUtilityEdgeResolvers<ContextType>;
  UtilitySetPublishStatusPayload?: GqlUtilitySetPublishStatusPayloadResolvers<ContextType>;
  UtilitySetPublishStatusSuccess?: GqlUtilitySetPublishStatusSuccessResolvers<ContextType>;
  UtilityUpdateInfoPayload?: GqlUtilityUpdateInfoPayloadResolvers<ContextType>;
  UtilityUpdateInfoSuccess?: GqlUtilityUpdateInfoSuccessResolvers<ContextType>;
  VcIssuanceRequest?: GqlVcIssuanceRequestResolvers<ContextType>;
  VcIssuanceRequestEdge?: GqlVcIssuanceRequestEdgeResolvers<ContextType>;
  VcIssuanceRequestsConnection?: GqlVcIssuanceRequestsConnectionResolvers<ContextType>;
  VoteBallot?: GqlVoteBallotResolvers<ContextType>;
  VoteCastPayload?: GqlVoteCastPayloadResolvers<ContextType>;
  VoteCastSuccess?: GqlVoteCastSuccessResolvers<ContextType>;
  VoteGate?: GqlVoteGateResolvers<ContextType>;
  VoteOption?: GqlVoteOptionResolvers<ContextType>;
  VotePowerPolicy?: GqlVotePowerPolicyResolvers<ContextType>;
  VoteTopic?: GqlVoteTopicResolvers<ContextType>;
  VoteTopicCreatePayload?: GqlVoteTopicCreatePayloadResolvers<ContextType>;
  VoteTopicCreateSuccess?: GqlVoteTopicCreateSuccessResolvers<ContextType>;
  VoteTopicDeletePayload?: GqlVoteTopicDeletePayloadResolvers<ContextType>;
  VoteTopicDeleteSuccess?: GqlVoteTopicDeleteSuccessResolvers<ContextType>;
  VoteTopicEdge?: GqlVoteTopicEdgeResolvers<ContextType>;
  VoteTopicUpdatePayload?: GqlVoteTopicUpdatePayloadResolvers<ContextType>;
  VoteTopicUpdateSuccess?: GqlVoteTopicUpdateSuccessResolvers<ContextType>;
  VoteTopicsConnection?: GqlVoteTopicsConnectionResolvers<ContextType>;
  Wallet?: GqlWalletResolvers<ContextType>;
  WalletEdge?: GqlWalletEdgeResolvers<ContextType>;
  WalletsConnection?: GqlWalletsConnectionResolvers<ContextType>;
}>;

export type GqlDirectiveResolvers<ContextType = any> = ResolversObject<{
  authz?: GqlAuthzDirectiveResolver<any, any, ContextType>;
  requireRole?: GqlRequireRoleDirectiveResolver<any, any, ContextType>;
}>;

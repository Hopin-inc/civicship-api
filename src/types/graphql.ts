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
  CanReadPhoneNumber: 'CanReadPhoneNumber',
  IsAdmin: 'IsAdmin',
  IsCommunityManager: 'IsCommunityManager',
  IsCommunityMember: 'IsCommunityMember',
  IsCommunityOwner: 'IsCommunityOwner',
  IsOpportunityOwner: 'IsOpportunityOwner',
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
};

export type GqlCommunityConfigInput = {
  firebaseConfig?: InputMaybe<GqlCommunityFirebaseConfigInput>;
  lineConfig?: InputMaybe<GqlCommunityLineConfigInput>;
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

export type GqlCommunityFirebaseConfigInput = {
  tenantId: Scalars['String']['input'];
};

export type GqlCommunityLineConfig = {
  __typename?: 'CommunityLineConfig';
  accessToken?: Maybe<Scalars['String']['output']>;
  channelId?: Maybe<Scalars['String']['output']>;
  channelSecret?: Maybe<Scalars['String']['output']>;
  liffBaseUrl?: Maybe<Scalars['String']['output']>;
  liffId?: Maybe<Scalars['String']['output']>;
  richMenus?: Maybe<Array<GqlCommunityLineRichMenuConfig>>;
};

export type GqlCommunityLineConfigInput = {
  accessToken: Scalars['String']['input'];
  channelId: Scalars['String']['input'];
  channelSecret: Scalars['String']['input'];
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
  Forbidden: 'FORBIDDEN',
  InsufficientBalance: 'INSUFFICIENT_BALANCE',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
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
  UnsupportedTransactionReason: 'UNSUPPORTED_TRANSACTION_REASON',
  ValidationError: 'VALIDATION_ERROR'
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

export type GqlIdentity = {
  __typename?: 'Identity';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  platform?: Maybe<GqlIdentityPlatform>;
  uid: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlIdentityCheckPhoneUserInput = {
  communityId: Scalars['ID']['input'];
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
  file: Scalars['Upload']['input'];
};

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
  hostOpportunityCount?: Maybe<Scalars['Int']['output']>;
  participationView?: Maybe<GqlMembershipParticipationView>;
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
  role?: InputMaybe<GqlRole>;
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

export type GqlMembershipHostedMetrics = {
  __typename?: 'MembershipHostedMetrics';
  geo: Array<GqlMembershipParticipationLocation>;
  totalParticipantCount: Scalars['Int']['output'];
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

export type GqlMembershipParticipatedMetrics = {
  __typename?: 'MembershipParticipatedMetrics';
  geo?: Maybe<Array<GqlMembershipParticipationLocation>>;
  totalParticipatedCount: Scalars['Int']['output'];
};

export type GqlMembershipParticipationLocation = {
  __typename?: 'MembershipParticipationLocation';
  address: Scalars['String']['output'];
  latitude: Scalars['Decimal']['output'];
  longitude: Scalars['Decimal']['output'];
  placeId: Scalars['ID']['output'];
  placeImage?: Maybe<Scalars['String']['output']>;
  placeName?: Maybe<Scalars['String']['output']>;
};

export type GqlMembershipParticipationView = {
  __typename?: 'MembershipParticipationView';
  hosted: GqlMembershipHostedMetrics;
  participated?: Maybe<GqlMembershipParticipatedMetrics>;
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
  articleCreate?: Maybe<GqlArticleCreatePayload>;
  articleDelete?: Maybe<GqlArticleDeletePayload>;
  articleUpdateContent?: Maybe<GqlArticleUpdateContentPayload>;
  communityCreate?: Maybe<GqlCommunityCreatePayload>;
  communityDelete?: Maybe<GqlCommunityDeletePayload>;
  communityUpdateProfile?: Maybe<GqlCommunityUpdateProfilePayload>;
  evaluationBulkCreate?: Maybe<GqlEvaluationBulkCreatePayload>;
  identityCheckPhoneUser: GqlIdentityCheckPhoneUserPayload;
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
  reservationAccept?: Maybe<GqlReservationSetStatusPayload>;
  reservationCancel?: Maybe<GqlReservationSetStatusPayload>;
  reservationCreate?: Maybe<GqlReservationCreatePayload>;
  reservationJoin?: Maybe<GqlReservationSetStatusPayload>;
  reservationReject?: Maybe<GqlReservationSetStatusPayload>;
  storePhoneAuthToken?: Maybe<GqlStorePhoneAuthTokenPayload>;
  ticketClaim?: Maybe<GqlTicketClaimPayload>;
  ticketIssue?: Maybe<GqlTicketIssuePayload>;
  ticketPurchase?: Maybe<GqlTicketPurchasePayload>;
  ticketRefund?: Maybe<GqlTicketRefundPayload>;
  ticketUse?: Maybe<GqlTicketUsePayload>;
  transactionDonateSelfPoint?: Maybe<GqlTransactionDonateSelfPointPayload>;
  transactionGrantCommunityPoint?: Maybe<GqlTransactionGrantCommunityPointPayload>;
  transactionIssueCommunityPoint?: Maybe<GqlTransactionIssueCommunityPointPayload>;
  userDeleteMe?: Maybe<GqlUserDeletePayload>;
  userSignUp?: Maybe<GqlCurrentUserPayload>;
  userUpdateMyProfile?: Maybe<GqlUserUpdateProfilePayload>;
  utilityCreate?: Maybe<GqlUtilityCreatePayload>;
  utilityDelete?: Maybe<GqlUtilityDeletePayload>;
  utilitySetPublishStatus?: Maybe<GqlUtilitySetPublishStatusPayload>;
  utilityUpdateInfo?: Maybe<GqlUtilityUpdateInfoPayload>;
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


export type GqlMutationIdentityCheckPhoneUserArgs = {
  input: GqlIdentityCheckPhoneUserInput;
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
  permission: GqlCheckCommunityPermissionInput;
};


export type GqlMutationOpportunitySetPublishStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunitySetPublishStatusInput;
  permission: GqlCheckCommunityPermissionInput;
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
  permission: GqlCheckCommunityPermissionInput;
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

export type GqlNftWallet = {
  __typename?: 'NftWallet';
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
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
  description: Scalars['String']['input'];
  feeRequired?: InputMaybe<Scalars['Int']['input']>;
  images?: InputMaybe<Array<GqlImageInput>>;
  placeId?: InputMaybe<Scalars['ID']['input']>;
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
  currentUser?: Maybe<GqlCurrentUserPayload>;
  echo: Scalars['String']['output'];
  evaluation?: Maybe<GqlEvaluation>;
  evaluationHistories: GqlEvaluationHistoriesConnection;
  evaluationHistory?: Maybe<GqlEvaluationHistory>;
  evaluations: GqlEvaluationsConnection;
  membership?: Maybe<GqlMembership>;
  memberships: GqlMembershipsConnection;
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
  reservation?: Maybe<GqlReservation>;
  reservationHistories: GqlReservationHistoriesConnection;
  reservationHistory?: Maybe<GqlReservationHistory>;
  reservations: GqlReservationsConnection;
  states: GqlStatesConnection;
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


export type GqlQueryStatesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlStatesInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
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


export type GqlQueryWalletArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryWalletsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlWalletFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlWalletSortInput>;
};

export type GqlReservation = {
  __typename?: 'Reservation';
  comment?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  histories?: Maybe<Array<GqlReservationHistory>>;
  id: Scalars['ID']['output'];
  opportunitySlot?: Maybe<GqlOpportunitySlot>;
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
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  createdByUser?: Maybe<GqlUser>;
  fromPointChange?: Maybe<Scalars['Int']['output']>;
  fromWallet?: Maybe<GqlWallet>;
  id: Scalars['ID']['output'];
  participation?: Maybe<GqlParticipation>;
  reason: GqlTransactionReason;
  ticketStatusHistories?: Maybe<Array<GqlTicketStatusHistory>>;
  toPointChange?: Maybe<Scalars['Int']['output']>;
  toWallet?: Maybe<GqlWallet>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlTransactionDonateSelfPointInput = {
  communityId: Scalars['ID']['input'];
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
  toUserId: Scalars['ID']['input'];
  transferPoints: Scalars['Int']['input'];
};

export type GqlTransactionGrantCommunityPointPayload = GqlTransactionGrantCommunityPointSuccess;

export type GqlTransactionGrantCommunityPointSuccess = {
  __typename?: 'TransactionGrantCommunityPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionIssueCommunityPointInput = {
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
  PointIssued: 'POINT_ISSUED',
  PointReward: 'POINT_REWARD',
  TicketPurchased: 'TICKET_PURCHASED',
  TicketRefunded: 'TICKET_REFUNDED'
} as const;

export type GqlTransactionReason = typeof GqlTransactionReason[keyof typeof GqlTransactionReason];
export type GqlTransactionSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTransactionsConnection = {
  __typename?: 'TransactionsConnection';
  edges?: Maybe<Array<Maybe<GqlTransactionEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
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
  nftWallet?: Maybe<GqlNftWallet>;
  opportunitiesCreatedByMe?: Maybe<Array<GqlOpportunity>>;
  participationStatusChangedByMe?: Maybe<Array<GqlParticipationStatusHistory>>;
  participations?: Maybe<Array<GqlParticipation>>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  portfolios?: Maybe<Array<GqlPortfolio>>;
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
  communityId: Scalars['ID']['input'];
  currentPrefecture: GqlCurrentPrefecture;
  image?: InputMaybe<GqlImageInput>;
  lineRefreshToken?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  phoneRefreshToken?: InputMaybe<Scalars['String']['input']>;
  phoneUid?: InputMaybe<Scalars['String']['input']>;
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
export type GqlWallet = {
  __typename?: 'Wallet';
  accumulatedPointView?: Maybe<GqlAccumulatedPointView>;
  community?: Maybe<GqlCommunity>;
  createdAt?: Maybe<Scalars['Datetime']['output']>;
  currentPointView?: Maybe<GqlCurrentPointView>;
  id: Scalars['ID']['output'];
  tickets?: Maybe<Array<GqlTicket>>;
  transactions?: Maybe<Array<GqlTransaction>>;
  type: GqlWalletType;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
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
  ArticleCreatePayload: ( Omit<GqlArticleCreateSuccess, 'article'> & { article: _RefType['Article'] } );
  ArticleDeletePayload: ( GqlArticleDeleteSuccess );
  ArticleUpdateContentPayload: ( Omit<GqlArticleUpdateContentSuccess, 'article'> & { article: _RefType['Article'] } );
  CommunityCreatePayload: ( Omit<GqlCommunityCreateSuccess, 'community'> & { community: _RefType['Community'] } );
  CommunityDeletePayload: ( GqlCommunityDeleteSuccess );
  CommunityUpdateProfilePayload: ( Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: _RefType['Community'] } );
  EvaluationBulkCreatePayload: ( Omit<GqlEvaluationBulkCreateSuccess, 'evaluations'> & { evaluations: Array<_RefType['Evaluation']> } );
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
  ReservationCreatePayload: ( Omit<GqlReservationCreateSuccess, 'reservation'> & { reservation: _RefType['Reservation'] } );
  ReservationSetStatusPayload: ( Omit<GqlReservationSetStatusSuccess, 'reservation'> & { reservation: _RefType['Reservation'] } );
  TicketClaimPayload: ( Omit<GqlTicketClaimSuccess, 'tickets'> & { tickets: Array<_RefType['Ticket']> } );
  TicketIssuePayload: ( Omit<GqlTicketIssueSuccess, 'issue'> & { issue: _RefType['TicketIssuer'] } );
  TicketPurchasePayload: ( Omit<GqlTicketPurchaseSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TicketRefundPayload: ( Omit<GqlTicketRefundSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TicketUsePayload: ( Omit<GqlTicketUseSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TransactionDonateSelfPointPayload: ( Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionGrantCommunityPointPayload: ( Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionIssueCommunityPointPayload: ( Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UserUpdateProfilePayload: ( Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UtilityCreatePayload: ( Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityDeletePayload: ( GqlUtilityDeleteSuccess );
  UtilitySetPublishStatusPayload: ( Omit<GqlUtilitySetPublishStatusSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityUpdateInfoPayload: ( Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: _RefType['Utility'] } );
}>;

/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlArticleEdge, 'node'> & { node?: Maybe<_RefType['Article']> } ) | ( Omit<GqlCityEdge, 'node'> & { node?: Maybe<_RefType['City']> } ) | ( Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<_RefType['Community']> } ) | ( Omit<GqlEvaluationEdge, 'node'> & { node?: Maybe<_RefType['Evaluation']> } ) | ( Omit<GqlEvaluationHistoryEdge, 'node'> & { node?: Maybe<_RefType['EvaluationHistory']> } ) | ( Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<_RefType['Membership']> } ) | ( Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<_RefType['Opportunity']> } ) | ( Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<_RefType['OpportunitySlot']> } ) | ( Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<_RefType['Participation']> } ) | ( Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['ParticipationStatusHistory']> } ) | ( Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<_RefType['Place']> } ) | ( Omit<GqlPortfolioEdge, 'node'> & { node?: Maybe<_RefType['Portfolio']> } ) | ( Omit<GqlReservationEdge, 'node'> & { node?: Maybe<_RefType['Reservation']> } ) | ( Omit<GqlReservationHistoryEdge, 'node'> & { node?: Maybe<_RefType['ReservationHistory']> } ) | ( Omit<GqlStateEdge, 'node'> & { node?: Maybe<_RefType['State']> } ) | ( Omit<GqlTicketClaimLinkEdge, 'node'> & { node?: Maybe<_RefType['TicketClaimLink']> } ) | ( Omit<GqlTicketEdge, 'node'> & { node?: Maybe<_RefType['Ticket']> } ) | ( Omit<GqlTicketIssuerEdge, 'node'> & { node?: Maybe<_RefType['TicketIssuer']> } ) | ( Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['TicketStatusHistory']> } ) | ( Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<_RefType['Transaction']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } ) | ( Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<_RefType['Utility']> } ) | ( Omit<GqlVcIssuanceRequestEdge, 'node'> & { node?: Maybe<_RefType['VcIssuanceRequest']> } ) | ( Omit<GqlWalletEdge, 'node'> & { node?: Maybe<_RefType['Wallet']> } );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  AccumulatedPointView: ResolverTypeWrapper<AccumulatedPointView>;
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
  City: ResolverTypeWrapper<City>;
  CityEdge: ResolverTypeWrapper<Omit<GqlCityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['City']> }>;
  ClaimLinkStatus: GqlClaimLinkStatus;
  CommunitiesConnection: ResolverTypeWrapper<Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<GqlResolversTypes['CommunityEdge']>> }>;
  Community: ResolverTypeWrapper<Community>;
  CommunityConfig: ResolverTypeWrapper<GqlCommunityConfig>;
  CommunityConfigInput: GqlCommunityConfigInput;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityCreatePayload']>;
  CommunityCreateSuccess: ResolverTypeWrapper<Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CommunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityDeletePayload']>;
  CommunityDeleteSuccess: ResolverTypeWrapper<GqlCommunityDeleteSuccess>;
  CommunityEdge: ResolverTypeWrapper<Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Community']> }>;
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunityFirebaseConfig: ResolverTypeWrapper<GqlCommunityFirebaseConfig>;
  CommunityFirebaseConfigInput: GqlCommunityFirebaseConfigInput;
  CommunityLineConfig: ResolverTypeWrapper<GqlCommunityLineConfig>;
  CommunityLineConfigInput: GqlCommunityLineConfigInput;
  CommunityLineRichMenuConfig: ResolverTypeWrapper<GqlCommunityLineRichMenuConfig>;
  CommunityLineRichMenuConfigInput: GqlCommunityLineRichMenuConfigInput;
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
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Identity: ResolverTypeWrapper<Omit<GqlIdentity, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  IdentityCheckPhoneUserInput: GqlIdentityCheckPhoneUserInput;
  IdentityCheckPhoneUserPayload: ResolverTypeWrapper<Omit<GqlIdentityCheckPhoneUserPayload, 'membership' | 'user'> & { membership?: Maybe<GqlResolversTypes['Membership']>, user?: Maybe<GqlResolversTypes['User']> }>;
  IdentityPlatform: GqlIdentityPlatform;
  ImageInput: GqlImageInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  LineRichMenuType: GqlLineRichMenuType;
  LinkPhoneAuthInput: GqlLinkPhoneAuthInput;
  LinkPhoneAuthPayload: ResolverTypeWrapper<Omit<GqlLinkPhoneAuthPayload, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  Membership: ResolverTypeWrapper<Membership>;
  MembershipCursorInput: GqlMembershipCursorInput;
  MembershipEdge: ResolverTypeWrapper<Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Membership']> }>;
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipHistory: ResolverTypeWrapper<MembershipHistory>;
  MembershipHostedMetrics: ResolverTypeWrapper<GqlMembershipHostedMetrics>;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipInvitePayload']>;
  MembershipInviteSuccess: ResolverTypeWrapper<Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipParticipatedMetrics: ResolverTypeWrapper<GqlMembershipParticipatedMetrics>;
  MembershipParticipationLocation: ResolverTypeWrapper<GqlMembershipParticipationLocation>;
  MembershipParticipationView: ResolverTypeWrapper<GqlMembershipParticipationView>;
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
  NestedPlaceConnectOrCreateInput: GqlNestedPlaceConnectOrCreateInput;
  NestedPlaceCreateInput: GqlNestedPlaceCreateInput;
  NestedPlacesBulkConnectOrCreateInput: GqlNestedPlacesBulkConnectOrCreateInput;
  NestedPlacesBulkUpdateInput: GqlNestedPlacesBulkUpdateInput;
  NftWallet: ResolverTypeWrapper<GqlNftWallet>;
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
  PublishStatus: GqlPublishStatus;
  Query: ResolverTypeWrapper<{}>;
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
  TransactionsConnection: ResolverTypeWrapper<Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>> }>;
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
  City: City;
  CityEdge: Omit<GqlCityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['City']> };
  CommunitiesConnection: Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<GqlResolversParentTypes['CommunityEdge']>> };
  Community: Community;
  CommunityConfig: GqlCommunityConfig;
  CommunityConfigInput: GqlCommunityConfigInput;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityCreatePayload'];
  CommunityCreateSuccess: Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CommunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityDeletePayload'];
  CommunityDeleteSuccess: GqlCommunityDeleteSuccess;
  CommunityEdge: Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Community']> };
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunityFirebaseConfig: GqlCommunityFirebaseConfig;
  CommunityFirebaseConfigInput: GqlCommunityFirebaseConfigInput;
  CommunityLineConfig: GqlCommunityLineConfig;
  CommunityLineConfigInput: GqlCommunityLineConfigInput;
  CommunityLineRichMenuConfig: GqlCommunityLineRichMenuConfig;
  CommunityLineRichMenuConfigInput: GqlCommunityLineRichMenuConfigInput;
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
  ID: Scalars['ID']['output'];
  Identity: Omit<GqlIdentity, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  IdentityCheckPhoneUserInput: GqlIdentityCheckPhoneUserInput;
  IdentityCheckPhoneUserPayload: Omit<GqlIdentityCheckPhoneUserPayload, 'membership' | 'user'> & { membership?: Maybe<GqlResolversParentTypes['Membership']>, user?: Maybe<GqlResolversParentTypes['User']> };
  ImageInput: GqlImageInput;
  Int: Scalars['Int']['output'];
  JSON: Scalars['JSON']['output'];
  LinkPhoneAuthInput: GqlLinkPhoneAuthInput;
  LinkPhoneAuthPayload: Omit<GqlLinkPhoneAuthPayload, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  Membership: Membership;
  MembershipCursorInput: GqlMembershipCursorInput;
  MembershipEdge: Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Membership']> };
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipHistory: MembershipHistory;
  MembershipHostedMetrics: GqlMembershipHostedMetrics;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipInvitePayload'];
  MembershipInviteSuccess: Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipParticipatedMetrics: GqlMembershipParticipatedMetrics;
  MembershipParticipationLocation: GqlMembershipParticipationLocation;
  MembershipParticipationView: GqlMembershipParticipationView;
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
  NestedPlaceConnectOrCreateInput: GqlNestedPlaceConnectOrCreateInput;
  NestedPlaceCreateInput: GqlNestedPlaceCreateInput;
  NestedPlacesBulkConnectOrCreateInput: GqlNestedPlacesBulkConnectOrCreateInput;
  NestedPlacesBulkUpdateInput: GqlNestedPlacesBulkUpdateInput;
  NftWallet: GqlNftWallet;
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
  Query: {};
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
  TransactionsConnection: Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TransactionEdge']>>> };
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
  __resolveType: TypeResolveFn<'ArticleEdge' | 'CityEdge' | 'CommunityEdge' | 'EvaluationEdge' | 'EvaluationHistoryEdge' | 'MembershipEdge' | 'OpportunityEdge' | 'OpportunitySlotEdge' | 'ParticipationEdge' | 'ParticipationStatusHistoryEdge' | 'PlaceEdge' | 'PortfolioEdge' | 'ReservationEdge' | 'ReservationHistoryEdge' | 'StateEdge' | 'TicketClaimLinkEdge' | 'TicketEdge' | 'TicketIssuerEdge' | 'TicketStatusHistoryEdge' | 'TransactionEdge' | 'UserEdge' | 'UtilityEdge' | 'VcIssuanceRequestEdge' | 'WalletEdge', ParentType, ContextType>;
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
  hostOpportunityCount?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  participationView?: Resolver<Maybe<GqlResolversTypes['MembershipParticipationView']>, ParentType, ContextType>;
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

export type GqlMembershipHostedMetricsResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipHostedMetrics'] = GqlResolversParentTypes['MembershipHostedMetrics']> = ResolversObject<{
  geo?: Resolver<Array<GqlResolversTypes['MembershipParticipationLocation']>, ParentType, ContextType>;
  totalParticipantCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipInvitePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipInvitePayload'] = GqlResolversParentTypes['MembershipInvitePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'MembershipInviteSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipInviteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipInviteSuccess'] = GqlResolversParentTypes['MembershipInviteSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipParticipatedMetricsResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipParticipatedMetrics'] = GqlResolversParentTypes['MembershipParticipatedMetrics']> = ResolversObject<{
  geo?: Resolver<Maybe<Array<GqlResolversTypes['MembershipParticipationLocation']>>, ParentType, ContextType>;
  totalParticipatedCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipParticipationLocationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipParticipationLocation'] = GqlResolversParentTypes['MembershipParticipationLocation']> = ResolversObject<{
  address?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  latitude?: Resolver<GqlResolversTypes['Decimal'], ParentType, ContextType>;
  longitude?: Resolver<GqlResolversTypes['Decimal'], ParentType, ContextType>;
  placeId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  placeImage?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  placeName?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipParticipationViewResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipParticipationView'] = GqlResolversParentTypes['MembershipParticipationView']> = ResolversObject<{
  hosted?: Resolver<GqlResolversTypes['MembershipHostedMetrics'], ParentType, ContextType>;
  participated?: Resolver<Maybe<GqlResolversTypes['MembershipParticipatedMetrics']>, ParentType, ContextType>;
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
  articleCreate?: Resolver<Maybe<GqlResolversTypes['ArticleCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleCreateArgs, 'input' | 'permission'>>;
  articleDelete?: Resolver<Maybe<GqlResolversTypes['ArticleDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleDeleteArgs, 'id' | 'permission'>>;
  articleUpdateContent?: Resolver<Maybe<GqlResolversTypes['ArticleUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleUpdateContentArgs, 'id' | 'input' | 'permission'>>;
  communityCreate?: Resolver<Maybe<GqlResolversTypes['CommunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityCreateArgs, 'input'>>;
  communityDelete?: Resolver<Maybe<GqlResolversTypes['CommunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityDeleteArgs, 'id' | 'permission'>>;
  communityUpdateProfile?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityUpdateProfileArgs, 'id' | 'input' | 'permission'>>;
  evaluationBulkCreate?: Resolver<Maybe<GqlResolversTypes['EvaluationBulkCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationEvaluationBulkCreateArgs, 'input' | 'permission'>>;
  identityCheckPhoneUser?: Resolver<GqlResolversTypes['IdentityCheckPhoneUserPayload'], ParentType, ContextType, RequireFields<GqlMutationIdentityCheckPhoneUserArgs, 'input'>>;
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
  reservationAccept?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationAcceptArgs, 'id' | 'permission'>>;
  reservationCancel?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationCancelArgs, 'id' | 'input' | 'permission'>>;
  reservationCreate?: Resolver<Maybe<GqlResolversTypes['ReservationCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationCreateArgs, 'input'>>;
  reservationJoin?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationJoinArgs, 'id'>>;
  reservationReject?: Resolver<Maybe<GqlResolversTypes['ReservationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationReservationRejectArgs, 'id' | 'input' | 'permission'>>;
  storePhoneAuthToken?: Resolver<Maybe<GqlResolversTypes['StorePhoneAuthTokenPayload']>, ParentType, ContextType, RequireFields<GqlMutationStorePhoneAuthTokenArgs, 'input'>>;
  ticketClaim?: Resolver<Maybe<GqlResolversTypes['TicketClaimPayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketClaimArgs, 'input'>>;
  ticketIssue?: Resolver<Maybe<GqlResolversTypes['TicketIssuePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketIssueArgs, 'input' | 'permission'>>;
  ticketPurchase?: Resolver<Maybe<GqlResolversTypes['TicketPurchasePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketPurchaseArgs, 'input' | 'permission'>>;
  ticketRefund?: Resolver<Maybe<GqlResolversTypes['TicketRefundPayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketRefundArgs, 'id' | 'input' | 'permission'>>;
  ticketUse?: Resolver<Maybe<GqlResolversTypes['TicketUsePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketUseArgs, 'id' | 'permission'>>;
  transactionDonateSelfPoint?: Resolver<Maybe<GqlResolversTypes['TransactionDonateSelfPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionDonateSelfPointArgs, 'input' | 'permission'>>;
  transactionGrantCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionGrantCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionGrantCommunityPointArgs, 'input' | 'permission'>>;
  transactionIssueCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionIssueCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionIssueCommunityPointArgs, 'input' | 'permission'>>;
  userDeleteMe?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteMeArgs, 'permission'>>;
  userSignUp?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserSignUpArgs, 'input'>>;
  userUpdateMyProfile?: Resolver<Maybe<GqlResolversTypes['UserUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateMyProfileArgs, 'input' | 'permission'>>;
  utilityCreate?: Resolver<Maybe<GqlResolversTypes['UtilityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityCreateArgs, 'input' | 'permission'>>;
  utilityDelete?: Resolver<Maybe<GqlResolversTypes['UtilityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityDeleteArgs, 'id' | 'permission'>>;
  utilitySetPublishStatus?: Resolver<Maybe<GqlResolversTypes['UtilitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilitySetPublishStatusArgs, 'id' | 'input' | 'permission'>>;
  utilityUpdateInfo?: Resolver<Maybe<GqlResolversTypes['UtilityUpdateInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityUpdateInfoArgs, 'id' | 'input' | 'permission'>>;
}>;

export type GqlNftWalletResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['NftWallet'] = GqlResolversParentTypes['NftWallet']> = ResolversObject<{
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
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

export type GqlQueryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Query'] = GqlResolversParentTypes['Query']> = ResolversObject<{
  article?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType, RequireFields<GqlQueryArticleArgs, 'id' | 'permission'>>;
  articles?: Resolver<GqlResolversTypes['ArticlesConnection'], ParentType, ContextType, Partial<GqlQueryArticlesArgs>>;
  cities?: Resolver<GqlResolversTypes['CitiesConnection'], ParentType, ContextType, Partial<GqlQueryCitiesArgs>>;
  communities?: Resolver<GqlResolversTypes['CommunitiesConnection'], ParentType, ContextType, Partial<GqlQueryCommunitiesArgs>>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType, RequireFields<GqlQueryCommunityArgs, 'id'>>;
  currentUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  echo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  evaluation?: Resolver<Maybe<GqlResolversTypes['Evaluation']>, ParentType, ContextType, RequireFields<GqlQueryEvaluationArgs, 'id'>>;
  evaluationHistories?: Resolver<GqlResolversTypes['EvaluationHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryEvaluationHistoriesArgs>>;
  evaluationHistory?: Resolver<Maybe<GqlResolversTypes['EvaluationHistory']>, ParentType, ContextType, RequireFields<GqlQueryEvaluationHistoryArgs, 'id'>>;
  evaluations?: Resolver<GqlResolversTypes['EvaluationsConnection'], ParentType, ContextType, Partial<GqlQueryEvaluationsArgs>>;
  membership?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType, RequireFields<GqlQueryMembershipArgs, 'communityId' | 'userId'>>;
  memberships?: Resolver<GqlResolversTypes['MembershipsConnection'], ParentType, ContextType, Partial<GqlQueryMembershipsArgs>>;
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
  reservation?: Resolver<Maybe<GqlResolversTypes['Reservation']>, ParentType, ContextType, RequireFields<GqlQueryReservationArgs, 'id'>>;
  reservationHistories?: Resolver<GqlResolversTypes['ReservationHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryReservationHistoriesArgs>>;
  reservationHistory?: Resolver<Maybe<GqlResolversTypes['ReservationHistory']>, ParentType, ContextType, RequireFields<GqlQueryReservationHistoryArgs, 'id'>>;
  reservations?: Resolver<GqlResolversTypes['ReservationsConnection'], ParentType, ContextType, Partial<GqlQueryReservationsArgs>>;
  states?: Resolver<GqlResolversTypes['StatesConnection'], ParentType, ContextType, Partial<GqlQueryStatesArgs>>;
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
  wallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType, RequireFields<GqlQueryWalletArgs, 'id'>>;
  wallets?: Resolver<GqlResolversTypes['WalletsConnection'], ParentType, ContextType, Partial<GqlQueryWalletsArgs>>;
}>;

export type GqlReservationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Reservation'] = GqlResolversParentTypes['Reservation']> = ResolversObject<{
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  histories?: Resolver<Maybe<Array<GqlResolversTypes['ReservationHistory']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  opportunitySlot?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
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
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  fromPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  fromWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TransactionReason'], ParentType, ContextType>;
  ticketStatusHistories?: Resolver<Maybe<Array<GqlResolversTypes['TicketStatusHistory']>>, ParentType, ContextType>;
  toPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  toWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
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

export type GqlTransactionsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionsConnection'] = GqlResolversParentTypes['TransactionsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
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
  nftWallet?: Resolver<Maybe<GqlResolversTypes['NftWallet']>, ParentType, ContextType>;
  opportunitiesCreatedByMe?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  participationStatusChangedByMe?: Resolver<Maybe<Array<GqlResolversTypes['ParticipationStatusHistory']>>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  phoneNumber?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  portfolios?: Resolver<Maybe<Array<GqlResolversTypes['Portfolio']>>, ParentType, ContextType, Partial<GqlUserPortfoliosArgs>>;
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

export type GqlWalletResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Wallet'] = GqlResolversParentTypes['Wallet']> = ResolversObject<{
  accumulatedPointView?: Resolver<Maybe<GqlResolversTypes['AccumulatedPointView']>, ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  currentPointView?: Resolver<Maybe<GqlResolversTypes['CurrentPointView']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  tickets?: Resolver<Maybe<Array<GqlResolversTypes['Ticket']>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
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
  CommunitiesConnection?: GqlCommunitiesConnectionResolvers<ContextType>;
  Community?: GqlCommunityResolvers<ContextType>;
  CommunityConfig?: GqlCommunityConfigResolvers<ContextType>;
  CommunityCreatePayload?: GqlCommunityCreatePayloadResolvers<ContextType>;
  CommunityCreateSuccess?: GqlCommunityCreateSuccessResolvers<ContextType>;
  CommunityDeletePayload?: GqlCommunityDeletePayloadResolvers<ContextType>;
  CommunityDeleteSuccess?: GqlCommunityDeleteSuccessResolvers<ContextType>;
  CommunityEdge?: GqlCommunityEdgeResolvers<ContextType>;
  CommunityFirebaseConfig?: GqlCommunityFirebaseConfigResolvers<ContextType>;
  CommunityLineConfig?: GqlCommunityLineConfigResolvers<ContextType>;
  CommunityLineRichMenuConfig?: GqlCommunityLineRichMenuConfigResolvers<ContextType>;
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
  Identity?: GqlIdentityResolvers<ContextType>;
  IdentityCheckPhoneUserPayload?: GqlIdentityCheckPhoneUserPayloadResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  LinkPhoneAuthPayload?: GqlLinkPhoneAuthPayloadResolvers<ContextType>;
  Membership?: GqlMembershipResolvers<ContextType>;
  MembershipEdge?: GqlMembershipEdgeResolvers<ContextType>;
  MembershipHistory?: GqlMembershipHistoryResolvers<ContextType>;
  MembershipHostedMetrics?: GqlMembershipHostedMetricsResolvers<ContextType>;
  MembershipInvitePayload?: GqlMembershipInvitePayloadResolvers<ContextType>;
  MembershipInviteSuccess?: GqlMembershipInviteSuccessResolvers<ContextType>;
  MembershipParticipatedMetrics?: GqlMembershipParticipatedMetricsResolvers<ContextType>;
  MembershipParticipationLocation?: GqlMembershipParticipationLocationResolvers<ContextType>;
  MembershipParticipationView?: GqlMembershipParticipationViewResolvers<ContextType>;
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
  Query?: GqlQueryResolvers<ContextType>;
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
  TransactionDonateSelfPointPayload?: GqlTransactionDonateSelfPointPayloadResolvers<ContextType>;
  TransactionDonateSelfPointSuccess?: GqlTransactionDonateSelfPointSuccessResolvers<ContextType>;
  TransactionEdge?: GqlTransactionEdgeResolvers<ContextType>;
  TransactionGrantCommunityPointPayload?: GqlTransactionGrantCommunityPointPayloadResolvers<ContextType>;
  TransactionGrantCommunityPointSuccess?: GqlTransactionGrantCommunityPointSuccessResolvers<ContextType>;
  TransactionIssueCommunityPointPayload?: GqlTransactionIssueCommunityPointPayloadResolvers<ContextType>;
  TransactionIssueCommunityPointSuccess?: GqlTransactionIssueCommunityPointSuccessResolvers<ContextType>;
  TransactionsConnection?: GqlTransactionsConnectionResolvers<ContextType>;
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
  Wallet?: GqlWalletResolvers<ContextType>;
  WalletEdge?: GqlWalletEdgeResolvers<ContextType>;
  WalletsConnection?: GqlWalletsConnectionResolvers<ContextType>;
}>;

export type GqlDirectiveResolvers<ContextType = any> = ResolversObject<{
  authz?: GqlAuthzDirectiveResolver<any, any, ContextType>;
  requireRole?: GqlRequireRoleDirectiveResolver<any, any, ContextType>;
}>;

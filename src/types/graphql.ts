import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Agenda, City, State, Index, Event, Activity, Like, Comment, Organization, Group, Target, User } from '@prisma/client/index.d';
import { Context } from '@/prisma/client';
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
  Datetime: { input: Date; output: Date; }
};

export type GqlAuthError = GqlError & {
  __typename?: 'AuthError';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlCity = {
  __typename?: 'City';
  code: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  state: GqlState;
};

export type GqlCommonError = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommunities = {
  __typename?: 'Communities';
  data: Array<GqlCommunity>;
  total: Scalars['Int']['output'];
};

export type GqlCommunitiesConnection = {
  __typename?: 'CommunitiesConnection';
  edges?: Maybe<Array<Maybe<GqlCommunityEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlCommunity = {
  __typename?: 'Community';
  bio?: Maybe<Scalars['String']['output']>;
  city: GqlCity;
  createdAt: Scalars['Datetime']['output'];
  establishedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  memberships?: Maybe<Array<GqlMembership>>;
  name: Scalars['String']['output'];
  opportunities?: Maybe<Array<GqlOpportunity>>;
  participations?: Maybe<Array<GqlParticipation>>;
  pointName: Scalars['String']['output'];
  state?: Maybe<GqlState>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utilities?: Maybe<Array<GqlUtility>>;
  wallets?: Maybe<Array<GqlWallet>>;
  website?: Maybe<Scalars['String']['output']>;
};

export type GqlCommunityAcceptUserInput = {
  role?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};

export type GqlCommunityCreateInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCode: Scalars['String']['input'];
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pointName: Scalars['String']['input'];
  stateCode: Scalars['String']['input'];
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityCreatePayload = GqlAuthError | GqlCommunityCreateSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommunityCreateSuccess = {
  __typename?: 'CommunityCreateSuccess';
  community: GqlCommunity;
};

export type GqlCommunityDeletePayload = GqlAuthError | GqlCommunityDeleteSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommunityDeleteSuccess = {
  __typename?: 'CommunityDeleteSuccess';
  communityId: Scalars['ID']['output'];
};

export type GqlCommunityEdge = GqlEdge & {
  __typename?: 'CommunityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlCommunity>;
};

export type GqlCommunityFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityReleaseUserInput = {
  reason?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};

export type GqlCommunitySortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlCommunityUpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCode?: InputMaybe<Scalars['String']['input']>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  pointName?: InputMaybe<Scalars['String']['input']>;
  stateCode?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunityUpdateProfilePayload = GqlAuthError | GqlCommunityUpdateProfileSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommunityUpdateProfileSuccess = {
  __typename?: 'CommunityUpdateProfileSuccess';
  community: GqlCommunity;
};

export type GqlCommunityUpdateUserPayload = GqlAuthError | GqlCommunityUpdateUserSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommunityUpdateUserSuccess = {
  __typename?: 'CommunityUpdateUserSuccess';
  community: GqlCommunity;
  user: GqlUser;
};

export type GqlComplexQueryError = GqlError & {
  __typename?: 'ComplexQueryError';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlCreateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  image?: InputMaybe<GqlImageInput>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCurrentPointView = {
  __typename?: 'CurrentPointView';
  currentPoint: Scalars['Int']['output'];
  wallet: GqlWallet;
};

export type GqlCurrentUserPayload = {
  __typename?: 'CurrentUserPayload';
  user?: Maybe<GqlUser>;
};

export type GqlEdge = {
  cursor: Scalars['String']['output'];
};

export type GqlError = {
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlField = {
  __typename?: 'Field';
  message?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export const GqlIdentityPlatform = {
  Facebook: 'FACEBOOK',
  Line: 'LINE'
} as const;

export type GqlIdentityPlatform = typeof GqlIdentityPlatform[keyof typeof GqlIdentityPlatform];
export type GqlImageInput = {
  base64: Scalars['String']['input'];
};

export type GqlInvalidInputValueError = GqlError & {
  __typename?: 'InvalidInputValueError';
  fields?: Maybe<Array<GqlField>>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlMembership = {
  __typename?: 'Membership';
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  role: GqlRole;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
};

export type GqlMembershipCreateInput = {
  communityId: Scalars['ID']['input'];
  role: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipCreateSuccess;

export type GqlMembershipCreateSuccess = {
  __typename?: 'MembershipCreateSuccess';
  membership: GqlMembership;
};

export type GqlMembershipDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipDeleteSuccess;

export type GqlMembershipDeleteSuccess = {
  __typename?: 'MembershipDeleteSuccess';
  communityId: Scalars['ID']['output'];
  userId: Scalars['ID']['output'];
};

export type GqlMembershipEdge = GqlEdge & {
  __typename?: 'MembershipEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlMembership>;
};

export type GqlMembershipFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlMembershipSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlMembershipsConnection = {
  __typename?: 'MembershipsConnection';
  edges?: Maybe<Array<Maybe<GqlMembershipEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlMutation = {
  __typename?: 'Mutation';
  communityAcceptUser?: Maybe<GqlCommunityUpdateUserPayload>;
  communityCreate?: Maybe<GqlCommunityCreatePayload>;
  communityDelete?: Maybe<GqlCommunityDeletePayload>;
  communityReleaseUser?: Maybe<GqlCommunityUpdateUserPayload>;
  communityUpdateProfile?: Maybe<GqlCommunityUpdateProfilePayload>;
  createUser?: Maybe<GqlCurrentUserPayload>;
  deleteUser?: Maybe<GqlCurrentUserPayload>;
  membershipCreate?: Maybe<GqlMembershipCreatePayload>;
  membershipDelete?: Maybe<GqlMembershipDeletePayload>;
  mutationEcho: Scalars['String']['output'];
  opportunityCreate?: Maybe<GqlOpportunityCreatePayload>;
  opportunityDelete?: Maybe<GqlOpportunityDeletePayload>;
  opportunityEditContent?: Maybe<GqlOpportunityEditContentPayload>;
  opportunitySetCommunityInternal?: Maybe<GqlOpportunitySetPublishStatusPayload>;
  opportunitySetPrivate?: Maybe<GqlOpportunitySetPublishStatusPayload>;
  opportunitySetPublic?: Maybe<GqlOpportunitySetPublishStatusPayload>;
  participationSetApply?: Maybe<GqlParticipationApplyPayload>;
  participationSetApprove?: Maybe<GqlParticipationSetStatusPayload>;
  participationSetCancel?: Maybe<GqlParticipationSetStatusPayload>;
  participationSetDeny?: Maybe<GqlParticipationSetStatusPayload>;
  participationSetNotParticipating?: Maybe<GqlParticipationSetStatusPayload>;
  participationSetParticipating?: Maybe<GqlParticipationSetStatusPayload>;
  transactionCreate?: Maybe<GqlTransactionCreatePayload>;
  userCreate?: Maybe<GqlUserCreatePayload>;
  userDelete?: Maybe<GqlUserDeletePayload>;
  userPublish?: Maybe<GqlUserSwitchPrivacyPayload>;
  userUnpublish?: Maybe<GqlUserSwitchPrivacyPayload>;
  userUpdateContent?: Maybe<GqlUserUpdateContentPayload>;
  utilityCreate?: Maybe<GqlUtilityCreatePayload>;
  utilityDelete?: Maybe<GqlUtilityDeletePayload>;
  walletCreate?: Maybe<GqlWalletCreatePayload>;
  walletDelete?: Maybe<GqlWalletDeletePayload>;
};


export type GqlMutationCommunityAcceptUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityAcceptUserInput;
};


export type GqlMutationCommunityCreateArgs = {
  input: GqlCommunityCreateInput;
};


export type GqlMutationCommunityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationCommunityReleaseUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityReleaseUserInput;
};


export type GqlMutationCommunityUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityUpdateProfileInput;
};


export type GqlMutationCreateUserArgs = {
  input: GqlCreateUserInput;
};


export type GqlMutationMembershipCreateArgs = {
  input: GqlMembershipCreateInput;
};


export type GqlMutationMembershipDeleteArgs = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type GqlMutationOpportunityCreateArgs = {
  input: GqlOpportunityCreateInput;
};


export type GqlMutationOpportunityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOpportunityEditContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunityEditContentInput;
};


export type GqlMutationOpportunitySetCommunityInternalArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOpportunitySetPrivateArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOpportunitySetPublicArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationSetApplyArgs = {
  input: GqlParticipationApplyInput;
};


export type GqlMutationParticipationSetApproveArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationUpdateStatusInput;
};


export type GqlMutationParticipationSetCancelArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationUpdateStatusInput;
};


export type GqlMutationParticipationSetDenyArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationUpdateStatusInput;
};


export type GqlMutationParticipationSetNotParticipatingArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationUpdateStatusInput;
};


export type GqlMutationParticipationSetParticipatingArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationUpdateStatusInput;
};


export type GqlMutationTransactionCreateArgs = {
  input: GqlTransactionCreateInput;
};


export type GqlMutationUserCreateArgs = {
  input: GqlUserCreateInput;
};


export type GqlMutationUserDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationUserPublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserSwitchPrivacyInput;
};


export type GqlMutationUserUnpublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserSwitchPrivacyInput;
};


export type GqlMutationUserUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserUpdateContentInput;
};


export type GqlMutationUtilityCreateArgs = {
  input: GqlUtilityCreateInput;
};


export type GqlMutationUtilityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationWalletCreateArgs = {
  input: GqlWalletCreateInput;
};


export type GqlMutationWalletDeleteArgs = {
  id: Scalars['ID']['input'];
};

export type GqlOpportunitiesConnection = {
  __typename?: 'OpportunitiesConnection';
  edges: Array<GqlOpportunityEdge>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlOpportunity = {
  __typename?: 'Opportunity';
  capacity?: Maybe<Scalars['Int']['output']>;
  category: GqlOpportunityCategory;
  city: GqlCity;
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  createdBy: GqlUser;
  description?: Maybe<Scalars['String']['output']>;
  endsAt?: Maybe<Scalars['Datetime']['output']>;
  files?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  participations?: Maybe<Array<GqlParticipation>>;
  pointsPerParticipation: Scalars['Int']['output'];
  publishStatus: GqlPublishStatus;
  requireApproval: Scalars['Boolean']['output'];
  startsAt?: Maybe<Scalars['Datetime']['output']>;
  state?: Maybe<GqlState>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export const GqlOpportunityCategory = {
  Conversation: 'CONVERSATION',
  Event: 'EVENT',
  Task: 'TASK'
} as const;

export type GqlOpportunityCategory = typeof GqlOpportunityCategory[keyof typeof GqlOpportunityCategory];
export type GqlOpportunityCreateInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  category: GqlOpportunityCategory;
  cityCode: Scalars['String']['input'];
  communityId: Scalars['String']['input'];
  createdById: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  files?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  pointsPerParticipation: Scalars['Int']['input'];
  requireApproval?: InputMaybe<Scalars['Boolean']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  stateCode?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type GqlOpportunityCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityCreateSuccess;

export type GqlOpportunityCreateSuccess = {
  __typename?: 'OpportunityCreateSuccess';
  opportunity: GqlOpportunity;
};

export type GqlOpportunityDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityDeleteSuccess;

export type GqlOpportunityDeleteSuccess = {
  __typename?: 'OpportunityDeleteSuccess';
  opportunityId: Scalars['String']['output'];
};

export type GqlOpportunityEdge = GqlEdge & {
  __typename?: 'OpportunityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOpportunity>;
};

export type GqlOpportunityEditContentInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<GqlOpportunityCategory>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  files?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  pointsPerParticipation?: InputMaybe<Scalars['Int']['input']>;
  requireApproval?: InputMaybe<Scalars['Boolean']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type GqlOpportunityEditContentPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityEditContentSuccess;

export type GqlOpportunityEditContentSuccess = {
  __typename?: 'OpportunityEditContentSuccess';
  opportunity: GqlOpportunity;
};

export type GqlOpportunityFilterInput = {
  category?: InputMaybe<GqlOpportunityCategory>;
  cityCode?: InputMaybe<Scalars['String']['input']>;
  communityId?: InputMaybe<Scalars['String']['input']>;
  createdBy?: InputMaybe<Scalars['String']['input']>;
  publishStatus?: InputMaybe<GqlPublishStatus>;
  stateCode?: InputMaybe<Scalars['String']['input']>;
};

export type GqlOpportunitySetPublishStatusPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunitySetPublishStatusSuccess;

export type GqlOpportunitySetPublishStatusSuccess = {
  __typename?: 'OpportunitySetPublishStatusSuccess';
  opportunity: GqlOpportunity;
};

export type GqlOpportunitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  pointsPerParticipation?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
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
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  opportunity?: Maybe<GqlOpportunity>;
  status: GqlParticipationStatus;
  statusHistories?: Maybe<Array<GqlParticipationStatusHistory>>;
  transactions?: Maybe<Array<GqlTransaction>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlParticipationApplyInput = {
  communityId?: InputMaybe<Scalars['String']['input']>;
  createdById: Scalars['String']['input'];
  opportunityId: Scalars['String']['input'];
};

export type GqlParticipationApplyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlParticipationApplySuccess;

export type GqlParticipationApplySuccess = {
  __typename?: 'ParticipationApplySuccess';
  participation: GqlParticipation;
};

export type GqlParticipationEdge = GqlEdge & {
  __typename?: 'ParticipationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlParticipation>;
};

export type GqlParticipationFilterInput = {
  communityId?: InputMaybe<Scalars['String']['input']>;
  opportunityId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GqlParticipationStatus>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlParticipationSetStatusPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlParticipationSetStatusSuccess;

export type GqlParticipationSetStatusSuccess = {
  __typename?: 'ParticipationSetStatusSuccess';
  participation: GqlParticipation;
};

export type GqlParticipationSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export const GqlParticipationStatus = {
  Applied: 'APPLIED',
  Approved: 'APPROVED',
  Canceled: 'CANCELED',
  Denied: 'DENIED',
  NotParticipating: 'NOT_PARTICIPATING',
  Participating: 'PARTICIPATING'
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
  createdAt: Scalars['Datetime']['output'];
  createdBy?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  participation: GqlParticipation;
  status: GqlParticipationStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlParticipationStatusHistoryCreateInput = {
  createdById?: InputMaybe<Scalars['String']['input']>;
  participationId: Scalars['String']['input'];
  status: GqlParticipationStatus;
};

export type GqlParticipationStatusHistoryCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlParticipationStatusHistoryCreateSuccess;

export type GqlParticipationStatusHistoryCreateSuccess = {
  __typename?: 'ParticipationStatusHistoryCreateSuccess';
  participationStatusHistory: GqlParticipationStatusHistory;
};

export type GqlParticipationStatusHistoryEdge = GqlEdge & {
  __typename?: 'ParticipationStatusHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlParticipationStatusHistory>;
};

export type GqlParticipationStatusHistoryFilterInput = {
  createdById?: InputMaybe<Scalars['String']['input']>;
  participationId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GqlParticipationStatus>;
};

export type GqlParticipationStatusHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlParticipationUpdateStatusInput = {
  createdById: Scalars['String']['input'];
};

export type GqlParticipationsConnection = {
  __typename?: 'ParticipationsConnection';
  edges: Array<GqlParticipationEdge>;
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
  cities: Array<GqlCity>;
  communities: GqlCommunitiesConnection;
  community?: Maybe<GqlCommunity>;
  currentUser?: Maybe<GqlCurrentUserPayload>;
  echo: Scalars['String']['output'];
  membership?: Maybe<GqlMembership>;
  memberships: GqlMembershipsConnection;
  opportunities: GqlOpportunitiesConnection;
  opportunity?: Maybe<GqlOpportunity>;
  participation?: Maybe<GqlParticipation>;
  participationStatusHistories: GqlParticipationStatusHistoriesConnection;
  participationStatusHistory?: Maybe<GqlParticipationStatusHistory>;
  participations: GqlParticipationsConnection;
  states: Array<GqlState>;
  transaction?: Maybe<GqlTransaction>;
  transactions: GqlTransactionsConnection;
  user?: Maybe<GqlUser>;
  users: GqlUsersConnection;
  utilities: GqlUtilitiesConnection;
  utility?: Maybe<GqlUtility>;
  wallet?: Maybe<GqlWallet>;
  wallets: GqlWalletsConnection;
};


export type GqlQueryCitiesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
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


export type GqlQueryMembershipArgs = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type GqlQueryMembershipsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
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


export type GqlQueryStatesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
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
export type GqlState = {
  __typename?: 'State';
  code: Scalars['ID']['output'];
  countryCode: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export const GqlSysRole = {
  SysAdmin: 'SYS_ADMIN',
  User: 'USER'
} as const;

export type GqlSysRole = typeof GqlSysRole[keyof typeof GqlSysRole];
export type GqlTransaction = {
  __typename?: 'Transaction';
  createdAt: Scalars['Datetime']['output'];
  fromPointChange?: Maybe<Scalars['Int']['output']>;
  fromWallet?: Maybe<GqlWallet>;
  id: Scalars['ID']['output'];
  participation?: Maybe<GqlParticipation>;
  toPointChange?: Maybe<Scalars['Int']['output']>;
  toWallet?: Maybe<GqlWallet>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utility?: Maybe<GqlUtility>;
};

export type GqlTransactionCreateInput = {
  fromPointChange?: InputMaybe<Scalars['Int']['input']>;
  fromWalletId?: InputMaybe<Scalars['ID']['input']>;
  participationId?: InputMaybe<Scalars['ID']['input']>;
  toPointChange?: InputMaybe<Scalars['Int']['input']>;
  toWalletId?: InputMaybe<Scalars['ID']['input']>;
  utilityId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlTransactionCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionCreateSuccess;

export type GqlTransactionCreateSuccess = {
  __typename?: 'TransactionCreateSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionEdge = GqlEdge & {
  __typename?: 'TransactionEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTransaction>;
};

export type GqlTransactionFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export const GqlTransactionReason = {
  Gift: 'GIFT',
  MembershipDeleted: 'MEMBERSHIP_DELETED',
  Other: 'OTHER',
  ParticipationApproved: 'PARTICIPATION_APPROVED',
  PointIssued: 'POINT_ISSUED'
} as const;

export type GqlTransactionReason = typeof GqlTransactionReason[keyof typeof GqlTransactionReason];
export type GqlTransactionSortInput = {
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTransactionsConnection = {
  __typename?: 'TransactionsConnection';
  edges?: Maybe<Array<Maybe<GqlTransactionEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlUser = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  memberships?: Maybe<Array<GqlMembership>>;
  name: Scalars['String']['output'];
  opportunitiesCreatedByMe?: Maybe<Array<GqlOpportunity>>;
  participationStatusChangedByMe?: Maybe<Array<GqlParticipationStatusHistory>>;
  participations?: Maybe<Array<GqlParticipation>>;
  slug: Scalars['String']['output'];
  sysRole: GqlSysRole;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  urlFacebook?: Maybe<Scalars['String']['output']>;
  urlInstagram?: Maybe<Scalars['String']['output']>;
  urlTiktok?: Maybe<Scalars['String']['output']>;
  urlWebsite?: Maybe<Scalars['String']['output']>;
  urlX?: Maybe<Scalars['String']['output']>;
  urlYoutube?: Maybe<Scalars['String']['output']>;
  wallets?: Maybe<Array<GqlWallet>>;
};

export type GqlUserCreateInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserCreateSuccess;

export type GqlUserCreateSuccess = {
  __typename?: 'UserCreateSuccess';
  user?: Maybe<GqlUser>;
};

export type GqlUserDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserDeleteSuccess;

export type GqlUserDeleteSuccess = {
  __typename?: 'UserDeleteSuccess';
  userId: Scalars['ID']['output'];
};

export type GqlUserEdge = GqlEdge & {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUser>;
};

export type GqlUserFilterInput = {
  agendaId?: InputMaybe<Scalars['Int']['input']>;
  cityCode?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlUserSwitchPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlUserSwitchPrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserSwitchPrivacySuccess;

export type GqlUserSwitchPrivacySuccess = {
  __typename?: 'UserSwitchPrivacySuccess';
  user: GqlUser;
};

export type GqlUserUpdateContentInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdateContentSuccess;

export type GqlUserUpdateContentSuccess = {
  __typename?: 'UserUpdateContentSuccess';
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
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pointsRequired: Scalars['Int']['output'];
  transactions?: Maybe<Array<GqlTransaction>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlUtilityCreateInput = {
  communityId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pointsRequired: Scalars['Int']['input'];
};

export type GqlUtilityCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUtilityCreateSuccess;

export type GqlUtilityCreateSuccess = {
  __typename?: 'UtilityCreateSuccess';
  utility: GqlUtility;
};

export type GqlUtilityDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUtilityDeleteSuccess;

export type GqlUtilityDeleteSuccess = {
  __typename?: 'UtilityDeleteSuccess';
  utilityId: Scalars['ID']['output'];
};

export type GqlUtilityEdge = GqlEdge & {
  __typename?: 'UtilityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUtility>;
};

export type GqlUtilityFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUtilitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlValueType = {
  Float: 'FLOAT',
  Int: 'INT'
} as const;

export type GqlValueType = typeof GqlValueType[keyof typeof GqlValueType];
export type GqlWallet = {
  __typename?: 'Wallet';
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  currentPointView?: Maybe<GqlCurrentPointView>;
  fromTransactions?: Maybe<Array<GqlTransaction>>;
  id: Scalars['ID']['output'];
  toTransactions?: Maybe<Array<GqlTransaction>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlWalletCreateInput = {
  communityId: Scalars['ID']['input'];
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlWalletCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlWalletCreateSuccess;

export type GqlWalletCreateSuccess = {
  __typename?: 'WalletCreateSuccess';
  wallet: GqlWallet;
};

export type GqlWalletDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlWalletDeleteSuccess;

export type GqlWalletDeleteSuccess = {
  __typename?: 'WalletDeleteSuccess';
  walletId: Scalars['ID']['output'];
};

export type GqlWalletEdge = GqlEdge & {
  __typename?: 'WalletEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlWallet>;
};

export type GqlWalletFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlWalletSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

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
  CommonError: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityCreatePayload: ( GqlAuthError ) | ( Omit<GqlCommunityCreateSuccess, 'community'> & { community: _RefType['Community'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityDeletePayload: ( GqlAuthError ) | ( GqlCommunityDeleteSuccess ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityUpdateProfilePayload: ( GqlAuthError ) | ( Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: _RefType['Community'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityUpdateUserPayload: ( GqlAuthError ) | ( Omit<GqlCommunityUpdateUserSuccess, 'community' | 'user'> & { community: _RefType['Community'], user: _RefType['User'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  MembershipCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipCreateSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlMembershipDeleteSuccess );
  OpportunityCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunityDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlOpportunityDeleteSuccess );
  OpportunityEditContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityEditContentSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunitySetPublishStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  ParticipationApplyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationApplySuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationSetStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationStatusHistoryCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: _RefType['ParticipationStatusHistory'] } );
  TransactionCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionCreateSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UserCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UserDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUserDeleteSuccess );
  UserSwitchPrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserSwitchPrivacySuccess, 'user'> & { user: _RefType['User'] } );
  UserUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateContentSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UtilityCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUtilityDeleteSuccess );
  WalletCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlWalletCreateSuccess, 'wallet'> & { wallet: _RefType['Wallet'] } );
  WalletDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlWalletDeleteSuccess );
}>;

/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<_RefType['Community']> } ) | ( Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<_RefType['Membership']> } ) | ( Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<_RefType['Opportunity']> } ) | ( Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<_RefType['Participation']> } ) | ( Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['ParticipationStatusHistory']> } ) | ( Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<_RefType['Transaction']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } ) | ( Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<_RefType['Utility']> } ) | ( Omit<GqlWalletEdge, 'node'> & { node?: Maybe<_RefType['Wallet']> } );
  Error: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  AuthError: ResolverTypeWrapper<GqlAuthError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  City: ResolverTypeWrapper<City>;
  CommonError: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommonError']>;
  Communities: ResolverTypeWrapper<Omit<GqlCommunities, 'data'> & { data: Array<GqlResolversTypes['Community']> }>;
  CommunitiesConnection: ResolverTypeWrapper<Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['CommunityEdge']>>> }>;
  Community: ResolverTypeWrapper<Omit<GqlCommunity, 'city' | 'memberships' | 'opportunities' | 'participations' | 'state' | 'utilities' | 'wallets'> & { city: GqlResolversTypes['City'], memberships?: Maybe<Array<GqlResolversTypes['Membership']>>, opportunities?: Maybe<Array<GqlResolversTypes['Opportunity']>>, participations?: Maybe<Array<GqlResolversTypes['Participation']>>, state?: Maybe<GqlResolversTypes['State']>, utilities?: Maybe<Array<GqlResolversTypes['Utility']>>, wallets?: Maybe<Array<GqlResolversTypes['Wallet']>> }>;
  CommunityAcceptUserInput: GqlCommunityAcceptUserInput;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityCreatePayload']>;
  CommunityCreateSuccess: ResolverTypeWrapper<Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CommunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityDeletePayload']>;
  CommunityDeleteSuccess: ResolverTypeWrapper<GqlCommunityDeleteSuccess>;
  CommunityEdge: ResolverTypeWrapper<Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Community']> }>;
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunityReleaseUserInput: GqlCommunityReleaseUserInput;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityUpdateProfilePayload']>;
  CommunityUpdateProfileSuccess: ResolverTypeWrapper<Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CommunityUpdateUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityUpdateUserPayload']>;
  CommunityUpdateUserSuccess: ResolverTypeWrapper<Omit<GqlCommunityUpdateUserSuccess, 'community' | 'user'> & { community: GqlResolversTypes['Community'], user: GqlResolversTypes['User'] }>;
  ComplexQueryError: ResolverTypeWrapper<GqlComplexQueryError>;
  CreateUserInput: GqlCreateUserInput;
  CurrentPointView: ResolverTypeWrapper<Omit<GqlCurrentPointView, 'wallet'> & { wallet: GqlResolversTypes['Wallet'] }>;
  CurrentUserPayload: ResolverTypeWrapper<Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  Error: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Error']>;
  Field: ResolverTypeWrapper<GqlField>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IdentityPlatform: GqlIdentityPlatform;
  ImageInput: GqlImageInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputValueError: ResolverTypeWrapper<GqlInvalidInputValueError>;
  Membership: ResolverTypeWrapper<Omit<GqlMembership, 'community' | 'user'> & { community: GqlResolversTypes['Community'], user: GqlResolversTypes['User'] }>;
  MembershipCreateInput: GqlMembershipCreateInput;
  MembershipCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipCreatePayload']>;
  MembershipCreateSuccess: ResolverTypeWrapper<Omit<GqlMembershipCreateSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipDeletePayload']>;
  MembershipDeleteSuccess: ResolverTypeWrapper<GqlMembershipDeleteSuccess>;
  MembershipEdge: ResolverTypeWrapper<Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Membership']> }>;
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipSortInput: GqlMembershipSortInput;
  MembershipsConnection: ResolverTypeWrapper<Omit<GqlMembershipsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>> }>;
  Mutation: ResolverTypeWrapper<{}>;
  OpportunitiesConnection: ResolverTypeWrapper<Omit<GqlOpportunitiesConnection, 'edges'> & { edges: Array<GqlResolversTypes['OpportunityEdge']> }>;
  Opportunity: ResolverTypeWrapper<Omit<GqlOpportunity, 'city' | 'community' | 'createdBy' | 'participations' | 'state'> & { city: GqlResolversTypes['City'], community: GqlResolversTypes['Community'], createdBy: GqlResolversTypes['User'], participations?: Maybe<Array<GqlResolversTypes['Participation']>>, state?: Maybe<GqlResolversTypes['State']> }>;
  OpportunityCategory: GqlOpportunityCategory;
  OpportunityCreateInput: GqlOpportunityCreateInput;
  OpportunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityCreatePayload']>;
  OpportunityCreateSuccess: ResolverTypeWrapper<Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityDeletePayload']>;
  OpportunityDeleteSuccess: ResolverTypeWrapper<GqlOpportunityDeleteSuccess>;
  OpportunityEdge: ResolverTypeWrapper<Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Opportunity']> }>;
  OpportunityEditContentInput: GqlOpportunityEditContentInput;
  OpportunityEditContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityEditContentPayload']>;
  OpportunityEditContentSuccess: ResolverTypeWrapper<Omit<GqlOpportunityEditContentSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunityFilterInput: GqlOpportunityFilterInput;
  OpportunitySetPublishStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySetPublishStatusPayload']>;
  OpportunitySetPublishStatusSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunitySortInput: GqlOpportunitySortInput;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Participation: ResolverTypeWrapper<Omit<GqlParticipation, 'community' | 'opportunity' | 'statusHistories' | 'transactions' | 'user'> & { community?: Maybe<GqlResolversTypes['Community']>, opportunity?: Maybe<GqlResolversTypes['Opportunity']>, statusHistories?: Maybe<Array<GqlResolversTypes['ParticipationStatusHistory']>>, transactions?: Maybe<Array<GqlResolversTypes['Transaction']>>, user?: Maybe<GqlResolversTypes['User']> }>;
  ParticipationApplyInput: GqlParticipationApplyInput;
  ParticipationApplyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationApplyPayload']>;
  ParticipationApplySuccess: ResolverTypeWrapper<Omit<GqlParticipationApplySuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationEdge: ResolverTypeWrapper<Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Participation']> }>;
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationSetStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationSetStatusPayload']>;
  ParticipationSetStatusSuccess: ResolverTypeWrapper<Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatus: GqlParticipationStatus;
  ParticipationStatusHistoriesConnection: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationStatusHistoryEdge']> }>;
  ParticipationStatusHistory: ResolverTypeWrapper<Omit<GqlParticipationStatusHistory, 'createdBy' | 'participation'> & { createdBy?: Maybe<GqlResolversTypes['User']>, participation: GqlResolversTypes['Participation'] }>;
  ParticipationStatusHistoryCreateInput: GqlParticipationStatusHistoryCreateInput;
  ParticipationStatusHistoryCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationStatusHistoryCreatePayload']>;
  ParticipationStatusHistoryCreateSuccess: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: GqlResolversTypes['ParticipationStatusHistory'] }>;
  ParticipationStatusHistoryEdge: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['ParticipationStatusHistory']> }>;
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationUpdateStatusInput: GqlParticipationUpdateStatusInput;
  ParticipationsConnection: ResolverTypeWrapper<Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationEdge']> }>;
  PublishStatus: GqlPublishStatus;
  Query: ResolverTypeWrapper<{}>;
  Role: GqlRole;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SysRole: GqlSysRole;
  Transaction: ResolverTypeWrapper<Omit<GqlTransaction, 'fromWallet' | 'participation' | 'toWallet' | 'utility'> & { fromWallet?: Maybe<GqlResolversTypes['Wallet']>, participation?: Maybe<GqlResolversTypes['Participation']>, toWallet?: Maybe<GqlResolversTypes['Wallet']>, utility?: Maybe<GqlResolversTypes['Utility']> }>;
  TransactionCreateInput: GqlTransactionCreateInput;
  TransactionCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionCreatePayload']>;
  TransactionCreateSuccess: ResolverTypeWrapper<Omit<GqlTransactionCreateSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionEdge: ResolverTypeWrapper<Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Transaction']> }>;
  TransactionFilterInput: GqlTransactionFilterInput;
  TransactionReason: GqlTransactionReason;
  TransactionSortInput: GqlTransactionSortInput;
  TransactionsConnection: ResolverTypeWrapper<Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>> }>;
  User: ResolverTypeWrapper<User>;
  UserCreateInput: GqlUserCreateInput;
  UserCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserCreatePayload']>;
  UserCreateSuccess: ResolverTypeWrapper<Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UserDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserDeletePayload']>;
  UserDeleteSuccess: ResolverTypeWrapper<GqlUserDeleteSuccess>;
  UserEdge: ResolverTypeWrapper<Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversTypes['User']> }>;
  UserFilterInput: GqlUserFilterInput;
  UserSortInput: GqlUserSortInput;
  UserSwitchPrivacyInput: GqlUserSwitchPrivacyInput;
  UserSwitchPrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserSwitchPrivacyPayload']>;
  UserSwitchPrivacySuccess: ResolverTypeWrapper<Omit<GqlUserSwitchPrivacySuccess, 'user'> & { user: GqlResolversTypes['User'] }>;
  UserUpdateContentInput: GqlUserUpdateContentInput;
  UserUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateContentPayload']>;
  UserUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateContentSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UsersConnection: ResolverTypeWrapper<Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>> }>;
  UtilitiesConnection: ResolverTypeWrapper<Omit<GqlUtilitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UtilityEdge']>>> }>;
  Utility: ResolverTypeWrapper<Omit<GqlUtility, 'community' | 'transactions'> & { community: GqlResolversTypes['Community'], transactions?: Maybe<Array<GqlResolversTypes['Transaction']>> }>;
  UtilityCreateInput: GqlUtilityCreateInput;
  UtilityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityCreatePayload']>;
  UtilityCreateSuccess: ResolverTypeWrapper<Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: GqlResolversTypes['Utility'] }>;
  UtilityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityDeletePayload']>;
  UtilityDeleteSuccess: ResolverTypeWrapper<GqlUtilityDeleteSuccess>;
  UtilityEdge: ResolverTypeWrapper<Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Utility']> }>;
  UtilityFilterInput: GqlUtilityFilterInput;
  UtilitySortInput: GqlUtilitySortInput;
  ValueType: GqlValueType;
  Wallet: ResolverTypeWrapper<Omit<GqlWallet, 'community' | 'currentPointView' | 'fromTransactions' | 'toTransactions' | 'user'> & { community: GqlResolversTypes['Community'], currentPointView?: Maybe<GqlResolversTypes['CurrentPointView']>, fromTransactions?: Maybe<Array<GqlResolversTypes['Transaction']>>, toTransactions?: Maybe<Array<GqlResolversTypes['Transaction']>>, user?: Maybe<GqlResolversTypes['User']> }>;
  WalletCreateInput: GqlWalletCreateInput;
  WalletCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['WalletCreatePayload']>;
  WalletCreateSuccess: ResolverTypeWrapper<Omit<GqlWalletCreateSuccess, 'wallet'> & { wallet: GqlResolversTypes['Wallet'] }>;
  WalletDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['WalletDeletePayload']>;
  WalletDeleteSuccess: ResolverTypeWrapper<GqlWalletDeleteSuccess>;
  WalletEdge: ResolverTypeWrapper<Omit<GqlWalletEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Wallet']> }>;
  WalletFilterInput: GqlWalletFilterInput;
  WalletSortInput: GqlWalletSortInput;
  WalletsConnection: ResolverTypeWrapper<Omit<GqlWalletsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['WalletEdge']>>> }>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlResolversParentTypes = ResolversObject<{
  AuthError: GqlAuthError;
  Boolean: Scalars['Boolean']['output'];
  City: City;
  CommonError: GqlResolversUnionTypes<GqlResolversParentTypes>['CommonError'];
  Communities: Omit<GqlCommunities, 'data'> & { data: Array<GqlResolversParentTypes['Community']> };
  CommunitiesConnection: Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['CommunityEdge']>>> };
  Community: Omit<GqlCommunity, 'city' | 'memberships' | 'opportunities' | 'participations' | 'state' | 'utilities' | 'wallets'> & { city: GqlResolversParentTypes['City'], memberships?: Maybe<Array<GqlResolversParentTypes['Membership']>>, opportunities?: Maybe<Array<GqlResolversParentTypes['Opportunity']>>, participations?: Maybe<Array<GqlResolversParentTypes['Participation']>>, state?: Maybe<GqlResolversParentTypes['State']>, utilities?: Maybe<Array<GqlResolversParentTypes['Utility']>>, wallets?: Maybe<Array<GqlResolversParentTypes['Wallet']>> };
  CommunityAcceptUserInput: GqlCommunityAcceptUserInput;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityCreatePayload'];
  CommunityCreateSuccess: Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CommunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityDeletePayload'];
  CommunityDeleteSuccess: GqlCommunityDeleteSuccess;
  CommunityEdge: Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Community']> };
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunityReleaseUserInput: GqlCommunityReleaseUserInput;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityUpdateProfilePayload'];
  CommunityUpdateProfileSuccess: Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CommunityUpdateUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityUpdateUserPayload'];
  CommunityUpdateUserSuccess: Omit<GqlCommunityUpdateUserSuccess, 'community' | 'user'> & { community: GqlResolversParentTypes['Community'], user: GqlResolversParentTypes['User'] };
  ComplexQueryError: GqlComplexQueryError;
  CreateUserInput: GqlCreateUserInput;
  CurrentPointView: Omit<GqlCurrentPointView, 'wallet'> & { wallet: GqlResolversParentTypes['Wallet'] };
  CurrentUserPayload: Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  Datetime: Scalars['Datetime']['output'];
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Error: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Error'];
  Field: GqlField;
  ID: Scalars['ID']['output'];
  ImageInput: GqlImageInput;
  Int: Scalars['Int']['output'];
  InvalidInputValueError: GqlInvalidInputValueError;
  Membership: Omit<GqlMembership, 'community' | 'user'> & { community: GqlResolversParentTypes['Community'], user: GqlResolversParentTypes['User'] };
  MembershipCreateInput: GqlMembershipCreateInput;
  MembershipCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipCreatePayload'];
  MembershipCreateSuccess: Omit<GqlMembershipCreateSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipDeletePayload'];
  MembershipDeleteSuccess: GqlMembershipDeleteSuccess;
  MembershipEdge: Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Membership']> };
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipSortInput: GqlMembershipSortInput;
  MembershipsConnection: Omit<GqlMembershipsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['MembershipEdge']>>> };
  Mutation: {};
  OpportunitiesConnection: Omit<GqlOpportunitiesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['OpportunityEdge']> };
  Opportunity: Omit<GqlOpportunity, 'city' | 'community' | 'createdBy' | 'participations' | 'state'> & { city: GqlResolversParentTypes['City'], community: GqlResolversParentTypes['Community'], createdBy: GqlResolversParentTypes['User'], participations?: Maybe<Array<GqlResolversParentTypes['Participation']>>, state?: Maybe<GqlResolversParentTypes['State']> };
  OpportunityCreateInput: GqlOpportunityCreateInput;
  OpportunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityCreatePayload'];
  OpportunityCreateSuccess: Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityDeletePayload'];
  OpportunityDeleteSuccess: GqlOpportunityDeleteSuccess;
  OpportunityEdge: Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Opportunity']> };
  OpportunityEditContentInput: GqlOpportunityEditContentInput;
  OpportunityEditContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityEditContentPayload'];
  OpportunityEditContentSuccess: Omit<GqlOpportunityEditContentSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunityFilterInput: GqlOpportunityFilterInput;
  OpportunitySetPublishStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySetPublishStatusPayload'];
  OpportunitySetPublishStatusSuccess: Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunitySortInput: GqlOpportunitySortInput;
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Participation: Omit<GqlParticipation, 'community' | 'opportunity' | 'statusHistories' | 'transactions' | 'user'> & { community?: Maybe<GqlResolversParentTypes['Community']>, opportunity?: Maybe<GqlResolversParentTypes['Opportunity']>, statusHistories?: Maybe<Array<GqlResolversParentTypes['ParticipationStatusHistory']>>, transactions?: Maybe<Array<GqlResolversParentTypes['Transaction']>>, user?: Maybe<GqlResolversParentTypes['User']> };
  ParticipationApplyInput: GqlParticipationApplyInput;
  ParticipationApplyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationApplyPayload'];
  ParticipationApplySuccess: Omit<GqlParticipationApplySuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationEdge: Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Participation']> };
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationSetStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationSetStatusPayload'];
  ParticipationSetStatusSuccess: Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatusHistoriesConnection: Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationStatusHistoryEdge']> };
  ParticipationStatusHistory: Omit<GqlParticipationStatusHistory, 'createdBy' | 'participation'> & { createdBy?: Maybe<GqlResolversParentTypes['User']>, participation: GqlResolversParentTypes['Participation'] };
  ParticipationStatusHistoryCreateInput: GqlParticipationStatusHistoryCreateInput;
  ParticipationStatusHistoryCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationStatusHistoryCreatePayload'];
  ParticipationStatusHistoryCreateSuccess: Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: GqlResolversParentTypes['ParticipationStatusHistory'] };
  ParticipationStatusHistoryEdge: Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['ParticipationStatusHistory']> };
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationUpdateStatusInput: GqlParticipationUpdateStatusInput;
  ParticipationsConnection: Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationEdge']> };
  Query: {};
  State: State;
  String: Scalars['String']['output'];
  Transaction: Omit<GqlTransaction, 'fromWallet' | 'participation' | 'toWallet' | 'utility'> & { fromWallet?: Maybe<GqlResolversParentTypes['Wallet']>, participation?: Maybe<GqlResolversParentTypes['Participation']>, toWallet?: Maybe<GqlResolversParentTypes['Wallet']>, utility?: Maybe<GqlResolversParentTypes['Utility']> };
  TransactionCreateInput: GqlTransactionCreateInput;
  TransactionCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionCreatePayload'];
  TransactionCreateSuccess: Omit<GqlTransactionCreateSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionEdge: Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Transaction']> };
  TransactionFilterInput: GqlTransactionFilterInput;
  TransactionSortInput: GqlTransactionSortInput;
  TransactionsConnection: Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TransactionEdge']>>> };
  User: User;
  UserCreateInput: GqlUserCreateInput;
  UserCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserCreatePayload'];
  UserCreateSuccess: Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  UserDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserDeletePayload'];
  UserDeleteSuccess: GqlUserDeleteSuccess;
  UserEdge: Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['User']> };
  UserFilterInput: GqlUserFilterInput;
  UserSortInput: GqlUserSortInput;
  UserSwitchPrivacyInput: GqlUserSwitchPrivacyInput;
  UserSwitchPrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserSwitchPrivacyPayload'];
  UserSwitchPrivacySuccess: Omit<GqlUserSwitchPrivacySuccess, 'user'> & { user: GqlResolversParentTypes['User'] };
  UserUpdateContentInput: GqlUserUpdateContentInput;
  UserUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateContentPayload'];
  UserUpdateContentSuccess: Omit<GqlUserUpdateContentSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  UsersConnection: Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['UserEdge']>>> };
  UtilitiesConnection: Omit<GqlUtilitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['UtilityEdge']>>> };
  Utility: Omit<GqlUtility, 'community' | 'transactions'> & { community: GqlResolversParentTypes['Community'], transactions?: Maybe<Array<GqlResolversParentTypes['Transaction']>> };
  UtilityCreateInput: GqlUtilityCreateInput;
  UtilityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityCreatePayload'];
  UtilityCreateSuccess: Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: GqlResolversParentTypes['Utility'] };
  UtilityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityDeletePayload'];
  UtilityDeleteSuccess: GqlUtilityDeleteSuccess;
  UtilityEdge: Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Utility']> };
  UtilityFilterInput: GqlUtilityFilterInput;
  UtilitySortInput: GqlUtilitySortInput;
  Wallet: Omit<GqlWallet, 'community' | 'currentPointView' | 'fromTransactions' | 'toTransactions' | 'user'> & { community: GqlResolversParentTypes['Community'], currentPointView?: Maybe<GqlResolversParentTypes['CurrentPointView']>, fromTransactions?: Maybe<Array<GqlResolversParentTypes['Transaction']>>, toTransactions?: Maybe<Array<GqlResolversParentTypes['Transaction']>>, user?: Maybe<GqlResolversParentTypes['User']> };
  WalletCreateInput: GqlWalletCreateInput;
  WalletCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['WalletCreatePayload'];
  WalletCreateSuccess: Omit<GqlWalletCreateSuccess, 'wallet'> & { wallet: GqlResolversParentTypes['Wallet'] };
  WalletDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['WalletDeletePayload'];
  WalletDeleteSuccess: GqlWalletDeleteSuccess;
  WalletEdge: Omit<GqlWalletEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Wallet']> };
  WalletFilterInput: GqlWalletFilterInput;
  WalletSortInput: GqlWalletSortInput;
  WalletsConnection: Omit<GqlWalletsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['WalletEdge']>>> };
}>;

export type GqlAuthErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AuthError'] = GqlResolversParentTypes['AuthError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCityResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['City'] = GqlResolversParentTypes['City']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<GqlResolversTypes['State'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommonErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommonError'] = GqlResolversParentTypes['CommonError']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunitiesResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Communities'] = GqlResolversParentTypes['Communities']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Community']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunitiesConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunitiesConnection'] = GqlResolversParentTypes['CommunitiesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['CommunityEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Community'] = GqlResolversParentTypes['Community']> = ResolversObject<{
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<GqlResolversTypes['City'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  establishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  memberships?: Resolver<Maybe<Array<GqlResolversTypes['Membership']>>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunities?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  pointName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<GqlResolversTypes['State']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utilities?: Resolver<Maybe<Array<GqlResolversTypes['Utility']>>, ParentType, ContextType>;
  wallets?: Resolver<Maybe<Array<GqlResolversTypes['Wallet']>>, ParentType, ContextType>;
  website?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityCreatePayload'] = GqlResolversParentTypes['CommunityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityCreateSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunityCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityCreateSuccess'] = GqlResolversParentTypes['CommunityCreateSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityDeletePayload'] = GqlResolversParentTypes['CommunityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityDeleteSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunityDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityDeleteSuccess'] = GqlResolversParentTypes['CommunityDeleteSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityEdge'] = GqlResolversParentTypes['CommunityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityUpdateProfilePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityUpdateProfilePayload'] = GqlResolversParentTypes['CommunityUpdateProfilePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityUpdateProfileSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunityUpdateProfileSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityUpdateProfileSuccess'] = GqlResolversParentTypes['CommunityUpdateProfileSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityUpdateUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityUpdateUserPayload'] = GqlResolversParentTypes['CommunityUpdateUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityUpdateUserSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunityUpdateUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommunityUpdateUserSuccess'] = GqlResolversParentTypes['CommunityUpdateUserSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlComplexQueryErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ComplexQueryError'] = GqlResolversParentTypes['ComplexQueryError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentPointViewResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CurrentPointView'] = GqlResolversParentTypes['CurrentPointView']> = ResolversObject<{
  currentPoint?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  wallet?: Resolver<GqlResolversTypes['Wallet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CurrentUserPayload'] = GqlResolversParentTypes['CurrentUserPayload']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlDatetimeScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Datetime'], any> {
  name: 'Datetime';
}

export type GqlEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Edge'] = GqlResolversParentTypes['Edge']> = ResolversObject<{
  __resolveType: TypeResolveFn<'CommunityEdge' | 'MembershipEdge' | 'OpportunityEdge' | 'ParticipationEdge' | 'ParticipationStatusHistoryEdge' | 'TransactionEdge' | 'UserEdge' | 'UtilityEdge' | 'WalletEdge', ParentType, ContextType>;
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Error'] = GqlResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
}>;

export type GqlFieldResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Field'] = GqlResolversParentTypes['Field']> = ResolversObject<{
  message?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlInvalidInputValueErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['InvalidInputValueError'] = GqlResolversParentTypes['InvalidInputValueError']> = ResolversObject<{
  fields?: Resolver<Maybe<Array<GqlResolversTypes['Field']>>, ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Membership'] = GqlResolversParentTypes['Membership']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  role?: Resolver<GqlResolversTypes['Role'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipCreatePayload'] = GqlResolversParentTypes['MembershipCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipCreateSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipCreateSuccess'] = GqlResolversParentTypes['MembershipCreateSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipDeletePayload'] = GqlResolversParentTypes['MembershipDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipDeleteSuccess'] = GqlResolversParentTypes['MembershipDeleteSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipEdge'] = GqlResolversParentTypes['MembershipEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipsConnection'] = GqlResolversParentTypes['MembershipsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMutationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Mutation'] = GqlResolversParentTypes['Mutation']> = ResolversObject<{
  communityAcceptUser?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityAcceptUserArgs, 'id' | 'input'>>;
  communityCreate?: Resolver<Maybe<GqlResolversTypes['CommunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityCreateArgs, 'input'>>;
  communityDelete?: Resolver<Maybe<GqlResolversTypes['CommunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityDeleteArgs, 'id'>>;
  communityReleaseUser?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityReleaseUserArgs, 'id' | 'input'>>;
  communityUpdateProfile?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityUpdateProfileArgs, 'id' | 'input'>>;
  createUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationCreateUserArgs, 'input'>>;
  deleteUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  membershipCreate?: Resolver<Maybe<GqlResolversTypes['MembershipCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipCreateArgs, 'input'>>;
  membershipDelete?: Resolver<Maybe<GqlResolversTypes['MembershipDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipDeleteArgs, 'communityId' | 'userId'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunityCreate?: Resolver<Maybe<GqlResolversTypes['OpportunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityCreateArgs, 'input'>>;
  opportunityDelete?: Resolver<Maybe<GqlResolversTypes['OpportunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityDeleteArgs, 'id'>>;
  opportunityEditContent?: Resolver<Maybe<GqlResolversTypes['OpportunityEditContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityEditContentArgs, 'id' | 'input'>>;
  opportunitySetCommunityInternal?: Resolver<Maybe<GqlResolversTypes['OpportunitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySetCommunityInternalArgs, 'id'>>;
  opportunitySetPrivate?: Resolver<Maybe<GqlResolversTypes['OpportunitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySetPrivateArgs, 'id'>>;
  opportunitySetPublic?: Resolver<Maybe<GqlResolversTypes['OpportunitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySetPublicArgs, 'id'>>;
  participationSetApply?: Resolver<Maybe<GqlResolversTypes['ParticipationApplyPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationSetApplyArgs, 'input'>>;
  participationSetApprove?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationSetApproveArgs, 'id' | 'input'>>;
  participationSetCancel?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationSetCancelArgs, 'id' | 'input'>>;
  participationSetDeny?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationSetDenyArgs, 'id' | 'input'>>;
  participationSetNotParticipating?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationSetNotParticipatingArgs, 'id' | 'input'>>;
  participationSetParticipating?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationSetParticipatingArgs, 'id' | 'input'>>;
  transactionCreate?: Resolver<Maybe<GqlResolversTypes['TransactionCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionCreateArgs, 'input'>>;
  userCreate?: Resolver<Maybe<GqlResolversTypes['UserCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserCreateArgs, 'input'>>;
  userDelete?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteArgs, 'id'>>;
  userPublish?: Resolver<Maybe<GqlResolversTypes['UserSwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserPublishArgs, 'id' | 'input'>>;
  userUnpublish?: Resolver<Maybe<GqlResolversTypes['UserSwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUnpublishArgs, 'id' | 'input'>>;
  userUpdateContent?: Resolver<Maybe<GqlResolversTypes['UserUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateContentArgs, 'id' | 'input'>>;
  utilityCreate?: Resolver<Maybe<GqlResolversTypes['UtilityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityCreateArgs, 'input'>>;
  utilityDelete?: Resolver<Maybe<GqlResolversTypes['UtilityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityDeleteArgs, 'id'>>;
  walletCreate?: Resolver<Maybe<GqlResolversTypes['WalletCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationWalletCreateArgs, 'input'>>;
  walletDelete?: Resolver<Maybe<GqlResolversTypes['WalletDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationWalletDeleteArgs, 'id'>>;
}>;

export type GqlOpportunitiesConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunitiesConnection'] = GqlResolversParentTypes['OpportunitiesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['OpportunityEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Opportunity'] = GqlResolversParentTypes['Opportunity']> = ResolversObject<{
  capacity?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  category?: Resolver<GqlResolversTypes['OpportunityCategory'], ParentType, ContextType>;
  city?: Resolver<GqlResolversTypes['City'], ParentType, ContextType>;
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  createdBy?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  files?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  pointsPerParticipation?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  publishStatus?: Resolver<GqlResolversTypes['PublishStatus'], ParentType, ContextType>;
  requireApproval?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  startsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  state?: Resolver<Maybe<GqlResolversTypes['State']>, ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityCreatePayload'] = GqlResolversParentTypes['OpportunityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityCreateSuccess'] = GqlResolversParentTypes['OpportunityCreateSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityDeletePayload'] = GqlResolversParentTypes['OpportunityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityDeleteSuccess'] = GqlResolversParentTypes['OpportunityDeleteSuccess']> = ResolversObject<{
  opportunityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityEdge'] = GqlResolversParentTypes['OpportunityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityEditContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityEditContentPayload'] = GqlResolversParentTypes['OpportunityEditContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityEditContentSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityEditContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunityEditContentSuccess'] = GqlResolversParentTypes['OpportunityEditContentSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySetPublishStatusPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunitySetPublishStatusPayload'] = GqlResolversParentTypes['OpportunitySetPublishStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunitySetPublishStatusSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunitySetPublishStatusSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OpportunitySetPublishStatusSuccess'] = GqlResolversParentTypes['OpportunitySetPublishStatusSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPageInfoResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['PageInfo'] = GqlResolversParentTypes['PageInfo']> = ResolversObject<{
  endCursor?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPagingResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Paging'] = GqlResolversParentTypes['Paging']> = ResolversObject<{
  skip?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  take?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Participation'] = GqlResolversParentTypes['Participation']> = ResolversObject<{
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ParticipationStatus'], ParentType, ContextType>;
  statusHistories?: Resolver<Maybe<Array<GqlResolversTypes['ParticipationStatusHistory']>>, ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationApplyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationApplyPayload'] = GqlResolversParentTypes['ParticipationApplyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationApplySuccess', ParentType, ContextType>;
}>;

export type GqlParticipationApplySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationApplySuccess'] = GqlResolversParentTypes['ParticipationApplySuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationEdge'] = GqlResolversParentTypes['ParticipationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationSetStatusPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationSetStatusPayload'] = GqlResolversParentTypes['ParticipationSetStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationSetStatusSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationSetStatusSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationSetStatusSuccess'] = GqlResolversParentTypes['ParticipationSetStatusSuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoriesConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoriesConnection'] = GqlResolversParentTypes['ParticipationStatusHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ParticipationStatusHistoryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationStatusHistory'] = GqlResolversParentTypes['ParticipationStatusHistory']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ParticipationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoryCreatePayload'] = GqlResolversParentTypes['ParticipationStatusHistoryCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationStatusHistoryCreateSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoryCreateSuccess'] = GqlResolversParentTypes['ParticipationStatusHistoryCreateSuccess']> = ResolversObject<{
  participationStatusHistory?: Resolver<GqlResolversTypes['ParticipationStatusHistory'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoryEdge'] = GqlResolversParentTypes['ParticipationStatusHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationsConnection'] = GqlResolversParentTypes['ParticipationsConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ParticipationEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlQueryResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Query'] = GqlResolversParentTypes['Query']> = ResolversObject<{
  cities?: Resolver<Array<GqlResolversTypes['City']>, ParentType, ContextType, Partial<GqlQueryCitiesArgs>>;
  communities?: Resolver<GqlResolversTypes['CommunitiesConnection'], ParentType, ContextType, Partial<GqlQueryCommunitiesArgs>>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType, RequireFields<GqlQueryCommunityArgs, 'id'>>;
  currentUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  echo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  membership?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType, RequireFields<GqlQueryMembershipArgs, 'communityId' | 'userId'>>;
  memberships?: Resolver<GqlResolversTypes['MembershipsConnection'], ParentType, ContextType, Partial<GqlQueryMembershipsArgs>>;
  opportunities?: Resolver<GqlResolversTypes['OpportunitiesConnection'], ParentType, ContextType, Partial<GqlQueryOpportunitiesArgs>>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType, RequireFields<GqlQueryOpportunityArgs, 'id'>>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType, RequireFields<GqlQueryParticipationArgs, 'id'>>;
  participationStatusHistories?: Resolver<GqlResolversTypes['ParticipationStatusHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryParticipationStatusHistoriesArgs>>;
  participationStatusHistory?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistory']>, ParentType, ContextType, RequireFields<GqlQueryParticipationStatusHistoryArgs, 'id'>>;
  participations?: Resolver<GqlResolversTypes['ParticipationsConnection'], ParentType, ContextType, Partial<GqlQueryParticipationsArgs>>;
  states?: Resolver<Array<GqlResolversTypes['State']>, ParentType, ContextType, Partial<GqlQueryStatesArgs>>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<GqlQueryTransactionArgs, 'id'>>;
  transactions?: Resolver<GqlResolversTypes['TransactionsConnection'], ParentType, ContextType, Partial<GqlQueryTransactionsArgs>>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlQueryUserArgs, 'id'>>;
  users?: Resolver<GqlResolversTypes['UsersConnection'], ParentType, ContextType, Partial<GqlQueryUsersArgs>>;
  utilities?: Resolver<GqlResolversTypes['UtilitiesConnection'], ParentType, ContextType, Partial<GqlQueryUtilitiesArgs>>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType, RequireFields<GqlQueryUtilityArgs, 'id'>>;
  wallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType, RequireFields<GqlQueryWalletArgs, 'id'>>;
  wallets?: Resolver<GqlResolversTypes['WalletsConnection'], ParentType, ContextType, Partial<GqlQueryWalletsArgs>>;
}>;

export type GqlStateResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['State'] = GqlResolversParentTypes['State']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  countryCode?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Transaction'] = GqlResolversParentTypes['Transaction']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  fromPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  fromWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  toPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  toWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionCreatePayload'] = GqlResolversParentTypes['TransactionCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionCreateSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionCreateSuccess'] = GqlResolversParentTypes['TransactionCreateSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionEdge'] = GqlResolversParentTypes['TransactionEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionsConnection'] = GqlResolversParentTypes['TransactionsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['User'] = GqlResolversParentTypes['User']> = ResolversObject<{
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  memberships?: Resolver<Maybe<Array<GqlResolversTypes['Membership']>>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunitiesCreatedByMe?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  participationStatusChangedByMe?: Resolver<Maybe<Array<GqlResolversTypes['ParticipationStatusHistory']>>, ParentType, ContextType>;
  participations?: Resolver<Maybe<Array<GqlResolversTypes['Participation']>>, ParentType, ContextType>;
  slug?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  sysRole?: Resolver<GqlResolversTypes['SysRole'], ParentType, ContextType>;
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

export type GqlUserCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserCreatePayload'] = GqlResolversParentTypes['UserCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserCreateSuccess', ParentType, ContextType>;
}>;

export type GqlUserCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserCreateSuccess'] = GqlResolversParentTypes['UserCreateSuccess']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserDeletePayload'] = GqlResolversParentTypes['UserDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlUserDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserDeleteSuccess'] = GqlResolversParentTypes['UserDeleteSuccess']> = ResolversObject<{
  userId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserEdge'] = GqlResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserSwitchPrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserSwitchPrivacyPayload'] = GqlResolversParentTypes['UserSwitchPrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserSwitchPrivacySuccess', ParentType, ContextType>;
}>;

export type GqlUserSwitchPrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserSwitchPrivacySuccess'] = GqlResolversParentTypes['UserSwitchPrivacySuccess']> = ResolversObject<{
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateContentPayload'] = GqlResolversParentTypes['UserUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateContentSuccess'] = GqlResolversParentTypes['UserUpdateContentSuccess']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUsersConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UsersConnection'] = GqlResolversParentTypes['UsersConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilitiesConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilitiesConnection'] = GqlResolversParentTypes['UtilitiesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['UtilityEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Utility'] = GqlResolversParentTypes['Utility']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  pointsRequired?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityCreatePayload'] = GqlResolversParentTypes['UtilityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityCreateSuccess'] = GqlResolversParentTypes['UtilityCreateSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityDeletePayload'] = GqlResolversParentTypes['UtilityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityDeleteSuccess'] = GqlResolversParentTypes['UtilityDeleteSuccess']> = ResolversObject<{
  utilityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityEdge'] = GqlResolversParentTypes['UtilityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Wallet'] = GqlResolversParentTypes['Wallet']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  currentPointView?: Resolver<Maybe<GqlResolversTypes['CurrentPointView']>, ParentType, ContextType>;
  fromTransactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  toTransactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['WalletCreatePayload'] = GqlResolversParentTypes['WalletCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'WalletCreateSuccess', ParentType, ContextType>;
}>;

export type GqlWalletCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['WalletCreateSuccess'] = GqlResolversParentTypes['WalletCreateSuccess']> = ResolversObject<{
  wallet?: Resolver<GqlResolversTypes['Wallet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['WalletDeletePayload'] = GqlResolversParentTypes['WalletDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'WalletDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlWalletDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['WalletDeleteSuccess'] = GqlResolversParentTypes['WalletDeleteSuccess']> = ResolversObject<{
  walletId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['WalletEdge'] = GqlResolversParentTypes['WalletEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['WalletsConnection'] = GqlResolversParentTypes['WalletsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['WalletEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlResolvers<ContextType = Context> = ResolversObject<{
  AuthError?: GqlAuthErrorResolvers<ContextType>;
  City?: GqlCityResolvers<ContextType>;
  CommonError?: GqlCommonErrorResolvers<ContextType>;
  Communities?: GqlCommunitiesResolvers<ContextType>;
  CommunitiesConnection?: GqlCommunitiesConnectionResolvers<ContextType>;
  Community?: GqlCommunityResolvers<ContextType>;
  CommunityCreatePayload?: GqlCommunityCreatePayloadResolvers<ContextType>;
  CommunityCreateSuccess?: GqlCommunityCreateSuccessResolvers<ContextType>;
  CommunityDeletePayload?: GqlCommunityDeletePayloadResolvers<ContextType>;
  CommunityDeleteSuccess?: GqlCommunityDeleteSuccessResolvers<ContextType>;
  CommunityEdge?: GqlCommunityEdgeResolvers<ContextType>;
  CommunityUpdateProfilePayload?: GqlCommunityUpdateProfilePayloadResolvers<ContextType>;
  CommunityUpdateProfileSuccess?: GqlCommunityUpdateProfileSuccessResolvers<ContextType>;
  CommunityUpdateUserPayload?: GqlCommunityUpdateUserPayloadResolvers<ContextType>;
  CommunityUpdateUserSuccess?: GqlCommunityUpdateUserSuccessResolvers<ContextType>;
  ComplexQueryError?: GqlComplexQueryErrorResolvers<ContextType>;
  CurrentPointView?: GqlCurrentPointViewResolvers<ContextType>;
  CurrentUserPayload?: GqlCurrentUserPayloadResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Field?: GqlFieldResolvers<ContextType>;
  InvalidInputValueError?: GqlInvalidInputValueErrorResolvers<ContextType>;
  Membership?: GqlMembershipResolvers<ContextType>;
  MembershipCreatePayload?: GqlMembershipCreatePayloadResolvers<ContextType>;
  MembershipCreateSuccess?: GqlMembershipCreateSuccessResolvers<ContextType>;
  MembershipDeletePayload?: GqlMembershipDeletePayloadResolvers<ContextType>;
  MembershipDeleteSuccess?: GqlMembershipDeleteSuccessResolvers<ContextType>;
  MembershipEdge?: GqlMembershipEdgeResolvers<ContextType>;
  MembershipsConnection?: GqlMembershipsConnectionResolvers<ContextType>;
  Mutation?: GqlMutationResolvers<ContextType>;
  OpportunitiesConnection?: GqlOpportunitiesConnectionResolvers<ContextType>;
  Opportunity?: GqlOpportunityResolvers<ContextType>;
  OpportunityCreatePayload?: GqlOpportunityCreatePayloadResolvers<ContextType>;
  OpportunityCreateSuccess?: GqlOpportunityCreateSuccessResolvers<ContextType>;
  OpportunityDeletePayload?: GqlOpportunityDeletePayloadResolvers<ContextType>;
  OpportunityDeleteSuccess?: GqlOpportunityDeleteSuccessResolvers<ContextType>;
  OpportunityEdge?: GqlOpportunityEdgeResolvers<ContextType>;
  OpportunityEditContentPayload?: GqlOpportunityEditContentPayloadResolvers<ContextType>;
  OpportunityEditContentSuccess?: GqlOpportunityEditContentSuccessResolvers<ContextType>;
  OpportunitySetPublishStatusPayload?: GqlOpportunitySetPublishStatusPayloadResolvers<ContextType>;
  OpportunitySetPublishStatusSuccess?: GqlOpportunitySetPublishStatusSuccessResolvers<ContextType>;
  PageInfo?: GqlPageInfoResolvers<ContextType>;
  Paging?: GqlPagingResolvers<ContextType>;
  Participation?: GqlParticipationResolvers<ContextType>;
  ParticipationApplyPayload?: GqlParticipationApplyPayloadResolvers<ContextType>;
  ParticipationApplySuccess?: GqlParticipationApplySuccessResolvers<ContextType>;
  ParticipationEdge?: GqlParticipationEdgeResolvers<ContextType>;
  ParticipationSetStatusPayload?: GqlParticipationSetStatusPayloadResolvers<ContextType>;
  ParticipationSetStatusSuccess?: GqlParticipationSetStatusSuccessResolvers<ContextType>;
  ParticipationStatusHistoriesConnection?: GqlParticipationStatusHistoriesConnectionResolvers<ContextType>;
  ParticipationStatusHistory?: GqlParticipationStatusHistoryResolvers<ContextType>;
  ParticipationStatusHistoryCreatePayload?: GqlParticipationStatusHistoryCreatePayloadResolvers<ContextType>;
  ParticipationStatusHistoryCreateSuccess?: GqlParticipationStatusHistoryCreateSuccessResolvers<ContextType>;
  ParticipationStatusHistoryEdge?: GqlParticipationStatusHistoryEdgeResolvers<ContextType>;
  ParticipationsConnection?: GqlParticipationsConnectionResolvers<ContextType>;
  Query?: GqlQueryResolvers<ContextType>;
  State?: GqlStateResolvers<ContextType>;
  Transaction?: GqlTransactionResolvers<ContextType>;
  TransactionCreatePayload?: GqlTransactionCreatePayloadResolvers<ContextType>;
  TransactionCreateSuccess?: GqlTransactionCreateSuccessResolvers<ContextType>;
  TransactionEdge?: GqlTransactionEdgeResolvers<ContextType>;
  TransactionsConnection?: GqlTransactionsConnectionResolvers<ContextType>;
  User?: GqlUserResolvers<ContextType>;
  UserCreatePayload?: GqlUserCreatePayloadResolvers<ContextType>;
  UserCreateSuccess?: GqlUserCreateSuccessResolvers<ContextType>;
  UserDeletePayload?: GqlUserDeletePayloadResolvers<ContextType>;
  UserDeleteSuccess?: GqlUserDeleteSuccessResolvers<ContextType>;
  UserEdge?: GqlUserEdgeResolvers<ContextType>;
  UserSwitchPrivacyPayload?: GqlUserSwitchPrivacyPayloadResolvers<ContextType>;
  UserSwitchPrivacySuccess?: GqlUserSwitchPrivacySuccessResolvers<ContextType>;
  UserUpdateContentPayload?: GqlUserUpdateContentPayloadResolvers<ContextType>;
  UserUpdateContentSuccess?: GqlUserUpdateContentSuccessResolvers<ContextType>;
  UsersConnection?: GqlUsersConnectionResolvers<ContextType>;
  UtilitiesConnection?: GqlUtilitiesConnectionResolvers<ContextType>;
  Utility?: GqlUtilityResolvers<ContextType>;
  UtilityCreatePayload?: GqlUtilityCreatePayloadResolvers<ContextType>;
  UtilityCreateSuccess?: GqlUtilityCreateSuccessResolvers<ContextType>;
  UtilityDeletePayload?: GqlUtilityDeletePayloadResolvers<ContextType>;
  UtilityDeleteSuccess?: GqlUtilityDeleteSuccessResolvers<ContextType>;
  UtilityEdge?: GqlUtilityEdgeResolvers<ContextType>;
  Wallet?: GqlWalletResolvers<ContextType>;
  WalletCreatePayload?: GqlWalletCreatePayloadResolvers<ContextType>;
  WalletCreateSuccess?: GqlWalletCreateSuccessResolvers<ContextType>;
  WalletDeletePayload?: GqlWalletDeletePayloadResolvers<ContextType>;
  WalletDeleteSuccess?: GqlWalletDeleteSuccessResolvers<ContextType>;
  WalletEdge?: GqlWalletEdgeResolvers<ContextType>;
  WalletsConnection?: GqlWalletsConnectionResolvers<ContextType>;
}>;


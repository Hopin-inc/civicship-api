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
  communityId: Scalars['String']['output'];
};

export type GqlCommunityEdge = GqlEdge & {
  __typename?: 'CommunityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlCommunity>;
};

export type GqlCommunityFilterInput = {
  cityCode?: InputMaybe<Scalars['String']['input']>;
  stateCode?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommunitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
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

export type GqlComplexQueryError = GqlError & {
  __typename?: 'ComplexQueryError';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlCreateUserInput = {
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCurrentPointView = {
  __typename?: 'CurrentPointView';
  currentPoint: Scalars['Int']['output'];
  walletId: Scalars['String']['output'];
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
  status?: Maybe<GqlMembershipStatus>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
};

export type GqlMembershipApproveInvitationInput = {
  communityId: Scalars['String']['input'];
};

export type GqlMembershipAssignManagerInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type GqlMembershipAssignMemberInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type GqlMembershipAssignOwnerInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type GqlMembershipCancelInvitationInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type GqlMembershipDenyInvitationInput = {
  communityId: Scalars['String']['input'];
};

export type GqlMembershipEdge = GqlEdge & {
  __typename?: 'MembershipEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlMembership>;
};

export type GqlMembershipFilterInput = {
  communityId?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<GqlRole>;
  status?: InputMaybe<GqlMembershipStatus>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlMembershipInviteInput = {
  communityId: Scalars['String']['input'];
  role?: InputMaybe<GqlRole>;
  userId: Scalars['String']['input'];
};

export type GqlMembershipInvitePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipInviteSuccess;

export type GqlMembershipInviteSuccess = {
  __typename?: 'MembershipInviteSuccess';
  membership: GqlMembership;
};

export type GqlMembershipRemoveInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type GqlMembershipRemovePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipRemoveSuccess;

export type GqlMembershipRemoveSuccess = {
  __typename?: 'MembershipRemoveSuccess';
  communityId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type GqlMembershipSelfJoinInput = {
  communityId: Scalars['String']['input'];
};

export type GqlMembershipSelfJoinPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipSelfJoinSuccess;

export type GqlMembershipSelfJoinSuccess = {
  __typename?: 'MembershipSelfJoinSuccess';
  membership: GqlMembership;
};

export type GqlMembershipSetInvitationStatusPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipSetInvitationStatusSuccess;

export type GqlMembershipSetInvitationStatusSuccess = {
  __typename?: 'MembershipSetInvitationStatusSuccess';
  membership: GqlMembership;
};

export type GqlMembershipSetRolePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipSetRoleSuccess;

export type GqlMembershipSetRoleSuccess = {
  __typename?: 'MembershipSetRoleSuccess';
  membership: GqlMembership;
};

export type GqlMembershipSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlMembershipStatus = {
  Canceled: 'CANCELED',
  Invited: 'INVITED',
  Joined: 'JOINED',
  Withdrawed: 'WITHDRAWED'
} as const;

export type GqlMembershipStatus = typeof GqlMembershipStatus[keyof typeof GqlMembershipStatus];
export type GqlMembershipWithdrawInput = {
  communityId: Scalars['String']['input'];
};

export type GqlMembershipWithdrawPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlMembershipWithdrawSuccess;

export type GqlMembershipWithdrawSuccess = {
  __typename?: 'MembershipWithdrawSuccess';
  communityId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type GqlMembershipsConnection = {
  __typename?: 'MembershipsConnection';
  edges?: Maybe<Array<Maybe<GqlMembershipEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlMutation = {
  __typename?: 'Mutation';
  communityCreate?: Maybe<GqlCommunityCreatePayload>;
  communityDelete?: Maybe<GqlCommunityDeletePayload>;
  communityUpdateProfile?: Maybe<GqlCommunityUpdateProfilePayload>;
  createUser?: Maybe<GqlCurrentUserPayload>;
  deleteUser?: Maybe<GqlCurrentUserPayload>;
  membershipApproveInvitation?: Maybe<GqlMembershipSetInvitationStatusPayload>;
  membershipAssignManager?: Maybe<GqlMembershipSetRolePayload>;
  membershipAssignMemberRole?: Maybe<GqlMembershipSetRolePayload>;
  membershipAssignOwner?: Maybe<GqlMembershipSetRolePayload>;
  membershipCancelInvitation?: Maybe<GqlMembershipSetInvitationStatusPayload>;
  membershipDenyInvitation?: Maybe<GqlMembershipSetInvitationStatusPayload>;
  membershipInvite?: Maybe<GqlMembershipInvitePayload>;
  membershipRemove?: Maybe<GqlMembershipRemovePayload>;
  membershipSelfJoin?: Maybe<GqlMembershipSelfJoinPayload>;
  membershipWithdraw?: Maybe<GqlMembershipWithdrawPayload>;
  mutationEcho: Scalars['String']['output'];
  opportunityCreate?: Maybe<GqlOpportunityCreatePayload>;
  opportunityDelete?: Maybe<GqlOpportunityDeletePayload>;
  opportunityEditContent?: Maybe<GqlOpportunityEditContentPayload>;
  opportunitySetPublishStatus?: Maybe<GqlOpportunitySetPublishStatusPayload>;
  participationApply?: Maybe<GqlParticipationApplyPayload>;
  participationApproveApplication?: Maybe<GqlParticipationSetStatusPayload>;
  participationApproveInvitation?: Maybe<GqlParticipationSetStatusPayload>;
  participationApprovePerformance?: Maybe<GqlParticipationSetStatusPayload>;
  participationCancelApplication?: Maybe<GqlParticipationSetStatusPayload>;
  participationCancelInvitation?: Maybe<GqlParticipationSetStatusPayload>;
  participationDenyApplication?: Maybe<GqlParticipationSetStatusPayload>;
  participationDenyInvitation?: Maybe<GqlParticipationSetStatusPayload>;
  participationDenyPerformance?: Maybe<GqlParticipationSetStatusPayload>;
  participationInvite?: Maybe<GqlParticipationInvitePayload>;
  transactionDonateSelfPoint?: Maybe<GqlTransactionDonateSelfPointPayload>;
  transactionGrantCommunityPoint?: Maybe<GqlTransactionGrantCommunityPointPayload>;
  transactionIssueCommunityPoint?: Maybe<GqlTransactionIssueCommunityPointPayload>;
  userUpdateProfile?: Maybe<GqlUserUpdateProfilePayload>;
  utilityCreate?: Maybe<GqlUtilityCreatePayload>;
  utilityDelete?: Maybe<GqlUtilityDeletePayload>;
  utilityUpdateInfo?: Maybe<GqlUtilityUpdateInfoPayload>;
  utilityUse?: Maybe<GqlUtilityUsePayload>;
};


export type GqlMutationCommunityCreateArgs = {
  input: GqlCommunityCreateInput;
};


export type GqlMutationCommunityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationCommunityUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityUpdateProfileInput;
};


export type GqlMutationCreateUserArgs = {
  input: GqlCreateUserInput;
};


export type GqlMutationMembershipApproveInvitationArgs = {
  input: GqlMembershipApproveInvitationInput;
};


export type GqlMutationMembershipAssignManagerArgs = {
  input: GqlMembershipAssignManagerInput;
};


export type GqlMutationMembershipAssignMemberRoleArgs = {
  input: GqlMembershipAssignMemberInput;
};


export type GqlMutationMembershipAssignOwnerArgs = {
  input: GqlMembershipAssignOwnerInput;
};


export type GqlMutationMembershipCancelInvitationArgs = {
  input: GqlMembershipCancelInvitationInput;
};


export type GqlMutationMembershipDenyInvitationArgs = {
  input: GqlMembershipDenyInvitationInput;
};


export type GqlMutationMembershipInviteArgs = {
  input: GqlMembershipInviteInput;
};


export type GqlMutationMembershipRemoveArgs = {
  input: GqlMembershipRemoveInput;
};


export type GqlMutationMembershipSelfJoinArgs = {
  input: GqlMembershipSelfJoinInput;
};


export type GqlMutationMembershipWithdrawArgs = {
  input: GqlMembershipWithdrawInput;
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


export type GqlMutationOpportunitySetPublishStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunitySetPublishStatusInput;
};


export type GqlMutationParticipationApplyArgs = {
  input: GqlParticipationApplyInput;
};


export type GqlMutationParticipationApproveApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationApproveInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationApprovePerformanceArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationCancelApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationCancelInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationDenyApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationDenyInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationDenyPerformanceArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationInviteArgs = {
  input: GqlParticipationInviteInput;
};


export type GqlMutationTransactionDonateSelfPointArgs = {
  input: GqlTransactionDonateSelfPointInput;
};


export type GqlMutationTransactionGrantCommunityPointArgs = {
  input: GqlTransactionGrantCommunityPointInput;
};


export type GqlMutationTransactionIssueCommunityPointArgs = {
  input: GqlTransactionIssueCommunityPointInput;
};


export type GqlMutationUserUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserUpdateProfileInput;
};


export type GqlMutationUtilityCreateArgs = {
  input: GqlUtilityCreateInput;
};


export type GqlMutationUtilityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationUtilityUpdateInfoArgs = {
  id: Scalars['ID']['input'];
  input: GqlUtilityUpdateInfoInput;
};


export type GqlMutationUtilityUseArgs = {
  id: Scalars['ID']['input'];
  input: GqlUtilityUseInput;
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
  createdByUser: GqlUser;
  description?: Maybe<Scalars['String']['output']>;
  endsAt?: Maybe<Scalars['Datetime']['output']>;
  files?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  participations?: Maybe<GqlParticipationsConnection>;
  pointsPerParticipation: Scalars['Int']['output'];
  publishStatus: GqlPublishStatus;
  requireApproval: Scalars['Boolean']['output'];
  startsAt?: Maybe<Scalars['Datetime']['output']>;
  state?: Maybe<GqlState>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlOpportunityParticipationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
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
  cityCode?: InputMaybe<Scalars['String']['input']>;
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

export type GqlOpportunitySetPublishStatusInput = {
  status: GqlPublishStatus;
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
  statusHistories?: Maybe<GqlParticipationStatusHistoriesConnection>;
  transactions?: Maybe<GqlTransactionsConnection>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};


export type GqlParticipationStatusHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


export type GqlParticipationTransactionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type GqlParticipationApplyInput = {
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

export type GqlParticipationInviteInput = {
  invitedUserId: Scalars['String']['input'];
  opportunityId: Scalars['String']['input'];
};

export type GqlParticipationInvitePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlParticipationInviteSuccess;

export type GqlParticipationInviteSuccess = {
  __typename?: 'ParticipationInviteSuccess';
  participation: GqlParticipation;
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
  Invited: 'INVITED',
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
  createdByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  participation: GqlParticipation;
  status: GqlParticipationStatus;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlParticipationStatusHistoryCreateInput = {
  createdById: Scalars['String']['input'];
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
  reason?: Maybe<GqlTransactionReason>;
  toPointChange?: Maybe<Scalars['Int']['output']>;
  toWallet?: Maybe<GqlWallet>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utility?: Maybe<GqlUtility>;
};

export type GqlTransactionDonateSelfPointInput = {
  from: Scalars['String']['input'];
  fromPointChange: Scalars['Int']['input'];
  to: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
};

export type GqlTransactionDonateSelfPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionDonateSelfPointSuccess;

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
  fromWalletId?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  participationId?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<GqlTransactionReason>;
  toWalletId?: InputMaybe<Scalars['String']['input']>;
  utilityId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlTransactionGiveRewardPointInput = {
  from: Scalars['String']['input'];
  fromPointChange: Scalars['Int']['input'];
  participationId: Scalars['String']['input'];
  to: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
};

export type GqlTransactionGiveRewardPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionGiveRewardPointSuccess;

export type GqlTransactionGiveRewardPointSuccess = {
  __typename?: 'TransactionGiveRewardPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionGrantCommunityPointInput = {
  from: Scalars['String']['input'];
  fromPointChange: Scalars['Int']['input'];
  to: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
};

export type GqlTransactionGrantCommunityPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionGrantCommunityPointSuccess;

export type GqlTransactionGrantCommunityPointSuccess = {
  __typename?: 'TransactionGrantCommunityPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionIssueCommunityPointInput = {
  to: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
};

export type GqlTransactionIssueCommunityPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionIssueCommunityPointSuccess;

export type GqlTransactionIssueCommunityPointSuccess = {
  __typename?: 'TransactionIssueCommunityPointSuccess';
  transaction: GqlTransaction;
};

export const GqlTransactionReason = {
  Gift: 'GIFT',
  MembershipDeleted: 'MEMBERSHIP_DELETED',
  Other: 'OTHER',
  ParticipationApproved: 'PARTICIPATION_APPROVED',
  PointIssued: 'POINT_ISSUED',
  UtilityUsage: 'UTILITY_USAGE'
} as const;

export type GqlTransactionReason = typeof GqlTransactionReason[keyof typeof GqlTransactionReason];
export type GqlTransactionSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTransactionUseUtilityInput = {
  from: Scalars['String']['input'];
  fromPointChange: Scalars['Int']['input'];
  to: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
  utilityId: Scalars['String']['input'];
};

export type GqlTransactionUseUtilityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionUseUtilitySuccess;

export type GqlTransactionUseUtilitySuccess = {
  __typename?: 'TransactionUseUtilitySuccess';
  transaction: GqlTransaction;
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
  sysRole?: Maybe<GqlSysRole>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  urlFacebook?: Maybe<Scalars['String']['output']>;
  urlInstagram?: Maybe<Scalars['String']['output']>;
  urlTiktok?: Maybe<Scalars['String']['output']>;
  urlWebsite?: Maybe<Scalars['String']['output']>;
  urlX?: Maybe<Scalars['String']['output']>;
  urlYoutube?: Maybe<Scalars['String']['output']>;
  wallets?: Maybe<Array<GqlWallet>>;
};

export type GqlUserEdge = GqlEdge & {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUser>;
};

export type GqlUserFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  sysRole?: InputMaybe<GqlSysRole>;
};

export type GqlUserSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlUserUpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  urlFacebook?: InputMaybe<Scalars['String']['input']>;
  urlInstagram?: InputMaybe<Scalars['String']['input']>;
  urlTiktok?: InputMaybe<Scalars['String']['input']>;
  urlWebsite?: InputMaybe<Scalars['String']['input']>;
  urlX?: InputMaybe<Scalars['String']['input']>;
  urlYoutube?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserUpdateProfilePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdateProfileSuccess;

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
  communityId: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<GqlImageInput>;
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
  utilityId: Scalars['String']['output'];
};

export type GqlUtilityEdge = GqlEdge & {
  __typename?: 'UtilityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUtility>;
};

export type GqlUtilityFilterInput = {
  communityId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUtilitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  pointsRequired?: InputMaybe<GqlSortDirection>;
};

export type GqlUtilityUpdateInfoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  pointsRequired: Scalars['Int']['input'];
};

export type GqlUtilityUpdateInfoPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUtilityUpdateInfoSuccess;

export type GqlUtilityUpdateInfoSuccess = {
  __typename?: 'UtilityUpdateInfoSuccess';
  utility: GqlUtility;
};

export type GqlUtilityUseInput = {
  userWalletId: Scalars['String']['input'];
};

export type GqlUtilityUsePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUtilityUseSuccess;

export type GqlUtilityUseSuccess = {
  __typename?: 'UtilityUseSuccess';
  transaction: GqlTransaction;
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
  id: Scalars['ID']['output'];
  transactions?: Maybe<Array<GqlTransaction>>;
  type: GqlWalletType;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};


export type GqlWalletTransactionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type GqlWalletCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlWalletCreateSuccess;

export type GqlWalletCreateSuccess = {
  __typename?: 'WalletCreateSuccess';
  wallet: GqlWallet;
};

export type GqlWalletCreateToCommunityInput = {
  communityId: Scalars['String']['input'];
};

export type GqlWalletCreateToMemberInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type GqlWalletDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlWalletDeleteSuccess;

export type GqlWalletDeleteSuccess = {
  __typename?: 'WalletDeleteSuccess';
  walletId: Scalars['String']['output'];
};

export type GqlWalletEdge = GqlEdge & {
  __typename?: 'WalletEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlWallet>;
};

export type GqlWalletFilterInput = {
  communityId?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<GqlWalletType>;
  userId?: InputMaybe<Scalars['String']['input']>;
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
  CommonError: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityCreatePayload: ( GqlAuthError ) | ( Omit<GqlCommunityCreateSuccess, 'community'> & { community: _RefType['Community'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityDeletePayload: ( GqlAuthError ) | ( GqlCommunityDeleteSuccess ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityUpdateProfilePayload: ( GqlAuthError ) | ( Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: _RefType['Community'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  MembershipInvitePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipRemovePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlMembershipRemoveSuccess );
  MembershipSelfJoinPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipSelfJoinSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipSetInvitationStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipSetRolePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipWithdrawPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlMembershipWithdrawSuccess );
  OpportunityCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunityDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlOpportunityDeleteSuccess );
  OpportunityEditContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityEditContentSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunitySetPublishStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  ParticipationApplyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationApplySuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationInvitePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationInviteSuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationSetStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationStatusHistoryCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: _RefType['ParticipationStatusHistory'] } );
  TransactionDonateSelfPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionGiveRewardPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionGiveRewardPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionGrantCommunityPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionIssueCommunityPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionUseUtilityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionUseUtilitySuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UserUpdateProfilePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UtilityCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUtilityDeleteSuccess );
  UtilityUpdateInfoPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityUsePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityUseSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
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
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityCreatePayload']>;
  CommunityCreateSuccess: ResolverTypeWrapper<Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CommunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityDeletePayload']>;
  CommunityDeleteSuccess: ResolverTypeWrapper<GqlCommunityDeleteSuccess>;
  CommunityEdge: ResolverTypeWrapper<Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Community']> }>;
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityUpdateProfilePayload']>;
  CommunityUpdateProfileSuccess: ResolverTypeWrapper<Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  ComplexQueryError: ResolverTypeWrapper<GqlComplexQueryError>;
  CreateUserInput: GqlCreateUserInput;
  CurrentPointView: ResolverTypeWrapper<GqlCurrentPointView>;
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
  MembershipApproveInvitationInput: GqlMembershipApproveInvitationInput;
  MembershipAssignManagerInput: GqlMembershipAssignManagerInput;
  MembershipAssignMemberInput: GqlMembershipAssignMemberInput;
  MembershipAssignOwnerInput: GqlMembershipAssignOwnerInput;
  MembershipCancelInvitationInput: GqlMembershipCancelInvitationInput;
  MembershipDenyInvitationInput: GqlMembershipDenyInvitationInput;
  MembershipEdge: ResolverTypeWrapper<Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Membership']> }>;
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipInvitePayload']>;
  MembershipInviteSuccess: ResolverTypeWrapper<Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipRemoveInput: GqlMembershipRemoveInput;
  MembershipRemovePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipRemovePayload']>;
  MembershipRemoveSuccess: ResolverTypeWrapper<GqlMembershipRemoveSuccess>;
  MembershipSelfJoinInput: GqlMembershipSelfJoinInput;
  MembershipSelfJoinPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipSelfJoinPayload']>;
  MembershipSelfJoinSuccess: ResolverTypeWrapper<Omit<GqlMembershipSelfJoinSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipSetInvitationStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipSetInvitationStatusPayload']>;
  MembershipSetInvitationStatusSuccess: ResolverTypeWrapper<Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipSetRolePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipSetRolePayload']>;
  MembershipSetRoleSuccess: ResolverTypeWrapper<Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipSortInput: GqlMembershipSortInput;
  MembershipStatus: GqlMembershipStatus;
  MembershipWithdrawInput: GqlMembershipWithdrawInput;
  MembershipWithdrawPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipWithdrawPayload']>;
  MembershipWithdrawSuccess: ResolverTypeWrapper<GqlMembershipWithdrawSuccess>;
  MembershipsConnection: ResolverTypeWrapper<Omit<GqlMembershipsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>> }>;
  Mutation: ResolverTypeWrapper<{}>;
  OpportunitiesConnection: ResolverTypeWrapper<Omit<GqlOpportunitiesConnection, 'edges'> & { edges: Array<GqlResolversTypes['OpportunityEdge']> }>;
  Opportunity: ResolverTypeWrapper<Omit<GqlOpportunity, 'city' | 'community' | 'createdByUser' | 'participations' | 'state'> & { city: GqlResolversTypes['City'], community: GqlResolversTypes['Community'], createdByUser: GqlResolversTypes['User'], participations?: Maybe<GqlResolversTypes['ParticipationsConnection']>, state?: Maybe<GqlResolversTypes['State']> }>;
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
  OpportunitySetPublishStatusInput: GqlOpportunitySetPublishStatusInput;
  OpportunitySetPublishStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySetPublishStatusPayload']>;
  OpportunitySetPublishStatusSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunitySortInput: GqlOpportunitySortInput;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Participation: ResolverTypeWrapper<Omit<GqlParticipation, 'community' | 'opportunity' | 'statusHistories' | 'transactions' | 'user'> & { community?: Maybe<GqlResolversTypes['Community']>, opportunity?: Maybe<GqlResolversTypes['Opportunity']>, statusHistories?: Maybe<GqlResolversTypes['ParticipationStatusHistoriesConnection']>, transactions?: Maybe<GqlResolversTypes['TransactionsConnection']>, user?: Maybe<GqlResolversTypes['User']> }>;
  ParticipationApplyInput: GqlParticipationApplyInput;
  ParticipationApplyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationApplyPayload']>;
  ParticipationApplySuccess: ResolverTypeWrapper<Omit<GqlParticipationApplySuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationEdge: ResolverTypeWrapper<Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Participation']> }>;
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationInviteInput: GqlParticipationInviteInput;
  ParticipationInvitePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationInvitePayload']>;
  ParticipationInviteSuccess: ResolverTypeWrapper<Omit<GqlParticipationInviteSuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationSetStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationSetStatusPayload']>;
  ParticipationSetStatusSuccess: ResolverTypeWrapper<Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatus: GqlParticipationStatus;
  ParticipationStatusHistoriesConnection: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationStatusHistoryEdge']> }>;
  ParticipationStatusHistory: ResolverTypeWrapper<Omit<GqlParticipationStatusHistory, 'createdByUser' | 'participation'> & { createdByUser?: Maybe<GqlResolversTypes['User']>, participation: GqlResolversTypes['Participation'] }>;
  ParticipationStatusHistoryCreateInput: GqlParticipationStatusHistoryCreateInput;
  ParticipationStatusHistoryCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationStatusHistoryCreatePayload']>;
  ParticipationStatusHistoryCreateSuccess: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: GqlResolversTypes['ParticipationStatusHistory'] }>;
  ParticipationStatusHistoryEdge: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['ParticipationStatusHistory']> }>;
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationsConnection: ResolverTypeWrapper<Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationEdge']> }>;
  PublishStatus: GqlPublishStatus;
  Query: ResolverTypeWrapper<{}>;
  Role: GqlRole;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SysRole: GqlSysRole;
  Transaction: ResolverTypeWrapper<Omit<GqlTransaction, 'fromWallet' | 'participation' | 'toWallet' | 'utility'> & { fromWallet?: Maybe<GqlResolversTypes['Wallet']>, participation?: Maybe<GqlResolversTypes['Participation']>, toWallet?: Maybe<GqlResolversTypes['Wallet']>, utility?: Maybe<GqlResolversTypes['Utility']> }>;
  TransactionDonateSelfPointInput: GqlTransactionDonateSelfPointInput;
  TransactionDonateSelfPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionDonateSelfPointPayload']>;
  TransactionDonateSelfPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionEdge: ResolverTypeWrapper<Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Transaction']> }>;
  TransactionFilterInput: GqlTransactionFilterInput;
  TransactionGiveRewardPointInput: GqlTransactionGiveRewardPointInput;
  TransactionGiveRewardPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionGiveRewardPointPayload']>;
  TransactionGiveRewardPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionGiveRewardPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionGrantCommunityPointInput: GqlTransactionGrantCommunityPointInput;
  TransactionGrantCommunityPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionGrantCommunityPointPayload']>;
  TransactionGrantCommunityPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionIssueCommunityPointInput: GqlTransactionIssueCommunityPointInput;
  TransactionIssueCommunityPointPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionIssueCommunityPointPayload']>;
  TransactionIssueCommunityPointSuccess: ResolverTypeWrapper<Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionReason: GqlTransactionReason;
  TransactionSortInput: GqlTransactionSortInput;
  TransactionUseUtilityInput: GqlTransactionUseUtilityInput;
  TransactionUseUtilityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionUseUtilityPayload']>;
  TransactionUseUtilitySuccess: ResolverTypeWrapper<Omit<GqlTransactionUseUtilitySuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionsConnection: ResolverTypeWrapper<Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>> }>;
  User: ResolverTypeWrapper<User>;
  UserEdge: ResolverTypeWrapper<Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversTypes['User']> }>;
  UserFilterInput: GqlUserFilterInput;
  UserSortInput: GqlUserSortInput;
  UserUpdateProfileInput: GqlUserUpdateProfileInput;
  UserUpdateProfilePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateProfilePayload']>;
  UserUpdateProfileSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
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
  UtilityUpdateInfoInput: GqlUtilityUpdateInfoInput;
  UtilityUpdateInfoPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityUpdateInfoPayload']>;
  UtilityUpdateInfoSuccess: ResolverTypeWrapper<Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: GqlResolversTypes['Utility'] }>;
  UtilityUseInput: GqlUtilityUseInput;
  UtilityUsePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityUsePayload']>;
  UtilityUseSuccess: ResolverTypeWrapper<Omit<GqlUtilityUseSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  ValueType: GqlValueType;
  Wallet: ResolverTypeWrapper<Omit<GqlWallet, 'community' | 'transactions' | 'user'> & { community: GqlResolversTypes['Community'], transactions?: Maybe<Array<GqlResolversTypes['Transaction']>>, user?: Maybe<GqlResolversTypes['User']> }>;
  WalletCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['WalletCreatePayload']>;
  WalletCreateSuccess: ResolverTypeWrapper<Omit<GqlWalletCreateSuccess, 'wallet'> & { wallet: GqlResolversTypes['Wallet'] }>;
  WalletCreateToCommunityInput: GqlWalletCreateToCommunityInput;
  WalletCreateToMemberInput: GqlWalletCreateToMemberInput;
  WalletDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['WalletDeletePayload']>;
  WalletDeleteSuccess: ResolverTypeWrapper<GqlWalletDeleteSuccess>;
  WalletEdge: ResolverTypeWrapper<Omit<GqlWalletEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Wallet']> }>;
  WalletFilterInput: GqlWalletFilterInput;
  WalletSortInput: GqlWalletSortInput;
  WalletType: GqlWalletType;
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
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityCreatePayload'];
  CommunityCreateSuccess: Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CommunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityDeletePayload'];
  CommunityDeleteSuccess: GqlCommunityDeleteSuccess;
  CommunityEdge: Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Community']> };
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityUpdateProfilePayload'];
  CommunityUpdateProfileSuccess: Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  ComplexQueryError: GqlComplexQueryError;
  CreateUserInput: GqlCreateUserInput;
  CurrentPointView: GqlCurrentPointView;
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
  MembershipApproveInvitationInput: GqlMembershipApproveInvitationInput;
  MembershipAssignManagerInput: GqlMembershipAssignManagerInput;
  MembershipAssignMemberInput: GqlMembershipAssignMemberInput;
  MembershipAssignOwnerInput: GqlMembershipAssignOwnerInput;
  MembershipCancelInvitationInput: GqlMembershipCancelInvitationInput;
  MembershipDenyInvitationInput: GqlMembershipDenyInvitationInput;
  MembershipEdge: Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Membership']> };
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipInvitePayload'];
  MembershipInviteSuccess: Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipRemoveInput: GqlMembershipRemoveInput;
  MembershipRemovePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipRemovePayload'];
  MembershipRemoveSuccess: GqlMembershipRemoveSuccess;
  MembershipSelfJoinInput: GqlMembershipSelfJoinInput;
  MembershipSelfJoinPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipSelfJoinPayload'];
  MembershipSelfJoinSuccess: Omit<GqlMembershipSelfJoinSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipSetInvitationStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipSetInvitationStatusPayload'];
  MembershipSetInvitationStatusSuccess: Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipSetRolePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipSetRolePayload'];
  MembershipSetRoleSuccess: Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipSortInput: GqlMembershipSortInput;
  MembershipWithdrawInput: GqlMembershipWithdrawInput;
  MembershipWithdrawPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipWithdrawPayload'];
  MembershipWithdrawSuccess: GqlMembershipWithdrawSuccess;
  MembershipsConnection: Omit<GqlMembershipsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['MembershipEdge']>>> };
  Mutation: {};
  OpportunitiesConnection: Omit<GqlOpportunitiesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['OpportunityEdge']> };
  Opportunity: Omit<GqlOpportunity, 'city' | 'community' | 'createdByUser' | 'participations' | 'state'> & { city: GqlResolversParentTypes['City'], community: GqlResolversParentTypes['Community'], createdByUser: GqlResolversParentTypes['User'], participations?: Maybe<GqlResolversParentTypes['ParticipationsConnection']>, state?: Maybe<GqlResolversParentTypes['State']> };
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
  OpportunitySetPublishStatusInput: GqlOpportunitySetPublishStatusInput;
  OpportunitySetPublishStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySetPublishStatusPayload'];
  OpportunitySetPublishStatusSuccess: Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunitySortInput: GqlOpportunitySortInput;
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Participation: Omit<GqlParticipation, 'community' | 'opportunity' | 'statusHistories' | 'transactions' | 'user'> & { community?: Maybe<GqlResolversParentTypes['Community']>, opportunity?: Maybe<GqlResolversParentTypes['Opportunity']>, statusHistories?: Maybe<GqlResolversParentTypes['ParticipationStatusHistoriesConnection']>, transactions?: Maybe<GqlResolversParentTypes['TransactionsConnection']>, user?: Maybe<GqlResolversParentTypes['User']> };
  ParticipationApplyInput: GqlParticipationApplyInput;
  ParticipationApplyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationApplyPayload'];
  ParticipationApplySuccess: Omit<GqlParticipationApplySuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationEdge: Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Participation']> };
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationInviteInput: GqlParticipationInviteInput;
  ParticipationInvitePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationInvitePayload'];
  ParticipationInviteSuccess: Omit<GqlParticipationInviteSuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationSetStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationSetStatusPayload'];
  ParticipationSetStatusSuccess: Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatusHistoriesConnection: Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationStatusHistoryEdge']> };
  ParticipationStatusHistory: Omit<GqlParticipationStatusHistory, 'createdByUser' | 'participation'> & { createdByUser?: Maybe<GqlResolversParentTypes['User']>, participation: GqlResolversParentTypes['Participation'] };
  ParticipationStatusHistoryCreateInput: GqlParticipationStatusHistoryCreateInput;
  ParticipationStatusHistoryCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationStatusHistoryCreatePayload'];
  ParticipationStatusHistoryCreateSuccess: Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: GqlResolversParentTypes['ParticipationStatusHistory'] };
  ParticipationStatusHistoryEdge: Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['ParticipationStatusHistory']> };
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationsConnection: Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationEdge']> };
  Query: {};
  State: State;
  String: Scalars['String']['output'];
  Transaction: Omit<GqlTransaction, 'fromWallet' | 'participation' | 'toWallet' | 'utility'> & { fromWallet?: Maybe<GqlResolversParentTypes['Wallet']>, participation?: Maybe<GqlResolversParentTypes['Participation']>, toWallet?: Maybe<GqlResolversParentTypes['Wallet']>, utility?: Maybe<GqlResolversParentTypes['Utility']> };
  TransactionDonateSelfPointInput: GqlTransactionDonateSelfPointInput;
  TransactionDonateSelfPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionDonateSelfPointPayload'];
  TransactionDonateSelfPointSuccess: Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionEdge: Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Transaction']> };
  TransactionFilterInput: GqlTransactionFilterInput;
  TransactionGiveRewardPointInput: GqlTransactionGiveRewardPointInput;
  TransactionGiveRewardPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionGiveRewardPointPayload'];
  TransactionGiveRewardPointSuccess: Omit<GqlTransactionGiveRewardPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionGrantCommunityPointInput: GqlTransactionGrantCommunityPointInput;
  TransactionGrantCommunityPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionGrantCommunityPointPayload'];
  TransactionGrantCommunityPointSuccess: Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionIssueCommunityPointInput: GqlTransactionIssueCommunityPointInput;
  TransactionIssueCommunityPointPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionIssueCommunityPointPayload'];
  TransactionIssueCommunityPointSuccess: Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionSortInput: GqlTransactionSortInput;
  TransactionUseUtilityInput: GqlTransactionUseUtilityInput;
  TransactionUseUtilityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionUseUtilityPayload'];
  TransactionUseUtilitySuccess: Omit<GqlTransactionUseUtilitySuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionsConnection: Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TransactionEdge']>>> };
  User: User;
  UserEdge: Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['User']> };
  UserFilterInput: GqlUserFilterInput;
  UserSortInput: GqlUserSortInput;
  UserUpdateProfileInput: GqlUserUpdateProfileInput;
  UserUpdateProfilePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateProfilePayload'];
  UserUpdateProfileSuccess: Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
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
  UtilityUpdateInfoInput: GqlUtilityUpdateInfoInput;
  UtilityUpdateInfoPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityUpdateInfoPayload'];
  UtilityUpdateInfoSuccess: Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: GqlResolversParentTypes['Utility'] };
  UtilityUseInput: GqlUtilityUseInput;
  UtilityUsePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityUsePayload'];
  UtilityUseSuccess: Omit<GqlUtilityUseSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  Wallet: Omit<GqlWallet, 'community' | 'transactions' | 'user'> & { community: GqlResolversParentTypes['Community'], transactions?: Maybe<Array<GqlResolversParentTypes['Transaction']>>, user?: Maybe<GqlResolversParentTypes['User']> };
  WalletCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['WalletCreatePayload'];
  WalletCreateSuccess: Omit<GqlWalletCreateSuccess, 'wallet'> & { wallet: GqlResolversParentTypes['Wallet'] };
  WalletCreateToCommunityInput: GqlWalletCreateToCommunityInput;
  WalletCreateToMemberInput: GqlWalletCreateToMemberInput;
  WalletDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['WalletDeletePayload'];
  WalletDeleteSuccess: GqlWalletDeleteSuccess;
  WalletEdge: Omit<GqlWalletEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Wallet']> };
  WalletFilterInput: GqlWalletFilterInput;
  WalletSortInput: GqlWalletSortInput;
  WalletsConnection: Omit<GqlWalletsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['WalletEdge']>>> };
}>;

export type GqlComplexityDirectiveArgs = {
  multipliers?: Maybe<Array<Scalars['String']['input']>>;
  value: Scalars['Int']['input'];
};

export type GqlComplexityDirectiveResolver<Result, Parent, ContextType = Context, Args = GqlComplexityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

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
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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

export type GqlComplexQueryErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ComplexQueryError'] = GqlResolversParentTypes['ComplexQueryError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentPointViewResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CurrentPointView'] = GqlResolversParentTypes['CurrentPointView']> = ResolversObject<{
  currentPoint?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  walletId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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
  status?: Resolver<Maybe<GqlResolversTypes['MembershipStatus']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipEdge'] = GqlResolversParentTypes['MembershipEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipInvitePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipInvitePayload'] = GqlResolversParentTypes['MembershipInvitePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipInviteSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipInviteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipInviteSuccess'] = GqlResolversParentTypes['MembershipInviteSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipRemovePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipRemovePayload'] = GqlResolversParentTypes['MembershipRemovePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipRemoveSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipRemoveSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipRemoveSuccess'] = GqlResolversParentTypes['MembershipRemoveSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSelfJoinPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipSelfJoinPayload'] = GqlResolversParentTypes['MembershipSelfJoinPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipSelfJoinSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSelfJoinSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipSelfJoinSuccess'] = GqlResolversParentTypes['MembershipSelfJoinSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSetInvitationStatusPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipSetInvitationStatusPayload'] = GqlResolversParentTypes['MembershipSetInvitationStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipSetInvitationStatusSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSetInvitationStatusSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipSetInvitationStatusSuccess'] = GqlResolversParentTypes['MembershipSetInvitationStatusSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSetRolePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipSetRolePayload'] = GqlResolversParentTypes['MembershipSetRolePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipSetRoleSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSetRoleSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipSetRoleSuccess'] = GqlResolversParentTypes['MembershipSetRoleSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipWithdrawPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipWithdrawPayload'] = GqlResolversParentTypes['MembershipWithdrawPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipWithdrawSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipWithdrawSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipWithdrawSuccess'] = GqlResolversParentTypes['MembershipWithdrawSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['MembershipsConnection'] = GqlResolversParentTypes['MembershipsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMutationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Mutation'] = GqlResolversParentTypes['Mutation']> = ResolversObject<{
  communityCreate?: Resolver<Maybe<GqlResolversTypes['CommunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityCreateArgs, 'input'>>;
  communityDelete?: Resolver<Maybe<GqlResolversTypes['CommunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityDeleteArgs, 'id'>>;
  communityUpdateProfile?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityUpdateProfileArgs, 'id' | 'input'>>;
  createUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationCreateUserArgs, 'input'>>;
  deleteUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  membershipApproveInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipApproveInvitationArgs, 'input'>>;
  membershipAssignManager?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignManagerArgs, 'input'>>;
  membershipAssignMemberRole?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignMemberRoleArgs, 'input'>>;
  membershipAssignOwner?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignOwnerArgs, 'input'>>;
  membershipCancelInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipCancelInvitationArgs, 'input'>>;
  membershipDenyInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipDenyInvitationArgs, 'input'>>;
  membershipInvite?: Resolver<Maybe<GqlResolversTypes['MembershipInvitePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipInviteArgs, 'input'>>;
  membershipRemove?: Resolver<Maybe<GqlResolversTypes['MembershipRemovePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipRemoveArgs, 'input'>>;
  membershipSelfJoin?: Resolver<Maybe<GqlResolversTypes['MembershipSelfJoinPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipSelfJoinArgs, 'input'>>;
  membershipWithdraw?: Resolver<Maybe<GqlResolversTypes['MembershipWithdrawPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipWithdrawArgs, 'input'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunityCreate?: Resolver<Maybe<GqlResolversTypes['OpportunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityCreateArgs, 'input'>>;
  opportunityDelete?: Resolver<Maybe<GqlResolversTypes['OpportunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityDeleteArgs, 'id'>>;
  opportunityEditContent?: Resolver<Maybe<GqlResolversTypes['OpportunityEditContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityEditContentArgs, 'id' | 'input'>>;
  opportunitySetPublishStatus?: Resolver<Maybe<GqlResolversTypes['OpportunitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySetPublishStatusArgs, 'id' | 'input'>>;
  participationApply?: Resolver<Maybe<GqlResolversTypes['ParticipationApplyPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationApplyArgs, 'input'>>;
  participationApproveApplication?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationApproveApplicationArgs, 'id'>>;
  participationApproveInvitation?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationApproveInvitationArgs, 'id'>>;
  participationApprovePerformance?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationApprovePerformanceArgs, 'id'>>;
  participationCancelApplication?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationCancelApplicationArgs, 'id'>>;
  participationCancelInvitation?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationCancelInvitationArgs, 'id'>>;
  participationDenyApplication?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDenyApplicationArgs, 'id'>>;
  participationDenyInvitation?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDenyInvitationArgs, 'id'>>;
  participationDenyPerformance?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDenyPerformanceArgs, 'id'>>;
  participationInvite?: Resolver<Maybe<GqlResolversTypes['ParticipationInvitePayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationInviteArgs, 'input'>>;
  transactionDonateSelfPoint?: Resolver<Maybe<GqlResolversTypes['TransactionDonateSelfPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionDonateSelfPointArgs, 'input'>>;
  transactionGrantCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionGrantCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionGrantCommunityPointArgs, 'input'>>;
  transactionIssueCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionIssueCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionIssueCommunityPointArgs, 'input'>>;
  userUpdateProfile?: Resolver<Maybe<GqlResolversTypes['UserUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateProfileArgs, 'id' | 'input'>>;
  utilityCreate?: Resolver<Maybe<GqlResolversTypes['UtilityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityCreateArgs, 'input'>>;
  utilityDelete?: Resolver<Maybe<GqlResolversTypes['UtilityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityDeleteArgs, 'id'>>;
  utilityUpdateInfo?: Resolver<Maybe<GqlResolversTypes['UtilityUpdateInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityUpdateInfoArgs, 'id' | 'input'>>;
  utilityUse?: Resolver<Maybe<GqlResolversTypes['UtilityUsePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityUseArgs, 'id' | 'input'>>;
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
  createdByUser?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  files?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  participations?: Resolver<Maybe<GqlResolversTypes['ParticipationsConnection']>, ParentType, ContextType, Partial<GqlOpportunityParticipationsArgs>>;
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
  statusHistories?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistoriesConnection']>, ParentType, ContextType, Partial<GqlParticipationStatusHistoriesArgs>>;
  transactions?: Resolver<Maybe<GqlResolversTypes['TransactionsConnection']>, ParentType, ContextType, Partial<GqlParticipationTransactionsArgs>>;
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

export type GqlParticipationInvitePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationInvitePayload'] = GqlResolversParentTypes['ParticipationInvitePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationInviteSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationInviteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ParticipationInviteSuccess'] = GqlResolversParentTypes['ParticipationInviteSuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
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
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
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
  reason?: Resolver<Maybe<GqlResolversTypes['TransactionReason']>, ParentType, ContextType>;
  toPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  toWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionDonateSelfPointPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionDonateSelfPointPayload'] = GqlResolversParentTypes['TransactionDonateSelfPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionDonateSelfPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionDonateSelfPointSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionDonateSelfPointSuccess'] = GqlResolversParentTypes['TransactionDonateSelfPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionEdge'] = GqlResolversParentTypes['TransactionEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionGiveRewardPointPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionGiveRewardPointPayload'] = GqlResolversParentTypes['TransactionGiveRewardPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionGiveRewardPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionGiveRewardPointSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionGiveRewardPointSuccess'] = GqlResolversParentTypes['TransactionGiveRewardPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionGrantCommunityPointPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionGrantCommunityPointPayload'] = GqlResolversParentTypes['TransactionGrantCommunityPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionGrantCommunityPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionGrantCommunityPointSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionGrantCommunityPointSuccess'] = GqlResolversParentTypes['TransactionGrantCommunityPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionIssueCommunityPointPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionIssueCommunityPointPayload'] = GqlResolversParentTypes['TransactionIssueCommunityPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionIssueCommunityPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionIssueCommunityPointSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionIssueCommunityPointSuccess'] = GqlResolversParentTypes['TransactionIssueCommunityPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionUseUtilityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionUseUtilityPayload'] = GqlResolversParentTypes['TransactionUseUtilityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionUseUtilitySuccess', ParentType, ContextType>;
}>;

export type GqlTransactionUseUtilitySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TransactionUseUtilitySuccess'] = GqlResolversParentTypes['TransactionUseUtilitySuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
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
  sysRole?: Resolver<Maybe<GqlResolversTypes['SysRole']>, ParentType, ContextType>;
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

export type GqlUserEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserEdge'] = GqlResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateProfilePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateProfilePayload'] = GqlResolversParentTypes['UserUpdateProfilePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateProfileSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateProfileSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateProfileSuccess'] = GqlResolversParentTypes['UserUpdateProfileSuccess']> = ResolversObject<{
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
  utilityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityEdge'] = GqlResolversParentTypes['UtilityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityUpdateInfoPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityUpdateInfoPayload'] = GqlResolversParentTypes['UtilityUpdateInfoPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityUpdateInfoSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityUpdateInfoSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityUpdateInfoSuccess'] = GqlResolversParentTypes['UtilityUpdateInfoSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityUsePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityUsePayload'] = GqlResolversParentTypes['UtilityUsePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityUseSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityUseSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UtilityUseSuccess'] = GqlResolversParentTypes['UtilityUseSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Wallet'] = GqlResolversParentTypes['Wallet']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  currentPointView?: Resolver<Maybe<GqlResolversTypes['CurrentPointView']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  transactions?: Resolver<Maybe<Array<GqlResolversTypes['Transaction']>>, ParentType, ContextType, Partial<GqlWalletTransactionsArgs>>;
  type?: Resolver<GqlResolversTypes['WalletType'], ParentType, ContextType>;
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
  walletId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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
  ComplexQueryError?: GqlComplexQueryErrorResolvers<ContextType>;
  CurrentPointView?: GqlCurrentPointViewResolvers<ContextType>;
  CurrentUserPayload?: GqlCurrentUserPayloadResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Field?: GqlFieldResolvers<ContextType>;
  InvalidInputValueError?: GqlInvalidInputValueErrorResolvers<ContextType>;
  Membership?: GqlMembershipResolvers<ContextType>;
  MembershipEdge?: GqlMembershipEdgeResolvers<ContextType>;
  MembershipInvitePayload?: GqlMembershipInvitePayloadResolvers<ContextType>;
  MembershipInviteSuccess?: GqlMembershipInviteSuccessResolvers<ContextType>;
  MembershipRemovePayload?: GqlMembershipRemovePayloadResolvers<ContextType>;
  MembershipRemoveSuccess?: GqlMembershipRemoveSuccessResolvers<ContextType>;
  MembershipSelfJoinPayload?: GqlMembershipSelfJoinPayloadResolvers<ContextType>;
  MembershipSelfJoinSuccess?: GqlMembershipSelfJoinSuccessResolvers<ContextType>;
  MembershipSetInvitationStatusPayload?: GqlMembershipSetInvitationStatusPayloadResolvers<ContextType>;
  MembershipSetInvitationStatusSuccess?: GqlMembershipSetInvitationStatusSuccessResolvers<ContextType>;
  MembershipSetRolePayload?: GqlMembershipSetRolePayloadResolvers<ContextType>;
  MembershipSetRoleSuccess?: GqlMembershipSetRoleSuccessResolvers<ContextType>;
  MembershipWithdrawPayload?: GqlMembershipWithdrawPayloadResolvers<ContextType>;
  MembershipWithdrawSuccess?: GqlMembershipWithdrawSuccessResolvers<ContextType>;
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
  ParticipationInvitePayload?: GqlParticipationInvitePayloadResolvers<ContextType>;
  ParticipationInviteSuccess?: GqlParticipationInviteSuccessResolvers<ContextType>;
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
  TransactionDonateSelfPointPayload?: GqlTransactionDonateSelfPointPayloadResolvers<ContextType>;
  TransactionDonateSelfPointSuccess?: GqlTransactionDonateSelfPointSuccessResolvers<ContextType>;
  TransactionEdge?: GqlTransactionEdgeResolvers<ContextType>;
  TransactionGiveRewardPointPayload?: GqlTransactionGiveRewardPointPayloadResolvers<ContextType>;
  TransactionGiveRewardPointSuccess?: GqlTransactionGiveRewardPointSuccessResolvers<ContextType>;
  TransactionGrantCommunityPointPayload?: GqlTransactionGrantCommunityPointPayloadResolvers<ContextType>;
  TransactionGrantCommunityPointSuccess?: GqlTransactionGrantCommunityPointSuccessResolvers<ContextType>;
  TransactionIssueCommunityPointPayload?: GqlTransactionIssueCommunityPointPayloadResolvers<ContextType>;
  TransactionIssueCommunityPointSuccess?: GqlTransactionIssueCommunityPointSuccessResolvers<ContextType>;
  TransactionUseUtilityPayload?: GqlTransactionUseUtilityPayloadResolvers<ContextType>;
  TransactionUseUtilitySuccess?: GqlTransactionUseUtilitySuccessResolvers<ContextType>;
  TransactionsConnection?: GqlTransactionsConnectionResolvers<ContextType>;
  User?: GqlUserResolvers<ContextType>;
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
  UtilityUpdateInfoPayload?: GqlUtilityUpdateInfoPayloadResolvers<ContextType>;
  UtilityUpdateInfoSuccess?: GqlUtilityUpdateInfoSuccessResolvers<ContextType>;
  UtilityUsePayload?: GqlUtilityUsePayloadResolvers<ContextType>;
  UtilityUseSuccess?: GqlUtilityUseSuccessResolvers<ContextType>;
  Wallet?: GqlWalletResolvers<ContextType>;
  WalletCreatePayload?: GqlWalletCreatePayloadResolvers<ContextType>;
  WalletCreateSuccess?: GqlWalletCreateSuccessResolvers<ContextType>;
  WalletDeletePayload?: GqlWalletDeletePayloadResolvers<ContextType>;
  WalletDeleteSuccess?: GqlWalletDeleteSuccessResolvers<ContextType>;
  WalletEdge?: GqlWalletEdgeResolvers<ContextType>;
  WalletsConnection?: GqlWalletsConnectionResolvers<ContextType>;
}>;

export type GqlDirectiveResolvers<ContextType = Context> = ResolversObject<{
  complexity?: GqlComplexityDirectiveResolver<any, any, ContextType>;
}>;

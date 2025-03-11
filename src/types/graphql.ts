import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { User, Community, Membership, Wallet, CurrentPointView, AccumulatedPointView, Opportunity, OpportunitySlot, OpportunityInvitation, OpportunityInvitationHistory, Place, Participation, ParticipationStatusHistory, Article, Utility, Transaction, City, State } from '@prisma/client/index.d';
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
  Decimal: { input: string; output: string; }
  JSON: { input: any; output: any; }
};

export type GqlAccumulatedPointView = {
  __typename?: 'AccumulatedPointView';
  accumulatedPoint: Scalars['Int']['output'];
  walletId: Scalars['String']['output'];
};

export type GqlArticle = {
  __typename?: 'Article';
  authors?: Maybe<GqlUsersConnection>;
  body: Scalars['String']['output'];
  category: GqlArticleCategory;
  community?: Maybe<GqlCommunity>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  introduction: Scalars['String']['output'];
  opportunities?: Maybe<GqlOpportunitiesConnection>;
  publishStatus: GqlPublishStatus;
  publishedAt?: Maybe<Scalars['Datetime']['output']>;
  relatedUsers?: Maybe<GqlUsersConnection>;
  thumbnail?: Maybe<Scalars['JSON']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlArticleAuthorsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlUserFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlUserSortInput>;
};


export type GqlArticleOpportunitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunitySortInput>;
};


export type GqlArticleRelatedUsersArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlUserFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlUserSortInput>;
};

export const GqlArticleCategory = {
  ActivityReport: 'ACTIVITY_REPORT',
  Interview: 'INTERVIEW'
} as const;

export type GqlArticleCategory = typeof GqlArticleCategory[keyof typeof GqlArticleCategory];
export type GqlArticleCreateInput = {
  authorIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  body: Scalars['String']['input'];
  category: GqlArticleCategory;
  communityId: Scalars['ID']['input'];
  introduction: Scalars['String']['input'];
  opportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  publishStatus?: InputMaybe<GqlPublishStatus>;
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  thumbnail?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
};

export type GqlArticleCreatePayload = GqlArticleCreateSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlArticleCreateSuccess = {
  __typename?: 'ArticleCreateSuccess';
  article?: Maybe<GqlArticle>;
};

export type GqlArticleDeletePayload = GqlArticleDeleteSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlArticleDeleteSuccess = {
  __typename?: 'ArticleDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type GqlArticleEdge = GqlEdge & {
  __typename?: 'ArticleEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlArticle>;
};

export type GqlArticleFilterInput = {
  category?: InputMaybe<GqlArticleCategory>;
  communityId?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  publishStatus?: InputMaybe<GqlPublishStatus>;
  writtenByUserId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlArticleSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  publishedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlArticleUpdateInput = {
  authorIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  body: Scalars['String']['input'];
  category: GqlArticleCategory;
  communityId: Scalars['ID']['input'];
  introduction: Scalars['String']['input'];
  opportunityIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  publishStatus?: InputMaybe<GqlPublishStatus>;
  publishedAt?: InputMaybe<Scalars['String']['input']>;
  relatedUserIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  thumbnail?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
};

export type GqlArticleUpdatePayload = GqlArticleUpdateSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlArticleUpdateSuccess = {
  __typename?: 'ArticleUpdateSuccess';
  article?: Maybe<GqlArticle>;
};

export type GqlArticlesConnection = {
  __typename?: 'ArticlesConnection';
  edges?: Maybe<Array<Maybe<GqlArticleEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
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
  articles?: Maybe<GqlArticlesConnection>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  establishedAt?: Maybe<Scalars['Datetime']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  memberships?: Maybe<GqlMembershipsConnection>;
  name: Scalars['String']['output'];
  opportunities?: Maybe<GqlOpportunitiesConnection>;
  participations?: Maybe<GqlParticipationsConnection>;
  pointName: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utilities?: Maybe<GqlUtilitiesConnection>;
  wallets?: Maybe<GqlWalletsConnection>;
  website?: Maybe<Scalars['String']['output']>;
};


export type GqlCommunityArticlesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlArticleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlArticleSortInput>;
};


export type GqlCommunityMembershipsArgs = {
  cursor?: InputMaybe<GqlMembershipCursorInput>;
  filter?: InputMaybe<GqlMembershipFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlMembershipSortInput>;
};


export type GqlCommunityOpportunitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunitySortInput>;
};


export type GqlCommunityParticipationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationSortInput>;
};


export type GqlCommunityUtilitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlUtilityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlUtilitySortInput>;
};


export type GqlCommunityWalletsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlWalletFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlWalletSortInput>;
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

export type GqlCommunityDeleteInput = {
  communityId: Scalars['ID']['input'];
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
  communityId: Scalars['ID']['input'];
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

export type GqlMembershipAcceptMyInvitationInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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

export type GqlMembershipCursorInput = {
  communityId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type GqlMembershipDenyMyInvitationInput = {
  communityId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
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
  userId: Scalars['String']['input'];
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
  articleCreate?: Maybe<GqlArticleCreatePayload>;
  articleDelete?: Maybe<GqlArticleDeletePayload>;
  articleUpdate?: Maybe<GqlArticleUpdatePayload>;
  communityCreate?: Maybe<GqlCommunityCreatePayload>;
  communityDelete?: Maybe<GqlCommunityDeletePayload>;
  communityUpdateProfile?: Maybe<GqlCommunityUpdateProfilePayload>;
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
  opportunityInvitationCreate?: Maybe<GqlOpportunityInvitationCreatePayload>;
  opportunityInvitationDelete?: Maybe<GqlOpportunityInvitationDeletePayload>;
  opportunityInvitationDisable?: Maybe<GqlOpportunityInvitationDisablePayload>;
  opportunitySetPublishStatus?: Maybe<GqlOpportunitySetPublishStatusPayload>;
  opportunitySlotsBulkUpdate?: Maybe<GqlOpportunitySlotsBulkUpdatePayload>;
  opportunityUpdateContent?: Maybe<GqlOpportunityUpdateContentPayload>;
  participationAcceptApplication?: Maybe<GqlParticipationSetStatusPayload>;
  participationAcceptMyInvitation?: Maybe<GqlParticipationSetStatusPayload>;
  participationApply?: Maybe<GqlParticipationApplyPayload>;
  participationApprovePerformance?: Maybe<GqlParticipationSetStatusPayload>;
  participationCancelInvitation?: Maybe<GqlParticipationSetStatusPayload>;
  participationCancelMyApplication?: Maybe<GqlParticipationSetStatusPayload>;
  participationDenyApplication?: Maybe<GqlParticipationSetStatusPayload>;
  participationDenyMyInvitation?: Maybe<GqlParticipationSetStatusPayload>;
  participationDenyPerformance?: Maybe<GqlParticipationSetStatusPayload>;
  participationInvite?: Maybe<GqlParticipationInvitePayload>;
  ticketCreate?: Maybe<GqlTicketCreatePayload>;
  ticketDelete?: Maybe<GqlTicketDeletePayload>;
  ticketStatusHistoryCreate?: Maybe<GqlTicketStatusHistoryCreatePayload>;
  ticketUpdateStatus?: Maybe<GqlTicketUpdateStatusPayload>;
  transactionDonateSelfPoint?: Maybe<GqlTransactionDonateSelfPointPayload>;
  transactionGrantCommunityPoint?: Maybe<GqlTransactionGrantCommunityPointPayload>;
  transactionIssueCommunityPoint?: Maybe<GqlTransactionIssueCommunityPointPayload>;
  userDeleteMe?: Maybe<GqlUserDeletePayload>;
  userSignUp?: Maybe<GqlCurrentUserPayload>;
  userUpdateMyProfile?: Maybe<GqlUserUpdateProfilePayload>;
  utilityCreate?: Maybe<GqlUtilityCreatePayload>;
  utilityDelete?: Maybe<GqlUtilityDeletePayload>;
  utilityPurchase?: Maybe<GqlUtilityPurchasePayload>;
  utilityRefund?: Maybe<GqlUtilityRefundPayload>;
  utilityUpdateInfo?: Maybe<GqlUtilityUpdateInfoPayload>;
  utilityUse?: Maybe<GqlUtilityUsePayload>;
};


export type GqlMutationArticleCreateArgs = {
  input: GqlArticleCreateInput;
};


export type GqlMutationArticleDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationArticleUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlArticleUpdateInput;
};


export type GqlMutationCommunityCreateArgs = {
  input: GqlCommunityCreateInput;
};


export type GqlMutationCommunityDeleteArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityDeleteInput;
};


export type GqlMutationCommunityUpdateProfileArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommunityUpdateProfileInput;
};


export type GqlMutationMembershipAcceptMyInvitationArgs = {
  input: GqlMembershipAcceptMyInvitationInput;
};


export type GqlMutationMembershipAssignManagerArgs = {
  input: GqlMembershipAssignManagerInput;
};


export type GqlMutationMembershipAssignMemberArgs = {
  input: GqlMembershipAssignMemberInput;
};


export type GqlMutationMembershipAssignOwnerArgs = {
  input: GqlMembershipAssignOwnerInput;
};


export type GqlMutationMembershipCancelInvitationArgs = {
  input: GqlMembershipCancelInvitationInput;
};


export type GqlMutationMembershipDenyMyInvitationArgs = {
  input: GqlMembershipDenyMyInvitationInput;
};


export type GqlMutationMembershipInviteArgs = {
  input: GqlMembershipInviteInput;
};


export type GqlMutationMembershipRemoveArgs = {
  input: GqlMembershipRemoveInput;
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


export type GqlMutationOpportunityInvitationCreateArgs = {
  input: GqlOpportunityInvitationCreateInput;
};


export type GqlMutationOpportunityInvitationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOpportunityInvitationDisableArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunityInvitationDisableInput;
};


export type GqlMutationOpportunitySetPublishStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunitySetPublishStatusInput;
};


export type GqlMutationOpportunitySlotsBulkUpdateArgs = {
  input: GqlOpportunitySlotsBulkUpdateInput;
};


export type GqlMutationOpportunityUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlOpportunityUpdateContentInput;
};


export type GqlMutationParticipationAcceptApplicationArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationSetStatusInput;
};


export type GqlMutationParticipationAcceptMyInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationApplyArgs = {
  input: GqlParticipationApplyInput;
};


export type GqlMutationParticipationApprovePerformanceArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationSetStatusInput;
};


export type GqlMutationParticipationCancelInvitationArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationSetStatusInput;
};


export type GqlMutationParticipationCancelMyApplicationArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationSetStatusInput;
};


export type GqlMutationParticipationDenyApplicationArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationSetStatusInput;
};


export type GqlMutationParticipationDenyMyInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationParticipationDenyPerformanceArgs = {
  id: Scalars['ID']['input'];
  input: GqlParticipationSetStatusInput;
};


export type GqlMutationParticipationInviteArgs = {
  input: GqlParticipationInviteInput;
};


export type GqlMutationTicketCreateArgs = {
  input: GqlTicketCreateInput;
};


export type GqlMutationTicketDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationTicketStatusHistoryCreateArgs = {
  input: GqlTicketStatusHistoryCreateInput;
};


export type GqlMutationTicketUpdateStatusArgs = {
  id: Scalars['ID']['input'];
  input: GqlTicketUpdateStatusInput;
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


export type GqlMutationUserDeleteMeArgs = {
  input: GqlUserDeleteInput;
};


export type GqlMutationUserSignUpArgs = {
  input: GqlUserSignUpInput;
};


export type GqlMutationUserUpdateMyProfileArgs = {
  input: GqlUserUpdateProfileInput;
};


export type GqlMutationUtilityCreateArgs = {
  input: GqlUtilityCreateInput;
};


export type GqlMutationUtilityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationUtilityPurchaseArgs = {
  id: Scalars['ID']['input'];
  input: GqlUtilityPurchaseInput;
};


export type GqlMutationUtilityRefundArgs = {
  id: Scalars['ID']['input'];
  input: GqlUtilityRefundInput;
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
  articles?: Maybe<GqlArticlesConnection>;
  body?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  category: GqlOpportunityCategory;
  community?: Maybe<GqlCommunity>;
  createdAt: Scalars['Datetime']['output'];
  createdByUser?: Maybe<GqlUser>;
  description: Scalars['String']['output'];
  endsAt?: Maybe<Scalars['Datetime']['output']>;
  feeRequired?: Maybe<Scalars['Int']['output']>;
  files?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  invitations?: Maybe<GqlOpportunityInvitationsConnection>;
  participations?: Maybe<GqlParticipationsConnection>;
  place?: Maybe<GqlPlace>;
  pointsToEarn?: Maybe<Scalars['Int']['output']>;
  publishStatus: GqlPublishStatus;
  requireApproval: Scalars['Boolean']['output'];
  requiredUtilities?: Maybe<Array<GqlUtility>>;
  slots?: Maybe<GqlOpportunitySlotsConnection>;
  startsAt?: Maybe<Scalars['Datetime']['output']>;
  title: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlOpportunityArticlesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlArticleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlArticleSortInput>;
};


export type GqlOpportunityInvitationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityInvitationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunityInvitationSortInput>;
};


export type GqlOpportunityParticipationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationSortInput>;
};


export type GqlOpportunitySlotsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunitySlotFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
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
  capacity?: InputMaybe<Scalars['Int']['input']>;
  category: GqlOpportunityCategory;
  communityId: Scalars['String']['input'];
  description: Scalars['String']['input'];
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  feeRequired?: InputMaybe<Scalars['Int']['input']>;
  files?: InputMaybe<Scalars['JSON']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  placeId?: InputMaybe<Scalars['String']['input']>;
  pointsRequired?: InputMaybe<Scalars['Int']['input']>;
  pointsToEarn?: InputMaybe<Scalars['Int']['input']>;
  publishStatus: GqlPublishStatus;
  requireApproval: Scalars['Boolean']['input'];
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
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

export type GqlOpportunityFilterInput = {
  articleId?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<GqlOpportunityCategory>;
  communityId?: InputMaybe<Scalars['String']['input']>;
  createdByUserId?: InputMaybe<Scalars['String']['input']>;
  placeId?: InputMaybe<Scalars['String']['input']>;
  publishStatus?: InputMaybe<GqlPublishStatus>;
};

export type GqlOpportunityInvitation = {
  __typename?: 'OpportunityInvitation';
  code: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  createdByUser?: Maybe<GqlUser>;
  histories?: Maybe<GqlOpportunityInvitationHistoriesConnection>;
  id: Scalars['ID']['output'];
  isValid: Scalars['Boolean']['output'];
  opportunity?: Maybe<GqlOpportunity>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlOpportunityInvitationHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityInvitationHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunityInvitationHistorySortInput>;
};

export type GqlOpportunityInvitationCreateInput = {
  code: Scalars['String']['input'];
  communityId: Scalars['ID']['input'];
  opportunityId: Scalars['ID']['input'];
};

export type GqlOpportunityInvitationCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityInvitationCreateSuccess;

export type GqlOpportunityInvitationCreateSuccess = {
  __typename?: 'OpportunityInvitationCreateSuccess';
  opportunityInvitation?: Maybe<GqlOpportunityInvitation>;
};

export type GqlOpportunityInvitationDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityInvitationDeleteSuccess;

export type GqlOpportunityInvitationDeleteSuccess = {
  __typename?: 'OpportunityInvitationDeleteSuccess';
  id: Scalars['ID']['output'];
};

export type GqlOpportunityInvitationDisableInput = {
  communityId: Scalars['ID']['input'];
};

export type GqlOpportunityInvitationDisablePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityInvitationDisableSuccess;

export type GqlOpportunityInvitationDisableSuccess = {
  __typename?: 'OpportunityInvitationDisableSuccess';
  opportunityInvitation?: Maybe<GqlOpportunityInvitation>;
};

export type GqlOpportunityInvitationEdge = GqlEdge & {
  __typename?: 'OpportunityInvitationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOpportunityInvitation>;
};

export type GqlOpportunityInvitationFilterInput = {
  createdByUserId?: InputMaybe<Scalars['ID']['input']>;
  isValid?: InputMaybe<Scalars['Boolean']['input']>;
  opportunityId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlOpportunityInvitationHistoriesConnection = {
  __typename?: 'OpportunityInvitationHistoriesConnection';
  edges?: Maybe<Array<Maybe<GqlOpportunityInvitationHistoryEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlOpportunityInvitationHistory = {
  __typename?: 'OpportunityInvitationHistory';
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  invitation?: Maybe<GqlOpportunityInvitation>;
  invitedUser?: Maybe<GqlUser>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlOpportunityInvitationHistoryCreateInput = {
  invitationId: Scalars['ID']['input'];
  invitedUserId: Scalars['ID']['input'];
};

export type GqlOpportunityInvitationHistoryCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityInvitationHistoryCreateSuccess;

export type GqlOpportunityInvitationHistoryCreateSuccess = {
  __typename?: 'OpportunityInvitationHistoryCreateSuccess';
  opportunityInvitationHistory?: Maybe<GqlOpportunityInvitationHistory>;
};

export type GqlOpportunityInvitationHistoryEdge = GqlEdge & {
  __typename?: 'OpportunityInvitationHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOpportunityInvitationHistory>;
};

export type GqlOpportunityInvitationHistoryFilterInput = {
  invitationId?: InputMaybe<Scalars['ID']['input']>;
  invitedUserId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlOpportunityInvitationHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOpportunityInvitationSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOpportunityInvitationsConnection = {
  __typename?: 'OpportunityInvitationsConnection';
  edges?: Maybe<Array<Maybe<GqlOpportunityInvitationEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlOpportunitySetPublishStatusInput = {
  communityId: Scalars['String']['input'];
  status: GqlPublishStatus;
};

export type GqlOpportunitySetPublishStatusPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunitySetPublishStatusSuccess;

export type GqlOpportunitySetPublishStatusSuccess = {
  __typename?: 'OpportunitySetPublishStatusSuccess';
  opportunity: GqlOpportunity;
};

export type GqlOpportunitySlot = {
  __typename?: 'OpportunitySlot';
  createdAt: Scalars['Datetime']['output'];
  endsAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  opportunity?: Maybe<GqlOpportunity>;
  participations?: Maybe<GqlParticipationsConnection>;
  startsAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlOpportunitySlotParticipationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationSortInput>;
};

export type GqlOpportunitySlotCreateInput = {
  endsAt: Scalars['Datetime']['input'];
  startsAt: Scalars['Datetime']['input'];
};

export type GqlOpportunitySlotEdge = GqlEdge & {
  __typename?: 'OpportunitySlotEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOpportunitySlot>;
};

export type GqlOpportunitySlotFilterInput = {
  opportunityId?: InputMaybe<Scalars['ID']['input']>;
};

export type GqlOpportunitySlotSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  endsAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOpportunitySlotUpdateInput = {
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  id: Scalars['ID']['input'];
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type GqlOpportunitySlotsBulkUpdateInput = {
  create?: InputMaybe<Array<GqlOpportunitySlotCreateInput>>;
  delete?: InputMaybe<Array<Scalars['ID']['input']>>;
  opportunityId: Scalars['ID']['input'];
  update?: InputMaybe<Array<GqlOpportunitySlotUpdateInput>>;
};

export type GqlOpportunitySlotsBulkUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunitySlotsBulkUpdateSuccess;

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
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOpportunityUpdateContentInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  category: GqlOpportunityCategory;
  communityId: Scalars['String']['input'];
  description: Scalars['String']['input'];
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  feeRequired?: InputMaybe<Scalars['Int']['input']>;
  files?: InputMaybe<Scalars['JSON']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  placeId?: InputMaybe<Scalars['String']['input']>;
  pointsRequired?: InputMaybe<Scalars['Int']['input']>;
  pointsToEarn?: InputMaybe<Scalars['Int']['input']>;
  publishStatus: GqlPublishStatus;
  requireApproval: Scalars['Boolean']['input'];
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
  title: Scalars['String']['input'];
};

export type GqlOpportunityUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOpportunityUpdateContentSuccess;

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
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  images?: Maybe<Scalars['JSON']['output']>;
  opportunity?: Maybe<GqlOpportunity>;
  opportunitySlot?: Maybe<GqlOpportunitySlot>;
  status: GqlParticipationStatus;
  statusHistories?: Maybe<GqlParticipationStatusHistoriesConnection>;
  transactions?: Maybe<GqlTransactionsConnection>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};


export type GqlParticipationStatusHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationStatusHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationStatusHistorySortInput>;
};


export type GqlParticipationTransactionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTransactionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTransactionSortInput>;
};

export type GqlParticipationApplyInput = {
  opportunityId: Scalars['String']['input'];
  userWalletId?: InputMaybe<Scalars['String']['input']>;
  utilityId?: InputMaybe<Scalars['String']['input']>;
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
  opportunitySlotId?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GqlParticipationStatus>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlParticipationInviteInput = {
  communityId: Scalars['String']['input'];
  invitedUserId: Scalars['String']['input'];
  opportunityId: Scalars['String']['input'];
};

export type GqlParticipationInvitePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlParticipationInviteSuccess;

export type GqlParticipationInviteSuccess = {
  __typename?: 'ParticipationInviteSuccess';
  participation: GqlParticipation;
};

export type GqlParticipationSetStatusInput = {
  communityId: Scalars['String']['input'];
  utilityId?: InputMaybe<Scalars['String']['input']>;
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

export type GqlPlace = {
  __typename?: 'Place';
  address: Scalars['String']['output'];
  city?: Maybe<GqlCity>;
  createdAt: Scalars['Datetime']['output'];
  googlePlaceId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isManual: Scalars['Boolean']['output'];
  latitude: Scalars['Decimal']['output'];
  longitude: Scalars['Decimal']['output'];
  mapLocation?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  opportunities?: Maybe<GqlOpportunitiesConnection>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlPlaceOpportunitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunitySortInput>;
};

export type GqlPlaceCreateInput = {
  address: Scalars['String']['input'];
  cityCode: Scalars['String']['input'];
  googlePlaceId?: InputMaybe<Scalars['String']['input']>;
  isManual: Scalars['Boolean']['input'];
  latitude: Scalars['Decimal']['input'];
  longitude: Scalars['Decimal']['input'];
  mapLocation?: InputMaybe<Scalars['JSON']['input']>;
  name: Scalars['String']['input'];
};

export type GqlPlaceCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlPlaceCreateSuccess;

export type GqlPlaceCreateSuccess = {
  __typename?: 'PlaceCreateSuccess';
  place?: Maybe<GqlPlace>;
};

export type GqlPlaceDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlPlaceDeleteSuccess;

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
  cityCode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlPlaceSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlPlaceUpdateInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  cityCode?: InputMaybe<Scalars['String']['input']>;
  googlePlaceId?: InputMaybe<Scalars['String']['input']>;
  isManual?: InputMaybe<Scalars['Boolean']['input']>;
  latitude?: InputMaybe<Scalars['Decimal']['input']>;
  longitude?: InputMaybe<Scalars['Decimal']['input']>;
  mapLocation?: InputMaybe<Scalars['JSON']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GqlPlaceUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlPlaceUpdateSuccess;

export type GqlPlaceUpdateSuccess = {
  __typename?: 'PlaceUpdateSuccess';
  place?: Maybe<GqlPlace>;
};

export type GqlPlacesConnection = {
  __typename?: 'PlacesConnection';
  edges?: Maybe<Array<Maybe<GqlPlaceEdge>>>;
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
  cities: Array<GqlCity>;
  communities: GqlCommunitiesConnection;
  community?: Maybe<GqlCommunity>;
  currentUser?: Maybe<GqlCurrentUserPayload>;
  echo: Scalars['String']['output'];
  membership?: Maybe<GqlMembership>;
  memberships: GqlMembershipsConnection;
  opportunities: GqlOpportunitiesConnection;
  opportunity?: Maybe<GqlOpportunity>;
  opportunityInvitation?: Maybe<GqlOpportunityInvitation>;
  opportunityInvitationHistories: GqlOpportunityInvitationHistoriesConnection;
  opportunityInvitationHistory?: Maybe<GqlOpportunityInvitationHistory>;
  opportunityInvitations: GqlOpportunityInvitationsConnection;
  opportunitySlot?: Maybe<GqlOpportunitySlot>;
  opportunitySlots: GqlOpportunitySlotsConnection;
  participation?: Maybe<GqlParticipation>;
  participationStatusHistories: GqlParticipationStatusHistoriesConnection;
  participationStatusHistory?: Maybe<GqlParticipationStatusHistory>;
  participations: GqlParticipationsConnection;
  place?: Maybe<GqlPlace>;
  places: GqlPlacesConnection;
  states: Array<GqlState>;
  ticket?: Maybe<GqlTicket>;
  ticketStatusHistories: GqlTicketStatusHistoriesConnection;
  ticketStatusHistory?: Maybe<GqlTicketStatusHistory>;
  tickets: GqlTicketsConnection;
  transaction?: Maybe<GqlTransaction>;
  transactions: GqlTransactionsConnection;
  user?: Maybe<GqlUser>;
  users: GqlUsersConnection;
  utilities: GqlUtilitiesConnection;
  utility?: Maybe<GqlUtility>;
  wallet?: Maybe<GqlWallet>;
  wallets: GqlWalletsConnection;
};


export type GqlQueryArticleArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryArticlesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlArticleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlArticleSortInput>;
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
};


export type GqlQueryOpportunityInvitationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryOpportunityInvitationHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityInvitationHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunityInvitationHistorySortInput>;
};


export type GqlQueryOpportunityInvitationHistoryArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryOpportunityInvitationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityInvitationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunityInvitationSortInput>;
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


export type GqlQueryStatesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type GqlQueryTicketArgs = {
  id: Scalars['ID']['input'];
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
export type GqlTicket = {
  __typename?: 'Ticket';
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  status: GqlTicketStatus;
  ticketStatusHistories?: Maybe<GqlTicketStatusHistoriesConnection>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  utility: GqlUtility;
  wallet: GqlWallet;
};


export type GqlTicketTicketStatusHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketStatusHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketStatusHistorySortInput>;
};

export type GqlTicketCreateInput = {
  utilityId: Scalars['String']['input'];
  walletId: Scalars['String']['input'];
};

export type GqlTicketCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTicketCreateSuccess;

export type GqlTicketCreateSuccess = {
  __typename?: 'TicketCreateSuccess';
  ticket: GqlTicket;
};

export type GqlTicketDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTicketDeleteSuccess;

export type GqlTicketDeleteSuccess = {
  __typename?: 'TicketDeleteSuccess';
  ticketId: Scalars['String']['output'];
};

export type GqlTicketEdge = GqlEdge & {
  __typename?: 'TicketEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTicket>;
};

export type GqlTicketFilterInput = {
  status?: InputMaybe<GqlTicketStatus>;
  utilityId?: InputMaybe<Scalars['String']['input']>;
  walletId?: InputMaybe<Scalars['String']['input']>;
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
  createdAt: Scalars['Datetime']['output'];
  createdByUser?: Maybe<GqlUser>;
  id: Scalars['ID']['output'];
  reason: GqlTicketStatusReason;
  status: GqlTicketStatus;
  ticket: GqlTicket;
  transaction?: Maybe<GqlTransaction>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlTicketStatusHistoryCreateInput = {
  createdBy?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<GqlTicketStatusReason>;
  status?: InputMaybe<GqlTicketStatus>;
  ticketId: Scalars['String']['input'];
  transactionId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlTicketStatusHistoryCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTicketStatusHistoryCreateSuccess;

export type GqlTicketStatusHistoryCreateSuccess = {
  __typename?: 'TicketStatusHistoryCreateSuccess';
  ticketStatusHistory: GqlTicketStatusHistory;
};

export type GqlTicketStatusHistoryEdge = GqlEdge & {
  __typename?: 'TicketStatusHistoryEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTicketStatusHistory>;
};

export type GqlTicketStatusHistoryFilterInput = {
  createdBy?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<GqlTicketStatusReason>;
  status?: InputMaybe<GqlTicketStatus>;
  ticketId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlTicketStatusHistorySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export const GqlTicketStatusReason = {
  Canceled: 'CANCELED',
  Expired: 'EXPIRED',
  Purchased: 'PURCHASED',
  Refunded: 'REFUNDED',
  Reserved: 'RESERVED',
  Used: 'USED'
} as const;

export type GqlTicketStatusReason = typeof GqlTicketStatusReason[keyof typeof GqlTicketStatusReason];
export type GqlTicketUpdateStatusInput = {
  newStatus: GqlTicketStatus;
};

export type GqlTicketUpdateStatusPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTicketUpdateStatusSuccess;

export type GqlTicketUpdateStatusSuccess = {
  __typename?: 'TicketUpdateStatusSuccess';
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
  createdAt: Scalars['Datetime']['output'];
  fromPointChange?: Maybe<Scalars['Int']['output']>;
  fromWallet?: Maybe<GqlWallet>;
  id: Scalars['ID']['output'];
  participation?: Maybe<GqlParticipation>;
  reason: GqlTransactionReason;
  ticketStatusHistories?: Maybe<GqlTicketStatusHistoriesConnection>;
  toPointChange?: Maybe<Scalars['Int']['output']>;
  toWallet?: Maybe<GqlWallet>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};


export type GqlTransactionTicketStatusHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketStatusHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketStatusHistorySortInput>;
};

export type GqlTransactionDonateSelfPointInput = {
  communityId: Scalars['String']['input'];
  fromPointChange: Scalars['Int']['input'];
  fromWalletId: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
  toUserId: Scalars['String']['input'];
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
};

export type GqlTransactionGiveRewardPointInput = {
  fromPointChange: Scalars['Int']['input'];
  fromWalletId: Scalars['String']['input'];
  participationId: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
  toWalletId: Scalars['String']['input'];
};

export type GqlTransactionGiveRewardPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionGiveRewardPointSuccess;

export type GqlTransactionGiveRewardPointSuccess = {
  __typename?: 'TransactionGiveRewardPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionGrantCommunityPointInput = {
  communityId: Scalars['String']['input'];
  fromPointChange: Scalars['Int']['input'];
  fromWalletId: Scalars['String']['input'];
  toPointChange: Scalars['Int']['input'];
  toUserId: Scalars['String']['input'];
};

export type GqlTransactionGrantCommunityPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionGrantCommunityPointSuccess;

export type GqlTransactionGrantCommunityPointSuccess = {
  __typename?: 'TransactionGrantCommunityPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionIssueCommunityPointInput = {
  toPointChange: Scalars['Int']['input'];
  toWalletId: Scalars['String']['input'];
};

export type GqlTransactionIssueCommunityPointPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionIssueCommunityPointSuccess;

export type GqlTransactionIssueCommunityPointSuccess = {
  __typename?: 'TransactionIssueCommunityPointSuccess';
  transaction: GqlTransaction;
};

export type GqlTransactionPurchaseUtilityInput = {
  fromWalletId: Scalars['String']['input'];
  toWalletId: Scalars['String']['input'];
  transferPoints: Scalars['Int']['input'];
};

export type GqlTransactionPurchaseUtilityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTransactionPurchaseUtilitySuccess;

export type GqlTransactionPurchaseUtilitySuccess = {
  __typename?: 'TransactionPurchaseUtilitySuccess';
  transaction: GqlTransaction;
};

export const GqlTransactionReason = {
  Donation: 'DONATION',
  Grant: 'GRANT',
  PointIssued: 'POINT_ISSUED',
  PointReward: 'POINT_REWARD',
  UtilityPurchased: 'UTILITY_PURCHASED',
  UtilityRefunded: 'UTILITY_REFUNDED'
} as const;

export type GqlTransactionReason = typeof GqlTransactionReason[keyof typeof GqlTransactionReason];
export type GqlTransactionRefundUtilityInput = {
  fromWalletId: Scalars['String']['input'];
  toWalletId: Scalars['String']['input'];
  transferPoints: Scalars['Int']['input'];
};

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
  articlesAboutMe?: Maybe<GqlArticlesConnection>;
  articlesWrittenByMe?: Maybe<GqlArticlesConnection>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  invitationHistories?: Maybe<GqlOpportunityInvitationHistoriesConnection>;
  invitations?: Maybe<GqlOpportunityInvitationsConnection>;
  memberships?: Maybe<GqlMembershipsConnection>;
  name: Scalars['String']['output'];
  opportunitiesCreatedByMe?: Maybe<GqlOpportunitiesConnection>;
  participationStatusChangedByMe?: Maybe<GqlParticipationStatusHistoriesConnection>;
  participations?: Maybe<GqlParticipationsConnection>;
  slug: Scalars['String']['output'];
  sysRole: GqlSysRole;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  urlFacebook?: Maybe<Scalars['String']['output']>;
  urlInstagram?: Maybe<Scalars['String']['output']>;
  urlTiktok?: Maybe<Scalars['String']['output']>;
  urlWebsite?: Maybe<Scalars['String']['output']>;
  urlX?: Maybe<Scalars['String']['output']>;
  urlYoutube?: Maybe<Scalars['String']['output']>;
  wallets?: Maybe<GqlWalletsConnection>;
};


export type GqlUserArticlesAboutMeArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlArticleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlArticleSortInput>;
};


export type GqlUserArticlesWrittenByMeArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlArticleFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlArticleSortInput>;
};


export type GqlUserInvitationHistoriesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityInvitationHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunityInvitationHistorySortInput>;
};


export type GqlUserInvitationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityInvitationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunityInvitationSortInput>;
};


export type GqlUserMembershipsArgs = {
  cursor?: InputMaybe<GqlMembershipCursorInput>;
  filter?: InputMaybe<GqlMembershipFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlMembershipSortInput>;
};


export type GqlUserOpportunitiesCreatedByMeArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOpportunityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOpportunitySortInput>;
};


export type GqlUserParticipationStatusChangedByMeArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationStatusHistoryFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationStatusHistorySortInput>;
};


export type GqlUserParticipationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlParticipationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlParticipationSortInput>;
};


export type GqlUserWalletsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlWalletFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlWalletSortInput>;
};

export type GqlUserDeleteInput = {
  userId: Scalars['String']['input'];
};

export type GqlUserDeletePayload = {
  __typename?: 'UserDeletePayload';
  userId: Scalars['String']['output'];
};

export type GqlUserEdge = GqlEdge & {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUser>;
};

export type GqlUserFilterInput = {
  articleAuthorId?: InputMaybe<Scalars['ID']['input']>;
  articleWriterId?: InputMaybe<Scalars['ID']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  sysRole?: InputMaybe<GqlSysRole>;
};

export type GqlUserSignUpInput = {
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlUserUpdateProfileInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<GqlImageInput>;
  name: Scalars['String']['input'];
  slug: Scalars['String']['input'];
  urlFacebook?: InputMaybe<Scalars['String']['input']>;
  urlInstagram?: InputMaybe<Scalars['String']['input']>;
  urlTiktok?: InputMaybe<Scalars['String']['input']>;
  urlWebsite?: InputMaybe<Scalars['String']['input']>;
  urlX?: InputMaybe<Scalars['String']['input']>;
  urlYoutube?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
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
  community?: Maybe<GqlCommunity>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  pointsRequired: Scalars['Int']['output'];
  requiredForOpportunities?: Maybe<Array<GqlOpportunity>>;
  tickets?: Maybe<Array<GqlTicket>>;
  type: GqlUtilityType;
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

export type GqlUtilityPurchaseInput = {
  communityId: Scalars['String']['input'];
  userWalletId: Scalars['String']['input'];
};

export type GqlUtilityPurchasePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUtilityPurchaseSuccess;

export type GqlUtilityPurchaseSuccess = {
  __typename?: 'UtilityPurchaseSuccess';
  transaction: GqlTransaction;
};

export type GqlUtilityRefundInput = {
  communityId: Scalars['String']['input'];
  userWalletId: Scalars['String']['input'];
};

export type GqlUtilityRefundPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUtilityRefundSuccess;

export type GqlUtilityRefundSuccess = {
  __typename?: 'UtilityRefundSuccess';
  transaction: GqlTransaction;
};

export type GqlUtilitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  pointsRequired?: InputMaybe<GqlSortDirection>;
};

export const GqlUtilityType = {
  Ticket: 'TICKET'
} as const;

export type GqlUtilityType = typeof GqlUtilityType[keyof typeof GqlUtilityType];
export type GqlUtilityUpdateInfoInput = {
  communityId: Scalars['String']['input'];
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
  communityId: Scalars['String']['input'];
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
  accumulatedPointView?: Maybe<GqlAccumulatedPointView>;
  community: GqlCommunity;
  createdAt: Scalars['Datetime']['output'];
  currentPointView?: Maybe<GqlCurrentPointView>;
  id: Scalars['ID']['output'];
  tickets: GqlTicketsConnection;
  transactions?: Maybe<GqlTransactionsConnection>;
  type: GqlWalletType;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};


export type GqlWalletTicketsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTicketFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTicketSortInput>;
};


export type GqlWalletTransactionsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTransactionFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTransactionSortInput>;
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
  ArticleCreatePayload: ( Omit<GqlArticleCreateSuccess, 'article'> & { article?: Maybe<_RefType['Article']> } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ArticleDeletePayload: ( GqlArticleDeleteSuccess ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ArticleUpdatePayload: ( Omit<GqlArticleUpdateSuccess, 'article'> & { article?: Maybe<_RefType['Article']> } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommonError: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityCreatePayload: ( GqlAuthError ) | ( Omit<GqlCommunityCreateSuccess, 'community'> & { community: _RefType['Community'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityDeletePayload: ( GqlAuthError ) | ( GqlCommunityDeleteSuccess ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommunityUpdateProfilePayload: ( GqlAuthError ) | ( Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: _RefType['Community'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  MembershipInvitePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipRemovePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlMembershipRemoveSuccess );
  MembershipSetInvitationStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipSetInvitationStatusSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipSetRolePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlMembershipSetRoleSuccess, 'membership'> & { membership: _RefType['Membership'] } );
  MembershipWithdrawPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlMembershipWithdrawSuccess );
  OpportunityCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunityDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlOpportunityDeleteSuccess );
  OpportunityInvitationCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityInvitationCreateSuccess, 'opportunityInvitation'> & { opportunityInvitation?: Maybe<_RefType['OpportunityInvitation']> } );
  OpportunityInvitationDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlOpportunityInvitationDeleteSuccess );
  OpportunityInvitationDisablePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityInvitationDisableSuccess, 'opportunityInvitation'> & { opportunityInvitation?: Maybe<_RefType['OpportunityInvitation']> } );
  OpportunityInvitationHistoryCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityInvitationHistoryCreateSuccess, 'opportunityInvitationHistory'> & { opportunityInvitationHistory?: Maybe<_RefType['OpportunityInvitationHistory']> } );
  OpportunitySetPublishStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  OpportunitySlotsBulkUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunitySlotsBulkUpdateSuccess, 'slots'> & { slots: Array<_RefType['OpportunitySlot']> } );
  OpportunityUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOpportunityUpdateContentSuccess, 'opportunity'> & { opportunity: _RefType['Opportunity'] } );
  ParticipationApplyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationApplySuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationInvitePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationInviteSuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationSetStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: _RefType['Participation'] } );
  ParticipationStatusHistoryCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: _RefType['ParticipationStatusHistory'] } );
  PlaceCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlPlaceCreateSuccess, 'place'> & { place?: Maybe<_RefType['Place']> } );
  PlaceDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlPlaceDeleteSuccess );
  PlaceUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlPlaceUpdateSuccess, 'place'> & { place?: Maybe<_RefType['Place']> } );
  TicketCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTicketCreateSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TicketDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlTicketDeleteSuccess );
  TicketStatusHistoryCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTicketStatusHistoryCreateSuccess, 'ticketStatusHistory'> & { ticketStatusHistory: _RefType['TicketStatusHistory'] } );
  TicketUpdateStatusPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTicketUpdateStatusSuccess, 'ticket'> & { ticket: _RefType['Ticket'] } );
  TransactionDonateSelfPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionDonateSelfPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionGiveRewardPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionGiveRewardPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionGrantCommunityPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionGrantCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionIssueCommunityPointPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionIssueCommunityPointSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  TransactionPurchaseUtilityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTransactionPurchaseUtilitySuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UserUpdateProfilePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateProfileSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UtilityCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityCreateSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUtilityDeleteSuccess );
  UtilityPurchasePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityPurchaseSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UtilityRefundPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityRefundSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  UtilityUpdateInfoPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: _RefType['Utility'] } );
  UtilityUsePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUtilityUseSuccess, 'transaction'> & { transaction: _RefType['Transaction'] } );
  WalletCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlWalletCreateSuccess, 'wallet'> & { wallet: _RefType['Wallet'] } );
  WalletDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlWalletDeleteSuccess );
}>;

/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlArticleEdge, 'node'> & { node?: Maybe<_RefType['Article']> } ) | ( Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<_RefType['Community']> } ) | ( Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<_RefType['Membership']> } ) | ( Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<_RefType['Opportunity']> } ) | ( Omit<GqlOpportunityInvitationEdge, 'node'> & { node?: Maybe<_RefType['OpportunityInvitation']> } ) | ( Omit<GqlOpportunityInvitationHistoryEdge, 'node'> & { node?: Maybe<_RefType['OpportunityInvitationHistory']> } ) | ( Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<_RefType['OpportunitySlot']> } ) | ( Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<_RefType['Participation']> } ) | ( Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['ParticipationStatusHistory']> } ) | ( Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<_RefType['Place']> } ) | ( Omit<GqlTicketEdge, 'node'> & { node?: Maybe<_RefType['Ticket']> } ) | ( Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<_RefType['TicketStatusHistory']> } ) | ( Omit<GqlTransactionEdge, 'node'> & { node?: Maybe<_RefType['Transaction']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } ) | ( Omit<GqlUtilityEdge, 'node'> & { node?: Maybe<_RefType['Utility']> } ) | ( Omit<GqlWalletEdge, 'node'> & { node?: Maybe<_RefType['Wallet']> } );
  Error: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  AccumulatedPointView: ResolverTypeWrapper<AccumulatedPointView>;
  Article: ResolverTypeWrapper<Article>;
  ArticleCategory: GqlArticleCategory;
  ArticleCreateInput: GqlArticleCreateInput;
  ArticleCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ArticleCreatePayload']>;
  ArticleCreateSuccess: ResolverTypeWrapper<Omit<GqlArticleCreateSuccess, 'article'> & { article?: Maybe<GqlResolversTypes['Article']> }>;
  ArticleDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ArticleDeletePayload']>;
  ArticleDeleteSuccess: ResolverTypeWrapper<GqlArticleDeleteSuccess>;
  ArticleEdge: ResolverTypeWrapper<Omit<GqlArticleEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Article']> }>;
  ArticleFilterInput: GqlArticleFilterInput;
  ArticleSortInput: GqlArticleSortInput;
  ArticleUpdateInput: GqlArticleUpdateInput;
  ArticleUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ArticleUpdatePayload']>;
  ArticleUpdateSuccess: ResolverTypeWrapper<Omit<GqlArticleUpdateSuccess, 'article'> & { article?: Maybe<GqlResolversTypes['Article']> }>;
  ArticlesConnection: ResolverTypeWrapper<Omit<GqlArticlesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ArticleEdge']>>> }>;
  AuthError: ResolverTypeWrapper<GqlAuthError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  City: ResolverTypeWrapper<City>;
  CommonError: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommonError']>;
  Communities: ResolverTypeWrapper<Omit<GqlCommunities, 'data'> & { data: Array<GqlResolversTypes['Community']> }>;
  CommunitiesConnection: ResolverTypeWrapper<Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['CommunityEdge']>>> }>;
  Community: ResolverTypeWrapper<Community>;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityCreatePayload']>;
  CommunityCreateSuccess: ResolverTypeWrapper<Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  CommunityDeleteInput: GqlCommunityDeleteInput;
  CommunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityDeletePayload']>;
  CommunityDeleteSuccess: ResolverTypeWrapper<GqlCommunityDeleteSuccess>;
  CommunityEdge: ResolverTypeWrapper<Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Community']> }>;
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommunityUpdateProfilePayload']>;
  CommunityUpdateProfileSuccess: ResolverTypeWrapper<Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversTypes['Community'] }>;
  ComplexQueryError: ResolverTypeWrapper<GqlComplexQueryError>;
  CurrentPointView: ResolverTypeWrapper<CurrentPointView>;
  CurrentUserPayload: ResolverTypeWrapper<Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  Decimal: ResolverTypeWrapper<Scalars['Decimal']['output']>;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  Error: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Error']>;
  Field: ResolverTypeWrapper<GqlField>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IdentityPlatform: GqlIdentityPlatform;
  ImageInput: GqlImageInput;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputValueError: ResolverTypeWrapper<GqlInvalidInputValueError>;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Membership: ResolverTypeWrapper<Membership>;
  MembershipAcceptMyInvitationInput: GqlMembershipAcceptMyInvitationInput;
  MembershipAssignManagerInput: GqlMembershipAssignManagerInput;
  MembershipAssignMemberInput: GqlMembershipAssignMemberInput;
  MembershipAssignOwnerInput: GqlMembershipAssignOwnerInput;
  MembershipCancelInvitationInput: GqlMembershipCancelInvitationInput;
  MembershipCursorInput: GqlMembershipCursorInput;
  MembershipDenyMyInvitationInput: GqlMembershipDenyMyInvitationInput;
  MembershipEdge: ResolverTypeWrapper<Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Membership']> }>;
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipInvitePayload']>;
  MembershipInviteSuccess: ResolverTypeWrapper<Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversTypes['Membership'] }>;
  MembershipRemoveInput: GqlMembershipRemoveInput;
  MembershipRemovePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['MembershipRemovePayload']>;
  MembershipRemoveSuccess: ResolverTypeWrapper<GqlMembershipRemoveSuccess>;
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
  Opportunity: ResolverTypeWrapper<Opportunity>;
  OpportunityCategory: GqlOpportunityCategory;
  OpportunityCreateInput: GqlOpportunityCreateInput;
  OpportunityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityCreatePayload']>;
  OpportunityCreateSuccess: ResolverTypeWrapper<Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityDeletePayload']>;
  OpportunityDeleteSuccess: ResolverTypeWrapper<GqlOpportunityDeleteSuccess>;
  OpportunityEdge: ResolverTypeWrapper<Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Opportunity']> }>;
  OpportunityFilterInput: GqlOpportunityFilterInput;
  OpportunityInvitation: ResolverTypeWrapper<OpportunityInvitation>;
  OpportunityInvitationCreateInput: GqlOpportunityInvitationCreateInput;
  OpportunityInvitationCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityInvitationCreatePayload']>;
  OpportunityInvitationCreateSuccess: ResolverTypeWrapper<Omit<GqlOpportunityInvitationCreateSuccess, 'opportunityInvitation'> & { opportunityInvitation?: Maybe<GqlResolversTypes['OpportunityInvitation']> }>;
  OpportunityInvitationDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityInvitationDeletePayload']>;
  OpportunityInvitationDeleteSuccess: ResolverTypeWrapper<GqlOpportunityInvitationDeleteSuccess>;
  OpportunityInvitationDisableInput: GqlOpportunityInvitationDisableInput;
  OpportunityInvitationDisablePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityInvitationDisablePayload']>;
  OpportunityInvitationDisableSuccess: ResolverTypeWrapper<Omit<GqlOpportunityInvitationDisableSuccess, 'opportunityInvitation'> & { opportunityInvitation?: Maybe<GqlResolversTypes['OpportunityInvitation']> }>;
  OpportunityInvitationEdge: ResolverTypeWrapper<Omit<GqlOpportunityInvitationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['OpportunityInvitation']> }>;
  OpportunityInvitationFilterInput: GqlOpportunityInvitationFilterInput;
  OpportunityInvitationHistoriesConnection: ResolverTypeWrapper<Omit<GqlOpportunityInvitationHistoriesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OpportunityInvitationHistoryEdge']>>> }>;
  OpportunityInvitationHistory: ResolverTypeWrapper<OpportunityInvitationHistory>;
  OpportunityInvitationHistoryCreateInput: GqlOpportunityInvitationHistoryCreateInput;
  OpportunityInvitationHistoryCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunityInvitationHistoryCreatePayload']>;
  OpportunityInvitationHistoryCreateSuccess: ResolverTypeWrapper<Omit<GqlOpportunityInvitationHistoryCreateSuccess, 'opportunityInvitationHistory'> & { opportunityInvitationHistory?: Maybe<GqlResolversTypes['OpportunityInvitationHistory']> }>;
  OpportunityInvitationHistoryEdge: ResolverTypeWrapper<Omit<GqlOpportunityInvitationHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['OpportunityInvitationHistory']> }>;
  OpportunityInvitationHistoryFilterInput: GqlOpportunityInvitationHistoryFilterInput;
  OpportunityInvitationHistorySortInput: GqlOpportunityInvitationHistorySortInput;
  OpportunityInvitationSortInput: GqlOpportunityInvitationSortInput;
  OpportunityInvitationsConnection: ResolverTypeWrapper<Omit<GqlOpportunityInvitationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OpportunityInvitationEdge']>>> }>;
  OpportunitySetPublishStatusInput: GqlOpportunitySetPublishStatusInput;
  OpportunitySetPublishStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OpportunitySetPublishStatusPayload']>;
  OpportunitySetPublishStatusSuccess: ResolverTypeWrapper<Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversTypes['Opportunity'] }>;
  OpportunitySlot: ResolverTypeWrapper<OpportunitySlot>;
  OpportunitySlotCreateInput: GqlOpportunitySlotCreateInput;
  OpportunitySlotEdge: ResolverTypeWrapper<Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<GqlResolversTypes['OpportunitySlot']> }>;
  OpportunitySlotFilterInput: GqlOpportunitySlotFilterInput;
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
  ParticipationApplyInput: GqlParticipationApplyInput;
  ParticipationApplyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationApplyPayload']>;
  ParticipationApplySuccess: ResolverTypeWrapper<Omit<GqlParticipationApplySuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationEdge: ResolverTypeWrapper<Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Participation']> }>;
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationInviteInput: GqlParticipationInviteInput;
  ParticipationInvitePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationInvitePayload']>;
  ParticipationInviteSuccess: ResolverTypeWrapper<Omit<GqlParticipationInviteSuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationSetStatusInput: GqlParticipationSetStatusInput;
  ParticipationSetStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationSetStatusPayload']>;
  ParticipationSetStatusSuccess: ResolverTypeWrapper<Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: GqlResolversTypes['Participation'] }>;
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatus: GqlParticipationStatus;
  ParticipationStatusHistoriesConnection: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationStatusHistoryEdge']> }>;
  ParticipationStatusHistory: ResolverTypeWrapper<ParticipationStatusHistory>;
  ParticipationStatusHistoryCreateInput: GqlParticipationStatusHistoryCreateInput;
  ParticipationStatusHistoryCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ParticipationStatusHistoryCreatePayload']>;
  ParticipationStatusHistoryCreateSuccess: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: GqlResolversTypes['ParticipationStatusHistory'] }>;
  ParticipationStatusHistoryEdge: ResolverTypeWrapper<Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['ParticipationStatusHistory']> }>;
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationsConnection: ResolverTypeWrapper<Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversTypes['ParticipationEdge']> }>;
  Place: ResolverTypeWrapper<Place>;
  PlaceCreateInput: GqlPlaceCreateInput;
  PlaceCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PlaceCreatePayload']>;
  PlaceCreateSuccess: ResolverTypeWrapper<Omit<GqlPlaceCreateSuccess, 'place'> & { place?: Maybe<GqlResolversTypes['Place']> }>;
  PlaceDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PlaceDeletePayload']>;
  PlaceDeleteSuccess: ResolverTypeWrapper<GqlPlaceDeleteSuccess>;
  PlaceEdge: ResolverTypeWrapper<Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Place']> }>;
  PlaceFilterInput: GqlPlaceFilterInput;
  PlaceSortInput: GqlPlaceSortInput;
  PlaceUpdateInput: GqlPlaceUpdateInput;
  PlaceUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['PlaceUpdatePayload']>;
  PlaceUpdateSuccess: ResolverTypeWrapper<Omit<GqlPlaceUpdateSuccess, 'place'> & { place?: Maybe<GqlResolversTypes['Place']> }>;
  PlacesConnection: ResolverTypeWrapper<Omit<GqlPlacesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['PlaceEdge']>>> }>;
  PublishStatus: GqlPublishStatus;
  Query: ResolverTypeWrapper<{}>;
  Role: GqlRole;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SysRole: GqlSysRole;
  Ticket: ResolverTypeWrapper<Omit<GqlTicket, 'ticketStatusHistories' | 'utility' | 'wallet'> & { ticketStatusHistories?: Maybe<GqlResolversTypes['TicketStatusHistoriesConnection']>, utility: GqlResolversTypes['Utility'], wallet: GqlResolversTypes['Wallet'] }>;
  TicketCreateInput: GqlTicketCreateInput;
  TicketCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketCreatePayload']>;
  TicketCreateSuccess: ResolverTypeWrapper<Omit<GqlTicketCreateSuccess, 'ticket'> & { ticket: GqlResolversTypes['Ticket'] }>;
  TicketDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketDeletePayload']>;
  TicketDeleteSuccess: ResolverTypeWrapper<GqlTicketDeleteSuccess>;
  TicketEdge: ResolverTypeWrapper<Omit<GqlTicketEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Ticket']> }>;
  TicketFilterInput: GqlTicketFilterInput;
  TicketSortInput: GqlTicketSortInput;
  TicketStatus: GqlTicketStatus;
  TicketStatusHistoriesConnection: ResolverTypeWrapper<Omit<GqlTicketStatusHistoriesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TicketStatusHistoryEdge']>>> }>;
  TicketStatusHistory: ResolverTypeWrapper<Omit<GqlTicketStatusHistory, 'createdByUser' | 'ticket' | 'transaction'> & { createdByUser?: Maybe<GqlResolversTypes['User']>, ticket: GqlResolversTypes['Ticket'], transaction?: Maybe<GqlResolversTypes['Transaction']> }>;
  TicketStatusHistoryCreateInput: GqlTicketStatusHistoryCreateInput;
  TicketStatusHistoryCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketStatusHistoryCreatePayload']>;
  TicketStatusHistoryCreateSuccess: ResolverTypeWrapper<Omit<GqlTicketStatusHistoryCreateSuccess, 'ticketStatusHistory'> & { ticketStatusHistory: GqlResolversTypes['TicketStatusHistory'] }>;
  TicketStatusHistoryEdge: ResolverTypeWrapper<Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversTypes['TicketStatusHistory']> }>;
  TicketStatusHistoryFilterInput: GqlTicketStatusHistoryFilterInput;
  TicketStatusHistorySortInput: GqlTicketStatusHistorySortInput;
  TicketStatusReason: GqlTicketStatusReason;
  TicketUpdateStatusInput: GqlTicketUpdateStatusInput;
  TicketUpdateStatusPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TicketUpdateStatusPayload']>;
  TicketUpdateStatusSuccess: ResolverTypeWrapper<Omit<GqlTicketUpdateStatusSuccess, 'ticket'> & { ticket: GqlResolversTypes['Ticket'] }>;
  TicketsConnection: ResolverTypeWrapper<Omit<GqlTicketsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TicketEdge']>>> }>;
  Transaction: ResolverTypeWrapper<Transaction>;
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
  TransactionPurchaseUtilityInput: GqlTransactionPurchaseUtilityInput;
  TransactionPurchaseUtilityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TransactionPurchaseUtilityPayload']>;
  TransactionPurchaseUtilitySuccess: ResolverTypeWrapper<Omit<GqlTransactionPurchaseUtilitySuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  TransactionReason: GqlTransactionReason;
  TransactionRefundUtilityInput: GqlTransactionRefundUtilityInput;
  TransactionSortInput: GqlTransactionSortInput;
  TransactionsConnection: ResolverTypeWrapper<Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>> }>;
  User: ResolverTypeWrapper<User>;
  UserDeleteInput: GqlUserDeleteInput;
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
  UtilityPurchaseInput: GqlUtilityPurchaseInput;
  UtilityPurchasePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityPurchasePayload']>;
  UtilityPurchaseSuccess: ResolverTypeWrapper<Omit<GqlUtilityPurchaseSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  UtilityRefundInput: GqlUtilityRefundInput;
  UtilityRefundPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityRefundPayload']>;
  UtilityRefundSuccess: ResolverTypeWrapper<Omit<GqlUtilityRefundSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  UtilitySortInput: GqlUtilitySortInput;
  UtilityType: GqlUtilityType;
  UtilityUpdateInfoInput: GqlUtilityUpdateInfoInput;
  UtilityUpdateInfoPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityUpdateInfoPayload']>;
  UtilityUpdateInfoSuccess: ResolverTypeWrapper<Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: GqlResolversTypes['Utility'] }>;
  UtilityUseInput: GqlUtilityUseInput;
  UtilityUsePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UtilityUsePayload']>;
  UtilityUseSuccess: ResolverTypeWrapper<Omit<GqlUtilityUseSuccess, 'transaction'> & { transaction: GqlResolversTypes['Transaction'] }>;
  ValueType: GqlValueType;
  Wallet: ResolverTypeWrapper<Wallet>;
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
  AccumulatedPointView: AccumulatedPointView;
  Article: Article;
  ArticleCreateInput: GqlArticleCreateInput;
  ArticleCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ArticleCreatePayload'];
  ArticleCreateSuccess: Omit<GqlArticleCreateSuccess, 'article'> & { article?: Maybe<GqlResolversParentTypes['Article']> };
  ArticleDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ArticleDeletePayload'];
  ArticleDeleteSuccess: GqlArticleDeleteSuccess;
  ArticleEdge: Omit<GqlArticleEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Article']> };
  ArticleFilterInput: GqlArticleFilterInput;
  ArticleSortInput: GqlArticleSortInput;
  ArticleUpdateInput: GqlArticleUpdateInput;
  ArticleUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ArticleUpdatePayload'];
  ArticleUpdateSuccess: Omit<GqlArticleUpdateSuccess, 'article'> & { article?: Maybe<GqlResolversParentTypes['Article']> };
  ArticlesConnection: Omit<GqlArticlesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ArticleEdge']>>> };
  AuthError: GqlAuthError;
  Boolean: Scalars['Boolean']['output'];
  City: City;
  CommonError: GqlResolversUnionTypes<GqlResolversParentTypes>['CommonError'];
  Communities: Omit<GqlCommunities, 'data'> & { data: Array<GqlResolversParentTypes['Community']> };
  CommunitiesConnection: Omit<GqlCommunitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['CommunityEdge']>>> };
  Community: Community;
  CommunityCreateInput: GqlCommunityCreateInput;
  CommunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityCreatePayload'];
  CommunityCreateSuccess: Omit<GqlCommunityCreateSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  CommunityDeleteInput: GqlCommunityDeleteInput;
  CommunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityDeletePayload'];
  CommunityDeleteSuccess: GqlCommunityDeleteSuccess;
  CommunityEdge: Omit<GqlCommunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Community']> };
  CommunityFilterInput: GqlCommunityFilterInput;
  CommunitySortInput: GqlCommunitySortInput;
  CommunityUpdateProfileInput: GqlCommunityUpdateProfileInput;
  CommunityUpdateProfilePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommunityUpdateProfilePayload'];
  CommunityUpdateProfileSuccess: Omit<GqlCommunityUpdateProfileSuccess, 'community'> & { community: GqlResolversParentTypes['Community'] };
  ComplexQueryError: GqlComplexQueryError;
  CurrentPointView: CurrentPointView;
  CurrentUserPayload: Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  Datetime: Scalars['Datetime']['output'];
  Decimal: Scalars['Decimal']['output'];
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Error: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Error'];
  Field: GqlField;
  ID: Scalars['ID']['output'];
  ImageInput: GqlImageInput;
  Int: Scalars['Int']['output'];
  InvalidInputValueError: GqlInvalidInputValueError;
  JSON: Scalars['JSON']['output'];
  Membership: Membership;
  MembershipAcceptMyInvitationInput: GqlMembershipAcceptMyInvitationInput;
  MembershipAssignManagerInput: GqlMembershipAssignManagerInput;
  MembershipAssignMemberInput: GqlMembershipAssignMemberInput;
  MembershipAssignOwnerInput: GqlMembershipAssignOwnerInput;
  MembershipCancelInvitationInput: GqlMembershipCancelInvitationInput;
  MembershipCursorInput: GqlMembershipCursorInput;
  MembershipDenyMyInvitationInput: GqlMembershipDenyMyInvitationInput;
  MembershipEdge: Omit<GqlMembershipEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Membership']> };
  MembershipFilterInput: GqlMembershipFilterInput;
  MembershipInviteInput: GqlMembershipInviteInput;
  MembershipInvitePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipInvitePayload'];
  MembershipInviteSuccess: Omit<GqlMembershipInviteSuccess, 'membership'> & { membership: GqlResolversParentTypes['Membership'] };
  MembershipRemoveInput: GqlMembershipRemoveInput;
  MembershipRemovePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['MembershipRemovePayload'];
  MembershipRemoveSuccess: GqlMembershipRemoveSuccess;
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
  Opportunity: Opportunity;
  OpportunityCreateInput: GqlOpportunityCreateInput;
  OpportunityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityCreatePayload'];
  OpportunityCreateSuccess: Omit<GqlOpportunityCreateSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityDeletePayload'];
  OpportunityDeleteSuccess: GqlOpportunityDeleteSuccess;
  OpportunityEdge: Omit<GqlOpportunityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Opportunity']> };
  OpportunityFilterInput: GqlOpportunityFilterInput;
  OpportunityInvitation: OpportunityInvitation;
  OpportunityInvitationCreateInput: GqlOpportunityInvitationCreateInput;
  OpportunityInvitationCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityInvitationCreatePayload'];
  OpportunityInvitationCreateSuccess: Omit<GqlOpportunityInvitationCreateSuccess, 'opportunityInvitation'> & { opportunityInvitation?: Maybe<GqlResolversParentTypes['OpportunityInvitation']> };
  OpportunityInvitationDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityInvitationDeletePayload'];
  OpportunityInvitationDeleteSuccess: GqlOpportunityInvitationDeleteSuccess;
  OpportunityInvitationDisableInput: GqlOpportunityInvitationDisableInput;
  OpportunityInvitationDisablePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityInvitationDisablePayload'];
  OpportunityInvitationDisableSuccess: Omit<GqlOpportunityInvitationDisableSuccess, 'opportunityInvitation'> & { opportunityInvitation?: Maybe<GqlResolversParentTypes['OpportunityInvitation']> };
  OpportunityInvitationEdge: Omit<GqlOpportunityInvitationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['OpportunityInvitation']> };
  OpportunityInvitationFilterInput: GqlOpportunityInvitationFilterInput;
  OpportunityInvitationHistoriesConnection: Omit<GqlOpportunityInvitationHistoriesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OpportunityInvitationHistoryEdge']>>> };
  OpportunityInvitationHistory: OpportunityInvitationHistory;
  OpportunityInvitationHistoryCreateInput: GqlOpportunityInvitationHistoryCreateInput;
  OpportunityInvitationHistoryCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunityInvitationHistoryCreatePayload'];
  OpportunityInvitationHistoryCreateSuccess: Omit<GqlOpportunityInvitationHistoryCreateSuccess, 'opportunityInvitationHistory'> & { opportunityInvitationHistory?: Maybe<GqlResolversParentTypes['OpportunityInvitationHistory']> };
  OpportunityInvitationHistoryEdge: Omit<GqlOpportunityInvitationHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['OpportunityInvitationHistory']> };
  OpportunityInvitationHistoryFilterInput: GqlOpportunityInvitationHistoryFilterInput;
  OpportunityInvitationHistorySortInput: GqlOpportunityInvitationHistorySortInput;
  OpportunityInvitationSortInput: GqlOpportunityInvitationSortInput;
  OpportunityInvitationsConnection: Omit<GqlOpportunityInvitationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OpportunityInvitationEdge']>>> };
  OpportunitySetPublishStatusInput: GqlOpportunitySetPublishStatusInput;
  OpportunitySetPublishStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OpportunitySetPublishStatusPayload'];
  OpportunitySetPublishStatusSuccess: Omit<GqlOpportunitySetPublishStatusSuccess, 'opportunity'> & { opportunity: GqlResolversParentTypes['Opportunity'] };
  OpportunitySlot: OpportunitySlot;
  OpportunitySlotCreateInput: GqlOpportunitySlotCreateInput;
  OpportunitySlotEdge: Omit<GqlOpportunitySlotEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['OpportunitySlot']> };
  OpportunitySlotFilterInput: GqlOpportunitySlotFilterInput;
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
  ParticipationApplyInput: GqlParticipationApplyInput;
  ParticipationApplyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationApplyPayload'];
  ParticipationApplySuccess: Omit<GqlParticipationApplySuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationEdge: Omit<GqlParticipationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Participation']> };
  ParticipationFilterInput: GqlParticipationFilterInput;
  ParticipationInviteInput: GqlParticipationInviteInput;
  ParticipationInvitePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationInvitePayload'];
  ParticipationInviteSuccess: Omit<GqlParticipationInviteSuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationSetStatusInput: GqlParticipationSetStatusInput;
  ParticipationSetStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationSetStatusPayload'];
  ParticipationSetStatusSuccess: Omit<GqlParticipationSetStatusSuccess, 'participation'> & { participation: GqlResolversParentTypes['Participation'] };
  ParticipationSortInput: GqlParticipationSortInput;
  ParticipationStatusHistoriesConnection: Omit<GqlParticipationStatusHistoriesConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationStatusHistoryEdge']> };
  ParticipationStatusHistory: ParticipationStatusHistory;
  ParticipationStatusHistoryCreateInput: GqlParticipationStatusHistoryCreateInput;
  ParticipationStatusHistoryCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ParticipationStatusHistoryCreatePayload'];
  ParticipationStatusHistoryCreateSuccess: Omit<GqlParticipationStatusHistoryCreateSuccess, 'participationStatusHistory'> & { participationStatusHistory: GqlResolversParentTypes['ParticipationStatusHistory'] };
  ParticipationStatusHistoryEdge: Omit<GqlParticipationStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['ParticipationStatusHistory']> };
  ParticipationStatusHistoryFilterInput: GqlParticipationStatusHistoryFilterInput;
  ParticipationStatusHistorySortInput: GqlParticipationStatusHistorySortInput;
  ParticipationsConnection: Omit<GqlParticipationsConnection, 'edges'> & { edges: Array<GqlResolversParentTypes['ParticipationEdge']> };
  Place: Place;
  PlaceCreateInput: GqlPlaceCreateInput;
  PlaceCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PlaceCreatePayload'];
  PlaceCreateSuccess: Omit<GqlPlaceCreateSuccess, 'place'> & { place?: Maybe<GqlResolversParentTypes['Place']> };
  PlaceDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PlaceDeletePayload'];
  PlaceDeleteSuccess: GqlPlaceDeleteSuccess;
  PlaceEdge: Omit<GqlPlaceEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Place']> };
  PlaceFilterInput: GqlPlaceFilterInput;
  PlaceSortInput: GqlPlaceSortInput;
  PlaceUpdateInput: GqlPlaceUpdateInput;
  PlaceUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['PlaceUpdatePayload'];
  PlaceUpdateSuccess: Omit<GqlPlaceUpdateSuccess, 'place'> & { place?: Maybe<GqlResolversParentTypes['Place']> };
  PlacesConnection: Omit<GqlPlacesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['PlaceEdge']>>> };
  Query: {};
  State: State;
  String: Scalars['String']['output'];
  Ticket: Omit<GqlTicket, 'ticketStatusHistories' | 'utility' | 'wallet'> & { ticketStatusHistories?: Maybe<GqlResolversParentTypes['TicketStatusHistoriesConnection']>, utility: GqlResolversParentTypes['Utility'], wallet: GqlResolversParentTypes['Wallet'] };
  TicketCreateInput: GqlTicketCreateInput;
  TicketCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketCreatePayload'];
  TicketCreateSuccess: Omit<GqlTicketCreateSuccess, 'ticket'> & { ticket: GqlResolversParentTypes['Ticket'] };
  TicketDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketDeletePayload'];
  TicketDeleteSuccess: GqlTicketDeleteSuccess;
  TicketEdge: Omit<GqlTicketEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Ticket']> };
  TicketFilterInput: GqlTicketFilterInput;
  TicketSortInput: GqlTicketSortInput;
  TicketStatusHistoriesConnection: Omit<GqlTicketStatusHistoriesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TicketStatusHistoryEdge']>>> };
  TicketStatusHistory: Omit<GqlTicketStatusHistory, 'createdByUser' | 'ticket' | 'transaction'> & { createdByUser?: Maybe<GqlResolversParentTypes['User']>, ticket: GqlResolversParentTypes['Ticket'], transaction?: Maybe<GqlResolversParentTypes['Transaction']> };
  TicketStatusHistoryCreateInput: GqlTicketStatusHistoryCreateInput;
  TicketStatusHistoryCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketStatusHistoryCreatePayload'];
  TicketStatusHistoryCreateSuccess: Omit<GqlTicketStatusHistoryCreateSuccess, 'ticketStatusHistory'> & { ticketStatusHistory: GqlResolversParentTypes['TicketStatusHistory'] };
  TicketStatusHistoryEdge: Omit<GqlTicketStatusHistoryEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['TicketStatusHistory']> };
  TicketStatusHistoryFilterInput: GqlTicketStatusHistoryFilterInput;
  TicketStatusHistorySortInput: GqlTicketStatusHistorySortInput;
  TicketUpdateStatusInput: GqlTicketUpdateStatusInput;
  TicketUpdateStatusPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TicketUpdateStatusPayload'];
  TicketUpdateStatusSuccess: Omit<GqlTicketUpdateStatusSuccess, 'ticket'> & { ticket: GqlResolversParentTypes['Ticket'] };
  TicketsConnection: Omit<GqlTicketsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TicketEdge']>>> };
  Transaction: Transaction;
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
  TransactionPurchaseUtilityInput: GqlTransactionPurchaseUtilityInput;
  TransactionPurchaseUtilityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TransactionPurchaseUtilityPayload'];
  TransactionPurchaseUtilitySuccess: Omit<GqlTransactionPurchaseUtilitySuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  TransactionRefundUtilityInput: GqlTransactionRefundUtilityInput;
  TransactionSortInput: GqlTransactionSortInput;
  TransactionsConnection: Omit<GqlTransactionsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TransactionEdge']>>> };
  User: User;
  UserDeleteInput: GqlUserDeleteInput;
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
  UtilityPurchaseInput: GqlUtilityPurchaseInput;
  UtilityPurchasePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityPurchasePayload'];
  UtilityPurchaseSuccess: Omit<GqlUtilityPurchaseSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  UtilityRefundInput: GqlUtilityRefundInput;
  UtilityRefundPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityRefundPayload'];
  UtilityRefundSuccess: Omit<GqlUtilityRefundSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  UtilitySortInput: GqlUtilitySortInput;
  UtilityUpdateInfoInput: GqlUtilityUpdateInfoInput;
  UtilityUpdateInfoPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityUpdateInfoPayload'];
  UtilityUpdateInfoSuccess: Omit<GqlUtilityUpdateInfoSuccess, 'utility'> & { utility: GqlResolversParentTypes['Utility'] };
  UtilityUseInput: GqlUtilityUseInput;
  UtilityUsePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UtilityUsePayload'];
  UtilityUseSuccess: Omit<GqlUtilityUseSuccess, 'transaction'> & { transaction: GqlResolversParentTypes['Transaction'] };
  Wallet: Wallet;
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

export type GqlComplexityDirectiveResolver<Result, Parent, ContextType = any, Args = GqlComplexityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type GqlRequireRoleDirectiveArgs = {
  role: GqlRole;
};

export type GqlRequireRoleDirectiveResolver<Result, Parent, ContextType = any, Args = GqlRequireRoleDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type GqlAccumulatedPointViewResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['AccumulatedPointView'] = GqlResolversParentTypes['AccumulatedPointView']> = ResolversObject<{
  accumulatedPoint?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  walletId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Article'] = GqlResolversParentTypes['Article']> = ResolversObject<{
  authors?: Resolver<Maybe<GqlResolversTypes['UsersConnection']>, ParentType, ContextType, Partial<GqlArticleAuthorsArgs>>;
  body?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  category?: Resolver<GqlResolversTypes['ArticleCategory'], ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  introduction?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunities?: Resolver<Maybe<GqlResolversTypes['OpportunitiesConnection']>, ParentType, ContextType, Partial<GqlArticleOpportunitiesArgs>>;
  publishStatus?: Resolver<GqlResolversTypes['PublishStatus'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  relatedUsers?: Resolver<Maybe<GqlResolversTypes['UsersConnection']>, ParentType, ContextType, Partial<GqlArticleRelatedUsersArgs>>;
  thumbnail?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleCreatePayload'] = GqlResolversParentTypes['ArticleCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleCreateSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlArticleCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleCreateSuccess'] = GqlResolversParentTypes['ArticleCreateSuccess']> = ResolversObject<{
  article?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleDeletePayload'] = GqlResolversParentTypes['ArticleDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleDeleteSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlArticleDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleDeleteSuccess'] = GqlResolversParentTypes['ArticleDeleteSuccess']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleEdge'] = GqlResolversParentTypes['ArticleEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticleUpdatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleUpdatePayload'] = GqlResolversParentTypes['ArticleUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleUpdateSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlArticleUpdateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticleUpdateSuccess'] = GqlResolversParentTypes['ArticleUpdateSuccess']> = ResolversObject<{
  article?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlArticlesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ArticlesConnection'] = GqlResolversParentTypes['ArticlesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['ArticleEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAuthErrorResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['AuthError'] = GqlResolversParentTypes['AuthError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['City'] = GqlResolversParentTypes['City']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<GqlResolversTypes['State'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommonErrorResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommonError'] = GqlResolversParentTypes['CommonError']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunitiesResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Communities'] = GqlResolversParentTypes['Communities']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Community']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunitiesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunitiesConnection'] = GqlResolversParentTypes['CommunitiesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['CommunityEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Community'] = GqlResolversParentTypes['Community']> = ResolversObject<{
  articles?: Resolver<Maybe<GqlResolversTypes['ArticlesConnection']>, ParentType, ContextType, Partial<GqlCommunityArticlesArgs>>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  establishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  memberships?: Resolver<Maybe<GqlResolversTypes['MembershipsConnection']>, ParentType, ContextType, Partial<GqlCommunityMembershipsArgs>>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunities?: Resolver<Maybe<GqlResolversTypes['OpportunitiesConnection']>, ParentType, ContextType, Partial<GqlCommunityOpportunitiesArgs>>;
  participations?: Resolver<Maybe<GqlResolversTypes['ParticipationsConnection']>, ParentType, ContextType, Partial<GqlCommunityParticipationsArgs>>;
  pointName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utilities?: Resolver<Maybe<GqlResolversTypes['UtilitiesConnection']>, ParentType, ContextType, Partial<GqlCommunityUtilitiesArgs>>;
  wallets?: Resolver<Maybe<GqlResolversTypes['WalletsConnection']>, ParentType, ContextType, Partial<GqlCommunityWalletsArgs>>;
  website?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityCreatePayload'] = GqlResolversParentTypes['CommunityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityCreateSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunityCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityCreateSuccess'] = GqlResolversParentTypes['CommunityCreateSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommunityDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityDeletePayload'] = GqlResolversParentTypes['CommunityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityDeleteSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
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

export type GqlCommunityUpdateProfilePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityUpdateProfilePayload'] = GqlResolversParentTypes['CommunityUpdateProfilePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommunityUpdateProfileSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommunityUpdateProfileSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CommunityUpdateProfileSuccess'] = GqlResolversParentTypes['CommunityUpdateProfileSuccess']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlComplexQueryErrorResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ComplexQueryError'] = GqlResolversParentTypes['ComplexQueryError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentPointViewResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['CurrentPointView'] = GqlResolversParentTypes['CurrentPointView']> = ResolversObject<{
  currentPoint?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  walletId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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

export type GqlEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Edge'] = GqlResolversParentTypes['Edge']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ArticleEdge' | 'CommunityEdge' | 'MembershipEdge' | 'OpportunityEdge' | 'OpportunityInvitationEdge' | 'OpportunityInvitationHistoryEdge' | 'OpportunitySlotEdge' | 'ParticipationEdge' | 'ParticipationStatusHistoryEdge' | 'PlaceEdge' | 'TicketEdge' | 'TicketStatusHistoryEdge' | 'TransactionEdge' | 'UserEdge' | 'UtilityEdge' | 'WalletEdge', ParentType, ContextType>;
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlErrorResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Error'] = GqlResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
}>;

export type GqlFieldResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Field'] = GqlResolversParentTypes['Field']> = ResolversObject<{
  message?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlInvalidInputValueErrorResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['InvalidInputValueError'] = GqlResolversParentTypes['InvalidInputValueError']> = ResolversObject<{
  fields?: Resolver<Maybe<Array<GqlResolversTypes['Field']>>, ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlJsonScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type GqlMembershipResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Membership'] = GqlResolversParentTypes['Membership']> = ResolversObject<{
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  role?: Resolver<GqlResolversTypes['Role'], ParentType, ContextType>;
  status?: Resolver<Maybe<GqlResolversTypes['MembershipStatus']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipEdge'] = GqlResolversParentTypes['MembershipEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipInvitePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipInvitePayload'] = GqlResolversParentTypes['MembershipInvitePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipInviteSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipInviteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipInviteSuccess'] = GqlResolversParentTypes['MembershipInviteSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipRemovePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipRemovePayload'] = GqlResolversParentTypes['MembershipRemovePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipRemoveSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipRemoveSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipRemoveSuccess'] = GqlResolversParentTypes['MembershipRemoveSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSetInvitationStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetInvitationStatusPayload'] = GqlResolversParentTypes['MembershipSetInvitationStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipSetInvitationStatusSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSetInvitationStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetInvitationStatusSuccess'] = GqlResolversParentTypes['MembershipSetInvitationStatusSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipSetRolePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetRolePayload'] = GqlResolversParentTypes['MembershipSetRolePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipSetRoleSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipSetRoleSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipSetRoleSuccess'] = GqlResolversParentTypes['MembershipSetRoleSuccess']> = ResolversObject<{
  membership?: Resolver<GqlResolversTypes['Membership'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipWithdrawPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipWithdrawPayload'] = GqlResolversParentTypes['MembershipWithdrawPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'MembershipWithdrawSuccess', ParentType, ContextType>;
}>;

export type GqlMembershipWithdrawSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipWithdrawSuccess'] = GqlResolversParentTypes['MembershipWithdrawSuccess']> = ResolversObject<{
  communityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMembershipsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['MembershipsConnection'] = GqlResolversParentTypes['MembershipsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['MembershipEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMutationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Mutation'] = GqlResolversParentTypes['Mutation']> = ResolversObject<{
  articleCreate?: Resolver<Maybe<GqlResolversTypes['ArticleCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleCreateArgs, 'input'>>;
  articleDelete?: Resolver<Maybe<GqlResolversTypes['ArticleDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleDeleteArgs, 'id'>>;
  articleUpdate?: Resolver<Maybe<GqlResolversTypes['ArticleUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationArticleUpdateArgs, 'id' | 'input'>>;
  communityCreate?: Resolver<Maybe<GqlResolversTypes['CommunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityCreateArgs, 'input'>>;
  communityDelete?: Resolver<Maybe<GqlResolversTypes['CommunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityDeleteArgs, 'id' | 'input'>>;
  communityUpdateProfile?: Resolver<Maybe<GqlResolversTypes['CommunityUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommunityUpdateProfileArgs, 'id' | 'input'>>;
  membershipAcceptMyInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAcceptMyInvitationArgs, 'input'>>;
  membershipAssignManager?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignManagerArgs, 'input'>>;
  membershipAssignMember?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignMemberArgs, 'input'>>;
  membershipAssignOwner?: Resolver<Maybe<GqlResolversTypes['MembershipSetRolePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipAssignOwnerArgs, 'input'>>;
  membershipCancelInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipCancelInvitationArgs, 'input'>>;
  membershipDenyMyInvitation?: Resolver<Maybe<GqlResolversTypes['MembershipSetInvitationStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipDenyMyInvitationArgs, 'input'>>;
  membershipInvite?: Resolver<Maybe<GqlResolversTypes['MembershipInvitePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipInviteArgs, 'input'>>;
  membershipRemove?: Resolver<Maybe<GqlResolversTypes['MembershipRemovePayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipRemoveArgs, 'input'>>;
  membershipWithdraw?: Resolver<Maybe<GqlResolversTypes['MembershipWithdrawPayload']>, ParentType, ContextType, RequireFields<GqlMutationMembershipWithdrawArgs, 'input'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunityCreate?: Resolver<Maybe<GqlResolversTypes['OpportunityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityCreateArgs, 'input'>>;
  opportunityDelete?: Resolver<Maybe<GqlResolversTypes['OpportunityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityDeleteArgs, 'id'>>;
  opportunityInvitationCreate?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityInvitationCreateArgs, 'input'>>;
  opportunityInvitationDelete?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityInvitationDeleteArgs, 'id'>>;
  opportunityInvitationDisable?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationDisablePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityInvitationDisableArgs, 'id' | 'input'>>;
  opportunitySetPublishStatus?: Resolver<Maybe<GqlResolversTypes['OpportunitySetPublishStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySetPublishStatusArgs, 'id' | 'input'>>;
  opportunitySlotsBulkUpdate?: Resolver<Maybe<GqlResolversTypes['OpportunitySlotsBulkUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunitySlotsBulkUpdateArgs, 'input'>>;
  opportunityUpdateContent?: Resolver<Maybe<GqlResolversTypes['OpportunityUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationOpportunityUpdateContentArgs, 'id' | 'input'>>;
  participationAcceptApplication?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationAcceptApplicationArgs, 'id' | 'input'>>;
  participationAcceptMyInvitation?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationAcceptMyInvitationArgs, 'id'>>;
  participationApply?: Resolver<Maybe<GqlResolversTypes['ParticipationApplyPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationApplyArgs, 'input'>>;
  participationApprovePerformance?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationApprovePerformanceArgs, 'id' | 'input'>>;
  participationCancelInvitation?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationCancelInvitationArgs, 'id' | 'input'>>;
  participationCancelMyApplication?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationCancelMyApplicationArgs, 'id' | 'input'>>;
  participationDenyApplication?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDenyApplicationArgs, 'id' | 'input'>>;
  participationDenyMyInvitation?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDenyMyInvitationArgs, 'id'>>;
  participationDenyPerformance?: Resolver<Maybe<GqlResolversTypes['ParticipationSetStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationDenyPerformanceArgs, 'id' | 'input'>>;
  participationInvite?: Resolver<Maybe<GqlResolversTypes['ParticipationInvitePayload']>, ParentType, ContextType, RequireFields<GqlMutationParticipationInviteArgs, 'input'>>;
  ticketCreate?: Resolver<Maybe<GqlResolversTypes['TicketCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketCreateArgs, 'input'>>;
  ticketDelete?: Resolver<Maybe<GqlResolversTypes['TicketDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketDeleteArgs, 'id'>>;
  ticketStatusHistoryCreate?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistoryCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketStatusHistoryCreateArgs, 'input'>>;
  ticketUpdateStatus?: Resolver<Maybe<GqlResolversTypes['TicketUpdateStatusPayload']>, ParentType, ContextType, RequireFields<GqlMutationTicketUpdateStatusArgs, 'id' | 'input'>>;
  transactionDonateSelfPoint?: Resolver<Maybe<GqlResolversTypes['TransactionDonateSelfPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionDonateSelfPointArgs, 'input'>>;
  transactionGrantCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionGrantCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionGrantCommunityPointArgs, 'input'>>;
  transactionIssueCommunityPoint?: Resolver<Maybe<GqlResolversTypes['TransactionIssueCommunityPointPayload']>, ParentType, ContextType, RequireFields<GqlMutationTransactionIssueCommunityPointArgs, 'input'>>;
  userDeleteMe?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteMeArgs, 'input'>>;
  userSignUp?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserSignUpArgs, 'input'>>;
  userUpdateMyProfile?: Resolver<Maybe<GqlResolversTypes['UserUpdateProfilePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateMyProfileArgs, 'input'>>;
  utilityCreate?: Resolver<Maybe<GqlResolversTypes['UtilityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityCreateArgs, 'input'>>;
  utilityDelete?: Resolver<Maybe<GqlResolversTypes['UtilityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityDeleteArgs, 'id'>>;
  utilityPurchase?: Resolver<Maybe<GqlResolversTypes['UtilityPurchasePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityPurchaseArgs, 'id' | 'input'>>;
  utilityRefund?: Resolver<Maybe<GqlResolversTypes['UtilityRefundPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityRefundArgs, 'id' | 'input'>>;
  utilityUpdateInfo?: Resolver<Maybe<GqlResolversTypes['UtilityUpdateInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityUpdateInfoArgs, 'id' | 'input'>>;
  utilityUse?: Resolver<Maybe<GqlResolversTypes['UtilityUsePayload']>, ParentType, ContextType, RequireFields<GqlMutationUtilityUseArgs, 'id' | 'input'>>;
}>;

export type GqlOpportunitiesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitiesConnection'] = GqlResolversParentTypes['OpportunitiesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['OpportunityEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Opportunity'] = GqlResolversParentTypes['Opportunity']> = ResolversObject<{
  articles?: Resolver<Maybe<GqlResolversTypes['ArticlesConnection']>, ParentType, ContextType, Partial<GqlOpportunityArticlesArgs>>;
  body?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  capacity?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  category?: Resolver<GqlResolversTypes['OpportunityCategory'], ParentType, ContextType>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  description?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  endsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  feeRequired?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  files?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  invitations?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationsConnection']>, ParentType, ContextType, Partial<GqlOpportunityInvitationsArgs>>;
  participations?: Resolver<Maybe<GqlResolversTypes['ParticipationsConnection']>, ParentType, ContextType, Partial<GqlOpportunityParticipationsArgs>>;
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType>;
  pointsToEarn?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  publishStatus?: Resolver<GqlResolversTypes['PublishStatus'], ParentType, ContextType>;
  requireApproval?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  requiredUtilities?: Resolver<Maybe<Array<GqlResolversTypes['Utility']>>, ParentType, ContextType>;
  slots?: Resolver<Maybe<GqlResolversTypes['OpportunitySlotsConnection']>, ParentType, ContextType, Partial<GqlOpportunitySlotsArgs>>;
  startsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  title?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityCreatePayload'] = GqlResolversParentTypes['OpportunityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityCreateSuccess'] = GqlResolversParentTypes['OpportunityCreateSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityDeletePayload'] = GqlResolversParentTypes['OpportunityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityDeleteSuccess'] = GqlResolversParentTypes['OpportunityDeleteSuccess']> = ResolversObject<{
  opportunityId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityEdge'] = GqlResolversParentTypes['OpportunityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitation'] = GqlResolversParentTypes['OpportunityInvitation']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  histories?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationHistoriesConnection']>, ParentType, ContextType, Partial<GqlOpportunityInvitationHistoriesArgs>>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  isValid?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationCreatePayload'] = GqlResolversParentTypes['OpportunityInvitationCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityInvitationCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationCreateSuccess'] = GqlResolversParentTypes['OpportunityInvitationCreateSuccess']> = ResolversObject<{
  opportunityInvitation?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationDeletePayload'] = GqlResolversParentTypes['OpportunityInvitationDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityInvitationDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationDeleteSuccess'] = GqlResolversParentTypes['OpportunityInvitationDeleteSuccess']> = ResolversObject<{
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationDisablePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationDisablePayload'] = GqlResolversParentTypes['OpportunityInvitationDisablePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityInvitationDisableSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationDisableSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationDisableSuccess'] = GqlResolversParentTypes['OpportunityInvitationDisableSuccess']> = ResolversObject<{
  opportunityInvitation?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationEdge'] = GqlResolversParentTypes['OpportunityInvitationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationHistoriesConnection'] = GqlResolversParentTypes['OpportunityInvitationHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['OpportunityInvitationHistoryEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationHistory'] = GqlResolversParentTypes['OpportunityInvitationHistory']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  invitation?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitation']>, ParentType, ContextType>;
  invitedUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationHistoryCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationHistoryCreatePayload'] = GqlResolversParentTypes['OpportunityInvitationHistoryCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityInvitationHistoryCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationHistoryCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationHistoryCreateSuccess'] = GqlResolversParentTypes['OpportunityInvitationHistoryCreateSuccess']> = ResolversObject<{
  opportunityInvitationHistory?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationHistoryEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationHistoryEdge'] = GqlResolversParentTypes['OpportunityInvitationHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunityInvitationsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunityInvitationsConnection'] = GqlResolversParentTypes['OpportunityInvitationsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['OpportunityInvitationEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySetPublishStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySetPublishStatusPayload'] = GqlResolversParentTypes['OpportunitySetPublishStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunitySetPublishStatusSuccess', ParentType, ContextType>;
}>;

export type GqlOpportunitySetPublishStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySetPublishStatusSuccess'] = GqlResolversParentTypes['OpportunitySetPublishStatusSuccess']> = ResolversObject<{
  opportunity?: Resolver<GqlResolversTypes['Opportunity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlot'] = GqlResolversParentTypes['OpportunitySlot']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  participations?: Resolver<Maybe<GqlResolversTypes['ParticipationsConnection']>, ParentType, ContextType, Partial<GqlOpportunitySlotParticipationsArgs>>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotEdge'] = GqlResolversParentTypes['OpportunitySlotEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOpportunitySlotsBulkUpdatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['OpportunitySlotsBulkUpdatePayload'] = GqlResolversParentTypes['OpportunitySlotsBulkUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunitySlotsBulkUpdateSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OpportunityUpdateContentSuccess', ParentType, ContextType>;
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
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType>;
  opportunitySlot?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ParticipationStatus'], ParentType, ContextType>;
  statusHistories?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistoriesConnection']>, ParentType, ContextType, Partial<GqlParticipationStatusHistoriesArgs>>;
  transactions?: Resolver<Maybe<GqlResolversTypes['TransactionsConnection']>, ParentType, ContextType, Partial<GqlParticipationTransactionsArgs>>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationApplyPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationApplyPayload'] = GqlResolversParentTypes['ParticipationApplyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationApplySuccess', ParentType, ContextType>;
}>;

export type GqlParticipationApplySuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationApplySuccess'] = GqlResolversParentTypes['ParticipationApplySuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationEdge'] = GqlResolversParentTypes['ParticipationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationInvitePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationInvitePayload'] = GqlResolversParentTypes['ParticipationInvitePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationInviteSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationInviteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationInviteSuccess'] = GqlResolversParentTypes['ParticipationInviteSuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationSetStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationSetStatusPayload'] = GqlResolversParentTypes['ParticipationSetStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationSetStatusSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationSetStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationSetStatusSuccess'] = GqlResolversParentTypes['ParticipationSetStatusSuccess']> = ResolversObject<{
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoriesConnection'] = GqlResolversParentTypes['ParticipationStatusHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Array<GqlResolversTypes['ParticipationStatusHistoryEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistory'] = GqlResolversParentTypes['ParticipationStatusHistory']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participation?: Resolver<GqlResolversTypes['Participation'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['ParticipationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoryCreatePayload'] = GqlResolversParentTypes['ParticipationStatusHistoryCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'ParticipationStatusHistoryCreateSuccess', ParentType, ContextType>;
}>;

export type GqlParticipationStatusHistoryCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['ParticipationStatusHistoryCreateSuccess'] = GqlResolversParentTypes['ParticipationStatusHistoryCreateSuccess']> = ResolversObject<{
  participationStatusHistory?: Resolver<GqlResolversTypes['ParticipationStatusHistory'], ParentType, ContextType>;
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
  address?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  city?: Resolver<Maybe<GqlResolversTypes['City']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  googlePlaceId?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  isManual?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  latitude?: Resolver<GqlResolversTypes['Decimal'], ParentType, ContextType>;
  longitude?: Resolver<GqlResolversTypes['Decimal'], ParentType, ContextType>;
  mapLocation?: Resolver<Maybe<GqlResolversTypes['JSON']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunities?: Resolver<Maybe<GqlResolversTypes['OpportunitiesConnection']>, ParentType, ContextType, Partial<GqlPlaceOpportunitiesArgs>>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceCreatePayload'] = GqlResolversParentTypes['PlaceCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'PlaceCreateSuccess', ParentType, ContextType>;
}>;

export type GqlPlaceCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceCreateSuccess'] = GqlResolversParentTypes['PlaceCreateSuccess']> = ResolversObject<{
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlaceDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceDeletePayload'] = GqlResolversParentTypes['PlaceDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'PlaceDeleteSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'PlaceUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlPlaceUpdateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlaceUpdateSuccess'] = GqlResolversParentTypes['PlaceUpdateSuccess']> = ResolversObject<{
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlPlacesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['PlacesConnection'] = GqlResolversParentTypes['PlacesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['PlaceEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlQueryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Query'] = GqlResolversParentTypes['Query']> = ResolversObject<{
  article?: Resolver<Maybe<GqlResolversTypes['Article']>, ParentType, ContextType, RequireFields<GqlQueryArticleArgs, 'id'>>;
  articles?: Resolver<GqlResolversTypes['ArticlesConnection'], ParentType, ContextType, Partial<GqlQueryArticlesArgs>>;
  cities?: Resolver<Array<GqlResolversTypes['City']>, ParentType, ContextType, Partial<GqlQueryCitiesArgs>>;
  communities?: Resolver<GqlResolversTypes['CommunitiesConnection'], ParentType, ContextType, Partial<GqlQueryCommunitiesArgs>>;
  community?: Resolver<Maybe<GqlResolversTypes['Community']>, ParentType, ContextType, RequireFields<GqlQueryCommunityArgs, 'id'>>;
  currentUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  echo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  membership?: Resolver<Maybe<GqlResolversTypes['Membership']>, ParentType, ContextType, RequireFields<GqlQueryMembershipArgs, 'communityId' | 'userId'>>;
  memberships?: Resolver<GqlResolversTypes['MembershipsConnection'], ParentType, ContextType, Partial<GqlQueryMembershipsArgs>>;
  opportunities?: Resolver<GqlResolversTypes['OpportunitiesConnection'], ParentType, ContextType, Partial<GqlQueryOpportunitiesArgs>>;
  opportunity?: Resolver<Maybe<GqlResolversTypes['Opportunity']>, ParentType, ContextType, RequireFields<GqlQueryOpportunityArgs, 'id'>>;
  opportunityInvitation?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitation']>, ParentType, ContextType, RequireFields<GqlQueryOpportunityInvitationArgs, 'id'>>;
  opportunityInvitationHistories?: Resolver<GqlResolversTypes['OpportunityInvitationHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryOpportunityInvitationHistoriesArgs>>;
  opportunityInvitationHistory?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationHistory']>, ParentType, ContextType, RequireFields<GqlQueryOpportunityInvitationHistoryArgs, 'id'>>;
  opportunityInvitations?: Resolver<GqlResolversTypes['OpportunityInvitationsConnection'], ParentType, ContextType, Partial<GqlQueryOpportunityInvitationsArgs>>;
  opportunitySlot?: Resolver<Maybe<GqlResolversTypes['OpportunitySlot']>, ParentType, ContextType, RequireFields<GqlQueryOpportunitySlotArgs, 'id'>>;
  opportunitySlots?: Resolver<GqlResolversTypes['OpportunitySlotsConnection'], ParentType, ContextType, Partial<GqlQueryOpportunitySlotsArgs>>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType, RequireFields<GqlQueryParticipationArgs, 'id'>>;
  participationStatusHistories?: Resolver<GqlResolversTypes['ParticipationStatusHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryParticipationStatusHistoriesArgs>>;
  participationStatusHistory?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistory']>, ParentType, ContextType, RequireFields<GqlQueryParticipationStatusHistoryArgs, 'id'>>;
  participations?: Resolver<GqlResolversTypes['ParticipationsConnection'], ParentType, ContextType, Partial<GqlQueryParticipationsArgs>>;
  place?: Resolver<Maybe<GqlResolversTypes['Place']>, ParentType, ContextType, RequireFields<GqlQueryPlaceArgs, 'id'>>;
  places?: Resolver<GqlResolversTypes['PlacesConnection'], ParentType, ContextType, Partial<GqlQueryPlacesArgs>>;
  states?: Resolver<Array<GqlResolversTypes['State']>, ParentType, ContextType, Partial<GqlQueryStatesArgs>>;
  ticket?: Resolver<Maybe<GqlResolversTypes['Ticket']>, ParentType, ContextType, RequireFields<GqlQueryTicketArgs, 'id'>>;
  ticketStatusHistories?: Resolver<GqlResolversTypes['TicketStatusHistoriesConnection'], ParentType, ContextType, Partial<GqlQueryTicketStatusHistoriesArgs>>;
  ticketStatusHistory?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistory']>, ParentType, ContextType, RequireFields<GqlQueryTicketStatusHistoryArgs, 'id'>>;
  tickets?: Resolver<GqlResolversTypes['TicketsConnection'], ParentType, ContextType, Partial<GqlQueryTicketsArgs>>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<GqlQueryTransactionArgs, 'id'>>;
  transactions?: Resolver<GqlResolversTypes['TransactionsConnection'], ParentType, ContextType, Partial<GqlQueryTransactionsArgs>>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlQueryUserArgs, 'id'>>;
  users?: Resolver<GqlResolversTypes['UsersConnection'], ParentType, ContextType, Partial<GqlQueryUsersArgs>>;
  utilities?: Resolver<GqlResolversTypes['UtilitiesConnection'], ParentType, ContextType, Partial<GqlQueryUtilitiesArgs>>;
  utility?: Resolver<Maybe<GqlResolversTypes['Utility']>, ParentType, ContextType, RequireFields<GqlQueryUtilityArgs, 'id'>>;
  wallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType, RequireFields<GqlQueryWalletArgs, 'id'>>;
  wallets?: Resolver<GqlResolversTypes['WalletsConnection'], ParentType, ContextType, Partial<GqlQueryWalletsArgs>>;
}>;

export type GqlStateResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['State'] = GqlResolversParentTypes['State']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  countryCode?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Ticket'] = GqlResolversParentTypes['Ticket']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['TicketStatus'], ParentType, ContextType>;
  ticketStatusHistories?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistoriesConnection']>, ParentType, ContextType, Partial<GqlTicketTicketStatusHistoriesArgs>>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  wallet?: Resolver<GqlResolversTypes['Wallet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketCreatePayload'] = GqlResolversParentTypes['TicketCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TicketCreateSuccess', ParentType, ContextType>;
}>;

export type GqlTicketCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketCreateSuccess'] = GqlResolversParentTypes['TicketCreateSuccess']> = ResolversObject<{
  ticket?: Resolver<GqlResolversTypes['Ticket'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketDeletePayload'] = GqlResolversParentTypes['TicketDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TicketDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlTicketDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketDeleteSuccess'] = GqlResolversParentTypes['TicketDeleteSuccess']> = ResolversObject<{
  ticketId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketEdge'] = GqlResolversParentTypes['TicketEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Ticket']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoriesConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistoriesConnection'] = GqlResolversParentTypes['TicketStatusHistoriesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TicketStatusHistoryEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoryResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistory'] = GqlResolversParentTypes['TicketStatusHistory']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  createdByUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TicketStatusReason'], ParentType, ContextType>;
  status?: Resolver<GqlResolversTypes['TicketStatus'], ParentType, ContextType>;
  ticket?: Resolver<GqlResolversTypes['Ticket'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<GqlResolversTypes['Transaction']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoryCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistoryCreatePayload'] = GqlResolversParentTypes['TicketStatusHistoryCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TicketStatusHistoryCreateSuccess', ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoryCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistoryCreateSuccess'] = GqlResolversParentTypes['TicketStatusHistoryCreateSuccess']> = ResolversObject<{
  ticketStatusHistory?: Resolver<GqlResolversTypes['TicketStatusHistory'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketStatusHistoryEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketStatusHistoryEdge'] = GqlResolversParentTypes['TicketStatusHistoryEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistory']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTicketUpdateStatusPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketUpdateStatusPayload'] = GqlResolversParentTypes['TicketUpdateStatusPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TicketUpdateStatusSuccess', ParentType, ContextType>;
}>;

export type GqlTicketUpdateStatusSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TicketUpdateStatusSuccess'] = GqlResolversParentTypes['TicketUpdateStatusSuccess']> = ResolversObject<{
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
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  fromPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  fromWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  participation?: Resolver<Maybe<GqlResolversTypes['Participation']>, ParentType, ContextType>;
  reason?: Resolver<GqlResolversTypes['TransactionReason'], ParentType, ContextType>;
  ticketStatusHistories?: Resolver<Maybe<GqlResolversTypes['TicketStatusHistoriesConnection']>, ParentType, ContextType, Partial<GqlTransactionTicketStatusHistoriesArgs>>;
  toPointChange?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  toWallet?: Resolver<Maybe<GqlResolversTypes['Wallet']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionDonateSelfPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionDonateSelfPointPayload'] = GqlResolversParentTypes['TransactionDonateSelfPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionDonateSelfPointSuccess', ParentType, ContextType>;
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

export type GqlTransactionGiveRewardPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionGiveRewardPointPayload'] = GqlResolversParentTypes['TransactionGiveRewardPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionGiveRewardPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionGiveRewardPointSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionGiveRewardPointSuccess'] = GqlResolversParentTypes['TransactionGiveRewardPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionGrantCommunityPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionGrantCommunityPointPayload'] = GqlResolversParentTypes['TransactionGrantCommunityPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionGrantCommunityPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionGrantCommunityPointSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionGrantCommunityPointSuccess'] = GqlResolversParentTypes['TransactionGrantCommunityPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionIssueCommunityPointPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionIssueCommunityPointPayload'] = GqlResolversParentTypes['TransactionIssueCommunityPointPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionIssueCommunityPointSuccess', ParentType, ContextType>;
}>;

export type GqlTransactionIssueCommunityPointSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionIssueCommunityPointSuccess'] = GqlResolversParentTypes['TransactionIssueCommunityPointSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionPurchaseUtilityPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionPurchaseUtilityPayload'] = GqlResolversParentTypes['TransactionPurchaseUtilityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TransactionPurchaseUtilitySuccess', ParentType, ContextType>;
}>;

export type GqlTransactionPurchaseUtilitySuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionPurchaseUtilitySuccess'] = GqlResolversParentTypes['TransactionPurchaseUtilitySuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTransactionsConnectionResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['TransactionsConnection'] = GqlResolversParentTypes['TransactionsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TransactionEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['User'] = GqlResolversParentTypes['User']> = ResolversObject<{
  articlesAboutMe?: Resolver<Maybe<GqlResolversTypes['ArticlesConnection']>, ParentType, ContextType, Partial<GqlUserArticlesAboutMeArgs>>;
  articlesWrittenByMe?: Resolver<Maybe<GqlResolversTypes['ArticlesConnection']>, ParentType, ContextType, Partial<GqlUserArticlesWrittenByMeArgs>>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  invitationHistories?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationHistoriesConnection']>, ParentType, ContextType, Partial<GqlUserInvitationHistoriesArgs>>;
  invitations?: Resolver<Maybe<GqlResolversTypes['OpportunityInvitationsConnection']>, ParentType, ContextType, Partial<GqlUserInvitationsArgs>>;
  memberships?: Resolver<Maybe<GqlResolversTypes['MembershipsConnection']>, ParentType, ContextType, Partial<GqlUserMembershipsArgs>>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  opportunitiesCreatedByMe?: Resolver<Maybe<GqlResolversTypes['OpportunitiesConnection']>, ParentType, ContextType, Partial<GqlUserOpportunitiesCreatedByMeArgs>>;
  participationStatusChangedByMe?: Resolver<Maybe<GqlResolversTypes['ParticipationStatusHistoriesConnection']>, ParentType, ContextType, Partial<GqlUserParticipationStatusChangedByMeArgs>>;
  participations?: Resolver<Maybe<GqlResolversTypes['ParticipationsConnection']>, ParentType, ContextType, Partial<GqlUserParticipationsArgs>>;
  slug?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  sysRole?: Resolver<GqlResolversTypes['SysRole'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  urlFacebook?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlInstagram?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlTiktok?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlWebsite?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlX?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  urlYoutube?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  wallets?: Resolver<Maybe<GqlResolversTypes['WalletsConnection']>, ParentType, ContextType, Partial<GqlUserWalletsArgs>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserDeletePayload'] = GqlResolversParentTypes['UserDeletePayload']> = ResolversObject<{
  userId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserEdgeResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserEdge'] = GqlResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateProfilePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UserUpdateProfilePayload'] = GqlResolversParentTypes['UserUpdateProfilePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateProfileSuccess', ParentType, ContextType>;
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
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  pointsRequired?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  requiredForOpportunities?: Resolver<Maybe<Array<GqlResolversTypes['Opportunity']>>, ParentType, ContextType>;
  tickets?: Resolver<Maybe<Array<GqlResolversTypes['Ticket']>>, ParentType, ContextType>;
  type?: Resolver<GqlResolversTypes['UtilityType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityCreatePayload'] = GqlResolversParentTypes['UtilityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityCreateSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityCreateSuccess'] = GqlResolversParentTypes['UtilityCreateSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityDeletePayload'] = GqlResolversParentTypes['UtilityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityDeleteSuccess', ParentType, ContextType>;
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

export type GqlUtilityPurchasePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityPurchasePayload'] = GqlResolversParentTypes['UtilityPurchasePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityPurchaseSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityPurchaseSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityPurchaseSuccess'] = GqlResolversParentTypes['UtilityPurchaseSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityRefundPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityRefundPayload'] = GqlResolversParentTypes['UtilityRefundPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityRefundSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityRefundSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityRefundSuccess'] = GqlResolversParentTypes['UtilityRefundSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityUpdateInfoPayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityUpdateInfoPayload'] = GqlResolversParentTypes['UtilityUpdateInfoPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityUpdateInfoSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityUpdateInfoSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityUpdateInfoSuccess'] = GqlResolversParentTypes['UtilityUpdateInfoSuccess']> = ResolversObject<{
  utility?: Resolver<GqlResolversTypes['Utility'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUtilityUsePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityUsePayload'] = GqlResolversParentTypes['UtilityUsePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UtilityUseSuccess', ParentType, ContextType>;
}>;

export type GqlUtilityUseSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['UtilityUseSuccess'] = GqlResolversParentTypes['UtilityUseSuccess']> = ResolversObject<{
  transaction?: Resolver<GqlResolversTypes['Transaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['Wallet'] = GqlResolversParentTypes['Wallet']> = ResolversObject<{
  accumulatedPointView?: Resolver<Maybe<GqlResolversTypes['AccumulatedPointView']>, ParentType, ContextType>;
  community?: Resolver<GqlResolversTypes['Community'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  currentPointView?: Resolver<Maybe<GqlResolversTypes['CurrentPointView']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  tickets?: Resolver<GqlResolversTypes['TicketsConnection'], ParentType, ContextType, Partial<GqlWalletTicketsArgs>>;
  transactions?: Resolver<Maybe<GqlResolversTypes['TransactionsConnection']>, ParentType, ContextType, Partial<GqlWalletTransactionsArgs>>;
  type?: Resolver<GqlResolversTypes['WalletType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletCreatePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['WalletCreatePayload'] = GqlResolversParentTypes['WalletCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'WalletCreateSuccess', ParentType, ContextType>;
}>;

export type GqlWalletCreateSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['WalletCreateSuccess'] = GqlResolversParentTypes['WalletCreateSuccess']> = ResolversObject<{
  wallet?: Resolver<GqlResolversTypes['Wallet'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlWalletDeletePayloadResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['WalletDeletePayload'] = GqlResolversParentTypes['WalletDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'WalletDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlWalletDeleteSuccessResolvers<ContextType = any, ParentType extends GqlResolversParentTypes['WalletDeleteSuccess'] = GqlResolversParentTypes['WalletDeleteSuccess']> = ResolversObject<{
  walletId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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
  ArticleUpdatePayload?: GqlArticleUpdatePayloadResolvers<ContextType>;
  ArticleUpdateSuccess?: GqlArticleUpdateSuccessResolvers<ContextType>;
  ArticlesConnection?: GqlArticlesConnectionResolvers<ContextType>;
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
  Decimal?: GraphQLScalarType;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Field?: GqlFieldResolvers<ContextType>;
  InvalidInputValueError?: GqlInvalidInputValueErrorResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Membership?: GqlMembershipResolvers<ContextType>;
  MembershipEdge?: GqlMembershipEdgeResolvers<ContextType>;
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
  OpportunitiesConnection?: GqlOpportunitiesConnectionResolvers<ContextType>;
  Opportunity?: GqlOpportunityResolvers<ContextType>;
  OpportunityCreatePayload?: GqlOpportunityCreatePayloadResolvers<ContextType>;
  OpportunityCreateSuccess?: GqlOpportunityCreateSuccessResolvers<ContextType>;
  OpportunityDeletePayload?: GqlOpportunityDeletePayloadResolvers<ContextType>;
  OpportunityDeleteSuccess?: GqlOpportunityDeleteSuccessResolvers<ContextType>;
  OpportunityEdge?: GqlOpportunityEdgeResolvers<ContextType>;
  OpportunityInvitation?: GqlOpportunityInvitationResolvers<ContextType>;
  OpportunityInvitationCreatePayload?: GqlOpportunityInvitationCreatePayloadResolvers<ContextType>;
  OpportunityInvitationCreateSuccess?: GqlOpportunityInvitationCreateSuccessResolvers<ContextType>;
  OpportunityInvitationDeletePayload?: GqlOpportunityInvitationDeletePayloadResolvers<ContextType>;
  OpportunityInvitationDeleteSuccess?: GqlOpportunityInvitationDeleteSuccessResolvers<ContextType>;
  OpportunityInvitationDisablePayload?: GqlOpportunityInvitationDisablePayloadResolvers<ContextType>;
  OpportunityInvitationDisableSuccess?: GqlOpportunityInvitationDisableSuccessResolvers<ContextType>;
  OpportunityInvitationEdge?: GqlOpportunityInvitationEdgeResolvers<ContextType>;
  OpportunityInvitationHistoriesConnection?: GqlOpportunityInvitationHistoriesConnectionResolvers<ContextType>;
  OpportunityInvitationHistory?: GqlOpportunityInvitationHistoryResolvers<ContextType>;
  OpportunityInvitationHistoryCreatePayload?: GqlOpportunityInvitationHistoryCreatePayloadResolvers<ContextType>;
  OpportunityInvitationHistoryCreateSuccess?: GqlOpportunityInvitationHistoryCreateSuccessResolvers<ContextType>;
  OpportunityInvitationHistoryEdge?: GqlOpportunityInvitationHistoryEdgeResolvers<ContextType>;
  OpportunityInvitationsConnection?: GqlOpportunityInvitationsConnectionResolvers<ContextType>;
  OpportunitySetPublishStatusPayload?: GqlOpportunitySetPublishStatusPayloadResolvers<ContextType>;
  OpportunitySetPublishStatusSuccess?: GqlOpportunitySetPublishStatusSuccessResolvers<ContextType>;
  OpportunitySlot?: GqlOpportunitySlotResolvers<ContextType>;
  OpportunitySlotEdge?: GqlOpportunitySlotEdgeResolvers<ContextType>;
  OpportunitySlotsBulkUpdatePayload?: GqlOpportunitySlotsBulkUpdatePayloadResolvers<ContextType>;
  OpportunitySlotsBulkUpdateSuccess?: GqlOpportunitySlotsBulkUpdateSuccessResolvers<ContextType>;
  OpportunitySlotsConnection?: GqlOpportunitySlotsConnectionResolvers<ContextType>;
  OpportunityUpdateContentPayload?: GqlOpportunityUpdateContentPayloadResolvers<ContextType>;
  OpportunityUpdateContentSuccess?: GqlOpportunityUpdateContentSuccessResolvers<ContextType>;
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
  Place?: GqlPlaceResolvers<ContextType>;
  PlaceCreatePayload?: GqlPlaceCreatePayloadResolvers<ContextType>;
  PlaceCreateSuccess?: GqlPlaceCreateSuccessResolvers<ContextType>;
  PlaceDeletePayload?: GqlPlaceDeletePayloadResolvers<ContextType>;
  PlaceDeleteSuccess?: GqlPlaceDeleteSuccessResolvers<ContextType>;
  PlaceEdge?: GqlPlaceEdgeResolvers<ContextType>;
  PlaceUpdatePayload?: GqlPlaceUpdatePayloadResolvers<ContextType>;
  PlaceUpdateSuccess?: GqlPlaceUpdateSuccessResolvers<ContextType>;
  PlacesConnection?: GqlPlacesConnectionResolvers<ContextType>;
  Query?: GqlQueryResolvers<ContextType>;
  State?: GqlStateResolvers<ContextType>;
  Ticket?: GqlTicketResolvers<ContextType>;
  TicketCreatePayload?: GqlTicketCreatePayloadResolvers<ContextType>;
  TicketCreateSuccess?: GqlTicketCreateSuccessResolvers<ContextType>;
  TicketDeletePayload?: GqlTicketDeletePayloadResolvers<ContextType>;
  TicketDeleteSuccess?: GqlTicketDeleteSuccessResolvers<ContextType>;
  TicketEdge?: GqlTicketEdgeResolvers<ContextType>;
  TicketStatusHistoriesConnection?: GqlTicketStatusHistoriesConnectionResolvers<ContextType>;
  TicketStatusHistory?: GqlTicketStatusHistoryResolvers<ContextType>;
  TicketStatusHistoryCreatePayload?: GqlTicketStatusHistoryCreatePayloadResolvers<ContextType>;
  TicketStatusHistoryCreateSuccess?: GqlTicketStatusHistoryCreateSuccessResolvers<ContextType>;
  TicketStatusHistoryEdge?: GqlTicketStatusHistoryEdgeResolvers<ContextType>;
  TicketUpdateStatusPayload?: GqlTicketUpdateStatusPayloadResolvers<ContextType>;
  TicketUpdateStatusSuccess?: GqlTicketUpdateStatusSuccessResolvers<ContextType>;
  TicketsConnection?: GqlTicketsConnectionResolvers<ContextType>;
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
  TransactionPurchaseUtilityPayload?: GqlTransactionPurchaseUtilityPayloadResolvers<ContextType>;
  TransactionPurchaseUtilitySuccess?: GqlTransactionPurchaseUtilitySuccessResolvers<ContextType>;
  TransactionsConnection?: GqlTransactionsConnectionResolvers<ContextType>;
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
  UtilityPurchasePayload?: GqlUtilityPurchasePayloadResolvers<ContextType>;
  UtilityPurchaseSuccess?: GqlUtilityPurchaseSuccessResolvers<ContextType>;
  UtilityRefundPayload?: GqlUtilityRefundPayloadResolvers<ContextType>;
  UtilityRefundSuccess?: GqlUtilityRefundSuccessResolvers<ContextType>;
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

export type GqlDirectiveResolvers<ContextType = any> = ResolversObject<{
  complexity?: GqlComplexityDirectiveResolver<any, any, ContextType>;
  requireRole?: GqlRequireRoleDirectiveResolver<any, any, ContextType>;
}>;

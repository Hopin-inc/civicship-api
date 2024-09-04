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

export type GqlActivities = {
  __typename?: 'Activities';
  data: Array<GqlActivity>;
  total: Scalars['Int']['output'];
};

export type GqlActivitiesConnection = {
  __typename?: 'ActivitiesConnection';
  edges?: Maybe<Array<Maybe<GqlActivityEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlActivity = {
  __typename?: 'Activity';
  application?: Maybe<GqlApplication>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endsAt: Scalars['Datetime']['output'];
  event?: Maybe<GqlEvent>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isPublic: Scalars['Boolean']['output'];
  issue?: Maybe<GqlIssue>;
  organization?: Maybe<GqlOrganization>;
  remark?: Maybe<Scalars['String']['output']>;
  startsAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlActivityAddEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlActivityAddUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlActivityCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  eventId: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlActivityCreatePayload = GqlActivityCreateSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityCreateSuccess = {
  __typename?: 'ActivityCreateSuccess';
  activity?: Maybe<GqlActivity>;
};

export type GqlActivityDeletePayload = GqlActivityDeleteSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityDeleteSuccess = {
  __typename?: 'ActivityDeleteSuccess';
  activityId: Scalars['ID']['output'];
};

export type GqlActivityEdge = GqlEdge & {
  __typename?: 'ActivityEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlActivity>;
};

export type GqlActivityFilterInput = {
  eventId?: InputMaybe<Scalars['String']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlActivityRemoveEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlActivityRemoveUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlActivitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlActivitySwitchPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlActivitySwitchPrivacyPayload = GqlActivitySwitchPrivacySuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivitySwitchPrivacySuccess = {
  __typename?: 'ActivitySwitchPrivacySuccess';
  activity: GqlActivity;
};

export type GqlActivityUpdateContentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
};

export type GqlActivityUpdateContentPayload = GqlActivityUpdateContentSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityUpdateContentSuccess = {
  __typename?: 'ActivityUpdateContentSuccess';
  activity: GqlActivity;
};

export type GqlActivityUpdateEventPayload = GqlActivityUpdateEventSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityUpdateEventSuccess = {
  __typename?: 'ActivityUpdateEventSuccess';
  activity: GqlActivity;
  event: GqlEvent;
};

export type GqlActivityUpdateUserPayload = GqlActivityUpdateUserSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityUpdateUserSuccess = {
  __typename?: 'ActivityUpdateUserSuccess';
  activity: GqlActivity;
  user: GqlUser;
};

export type GqlAgenda = {
  __typename?: 'Agenda';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type GqlApplication = {
  __typename?: 'Application';
  activity?: Maybe<GqlActivity>;
  approvals?: Maybe<Array<GqlApplicationConfirmation>>;
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['Datetime']['output'];
  event?: Maybe<GqlEvent>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  submittedAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlApplicationAddConfirmationInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  confirmerId: Scalars['String']['input'];
  isApproved: Scalars['Boolean']['input'];
};

export type GqlApplicationAddConfirmationPayload = GqlApplicationAddConfirmationSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationAddConfirmationSuccess = {
  __typename?: 'ApplicationAddConfirmationSuccess';
  application: GqlApplication;
};

export type GqlApplicationApprovalInput = {
  applicationConfirmationId: Scalars['String']['input'];
};

export type GqlApplicationConfirmation = {
  __typename?: 'ApplicationConfirmation';
  application?: Maybe<GqlApplication>;
  comment?: Maybe<Scalars['String']['output']>;
  confirmedBy?: Maybe<GqlUser>;
  createdAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  isApproved: Scalars['Boolean']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlApplicationCreateInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['String']['input']>;
  submittedAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlApplicationCreatePayload = GqlApplicationCreateSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationCreateSuccess = {
  __typename?: 'ApplicationCreateSuccess';
  application: GqlApplication;
};

export type GqlApplicationDeleteConfirmationInput = {
  applicationConfirmationId: Scalars['String']['input'];
};

export type GqlApplicationDeleteConfirmationPayload = GqlApplicationDeleteConfirmationSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationDeleteConfirmationSuccess = {
  __typename?: 'ApplicationDeleteConfirmationSuccess';
  applicationConfirmationId: Scalars['String']['output'];
  applicationId: Scalars['ID']['output'];
};

export type GqlApplicationDeletePayload = GqlApplicationDeleteSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationDeleteSuccess = {
  __typename?: 'ApplicationDeleteSuccess';
  applicationId: Scalars['ID']['output'];
};

export type GqlApplicationEdge = GqlEdge & {
  __typename?: 'ApplicationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlApplication>;
};

export type GqlApplicationFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlApplicationRefusalInput = {
  applicationConfirmationId: Scalars['String']['input'];
};

export type GqlApplicationSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlApplicationSwitchIsApprovedPayload = GqlApplicationSwitchIsApprovedSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationSwitchIsApprovedSuccess = {
  __typename?: 'ApplicationSwitchIsApprovedSuccess';
  application: GqlApplication;
};

export type GqlApplicationSwitchPrivacyPayload = GqlApplicationSwitchPrivacySuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationSwitchPrivacySuccess = {
  __typename?: 'ApplicationSwitchPrivacySuccess';
  application: GqlApplication;
};

export type GqlApplicationUpdateCommentInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
};

export type GqlApplicationUpdateCommentPayload = GqlApplicationUpdateCommentSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationUpdateCommentSuccess = {
  __typename?: 'ApplicationUpdateCommentSuccess';
  application: GqlApplication;
};

export type GqlApplicationUpdateConfirmationCommentInput = {
  applicationConfirmationId: Scalars['String']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
};

export type GqlApplicationUpdateConfirmationCommentPayload = GqlApplicationUpdateConfirmationCommentSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlApplicationUpdateConfirmationCommentSuccess = {
  __typename?: 'ApplicationUpdateConfirmationCommentSuccess';
  application: GqlApplication;
};

export type GqlApplicationsConnection = {
  __typename?: 'ApplicationsConnection';
  edges?: Maybe<Array<Maybe<GqlApplicationEdge>>>;
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

export type GqlComment = {
  __typename?: 'Comment';
  content: Scalars['String']['output'];
  createdAt: Scalars['Datetime']['output'];
  event?: Maybe<GqlEvent>;
  id: Scalars['ID']['output'];
  postedAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlCommentAddEventInput = {
  content: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  postedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId: Scalars['String']['input'];
};

export type GqlCommentAddEventPayload = GqlAuthError | GqlCommentAddEventSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommentAddEventSuccess = {
  __typename?: 'CommentAddEventSuccess';
  comment: GqlComment;
};

export type GqlCommentDeletePayload = GqlAuthError | GqlCommentDeleteSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommentDeleteSuccess = {
  __typename?: 'CommentDeleteSuccess';
  commentId: Scalars['String']['output'];
};

export type GqlCommentUpdateContentInput = {
  content?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommentUpdateContentPayload = GqlAuthError | GqlCommentUpdateContentSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommentUpdateContentSuccess = {
  __typename?: 'CommentUpdateContentSuccess';
  comment: GqlComment;
};

export type GqlComments = {
  __typename?: 'Comments';
  data: Array<GqlComment>;
  total: Scalars['Int']['output'];
};

export type GqlCommonError = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlComplexQueryError = GqlError & {
  __typename?: 'ComplexQueryError';
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlCurrentUserPayload = {
  __typename?: 'CurrentUserPayload';
  user?: Maybe<GqlUser>;
};

export type GqlCustomTokenCreatePayload = {
  __typename?: 'CustomTokenCreatePayload';
  idToken: Scalars['String']['output'];
};

export type GqlEdge = {
  cursor: Scalars['String']['output'];
};

export const GqlEntityPosition = {
  Prefix: 'PREFIX',
  Suffix: 'SUFFIX'
} as const;

export type GqlEntityPosition = typeof GqlEntityPosition[keyof typeof GqlEntityPosition];
export type GqlError = {
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlEvent = {
  __typename?: 'Event';
  activities?: Maybe<GqlActivities>;
  agendas?: Maybe<Array<GqlAgenda>>;
  cities?: Maybe<Array<GqlCity>>;
  comments?: Maybe<GqlComments>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endsAt: Scalars['Datetime']['output'];
  groups?: Maybe<Array<GqlGroup>>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isPublic: Scalars['Boolean']['output'];
  likes?: Maybe<GqlLikes>;
  organizations?: Maybe<Array<GqlOrganization>>;
  plannedEndsAt?: Maybe<Scalars['Datetime']['output']>;
  plannedStartsAt?: Maybe<Scalars['Datetime']['output']>;
  skillsets?: Maybe<Array<GqlSkillset>>;
  startsAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlEventAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlEventAddOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlEventDeletePayload = GqlAuthError | GqlComplexQueryError | GqlEventDeleteSuccess | GqlInvalidInputValueError;

export type GqlEventDeleteSuccess = {
  __typename?: 'EventDeleteSuccess';
  eventId: Scalars['ID']['output'];
};

export type GqlEventEdge = GqlEdge & {
  __typename?: 'EventEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlEvent>;
};

export type GqlEventFilterInput = {
  agendaId?: InputMaybe<Scalars['Int']['input']>;
  cityCode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlEventPlanInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  organizationIds?: InputMaybe<Array<Scalars['String']['input']>>;
  plannedEndsAt?: InputMaybe<Scalars['Datetime']['input']>;
  plannedStartsAt?: InputMaybe<Scalars['Datetime']['input']>;
  skillsets?: InputMaybe<Array<Scalars['Int']['input']>>;
  startsAt: Scalars['Datetime']['input'];
};

export type GqlEventPlanPayload = GqlAuthError | GqlComplexQueryError | GqlEventPlanSuccess | GqlInvalidInputValueError;

export type GqlEventPlanSuccess = {
  __typename?: 'EventPlanSuccess';
  event?: Maybe<GqlEvent>;
};

export type GqlEventRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlEventRemoveOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlEventSortInput = {
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlEventUpdateContentInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  plannedEndsAt?: InputMaybe<Scalars['Datetime']['input']>;
  plannedStartsAt?: InputMaybe<Scalars['Datetime']['input']>;
  skillsets?: InputMaybe<Array<Scalars['Int']['input']>>;
  startsAt: Scalars['Datetime']['input'];
};

export type GqlEventUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlEventUpdateContentSuccess | GqlInvalidInputValueError;

export type GqlEventUpdateContentSuccess = {
  __typename?: 'EventUpdateContentSuccess';
  event: GqlEvent;
};

export type GqlEventUpdateGroupPayload = GqlAuthError | GqlComplexQueryError | GqlEventUpdateGroupSuccess | GqlInvalidInputValueError;

export type GqlEventUpdateGroupSuccess = {
  __typename?: 'EventUpdateGroupSuccess';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlEventUpdateOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlEventUpdateOrganizationSuccess | GqlInvalidInputValueError;

export type GqlEventUpdateOrganizationSuccess = {
  __typename?: 'EventUpdateOrganizationSuccess';
  event: GqlEvent;
  organization: GqlOrganization;
};

export type GqlEventUpdatePrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlEventUpdatePrivacySuccess | GqlInvalidInputValueError;

export type GqlEventUpdatePrivacySuccess = {
  __typename?: 'EventUpdatePrivacySuccess';
  event: GqlEvent;
};

export type GqlEventsConnection = {
  __typename?: 'EventsConnection';
  edges?: Maybe<Array<Maybe<GqlEventEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlField = {
  __typename?: 'Field';
  message?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type GqlGroup = {
  __typename?: 'Group';
  agendas?: Maybe<Array<GqlAgenda>>;
  bio?: Maybe<Scalars['String']['output']>;
  children?: Maybe<Array<GqlGroup>>;
  cities?: Maybe<Array<GqlCity>>;
  createdAt: Scalars['Datetime']['output'];
  events?: Maybe<Array<GqlEvent>>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  organization?: Maybe<GqlOrganization>;
  parent?: Maybe<GqlGroup>;
  targets?: Maybe<Array<GqlTarget>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  users?: Maybe<Array<GqlUser>>;
};

export type GqlGroupAddChildInput = {
  childId: Scalars['String']['input'];
};

export type GqlGroupAddEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlGroupAddParentInput = {
  parentId: Scalars['String']['input'];
};

export type GqlGroupAddTargetInput = {
  targetId: Scalars['String']['input'];
};

export type GqlGroupAddUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlGroupChangeOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlGroupChangeOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlGroupChangeOrganizationSuccess | GqlInvalidInputValueError;

export type GqlGroupChangeOrganizationSuccess = {
  __typename?: 'GroupChangeOrganizationSuccess';
  group: GqlGroup;
  organization: GqlOrganization;
};

export type GqlGroupCreateInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  childrenIds?: InputMaybe<Array<Scalars['String']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GqlGroupCreatePayload = GqlAuthError | GqlComplexQueryError | GqlGroupCreateSuccess | GqlInvalidInputValueError;

export type GqlGroupCreateSuccess = {
  __typename?: 'GroupCreateSuccess';
  group?: Maybe<GqlGroup>;
};

export type GqlGroupDeletePayload = GqlAuthError | GqlComplexQueryError | GqlGroupDeleteSuccess | GqlInvalidInputValueError;

export type GqlGroupDeleteSuccess = {
  __typename?: 'GroupDeleteSuccess';
  groupId: Scalars['ID']['output'];
};

export type GqlGroupEdge = GqlEdge & {
  __typename?: 'GroupEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlGroup>;
};

export type GqlGroupFilterInput = {
  agendaId?: InputMaybe<Scalars['Int']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlGroupRemoveChildInput = {
  childId: Scalars['String']['input'];
};

export type GqlGroupRemoveEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlGroupRemoveParentInput = {
  parentId: Scalars['String']['input'];
};

export type GqlGroupRemoveTargetInput = {
  targetId: Scalars['String']['input'];
};

export type GqlGroupRemoveUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlGroupSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlGroupUpdateChildPayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateChildSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateChildSuccess = {
  __typename?: 'GroupUpdateChildSuccess';
  child: GqlGroup;
  group: GqlGroup;
};

export type GqlGroupUpdateContentInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type GqlGroupUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateContentSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateContentSuccess = {
  __typename?: 'GroupUpdateContentSuccess';
  group: GqlGroup;
};

export type GqlGroupUpdateEventPayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateEventSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateEventSuccess = {
  __typename?: 'GroupUpdateEventSuccess';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlGroupUpdateParentPayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateParentSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateParentSuccess = {
  __typename?: 'GroupUpdateParentSuccess';
  group: GqlGroup;
  parent: GqlGroup;
};

export type GqlGroupUpdateTargetPayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateTargetSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateTargetSuccess = {
  __typename?: 'GroupUpdateTargetSuccess';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlGroupUpdateUserPayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateUserSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateUserSuccess = {
  __typename?: 'GroupUpdateUserSuccess';
  group: GqlGroup;
  user: GqlUser;
};

export type GqlGroupsConnection = {
  __typename?: 'GroupsConnection';
  edges?: Maybe<Array<Maybe<GqlGroupEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlIdentityPlatform = {
  Line: 'LINE'
} as const;

export type GqlIdentityPlatform = typeof GqlIdentityPlatform[keyof typeof GqlIdentityPlatform];
export type GqlIndex = {
  __typename?: 'Index';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  valueType: GqlValueType;
};

export type GqlInvalidInputValueError = GqlError & {
  __typename?: 'InvalidInputValueError';
  fields?: Maybe<Array<GqlField>>;
  message: Scalars['String']['output'];
  statusCode: Scalars['Int']['output'];
};

export type GqlIssue = {
  __typename?: 'Issue';
  activities?: Maybe<GqlActivities>;
  cities?: Maybe<Array<GqlCity>>;
  comments?: Maybe<GqlComments>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  groups?: Maybe<Array<GqlGroup>>;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isPublic: Scalars['Boolean']['output'];
  issueCategories?: Maybe<Array<GqlIssueCategory>>;
  likes?: Maybe<GqlLikes>;
  organizations?: Maybe<Array<GqlOrganization>>;
  skillsets?: Maybe<Array<GqlSkillset>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlIssueAddCategoryInput = {
  categoryId: Scalars['Int']['input'];
};

export type GqlIssueAddCategoryPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueAddCategorySuccess;

export type GqlIssueAddCategorySuccess = {
  __typename?: 'IssueAddCategorySuccess';
  category: GqlIssueCategory;
  issue: GqlIssue;
};

export type GqlIssueAddCityInput = {
  cityId: Scalars['String']['input'];
};

export type GqlIssueAddCityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueAddCitySuccess;

export type GqlIssueAddCitySuccess = {
  __typename?: 'IssueAddCitySuccess';
  city: GqlCity;
  issue: GqlIssue;
};

export type GqlIssueAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlIssueAddGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueAddGroupSuccess;

export type GqlIssueAddGroupSuccess = {
  __typename?: 'IssueAddGroupSuccess';
  group: GqlGroup;
  issue: GqlIssue;
};

export type GqlIssueAddOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlIssueAddOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueAddOrganizationSuccess;

export type GqlIssueAddOrganizationSuccess = {
  __typename?: 'IssueAddOrganizationSuccess';
  issue: GqlIssue;
  organization: GqlOrganization;
};

export type GqlIssueAddSkillsetInput = {
  skillsetId: Scalars['Int']['input'];
};

export type GqlIssueAddSkillsetPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueAddSkillsetSuccess;

export type GqlIssueAddSkillsetSuccess = {
  __typename?: 'IssueAddSkillsetSuccess';
  issue: GqlIssue;
  skillset: GqlSkillset;
};

export type GqlIssueCategory = {
  __typename?: 'IssueCategory';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type GqlIssueCreateInput = {
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  issueCategoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  organizationIds?: InputMaybe<Array<Scalars['String']['input']>>;
  skillsetIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type GqlIssueCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueCreateSuccess;

export type GqlIssueCreateSuccess = {
  __typename?: 'IssueCreateSuccess';
  issue: GqlIssue;
};

export type GqlIssueDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueDeleteSuccess;

export type GqlIssueDeleteSuccess = {
  __typename?: 'IssueDeleteSuccess';
  issueId: Scalars['String']['output'];
};

export type GqlIssueEdge = GqlEdge & {
  __typename?: 'IssueEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlIssue>;
};

export type GqlIssueFilterInput = {
  cityCode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlIssuePrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlIssueRemoveCategoryInput = {
  categoryId: Scalars['Int']['input'];
};

export type GqlIssueRemoveCategoryPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueRemoveCategorySuccess;

export type GqlIssueRemoveCategorySuccess = {
  __typename?: 'IssueRemoveCategorySuccess';
  category: GqlIssueCategory;
  issue: GqlIssue;
};

export type GqlIssueRemoveCityInput = {
  cityId: Scalars['String']['input'];
};

export type GqlIssueRemoveCityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueRemoveCitySuccess;

export type GqlIssueRemoveCitySuccess = {
  __typename?: 'IssueRemoveCitySuccess';
  city: GqlCity;
  issue: GqlIssue;
};

export type GqlIssueRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlIssueRemoveGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueRemoveGroupSuccess;

export type GqlIssueRemoveGroupSuccess = {
  __typename?: 'IssueRemoveGroupSuccess';
  group: GqlGroup;
  issue: GqlIssue;
};

export type GqlIssueRemoveOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlIssueRemoveOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueRemoveOrganizationSuccess;

export type GqlIssueRemoveOrganizationSuccess = {
  __typename?: 'IssueRemoveOrganizationSuccess';
  issue: GqlIssue;
  organization: GqlOrganization;
};

export type GqlIssueRemoveSkillsetInput = {
  skillsetId: Scalars['Int']['input'];
};

export type GqlIssueRemoveSkillsetPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueRemoveSkillsetSuccess;

export type GqlIssueRemoveSkillsetSuccess = {
  __typename?: 'IssueRemoveSkillsetSuccess';
  issue: GqlIssue;
  skillset: GqlSkillset;
};

export type GqlIssueSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
};

export type GqlIssueUpdateContentInput = {
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  issueCategoryIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  skillsetIds?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type GqlIssueUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueUpdateContentSuccess;

export type GqlIssueUpdateContentSuccess = {
  __typename?: 'IssueUpdateContentSuccess';
  issue: GqlIssue;
};

export type GqlIssueUpdatePrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlIssueUpdatePrivacySuccess;

export type GqlIssueUpdatePrivacySuccess = {
  __typename?: 'IssueUpdatePrivacySuccess';
  issue: GqlIssue;
};

export type GqlIssuesConnection = {
  __typename?: 'IssuesConnection';
  edges?: Maybe<Array<Maybe<GqlIssueEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlLike = {
  __typename?: 'Like';
  createdAt: Scalars['Datetime']['output'];
  event?: Maybe<GqlEvent>;
  postedAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user?: Maybe<GqlUser>;
};

export type GqlLikeAddEventInput = {
  eventId: Scalars['String']['input'];
  postedAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlLikeAddEventPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlLikeAddEventSuccess;

export type GqlLikeAddEventSuccess = {
  __typename?: 'LikeAddEventSuccess';
  like: GqlLike;
};

export type GqlLikeDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlLikeDeleteSuccess;

export type GqlLikeDeleteSuccess = {
  __typename?: 'LikeDeleteSuccess';
  likeId: Scalars['String']['output'];
};

export type GqlLikes = {
  __typename?: 'Likes';
  data: Array<GqlLike>;
  total: Scalars['Int']['output'];
};

export type GqlMutation = {
  __typename?: 'Mutation';
  activityAddEvent?: Maybe<GqlActivityUpdateEventPayload>;
  activityAddUser?: Maybe<GqlActivityUpdateUserPayload>;
  activityCreate?: Maybe<GqlActivityCreatePayload>;
  activityDelete?: Maybe<GqlActivityDeletePayload>;
  activityPublish?: Maybe<GqlActivitySwitchPrivacyPayload>;
  activityRemoveEvent?: Maybe<GqlActivityUpdateEventPayload>;
  activityRemoveUser?: Maybe<GqlActivityUpdateUserPayload>;
  activityUnpublish?: Maybe<GqlActivitySwitchPrivacyPayload>;
  activityUpdateContent?: Maybe<GqlActivityUpdateContentPayload>;
  applicationAddConfirmation?: Maybe<GqlApplicationAddConfirmationPayload>;
  applicationApproval?: Maybe<GqlApplicationSwitchIsApprovedPayload>;
  applicationCreate?: Maybe<GqlApplicationCreatePayload>;
  applicationDelete?: Maybe<GqlApplicationDeletePayload>;
  applicationDeleteConfirmation?: Maybe<GqlApplicationDeleteConfirmationPayload>;
  applicationPublish?: Maybe<GqlApplicationSwitchPrivacyPayload>;
  applicationRefusal?: Maybe<GqlApplicationSwitchIsApprovedPayload>;
  applicationUnpublish?: Maybe<GqlApplicationSwitchPrivacyPayload>;
  applicationUpdateComment?: Maybe<GqlApplicationUpdateCommentPayload>;
  applicationUpdateConfirmationComment?: Maybe<GqlApplicationUpdateConfirmationCommentPayload>;
  commentAddEvent?: Maybe<GqlCommentAddEventPayload>;
  commentDelete?: Maybe<GqlCommentDeletePayload>;
  commentUpdateContent?: Maybe<GqlCommentUpdateContentPayload>;
  eventAddGroup?: Maybe<GqlEventUpdateGroupPayload>;
  eventAddOrganization?: Maybe<GqlEventUpdateOrganizationPayload>;
  eventDelete?: Maybe<GqlEventDeletePayload>;
  eventPlan?: Maybe<GqlEventPlanPayload>;
  eventPublish?: Maybe<GqlEventUpdatePrivacyPayload>;
  eventRemoveGroup?: Maybe<GqlEventUpdateGroupPayload>;
  eventRemoveOrganization?: Maybe<GqlEventUpdateOrganizationPayload>;
  eventUnpublish?: Maybe<GqlEventUpdatePrivacyPayload>;
  eventUpdateContent?: Maybe<GqlEventUpdateContentPayload>;
  groupAddChild?: Maybe<GqlGroupUpdateChildPayload>;
  groupAddEvent?: Maybe<GqlGroupUpdateEventPayload>;
  groupAddParent?: Maybe<GqlGroupUpdateParentPayload>;
  groupAddTarget?: Maybe<GqlGroupUpdateTargetPayload>;
  groupAddUser?: Maybe<GqlGroupUpdateUserPayload>;
  groupChangeOrganization?: Maybe<GqlGroupChangeOrganizationPayload>;
  groupCreate?: Maybe<GqlGroupCreatePayload>;
  groupDelete?: Maybe<GqlGroupDeletePayload>;
  groupRemoveChild?: Maybe<GqlGroupUpdateChildPayload>;
  groupRemoveEvent?: Maybe<GqlGroupUpdateEventPayload>;
  groupRemoveParent?: Maybe<GqlGroupUpdateParentPayload>;
  groupRemoveTarget?: Maybe<GqlGroupUpdateTargetPayload>;
  groupRemoveUser?: Maybe<GqlGroupUpdateUserPayload>;
  groupUpdateContent?: Maybe<GqlGroupUpdateContentPayload>;
  issueAddCategory?: Maybe<GqlIssueAddCategoryPayload>;
  issueAddCity?: Maybe<GqlIssueAddCityPayload>;
  issueAddGroup?: Maybe<GqlIssueAddGroupPayload>;
  issueAddOrganization?: Maybe<GqlIssueAddOrganizationPayload>;
  issueAddSkillset?: Maybe<GqlIssueAddSkillsetPayload>;
  issueCreate?: Maybe<GqlIssueCreatePayload>;
  issueDelete?: Maybe<GqlIssueDeletePayload>;
  issuePublish?: Maybe<GqlIssueUpdatePrivacyPayload>;
  issueRemoveCategory?: Maybe<GqlIssueRemoveCategoryPayload>;
  issueRemoveCity?: Maybe<GqlIssueRemoveCityPayload>;
  issueRemoveGroup?: Maybe<GqlIssueRemoveGroupPayload>;
  issueRemoveOrganization?: Maybe<GqlIssueRemoveOrganizationPayload>;
  issueRemoveSkillset?: Maybe<GqlIssueRemoveSkillsetPayload>;
  issueUnpublish?: Maybe<GqlIssueUpdatePrivacyPayload>;
  issueUpdateContent?: Maybe<GqlIssueUpdateContentPayload>;
  likeAddEvent?: Maybe<GqlLikeAddEventPayload>;
  likeDelete?: Maybe<GqlLikeDeletePayload>;
  mutationEcho: Scalars['String']['output'];
  organizationAddGroup?: Maybe<GqlOrganizationAddGroupPayload>;
  organizationAddTarget?: Maybe<GqlOrganizationAddTargetPayload>;
  organizationAddUser?: Maybe<GqlOrganizationAddUserPayload>;
  organizationCreate?: Maybe<GqlOrganizationCreatePayload>;
  organizationDelete?: Maybe<GqlOrganizationDeletePayload>;
  organizationPublish?: Maybe<GqlOrganizationUpdatePrivacyPayload>;
  organizationRemoveGroup?: Maybe<GqlOrganizationRemoveGroupPayload>;
  organizationRemoveTarget?: Maybe<GqlOrganizationRemoveTargetPayload>;
  organizationRemoveUser?: Maybe<GqlOrganizationRemoveUserPayload>;
  organizationUnpublish?: Maybe<GqlOrganizationUpdatePrivacyPayload>;
  organizationUpdateContent?: Maybe<GqlOrganizationUpdateContentPayload>;
  organizationUpdateDefault?: Maybe<GqlOrganizationUpdateDefaultPayload>;
  targetAddGroup?: Maybe<GqlTargetAddGroupPayload>;
  targetAddOrganization?: Maybe<GqlTargetAddOrganizationPayload>;
  targetCreate?: Maybe<GqlTargetCreatePayload>;
  targetDelete?: Maybe<GqlTargetDeletePayload>;
  targetRemoveGroup?: Maybe<GqlTargetRemoveGroupPayload>;
  targetRemoveOrganization?: Maybe<GqlTargetRemoveOrganizationPayload>;
  targetUpdateContent?: Maybe<GqlTargetUpdateContentPayload>;
  targetUpdateIndex?: Maybe<GqlTargetUpdateIndexPayload>;
  userAddActivity?: Maybe<GqlUserUpdateActivityPayload>;
  userAddGroup?: Maybe<GqlUserUpdateGroupPayload>;
  userAddOrganization?: Maybe<GqlUserUpdateOrganizationPayload>;
  userCreate?: Maybe<GqlUserCreatePayload>;
  userDelete?: Maybe<GqlUserDeletePayload>;
  userPublish?: Maybe<GqlUserSwitchPrivacyPayload>;
  userRemoveActivity?: Maybe<GqlUserUpdateActivityPayload>;
  userRemoveGroup?: Maybe<GqlUserUpdateGroupPayload>;
  userRemoveOrganization?: Maybe<GqlUserUpdateOrganizationPayload>;
  userUnpublish?: Maybe<GqlUserSwitchPrivacyPayload>;
  userUpdateContent?: Maybe<GqlUserUpdateContentPayload>;
};


export type GqlMutationActivityAddEventArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityAddEventInput;
};


export type GqlMutationActivityAddUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityAddUserInput;
};


export type GqlMutationActivityCreateArgs = {
  input: GqlActivityCreateInput;
};


export type GqlMutationActivityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationActivityPublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivitySwitchPrivacyInput;
};


export type GqlMutationActivityRemoveEventArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityRemoveEventInput;
};


export type GqlMutationActivityRemoveUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityRemoveUserInput;
};


export type GqlMutationActivityUnpublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivitySwitchPrivacyInput;
};


export type GqlMutationActivityUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityUpdateContentInput;
};


export type GqlMutationApplicationAddConfirmationArgs = {
  id: Scalars['ID']['input'];
  input: GqlApplicationAddConfirmationInput;
};


export type GqlMutationApplicationApprovalArgs = {
  id: Scalars['ID']['input'];
  input: GqlApplicationApprovalInput;
};


export type GqlMutationApplicationCreateArgs = {
  input: GqlApplicationCreateInput;
};


export type GqlMutationApplicationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationApplicationDeleteConfirmationArgs = {
  id: Scalars['ID']['input'];
  input: GqlApplicationDeleteConfirmationInput;
};


export type GqlMutationApplicationPublishArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationApplicationRefusalArgs = {
  id: Scalars['ID']['input'];
  input: GqlApplicationRefusalInput;
};


export type GqlMutationApplicationUnpublishArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationApplicationUpdateCommentArgs = {
  id: Scalars['ID']['input'];
  input: GqlApplicationUpdateCommentInput;
};


export type GqlMutationApplicationUpdateConfirmationCommentArgs = {
  id: Scalars['ID']['input'];
  input: GqlApplicationUpdateConfirmationCommentInput;
};


export type GqlMutationCommentAddEventArgs = {
  input: GqlCommentAddEventInput;
};


export type GqlMutationCommentDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationCommentUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommentUpdateContentInput;
};


export type GqlMutationEventAddGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventAddGroupInput;
};


export type GqlMutationEventAddOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventAddOrganizationInput;
};


export type GqlMutationEventDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationEventPlanArgs = {
  input: GqlEventPlanInput;
};


export type GqlMutationEventPublishArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationEventRemoveGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventRemoveGroupInput;
};


export type GqlMutationEventRemoveOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventRemoveOrganizationInput;
};


export type GqlMutationEventUnpublishArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationEventUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventUpdateContentInput;
};


export type GqlMutationGroupAddChildArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupAddChildInput;
};


export type GqlMutationGroupAddEventArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupAddEventInput;
};


export type GqlMutationGroupAddParentArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupAddParentInput;
};


export type GqlMutationGroupAddTargetArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupAddTargetInput;
};


export type GqlMutationGroupAddUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupAddUserInput;
};


export type GqlMutationGroupChangeOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupChangeOrganizationInput;
};


export type GqlMutationGroupCreateArgs = {
  input: GqlGroupCreateInput;
};


export type GqlMutationGroupDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationGroupRemoveChildArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupRemoveChildInput;
};


export type GqlMutationGroupRemoveEventArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupRemoveEventInput;
};


export type GqlMutationGroupRemoveParentArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupRemoveParentInput;
};


export type GqlMutationGroupRemoveTargetArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupRemoveTargetInput;
};


export type GqlMutationGroupRemoveUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupRemoveUserInput;
};


export type GqlMutationGroupUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupUpdateContentInput;
};


export type GqlMutationIssueAddCategoryArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueAddCategoryInput;
};


export type GqlMutationIssueAddCityArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueAddCityInput;
};


export type GqlMutationIssueAddGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueAddGroupInput;
};


export type GqlMutationIssueAddOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueAddOrganizationInput;
};


export type GqlMutationIssueAddSkillsetArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueAddSkillsetInput;
};


export type GqlMutationIssueCreateArgs = {
  input: GqlIssueCreateInput;
};


export type GqlMutationIssueDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationIssuePublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssuePrivacyInput;
};


export type GqlMutationIssueRemoveCategoryArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueRemoveCategoryInput;
};


export type GqlMutationIssueRemoveCityArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueRemoveCityInput;
};


export type GqlMutationIssueRemoveGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueRemoveGroupInput;
};


export type GqlMutationIssueRemoveOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueRemoveOrganizationInput;
};


export type GqlMutationIssueRemoveSkillsetArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueRemoveSkillsetInput;
};


export type GqlMutationIssueUnpublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssuePrivacyInput;
};


export type GqlMutationIssueUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlIssueUpdateContentInput;
};


export type GqlMutationLikeAddEventArgs = {
  input: GqlLikeAddEventInput;
};


export type GqlMutationLikeDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOrganizationAddGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationAddGroupInput;
};


export type GqlMutationOrganizationAddTargetArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationAddTargetInput;
};


export type GqlMutationOrganizationAddUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationAddUserInput;
};


export type GqlMutationOrganizationCreateArgs = {
  input: GqlOrganizationCreateInput;
};


export type GqlMutationOrganizationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOrganizationPublishArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOrganizationRemoveGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationRemoveGroupInput;
};


export type GqlMutationOrganizationRemoveTargetArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationRemoveTargetInput;
};


export type GqlMutationOrganizationRemoveUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationRemoveUserInput;
};


export type GqlMutationOrganizationUnpublishArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOrganizationUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationUpdateContentInput;
};


export type GqlMutationOrganizationUpdateDefaultArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationUpdateDefaultInput;
};


export type GqlMutationTargetAddGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetAddGroupInput;
};


export type GqlMutationTargetAddOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetAddOrganizationInput;
};


export type GqlMutationTargetCreateArgs = {
  input: GqlTargetCreateInput;
};


export type GqlMutationTargetDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationTargetRemoveGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetRemoveGroupInput;
};


export type GqlMutationTargetRemoveOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetRemoveOrganizationInput;
};


export type GqlMutationTargetUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetUpdateContentInput;
};


export type GqlMutationTargetUpdateIndexArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetUpdateIndexInput;
};


export type GqlMutationUserAddActivityArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserAddActivityInput;
};


export type GqlMutationUserAddGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserAddGroupInput;
};


export type GqlMutationUserAddOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserAddOrganizationInput;
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


export type GqlMutationUserRemoveActivityArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserRemoveActivityInput;
};


export type GqlMutationUserRemoveGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserRemoveGroupInput;
};


export type GqlMutationUserRemoveOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserRemoveOrganizationInput;
};


export type GqlMutationUserUnpublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserSwitchPrivacyInput;
};


export type GqlMutationUserUpdateContentArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserUpdateContentInput;
};

export type GqlOrganization = {
  __typename?: 'Organization';
  address1: Scalars['String']['output'];
  address2?: Maybe<Scalars['String']['output']>;
  agendas?: Maybe<Array<GqlAgenda>>;
  bio?: Maybe<Scalars['String']['output']>;
  cities?: Maybe<Array<GqlCity>>;
  city: GqlCity;
  createdAt: Scalars['Datetime']['output'];
  entity?: Maybe<Scalars['String']['output']>;
  entityPosition?: Maybe<GqlEntityPosition>;
  establishedAt?: Maybe<Scalars['Datetime']['output']>;
  events?: Maybe<Array<GqlEvent>>;
  groups?: Maybe<Array<GqlGroup>>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isPublic: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  state: GqlState;
  targets?: Maybe<Array<GqlTarget>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  users?: Maybe<Array<GqlUser>>;
  website?: Maybe<Scalars['String']['output']>;
  zipcode: Scalars['String']['output'];
};

export type GqlOrganizationAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlOrganizationAddGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationAddGroupSuccess;

export type GqlOrganizationAddGroupSuccess = {
  __typename?: 'OrganizationAddGroupSuccess';
  group: GqlGroup;
  organization: GqlOrganization;
};

export type GqlOrganizationAddTargetInput = {
  targetId: Scalars['String']['input'];
};

export type GqlOrganizationAddTargetPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationAddTargetSuccess;

export type GqlOrganizationAddTargetSuccess = {
  __typename?: 'OrganizationAddTargetSuccess';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlOrganizationAddUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlOrganizationAddUserPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationAddUserSuccess;

export type GqlOrganizationAddUserSuccess = {
  __typename?: 'OrganizationAddUserSuccess';
  organization: GqlOrganization;
  user: GqlUser;
};

export type GqlOrganizationCreateInput = {
  address1: Scalars['String']['input'];
  address2?: InputMaybe<Scalars['String']['input']>;
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCode: Scalars['String']['input'];
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  entity?: InputMaybe<Scalars['String']['input']>;
  entityPosition?: InputMaybe<GqlEntityPosition>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  stateCode: Scalars['String']['input'];
  stateCountryCode: Scalars['String']['input'];
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
  website?: InputMaybe<Scalars['String']['input']>;
  zipcode: Scalars['String']['input'];
};

export type GqlOrganizationCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationCreateSuccess;

export type GqlOrganizationCreateSuccess = {
  __typename?: 'OrganizationCreateSuccess';
  organization?: Maybe<GqlOrganization>;
};

export type GqlOrganizationDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationDeleteSuccess;

export type GqlOrganizationDeleteSuccess = {
  __typename?: 'OrganizationDeleteSuccess';
  organizationId: Scalars['ID']['output'];
};

export type GqlOrganizationEdge = GqlEdge & {
  __typename?: 'OrganizationEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlOrganization>;
};

export type GqlOrganizationFilterInput = {
  agendaId?: InputMaybe<Scalars['Int']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlOrganizationRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlOrganizationRemoveGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationRemoveGroupSuccess;

export type GqlOrganizationRemoveGroupSuccess = {
  __typename?: 'OrganizationRemoveGroupSuccess';
  group: GqlGroup;
  organization: GqlOrganization;
};

export type GqlOrganizationRemoveTargetInput = {
  targetId: Scalars['String']['input'];
};

export type GqlOrganizationRemoveTargetPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationRemoveTargetSuccess;

export type GqlOrganizationRemoveTargetSuccess = {
  __typename?: 'OrganizationRemoveTargetSuccess';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlOrganizationRemoveUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlOrganizationRemoveUserPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationRemoveUserSuccess;

export type GqlOrganizationRemoveUserSuccess = {
  __typename?: 'OrganizationRemoveUserSuccess';
  organization: GqlOrganization;
  user: GqlUser;
};

export type GqlOrganizationSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlOrganizationUpdateContentInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlOrganizationUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationUpdateContentSuccess;

export type GqlOrganizationUpdateContentSuccess = {
  __typename?: 'OrganizationUpdateContentSuccess';
  organization: GqlOrganization;
};

export type GqlOrganizationUpdateDefaultInput = {
  address1: Scalars['String']['input'];
  address2?: InputMaybe<Scalars['String']['input']>;
  cityCode: Scalars['String']['input'];
  entity?: InputMaybe<Scalars['String']['input']>;
  entityPosition?: InputMaybe<GqlEntityPosition>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  name: Scalars['String']['input'];
  stateCode: Scalars['String']['input'];
  stateCountryCode: Scalars['String']['input'];
  zipcode: Scalars['String']['input'];
};

export type GqlOrganizationUpdateDefaultPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationUpdateDefaultSuccess;

export type GqlOrganizationUpdateDefaultSuccess = {
  __typename?: 'OrganizationUpdateDefaultSuccess';
  organization: GqlOrganization;
};

export type GqlOrganizationUpdatePrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationUpdatePrivacySuccess;

export type GqlOrganizationUpdatePrivacySuccess = {
  __typename?: 'OrganizationUpdatePrivacySuccess';
  organization: GqlOrganization;
};

export type GqlOrganizations = {
  __typename?: 'Organizations';
  data: Array<GqlOrganization>;
  total: Scalars['Int']['output'];
};

export type GqlOrganizationsConnection = {
  __typename?: 'OrganizationsConnection';
  edges?: Maybe<Array<Maybe<GqlOrganizationEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
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

export type GqlQuery = {
  __typename?: 'Query';
  activities: GqlActivitiesConnection;
  activity?: Maybe<GqlActivity>;
  agendas: Array<GqlAgenda>;
  application?: Maybe<GqlApplication>;
  applications: GqlApplicationsConnection;
  cities: Array<GqlCity>;
  currentUser?: Maybe<GqlCurrentUserPayload>;
  echo: Scalars['String']['output'];
  event?: Maybe<GqlEvent>;
  events: GqlEventsConnection;
  group?: Maybe<GqlGroup>;
  groups: GqlGroupsConnection;
  issue?: Maybe<GqlIssue>;
  issues: GqlIssuesConnection;
  organization?: Maybe<GqlOrganization>;
  organizations: GqlOrganizationsConnection;
  states: Array<GqlState>;
  target?: Maybe<GqlTarget>;
  targets: GqlTargetsConnection;
  user?: Maybe<GqlUser>;
  users: GqlUsersConnection;
};


export type GqlQueryActivitiesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlActivityFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlActivitySortInput>;
};


export type GqlQueryActivityArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryApplicationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryApplicationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlApplicationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlApplicationSortInput>;
};


export type GqlQueryCitiesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type GqlQueryEventArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryEventsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlEventFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlEventSortInput>;
};


export type GqlQueryGroupArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryGroupsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlGroupFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlGroupSortInput>;
};


export type GqlQueryIssueArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryIssuesArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlIssueFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlIssueSortInput>;
};


export type GqlQueryOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryOrganizationsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlOrganizationFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlOrganizationSortInput>;
};


export type GqlQueryStatesArgs = {
  name?: InputMaybe<Scalars['String']['input']>;
};


export type GqlQueryTargetArgs = {
  id: Scalars['ID']['input'];
};


export type GqlQueryTargetsArgs = {
  cursor?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<GqlTargetFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<GqlTargetSortInput>;
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

export const GqlRole = {
  Manager: 'MANAGER',
  Member: 'MEMBER',
  Owner: 'OWNER'
} as const;

export type GqlRole = typeof GqlRole[keyof typeof GqlRole];
export type GqlSkillset = {
  __typename?: 'Skillset';
  code: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

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
export type GqlTarget = {
  __typename?: 'Target';
  createdAt: Scalars['Datetime']['output'];
  group?: Maybe<GqlGroup>;
  id: Scalars['ID']['output'];
  index?: Maybe<GqlIndex>;
  name: Scalars['String']['output'];
  organization?: Maybe<GqlOrganization>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  validFrom: Scalars['Datetime']['output'];
  validTo: Scalars['Datetime']['output'];
  value: Scalars['Float']['output'];
};

export type GqlTargetAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlTargetAddGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetAddGroupSuccess;

export type GqlTargetAddGroupSuccess = {
  __typename?: 'TargetAddGroupSuccess';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlTargetAddOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlTargetAddOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetAddOrganizationSuccess;

export type GqlTargetAddOrganizationSuccess = {
  __typename?: 'TargetAddOrganizationSuccess';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlTargetCreateInput = {
  groupId: Scalars['String']['input'];
  indexId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  validFrom: Scalars['Datetime']['input'];
  validTo: Scalars['Datetime']['input'];
  value: Scalars['Float']['input'];
};

export type GqlTargetCreatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetCreateSuccess;

export type GqlTargetCreateSuccess = {
  __typename?: 'TargetCreateSuccess';
  target?: Maybe<GqlTarget>;
};

export type GqlTargetDeletePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetDeleteSuccess;

export type GqlTargetDeleteSuccess = {
  __typename?: 'TargetDeleteSuccess';
  targetId: Scalars['ID']['output'];
};

export type GqlTargetEdge = GqlEdge & {
  __typename?: 'TargetEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTarget>;
};

export type GqlTargetFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlTargetRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlTargetRemoveGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetRemoveGroupSuccess;

export type GqlTargetRemoveGroupSuccess = {
  __typename?: 'TargetRemoveGroupSuccess';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlTargetRemoveOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlTargetRemoveOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetRemoveOrganizationSuccess;

export type GqlTargetRemoveOrganizationSuccess = {
  __typename?: 'TargetRemoveOrganizationSuccess';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlTargetSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTargetUpdateContentInput = {
  name: Scalars['String']['input'];
  validFrom: Scalars['Datetime']['input'];
  validTo: Scalars['Datetime']['input'];
  value: Scalars['Float']['input'];
};

export type GqlTargetUpdateContentPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetUpdateContentSuccess;

export type GqlTargetUpdateContentSuccess = {
  __typename?: 'TargetUpdateContentSuccess';
  target?: Maybe<GqlTarget>;
};

export type GqlTargetUpdateIndexInput = {
  indexId: Scalars['Int']['input'];
};

export type GqlTargetUpdateIndexPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetUpdateIndexSuccess;

export type GqlTargetUpdateIndexSuccess = {
  __typename?: 'TargetUpdateIndexSuccess';
  index: GqlIndex;
  target: GqlTarget;
};

export type GqlTargetsConnection = {
  __typename?: 'TargetsConnection';
  edges?: Maybe<Array<Maybe<GqlTargetEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlUser = {
  __typename?: 'User';
  activities?: Maybe<Array<GqlActivity>>;
  agendas?: Maybe<Array<GqlAgenda>>;
  bio?: Maybe<Scalars['String']['output']>;
  cities?: Maybe<Array<GqlCity>>;
  comments?: Maybe<Array<GqlComment>>;
  createdAt: Scalars['Datetime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  groups?: Maybe<Array<GqlGroup>>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isPublic: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  likes?: Maybe<Array<GqlLike>>;
  middleName?: Maybe<Scalars['String']['output']>;
  organizations?: Maybe<Array<GqlOrganization>>;
  sysRole: GqlSysRole;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlUserAddActivityInput = {
  activityId: Scalars['String']['input'];
};

export type GqlUserAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlUserAddOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlUserCreateInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  organizationIds?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type GqlUserRemoveActivityInput = {
  activityId: Scalars['String']['input'];
};

export type GqlUserRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlUserRemoveOrganizationInput = {
  organizationId: Scalars['String']['input'];
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

export type GqlUserUpdateActivityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdateActivitySuccess;

export type GqlUserUpdateActivitySuccess = {
  __typename?: 'UserUpdateActivitySuccess';
  activity: GqlActivity;
  user?: Maybe<GqlUser>;
};

export type GqlUserUpdateContentInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type GqlUserUpdateGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdateGroupSuccess;

export type GqlUserUpdateGroupSuccess = {
  __typename?: 'UserUpdateGroupSuccess';
  group: GqlGroup;
  user: GqlUser;
};

export type GqlUserUpdateOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdateOrganizationSuccess;

export type GqlUserUpdateOrganizationSuccess = {
  __typename?: 'UserUpdateOrganizationSuccess';
  organization: GqlOrganization;
  user: GqlUser;
};

export type GqlUsersConnection = {
  __typename?: 'UsersConnection';
  edges?: Maybe<Array<Maybe<GqlUserEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export const GqlValueType = {
  Float: 'FLOAT',
  Int: 'INT'
} as const;

export type GqlValueType = typeof GqlValueType[keyof typeof GqlValueType];
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
  ActivityCreatePayload: ( Omit<GqlActivityCreateSuccess, 'activity'> & { activity?: Maybe<_RefType['Activity']> } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityDeletePayload: ( GqlActivityDeleteSuccess ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivitySwitchPrivacyPayload: ( Omit<GqlActivitySwitchPrivacySuccess, 'activity'> & { activity: _RefType['Activity'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityUpdateContentPayload: ( Omit<GqlActivityUpdateContentSuccess, 'activity'> & { activity: _RefType['Activity'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityUpdateEventPayload: ( Omit<GqlActivityUpdateEventSuccess, 'activity' | 'event'> & { activity: _RefType['Activity'], event: _RefType['Event'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityUpdateUserPayload: ( Omit<GqlActivityUpdateUserSuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user: _RefType['User'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationAddConfirmationPayload: ( Omit<GqlApplicationAddConfirmationSuccess, 'application'> & { application: _RefType['Application'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationCreatePayload: ( Omit<GqlApplicationCreateSuccess, 'application'> & { application: _RefType['Application'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationDeleteConfirmationPayload: ( GqlApplicationDeleteConfirmationSuccess ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationDeletePayload: ( GqlApplicationDeleteSuccess ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationSwitchIsApprovedPayload: ( Omit<GqlApplicationSwitchIsApprovedSuccess, 'application'> & { application: _RefType['Application'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationSwitchPrivacyPayload: ( Omit<GqlApplicationSwitchPrivacySuccess, 'application'> & { application: _RefType['Application'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationUpdateCommentPayload: ( Omit<GqlApplicationUpdateCommentSuccess, 'application'> & { application: _RefType['Application'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ApplicationUpdateConfirmationCommentPayload: ( Omit<GqlApplicationUpdateConfirmationCommentSuccess, 'application'> & { application: _RefType['Application'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommentAddEventPayload: ( GqlAuthError ) | ( Omit<GqlCommentAddEventSuccess, 'comment'> & { comment: _RefType['Comment'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommentDeletePayload: ( GqlAuthError ) | ( GqlCommentDeleteSuccess ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommentUpdateContentPayload: ( GqlAuthError ) | ( Omit<GqlCommentUpdateContentSuccess, 'comment'> & { comment: _RefType['Comment'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommonError: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  EventDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlEventDeleteSuccess ) | ( GqlInvalidInputValueError );
  EventPlanPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventPlanSuccess, 'event'> & { event?: Maybe<_RefType['Event']> } ) | ( GqlInvalidInputValueError );
  EventUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventUpdateContentSuccess, 'event'> & { event: _RefType['Event'] } ) | ( GqlInvalidInputValueError );
  EventUpdateGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventUpdateGroupSuccess, 'event' | 'group'> & { event: _RefType['Event'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  EventUpdateOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventUpdateOrganizationSuccess, 'event' | 'organization'> & { event: _RefType['Event'], organization: _RefType['Organization'] } ) | ( GqlInvalidInputValueError );
  EventUpdatePrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventUpdatePrivacySuccess, 'event'> & { event: _RefType['Event'] } ) | ( GqlInvalidInputValueError );
  GroupChangeOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupChangeOrganizationSuccess, 'group' | 'organization'> & { group: _RefType['Group'], organization: _RefType['Organization'] } ) | ( GqlInvalidInputValueError );
  GroupCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupCreateSuccess, 'group'> & { group?: Maybe<_RefType['Group']> } ) | ( GqlInvalidInputValueError );
  GroupDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlGroupDeleteSuccess ) | ( GqlInvalidInputValueError );
  GroupUpdateChildPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateChildSuccess, 'child' | 'group'> & { child: _RefType['Group'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateContentSuccess, 'group'> & { group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupUpdateEventPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateEventSuccess, 'event' | 'group'> & { event: _RefType['Event'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupUpdateParentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateParentSuccess, 'group' | 'parent'> & { group: _RefType['Group'], parent: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupUpdateTargetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateTargetSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } ) | ( GqlInvalidInputValueError );
  GroupUpdateUserPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateUserSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } ) | ( GqlInvalidInputValueError );
  IssueAddCategoryPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueAddCategorySuccess, 'issue'> & { issue: _RefType['Issue'] } );
  IssueAddCityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueAddCitySuccess, 'city' | 'issue'> & { city: _RefType['City'], issue: _RefType['Issue'] } );
  IssueAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueAddGroupSuccess, 'group' | 'issue'> & { group: _RefType['Group'], issue: _RefType['Issue'] } );
  IssueAddOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueAddOrganizationSuccess, 'issue' | 'organization'> & { issue: _RefType['Issue'], organization: _RefType['Organization'] } );
  IssueAddSkillsetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueAddSkillsetSuccess, 'issue'> & { issue: _RefType['Issue'] } );
  IssueCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueCreateSuccess, 'issue'> & { issue: _RefType['Issue'] } );
  IssueDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlIssueDeleteSuccess );
  IssueRemoveCategoryPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueRemoveCategorySuccess, 'issue'> & { issue: _RefType['Issue'] } );
  IssueRemoveCityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueRemoveCitySuccess, 'city' | 'issue'> & { city: _RefType['City'], issue: _RefType['Issue'] } );
  IssueRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueRemoveGroupSuccess, 'group' | 'issue'> & { group: _RefType['Group'], issue: _RefType['Issue'] } );
  IssueRemoveOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueRemoveOrganizationSuccess, 'issue' | 'organization'> & { issue: _RefType['Issue'], organization: _RefType['Organization'] } );
  IssueRemoveSkillsetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueRemoveSkillsetSuccess, 'issue'> & { issue: _RefType['Issue'] } );
  IssueUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueUpdateContentSuccess, 'issue'> & { issue: _RefType['Issue'] } );
  IssueUpdatePrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlIssueUpdatePrivacySuccess, 'issue'> & { issue: _RefType['Issue'] } );
  LikeAddEventPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlLikeAddEventSuccess, 'like'> & { like: _RefType['Like'] } );
  LikeDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlLikeDeleteSuccess );
  OrganizationAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationAddGroupSuccess, 'group' | 'organization'> & { group: _RefType['Group'], organization: _RefType['Organization'] } );
  OrganizationAddTargetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationAddTargetSuccess, 'organization' | 'target'> & { organization: _RefType['Organization'], target: _RefType['Target'] } );
  OrganizationAddUserPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationAddUserSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
  OrganizationCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationCreateSuccess, 'organization'> & { organization?: Maybe<_RefType['Organization']> } );
  OrganizationDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlOrganizationDeleteSuccess );
  OrganizationRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationRemoveGroupSuccess, 'group' | 'organization'> & { group: _RefType['Group'], organization: _RefType['Organization'] } );
  OrganizationRemoveTargetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationRemoveTargetSuccess, 'organization' | 'target'> & { organization: _RefType['Organization'], target: _RefType['Target'] } );
  OrganizationRemoveUserPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationRemoveUserSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
  OrganizationUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationUpdateContentSuccess, 'organization'> & { organization: _RefType['Organization'] } );
  OrganizationUpdateDefaultPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationUpdateDefaultSuccess, 'organization'> & { organization: _RefType['Organization'] } );
  OrganizationUpdatePrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationUpdatePrivacySuccess, 'organization'> & { organization: _RefType['Organization'] } );
  TargetAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetAddGroupSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } );
  TargetAddOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetAddOrganizationSuccess, 'organization' | 'target'> & { organization: _RefType['Organization'], target: _RefType['Target'] } );
  TargetCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetCreateSuccess, 'target'> & { target?: Maybe<_RefType['Target']> } );
  TargetDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlTargetDeleteSuccess );
  TargetRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetRemoveGroupSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } );
  TargetRemoveOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetRemoveOrganizationSuccess, 'organization' | 'target'> & { organization: _RefType['Organization'], target: _RefType['Target'] } );
  TargetUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetUpdateContentSuccess, 'target'> & { target?: Maybe<_RefType['Target']> } );
  TargetUpdateIndexPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetUpdateIndexSuccess, 'index' | 'target'> & { index: _RefType['Index'], target: _RefType['Target'] } );
  UserCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UserDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUserDeleteSuccess );
  UserSwitchPrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserSwitchPrivacySuccess, 'user'> & { user: _RefType['User'] } );
  UserUpdateActivityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateActivitySuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user?: Maybe<_RefType['User']> } );
  UserUpdateContentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateContentSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UserUpdateGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateGroupSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } );
  UserUpdateOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateOrganizationSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
}>;

/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlActivityEdge, 'node'> & { node?: Maybe<_RefType['Activity']> } ) | ( Omit<GqlApplicationEdge, 'node'> & { node?: Maybe<_RefType['Application']> } ) | ( Omit<GqlEventEdge, 'node'> & { node?: Maybe<_RefType['Event']> } ) | ( Omit<GqlGroupEdge, 'node'> & { node?: Maybe<_RefType['Group']> } ) | ( Omit<GqlIssueEdge, 'node'> & { node?: Maybe<_RefType['Issue']> } ) | ( Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<_RefType['Organization']> } ) | ( Omit<GqlTargetEdge, 'node'> & { node?: Maybe<_RefType['Target']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } );
  Error: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  Activities: ResolverTypeWrapper<Omit<GqlActivities, 'data'> & { data: Array<GqlResolversTypes['Activity']> }>;
  ActivitiesConnection: ResolverTypeWrapper<Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ActivityEdge']>>> }>;
  Activity: ResolverTypeWrapper<Activity>;
  ActivityAddEventInput: GqlActivityAddEventInput;
  ActivityAddUserInput: GqlActivityAddUserInput;
  ActivityCreateInput: GqlActivityCreateInput;
  ActivityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityCreatePayload']>;
  ActivityCreateSuccess: ResolverTypeWrapper<Omit<GqlActivityCreateSuccess, 'activity'> & { activity?: Maybe<GqlResolversTypes['Activity']> }>;
  ActivityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityDeletePayload']>;
  ActivityDeleteSuccess: ResolverTypeWrapper<GqlActivityDeleteSuccess>;
  ActivityEdge: ResolverTypeWrapper<Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Activity']> }>;
  ActivityFilterInput: GqlActivityFilterInput;
  ActivityRemoveEventInput: GqlActivityRemoveEventInput;
  ActivityRemoveUserInput: GqlActivityRemoveUserInput;
  ActivitySortInput: GqlActivitySortInput;
  ActivitySwitchPrivacyInput: GqlActivitySwitchPrivacyInput;
  ActivitySwitchPrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivitySwitchPrivacyPayload']>;
  ActivitySwitchPrivacySuccess: ResolverTypeWrapper<Omit<GqlActivitySwitchPrivacySuccess, 'activity'> & { activity: GqlResolversTypes['Activity'] }>;
  ActivityUpdateContentInput: GqlActivityUpdateContentInput;
  ActivityUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityUpdateContentPayload']>;
  ActivityUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlActivityUpdateContentSuccess, 'activity'> & { activity: GqlResolversTypes['Activity'] }>;
  ActivityUpdateEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityUpdateEventPayload']>;
  ActivityUpdateEventSuccess: ResolverTypeWrapper<Omit<GqlActivityUpdateEventSuccess, 'activity' | 'event'> & { activity: GqlResolversTypes['Activity'], event: GqlResolversTypes['Event'] }>;
  ActivityUpdateUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityUpdateUserPayload']>;
  ActivityUpdateUserSuccess: ResolverTypeWrapper<Omit<GqlActivityUpdateUserSuccess, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user: GqlResolversTypes['User'] }>;
  Agenda: ResolverTypeWrapper<Agenda>;
  Application: ResolverTypeWrapper<Omit<GqlApplication, 'activity' | 'approvals' | 'event' | 'user'> & { activity?: Maybe<GqlResolversTypes['Activity']>, approvals?: Maybe<Array<GqlResolversTypes['ApplicationConfirmation']>>, event?: Maybe<GqlResolversTypes['Event']>, user?: Maybe<GqlResolversTypes['User']> }>;
  ApplicationAddConfirmationInput: GqlApplicationAddConfirmationInput;
  ApplicationAddConfirmationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationAddConfirmationPayload']>;
  ApplicationAddConfirmationSuccess: ResolverTypeWrapper<Omit<GqlApplicationAddConfirmationSuccess, 'application'> & { application: GqlResolversTypes['Application'] }>;
  ApplicationApprovalInput: GqlApplicationApprovalInput;
  ApplicationConfirmation: ResolverTypeWrapper<Omit<GqlApplicationConfirmation, 'application' | 'confirmedBy'> & { application?: Maybe<GqlResolversTypes['Application']>, confirmedBy?: Maybe<GqlResolversTypes['User']> }>;
  ApplicationCreateInput: GqlApplicationCreateInput;
  ApplicationCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationCreatePayload']>;
  ApplicationCreateSuccess: ResolverTypeWrapper<Omit<GqlApplicationCreateSuccess, 'application'> & { application: GqlResolversTypes['Application'] }>;
  ApplicationDeleteConfirmationInput: GqlApplicationDeleteConfirmationInput;
  ApplicationDeleteConfirmationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationDeleteConfirmationPayload']>;
  ApplicationDeleteConfirmationSuccess: ResolverTypeWrapper<GqlApplicationDeleteConfirmationSuccess>;
  ApplicationDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationDeletePayload']>;
  ApplicationDeleteSuccess: ResolverTypeWrapper<GqlApplicationDeleteSuccess>;
  ApplicationEdge: ResolverTypeWrapper<Omit<GqlApplicationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Application']> }>;
  ApplicationFilterInput: GqlApplicationFilterInput;
  ApplicationRefusalInput: GqlApplicationRefusalInput;
  ApplicationSortInput: GqlApplicationSortInput;
  ApplicationSwitchIsApprovedPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationSwitchIsApprovedPayload']>;
  ApplicationSwitchIsApprovedSuccess: ResolverTypeWrapper<Omit<GqlApplicationSwitchIsApprovedSuccess, 'application'> & { application: GqlResolversTypes['Application'] }>;
  ApplicationSwitchPrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationSwitchPrivacyPayload']>;
  ApplicationSwitchPrivacySuccess: ResolverTypeWrapper<Omit<GqlApplicationSwitchPrivacySuccess, 'application'> & { application: GqlResolversTypes['Application'] }>;
  ApplicationUpdateCommentInput: GqlApplicationUpdateCommentInput;
  ApplicationUpdateCommentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationUpdateCommentPayload']>;
  ApplicationUpdateCommentSuccess: ResolverTypeWrapper<Omit<GqlApplicationUpdateCommentSuccess, 'application'> & { application: GqlResolversTypes['Application'] }>;
  ApplicationUpdateConfirmationCommentInput: GqlApplicationUpdateConfirmationCommentInput;
  ApplicationUpdateConfirmationCommentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ApplicationUpdateConfirmationCommentPayload']>;
  ApplicationUpdateConfirmationCommentSuccess: ResolverTypeWrapper<Omit<GqlApplicationUpdateConfirmationCommentSuccess, 'application'> & { application: GqlResolversTypes['Application'] }>;
  ApplicationsConnection: ResolverTypeWrapper<Omit<GqlApplicationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ApplicationEdge']>>> }>;
  AuthError: ResolverTypeWrapper<GqlAuthError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  City: ResolverTypeWrapper<City>;
  Comment: ResolverTypeWrapper<Comment>;
  CommentAddEventInput: GqlCommentAddEventInput;
  CommentAddEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommentAddEventPayload']>;
  CommentAddEventSuccess: ResolverTypeWrapper<Omit<GqlCommentAddEventSuccess, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  CommentDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommentDeletePayload']>;
  CommentDeleteSuccess: ResolverTypeWrapper<GqlCommentDeleteSuccess>;
  CommentUpdateContentInput: GqlCommentUpdateContentInput;
  CommentUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommentUpdateContentPayload']>;
  CommentUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlCommentUpdateContentSuccess, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  Comments: ResolverTypeWrapper<Omit<GqlComments, 'data'> & { data: Array<GqlResolversTypes['Comment']> }>;
  CommonError: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommonError']>;
  ComplexQueryError: ResolverTypeWrapper<GqlComplexQueryError>;
  CurrentUserPayload: ResolverTypeWrapper<Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  CustomTokenCreatePayload: ResolverTypeWrapper<GqlCustomTokenCreatePayload>;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  EntityPosition: GqlEntityPosition;
  Error: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Error']>;
  Event: ResolverTypeWrapper<Event>;
  EventAddGroupInput: GqlEventAddGroupInput;
  EventAddOrganizationInput: GqlEventAddOrganizationInput;
  EventDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventDeletePayload']>;
  EventDeleteSuccess: ResolverTypeWrapper<GqlEventDeleteSuccess>;
  EventEdge: ResolverTypeWrapper<Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Event']> }>;
  EventFilterInput: GqlEventFilterInput;
  EventPlanInput: GqlEventPlanInput;
  EventPlanPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventPlanPayload']>;
  EventPlanSuccess: ResolverTypeWrapper<Omit<GqlEventPlanSuccess, 'event'> & { event?: Maybe<GqlResolversTypes['Event']> }>;
  EventRemoveGroupInput: GqlEventRemoveGroupInput;
  EventRemoveOrganizationInput: GqlEventRemoveOrganizationInput;
  EventSortInput: GqlEventSortInput;
  EventUpdateContentInput: GqlEventUpdateContentInput;
  EventUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventUpdateContentPayload']>;
  EventUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlEventUpdateContentSuccess, 'event'> & { event: GqlResolversTypes['Event'] }>;
  EventUpdateGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventUpdateGroupPayload']>;
  EventUpdateGroupSuccess: ResolverTypeWrapper<Omit<GqlEventUpdateGroupSuccess, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  EventUpdateOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventUpdateOrganizationPayload']>;
  EventUpdateOrganizationSuccess: ResolverTypeWrapper<Omit<GqlEventUpdateOrganizationSuccess, 'event' | 'organization'> & { event: GqlResolversTypes['Event'], organization: GqlResolversTypes['Organization'] }>;
  EventUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventUpdatePrivacyPayload']>;
  EventUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlEventUpdatePrivacySuccess, 'event'> & { event: GqlResolversTypes['Event'] }>;
  EventsConnection: ResolverTypeWrapper<Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['EventEdge']>>> }>;
  Field: ResolverTypeWrapper<GqlField>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Group: ResolverTypeWrapper<Group>;
  GroupAddChildInput: GqlGroupAddChildInput;
  GroupAddEventInput: GqlGroupAddEventInput;
  GroupAddParentInput: GqlGroupAddParentInput;
  GroupAddTargetInput: GqlGroupAddTargetInput;
  GroupAddUserInput: GqlGroupAddUserInput;
  GroupChangeOrganizationInput: GqlGroupChangeOrganizationInput;
  GroupChangeOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupChangeOrganizationPayload']>;
  GroupChangeOrganizationSuccess: ResolverTypeWrapper<Omit<GqlGroupChangeOrganizationSuccess, 'group' | 'organization'> & { group: GqlResolversTypes['Group'], organization: GqlResolversTypes['Organization'] }>;
  GroupCreateInput: GqlGroupCreateInput;
  GroupCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupCreatePayload']>;
  GroupCreateSuccess: ResolverTypeWrapper<Omit<GqlGroupCreateSuccess, 'group'> & { group?: Maybe<GqlResolversTypes['Group']> }>;
  GroupDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupDeletePayload']>;
  GroupDeleteSuccess: ResolverTypeWrapper<GqlGroupDeleteSuccess>;
  GroupEdge: ResolverTypeWrapper<Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Group']> }>;
  GroupFilterInput: GqlGroupFilterInput;
  GroupRemoveChildInput: GqlGroupRemoveChildInput;
  GroupRemoveEventInput: GqlGroupRemoveEventInput;
  GroupRemoveParentInput: GqlGroupRemoveParentInput;
  GroupRemoveTargetInput: GqlGroupRemoveTargetInput;
  GroupRemoveUserInput: GqlGroupRemoveUserInput;
  GroupSortInput: GqlGroupSortInput;
  GroupUpdateChildPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdateChildPayload']>;
  GroupUpdateChildSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateChildSuccess, 'child' | 'group'> & { child: GqlResolversTypes['Group'], group: GqlResolversTypes['Group'] }>;
  GroupUpdateContentInput: GqlGroupUpdateContentInput;
  GroupUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdateContentPayload']>;
  GroupUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateContentSuccess, 'group'> & { group: GqlResolversTypes['Group'] }>;
  GroupUpdateEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdateEventPayload']>;
  GroupUpdateEventSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateEventSuccess, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  GroupUpdateParentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdateParentPayload']>;
  GroupUpdateParentSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateParentSuccess, 'group' | 'parent'> & { group: GqlResolversTypes['Group'], parent: GqlResolversTypes['Group'] }>;
  GroupUpdateTargetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdateTargetPayload']>;
  GroupUpdateTargetSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateTargetSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  GroupUpdateUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdateUserPayload']>;
  GroupUpdateUserSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateUserSuccess, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  GroupsConnection: ResolverTypeWrapper<Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['GroupEdge']>>> }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IdentityPlatform: GqlIdentityPlatform;
  Index: ResolverTypeWrapper<Index>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputValueError: ResolverTypeWrapper<GqlInvalidInputValueError>;
  Issue: ResolverTypeWrapper<Omit<GqlIssue, 'activities' | 'cities' | 'comments' | 'groups' | 'likes' | 'organizations'> & { activities?: Maybe<GqlResolversTypes['Activities']>, cities?: Maybe<Array<GqlResolversTypes['City']>>, comments?: Maybe<GqlResolversTypes['Comments']>, groups?: Maybe<Array<GqlResolversTypes['Group']>>, likes?: Maybe<GqlResolversTypes['Likes']>, organizations?: Maybe<Array<GqlResolversTypes['Organization']>> }>;
  IssueAddCategoryInput: GqlIssueAddCategoryInput;
  IssueAddCategoryPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueAddCategoryPayload']>;
  IssueAddCategorySuccess: ResolverTypeWrapper<Omit<GqlIssueAddCategorySuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssueAddCityInput: GqlIssueAddCityInput;
  IssueAddCityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueAddCityPayload']>;
  IssueAddCitySuccess: ResolverTypeWrapper<Omit<GqlIssueAddCitySuccess, 'city' | 'issue'> & { city: GqlResolversTypes['City'], issue: GqlResolversTypes['Issue'] }>;
  IssueAddGroupInput: GqlIssueAddGroupInput;
  IssueAddGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueAddGroupPayload']>;
  IssueAddGroupSuccess: ResolverTypeWrapper<Omit<GqlIssueAddGroupSuccess, 'group' | 'issue'> & { group: GqlResolversTypes['Group'], issue: GqlResolversTypes['Issue'] }>;
  IssueAddOrganizationInput: GqlIssueAddOrganizationInput;
  IssueAddOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueAddOrganizationPayload']>;
  IssueAddOrganizationSuccess: ResolverTypeWrapper<Omit<GqlIssueAddOrganizationSuccess, 'issue' | 'organization'> & { issue: GqlResolversTypes['Issue'], organization: GqlResolversTypes['Organization'] }>;
  IssueAddSkillsetInput: GqlIssueAddSkillsetInput;
  IssueAddSkillsetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueAddSkillsetPayload']>;
  IssueAddSkillsetSuccess: ResolverTypeWrapper<Omit<GqlIssueAddSkillsetSuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssueCategory: ResolverTypeWrapper<GqlIssueCategory>;
  IssueCreateInput: GqlIssueCreateInput;
  IssueCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueCreatePayload']>;
  IssueCreateSuccess: ResolverTypeWrapper<Omit<GqlIssueCreateSuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssueDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueDeletePayload']>;
  IssueDeleteSuccess: ResolverTypeWrapper<GqlIssueDeleteSuccess>;
  IssueEdge: ResolverTypeWrapper<Omit<GqlIssueEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Issue']> }>;
  IssueFilterInput: GqlIssueFilterInput;
  IssuePrivacyInput: GqlIssuePrivacyInput;
  IssueRemoveCategoryInput: GqlIssueRemoveCategoryInput;
  IssueRemoveCategoryPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueRemoveCategoryPayload']>;
  IssueRemoveCategorySuccess: ResolverTypeWrapper<Omit<GqlIssueRemoveCategorySuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssueRemoveCityInput: GqlIssueRemoveCityInput;
  IssueRemoveCityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueRemoveCityPayload']>;
  IssueRemoveCitySuccess: ResolverTypeWrapper<Omit<GqlIssueRemoveCitySuccess, 'city' | 'issue'> & { city: GqlResolversTypes['City'], issue: GqlResolversTypes['Issue'] }>;
  IssueRemoveGroupInput: GqlIssueRemoveGroupInput;
  IssueRemoveGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueRemoveGroupPayload']>;
  IssueRemoveGroupSuccess: ResolverTypeWrapper<Omit<GqlIssueRemoveGroupSuccess, 'group' | 'issue'> & { group: GqlResolversTypes['Group'], issue: GqlResolversTypes['Issue'] }>;
  IssueRemoveOrganizationInput: GqlIssueRemoveOrganizationInput;
  IssueRemoveOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueRemoveOrganizationPayload']>;
  IssueRemoveOrganizationSuccess: ResolverTypeWrapper<Omit<GqlIssueRemoveOrganizationSuccess, 'issue' | 'organization'> & { issue: GqlResolversTypes['Issue'], organization: GqlResolversTypes['Organization'] }>;
  IssueRemoveSkillsetInput: GqlIssueRemoveSkillsetInput;
  IssueRemoveSkillsetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueRemoveSkillsetPayload']>;
  IssueRemoveSkillsetSuccess: ResolverTypeWrapper<Omit<GqlIssueRemoveSkillsetSuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssueSortInput: GqlIssueSortInput;
  IssueUpdateContentInput: GqlIssueUpdateContentInput;
  IssueUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueUpdateContentPayload']>;
  IssueUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlIssueUpdateContentSuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssueUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['IssueUpdatePrivacyPayload']>;
  IssueUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlIssueUpdatePrivacySuccess, 'issue'> & { issue: GqlResolversTypes['Issue'] }>;
  IssuesConnection: ResolverTypeWrapper<Omit<GqlIssuesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['IssueEdge']>>> }>;
  Like: ResolverTypeWrapper<Like>;
  LikeAddEventInput: GqlLikeAddEventInput;
  LikeAddEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['LikeAddEventPayload']>;
  LikeAddEventSuccess: ResolverTypeWrapper<Omit<GqlLikeAddEventSuccess, 'like'> & { like: GqlResolversTypes['Like'] }>;
  LikeDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['LikeDeletePayload']>;
  LikeDeleteSuccess: ResolverTypeWrapper<GqlLikeDeleteSuccess>;
  Likes: ResolverTypeWrapper<Omit<GqlLikes, 'data'> & { data: Array<GqlResolversTypes['Like']> }>;
  Mutation: ResolverTypeWrapper<{}>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationAddGroupInput: GqlOrganizationAddGroupInput;
  OrganizationAddGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationAddGroupPayload']>;
  OrganizationAddGroupSuccess: ResolverTypeWrapper<Omit<GqlOrganizationAddGroupSuccess, 'group' | 'organization'> & { group: GqlResolversTypes['Group'], organization: GqlResolversTypes['Organization'] }>;
  OrganizationAddTargetInput: GqlOrganizationAddTargetInput;
  OrganizationAddTargetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationAddTargetPayload']>;
  OrganizationAddTargetSuccess: ResolverTypeWrapper<Omit<GqlOrganizationAddTargetSuccess, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  OrganizationAddUserInput: GqlOrganizationAddUserInput;
  OrganizationAddUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationAddUserPayload']>;
  OrganizationAddUserSuccess: ResolverTypeWrapper<Omit<GqlOrganizationAddUserSuccess, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  OrganizationCreateInput: GqlOrganizationCreateInput;
  OrganizationCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationCreatePayload']>;
  OrganizationCreateSuccess: ResolverTypeWrapper<Omit<GqlOrganizationCreateSuccess, 'organization'> & { organization?: Maybe<GqlResolversTypes['Organization']> }>;
  OrganizationDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationDeletePayload']>;
  OrganizationDeleteSuccess: ResolverTypeWrapper<GqlOrganizationDeleteSuccess>;
  OrganizationEdge: ResolverTypeWrapper<Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Organization']> }>;
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationRemoveGroupInput: GqlOrganizationRemoveGroupInput;
  OrganizationRemoveGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationRemoveGroupPayload']>;
  OrganizationRemoveGroupSuccess: ResolverTypeWrapper<Omit<GqlOrganizationRemoveGroupSuccess, 'group' | 'organization'> & { group: GqlResolversTypes['Group'], organization: GqlResolversTypes['Organization'] }>;
  OrganizationRemoveTargetInput: GqlOrganizationRemoveTargetInput;
  OrganizationRemoveTargetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationRemoveTargetPayload']>;
  OrganizationRemoveTargetSuccess: ResolverTypeWrapper<Omit<GqlOrganizationRemoveTargetSuccess, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  OrganizationRemoveUserInput: GqlOrganizationRemoveUserInput;
  OrganizationRemoveUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationRemoveUserPayload']>;
  OrganizationRemoveUserSuccess: ResolverTypeWrapper<Omit<GqlOrganizationRemoveUserSuccess, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  OrganizationSortInput: GqlOrganizationSortInput;
  OrganizationUpdateContentInput: GqlOrganizationUpdateContentInput;
  OrganizationUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationUpdateContentPayload']>;
  OrganizationUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlOrganizationUpdateContentSuccess, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  OrganizationUpdateDefaultInput: GqlOrganizationUpdateDefaultInput;
  OrganizationUpdateDefaultPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationUpdateDefaultPayload']>;
  OrganizationUpdateDefaultSuccess: ResolverTypeWrapper<Omit<GqlOrganizationUpdateDefaultSuccess, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  OrganizationUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationUpdatePrivacyPayload']>;
  OrganizationUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlOrganizationUpdatePrivacySuccess, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  Organizations: ResolverTypeWrapper<Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversTypes['Organization']> }>;
  OrganizationsConnection: ResolverTypeWrapper<Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OrganizationEdge']>>> }>;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Query: ResolverTypeWrapper<{}>;
  Role: GqlRole;
  Skillset: ResolverTypeWrapper<GqlSkillset>;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SysRole: GqlSysRole;
  Target: ResolverTypeWrapper<Target>;
  TargetAddGroupInput: GqlTargetAddGroupInput;
  TargetAddGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetAddGroupPayload']>;
  TargetAddGroupSuccess: ResolverTypeWrapper<Omit<GqlTargetAddGroupSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  TargetAddOrganizationInput: GqlTargetAddOrganizationInput;
  TargetAddOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetAddOrganizationPayload']>;
  TargetAddOrganizationSuccess: ResolverTypeWrapper<Omit<GqlTargetAddOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  TargetCreateInput: GqlTargetCreateInput;
  TargetCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetCreatePayload']>;
  TargetCreateSuccess: ResolverTypeWrapper<Omit<GqlTargetCreateSuccess, 'target'> & { target?: Maybe<GqlResolversTypes['Target']> }>;
  TargetDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetDeletePayload']>;
  TargetDeleteSuccess: ResolverTypeWrapper<GqlTargetDeleteSuccess>;
  TargetEdge: ResolverTypeWrapper<Omit<GqlTargetEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Target']> }>;
  TargetFilterInput: GqlTargetFilterInput;
  TargetRemoveGroupInput: GqlTargetRemoveGroupInput;
  TargetRemoveGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetRemoveGroupPayload']>;
  TargetRemoveGroupSuccess: ResolverTypeWrapper<Omit<GqlTargetRemoveGroupSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  TargetRemoveOrganizationInput: GqlTargetRemoveOrganizationInput;
  TargetRemoveOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetRemoveOrganizationPayload']>;
  TargetRemoveOrganizationSuccess: ResolverTypeWrapper<Omit<GqlTargetRemoveOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  TargetSortInput: GqlTargetSortInput;
  TargetUpdateContentInput: GqlTargetUpdateContentInput;
  TargetUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetUpdateContentPayload']>;
  TargetUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlTargetUpdateContentSuccess, 'target'> & { target?: Maybe<GqlResolversTypes['Target']> }>;
  TargetUpdateIndexInput: GqlTargetUpdateIndexInput;
  TargetUpdateIndexPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetUpdateIndexPayload']>;
  TargetUpdateIndexSuccess: ResolverTypeWrapper<Omit<GqlTargetUpdateIndexSuccess, 'index' | 'target'> & { index: GqlResolversTypes['Index'], target: GqlResolversTypes['Target'] }>;
  TargetsConnection: ResolverTypeWrapper<Omit<GqlTargetsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TargetEdge']>>> }>;
  User: ResolverTypeWrapper<User>;
  UserAddActivityInput: GqlUserAddActivityInput;
  UserAddGroupInput: GqlUserAddGroupInput;
  UserAddOrganizationInput: GqlUserAddOrganizationInput;
  UserCreateInput: GqlUserCreateInput;
  UserCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserCreatePayload']>;
  UserCreateSuccess: ResolverTypeWrapper<Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UserDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserDeletePayload']>;
  UserDeleteSuccess: ResolverTypeWrapper<GqlUserDeleteSuccess>;
  UserEdge: ResolverTypeWrapper<Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversTypes['User']> }>;
  UserFilterInput: GqlUserFilterInput;
  UserRemoveActivityInput: GqlUserRemoveActivityInput;
  UserRemoveGroupInput: GqlUserRemoveGroupInput;
  UserRemoveOrganizationInput: GqlUserRemoveOrganizationInput;
  UserSortInput: GqlUserSortInput;
  UserSwitchPrivacyInput: GqlUserSwitchPrivacyInput;
  UserSwitchPrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserSwitchPrivacyPayload']>;
  UserSwitchPrivacySuccess: ResolverTypeWrapper<Omit<GqlUserSwitchPrivacySuccess, 'user'> & { user: GqlResolversTypes['User'] }>;
  UserUpdateActivityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateActivityPayload']>;
  UserUpdateActivitySuccess: ResolverTypeWrapper<Omit<GqlUserUpdateActivitySuccess, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user?: Maybe<GqlResolversTypes['User']> }>;
  UserUpdateContentInput: GqlUserUpdateContentInput;
  UserUpdateContentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateContentPayload']>;
  UserUpdateContentSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateContentSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UserUpdateGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateGroupPayload']>;
  UserUpdateGroupSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateGroupSuccess, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  UserUpdateOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdateOrganizationPayload']>;
  UserUpdateOrganizationSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateOrganizationSuccess, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  UsersConnection: ResolverTypeWrapper<Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>> }>;
  ValueType: GqlValueType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlResolversParentTypes = ResolversObject<{
  Activities: Omit<GqlActivities, 'data'> & { data: Array<GqlResolversParentTypes['Activity']> };
  ActivitiesConnection: Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ActivityEdge']>>> };
  Activity: Activity;
  ActivityAddEventInput: GqlActivityAddEventInput;
  ActivityAddUserInput: GqlActivityAddUserInput;
  ActivityCreateInput: GqlActivityCreateInput;
  ActivityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityCreatePayload'];
  ActivityCreateSuccess: Omit<GqlActivityCreateSuccess, 'activity'> & { activity?: Maybe<GqlResolversParentTypes['Activity']> };
  ActivityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityDeletePayload'];
  ActivityDeleteSuccess: GqlActivityDeleteSuccess;
  ActivityEdge: Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Activity']> };
  ActivityFilterInput: GqlActivityFilterInput;
  ActivityRemoveEventInput: GqlActivityRemoveEventInput;
  ActivityRemoveUserInput: GqlActivityRemoveUserInput;
  ActivitySortInput: GqlActivitySortInput;
  ActivitySwitchPrivacyInput: GqlActivitySwitchPrivacyInput;
  ActivitySwitchPrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivitySwitchPrivacyPayload'];
  ActivitySwitchPrivacySuccess: Omit<GqlActivitySwitchPrivacySuccess, 'activity'> & { activity: GqlResolversParentTypes['Activity'] };
  ActivityUpdateContentInput: GqlActivityUpdateContentInput;
  ActivityUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityUpdateContentPayload'];
  ActivityUpdateContentSuccess: Omit<GqlActivityUpdateContentSuccess, 'activity'> & { activity: GqlResolversParentTypes['Activity'] };
  ActivityUpdateEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityUpdateEventPayload'];
  ActivityUpdateEventSuccess: Omit<GqlActivityUpdateEventSuccess, 'activity' | 'event'> & { activity: GqlResolversParentTypes['Activity'], event: GqlResolversParentTypes['Event'] };
  ActivityUpdateUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityUpdateUserPayload'];
  ActivityUpdateUserSuccess: Omit<GqlActivityUpdateUserSuccess, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user: GqlResolversParentTypes['User'] };
  Agenda: Agenda;
  Application: Omit<GqlApplication, 'activity' | 'approvals' | 'event' | 'user'> & { activity?: Maybe<GqlResolversParentTypes['Activity']>, approvals?: Maybe<Array<GqlResolversParentTypes['ApplicationConfirmation']>>, event?: Maybe<GqlResolversParentTypes['Event']>, user?: Maybe<GqlResolversParentTypes['User']> };
  ApplicationAddConfirmationInput: GqlApplicationAddConfirmationInput;
  ApplicationAddConfirmationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationAddConfirmationPayload'];
  ApplicationAddConfirmationSuccess: Omit<GqlApplicationAddConfirmationSuccess, 'application'> & { application: GqlResolversParentTypes['Application'] };
  ApplicationApprovalInput: GqlApplicationApprovalInput;
  ApplicationConfirmation: Omit<GqlApplicationConfirmation, 'application' | 'confirmedBy'> & { application?: Maybe<GqlResolversParentTypes['Application']>, confirmedBy?: Maybe<GqlResolversParentTypes['User']> };
  ApplicationCreateInput: GqlApplicationCreateInput;
  ApplicationCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationCreatePayload'];
  ApplicationCreateSuccess: Omit<GqlApplicationCreateSuccess, 'application'> & { application: GqlResolversParentTypes['Application'] };
  ApplicationDeleteConfirmationInput: GqlApplicationDeleteConfirmationInput;
  ApplicationDeleteConfirmationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationDeleteConfirmationPayload'];
  ApplicationDeleteConfirmationSuccess: GqlApplicationDeleteConfirmationSuccess;
  ApplicationDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationDeletePayload'];
  ApplicationDeleteSuccess: GqlApplicationDeleteSuccess;
  ApplicationEdge: Omit<GqlApplicationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Application']> };
  ApplicationFilterInput: GqlApplicationFilterInput;
  ApplicationRefusalInput: GqlApplicationRefusalInput;
  ApplicationSortInput: GqlApplicationSortInput;
  ApplicationSwitchIsApprovedPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationSwitchIsApprovedPayload'];
  ApplicationSwitchIsApprovedSuccess: Omit<GqlApplicationSwitchIsApprovedSuccess, 'application'> & { application: GqlResolversParentTypes['Application'] };
  ApplicationSwitchPrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationSwitchPrivacyPayload'];
  ApplicationSwitchPrivacySuccess: Omit<GqlApplicationSwitchPrivacySuccess, 'application'> & { application: GqlResolversParentTypes['Application'] };
  ApplicationUpdateCommentInput: GqlApplicationUpdateCommentInput;
  ApplicationUpdateCommentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationUpdateCommentPayload'];
  ApplicationUpdateCommentSuccess: Omit<GqlApplicationUpdateCommentSuccess, 'application'> & { application: GqlResolversParentTypes['Application'] };
  ApplicationUpdateConfirmationCommentInput: GqlApplicationUpdateConfirmationCommentInput;
  ApplicationUpdateConfirmationCommentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ApplicationUpdateConfirmationCommentPayload'];
  ApplicationUpdateConfirmationCommentSuccess: Omit<GqlApplicationUpdateConfirmationCommentSuccess, 'application'> & { application: GqlResolversParentTypes['Application'] };
  ApplicationsConnection: Omit<GqlApplicationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ApplicationEdge']>>> };
  AuthError: GqlAuthError;
  Boolean: Scalars['Boolean']['output'];
  City: City;
  Comment: Comment;
  CommentAddEventInput: GqlCommentAddEventInput;
  CommentAddEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommentAddEventPayload'];
  CommentAddEventSuccess: Omit<GqlCommentAddEventSuccess, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  CommentDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommentDeletePayload'];
  CommentDeleteSuccess: GqlCommentDeleteSuccess;
  CommentUpdateContentInput: GqlCommentUpdateContentInput;
  CommentUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommentUpdateContentPayload'];
  CommentUpdateContentSuccess: Omit<GqlCommentUpdateContentSuccess, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  Comments: Omit<GqlComments, 'data'> & { data: Array<GqlResolversParentTypes['Comment']> };
  CommonError: GqlResolversUnionTypes<GqlResolversParentTypes>['CommonError'];
  ComplexQueryError: GqlComplexQueryError;
  CurrentUserPayload: Omit<GqlCurrentUserPayload, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  CustomTokenCreatePayload: GqlCustomTokenCreatePayload;
  Datetime: Scalars['Datetime']['output'];
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Error: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Error'];
  Event: Event;
  EventAddGroupInput: GqlEventAddGroupInput;
  EventAddOrganizationInput: GqlEventAddOrganizationInput;
  EventDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventDeletePayload'];
  EventDeleteSuccess: GqlEventDeleteSuccess;
  EventEdge: Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Event']> };
  EventFilterInput: GqlEventFilterInput;
  EventPlanInput: GqlEventPlanInput;
  EventPlanPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventPlanPayload'];
  EventPlanSuccess: Omit<GqlEventPlanSuccess, 'event'> & { event?: Maybe<GqlResolversParentTypes['Event']> };
  EventRemoveGroupInput: GqlEventRemoveGroupInput;
  EventRemoveOrganizationInput: GqlEventRemoveOrganizationInput;
  EventSortInput: GqlEventSortInput;
  EventUpdateContentInput: GqlEventUpdateContentInput;
  EventUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventUpdateContentPayload'];
  EventUpdateContentSuccess: Omit<GqlEventUpdateContentSuccess, 'event'> & { event: GqlResolversParentTypes['Event'] };
  EventUpdateGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventUpdateGroupPayload'];
  EventUpdateGroupSuccess: Omit<GqlEventUpdateGroupSuccess, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  EventUpdateOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventUpdateOrganizationPayload'];
  EventUpdateOrganizationSuccess: Omit<GqlEventUpdateOrganizationSuccess, 'event' | 'organization'> & { event: GqlResolversParentTypes['Event'], organization: GqlResolversParentTypes['Organization'] };
  EventUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventUpdatePrivacyPayload'];
  EventUpdatePrivacySuccess: Omit<GqlEventUpdatePrivacySuccess, 'event'> & { event: GqlResolversParentTypes['Event'] };
  EventsConnection: Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['EventEdge']>>> };
  Field: GqlField;
  Float: Scalars['Float']['output'];
  Group: Group;
  GroupAddChildInput: GqlGroupAddChildInput;
  GroupAddEventInput: GqlGroupAddEventInput;
  GroupAddParentInput: GqlGroupAddParentInput;
  GroupAddTargetInput: GqlGroupAddTargetInput;
  GroupAddUserInput: GqlGroupAddUserInput;
  GroupChangeOrganizationInput: GqlGroupChangeOrganizationInput;
  GroupChangeOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupChangeOrganizationPayload'];
  GroupChangeOrganizationSuccess: Omit<GqlGroupChangeOrganizationSuccess, 'group' | 'organization'> & { group: GqlResolversParentTypes['Group'], organization: GqlResolversParentTypes['Organization'] };
  GroupCreateInput: GqlGroupCreateInput;
  GroupCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupCreatePayload'];
  GroupCreateSuccess: Omit<GqlGroupCreateSuccess, 'group'> & { group?: Maybe<GqlResolversParentTypes['Group']> };
  GroupDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupDeletePayload'];
  GroupDeleteSuccess: GqlGroupDeleteSuccess;
  GroupEdge: Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Group']> };
  GroupFilterInput: GqlGroupFilterInput;
  GroupRemoveChildInput: GqlGroupRemoveChildInput;
  GroupRemoveEventInput: GqlGroupRemoveEventInput;
  GroupRemoveParentInput: GqlGroupRemoveParentInput;
  GroupRemoveTargetInput: GqlGroupRemoveTargetInput;
  GroupRemoveUserInput: GqlGroupRemoveUserInput;
  GroupSortInput: GqlGroupSortInput;
  GroupUpdateChildPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdateChildPayload'];
  GroupUpdateChildSuccess: Omit<GqlGroupUpdateChildSuccess, 'child' | 'group'> & { child: GqlResolversParentTypes['Group'], group: GqlResolversParentTypes['Group'] };
  GroupUpdateContentInput: GqlGroupUpdateContentInput;
  GroupUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdateContentPayload'];
  GroupUpdateContentSuccess: Omit<GqlGroupUpdateContentSuccess, 'group'> & { group: GqlResolversParentTypes['Group'] };
  GroupUpdateEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdateEventPayload'];
  GroupUpdateEventSuccess: Omit<GqlGroupUpdateEventSuccess, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  GroupUpdateParentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdateParentPayload'];
  GroupUpdateParentSuccess: Omit<GqlGroupUpdateParentSuccess, 'group' | 'parent'> & { group: GqlResolversParentTypes['Group'], parent: GqlResolversParentTypes['Group'] };
  GroupUpdateTargetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdateTargetPayload'];
  GroupUpdateTargetSuccess: Omit<GqlGroupUpdateTargetSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  GroupUpdateUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdateUserPayload'];
  GroupUpdateUserSuccess: Omit<GqlGroupUpdateUserSuccess, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  GroupsConnection: Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['GroupEdge']>>> };
  ID: Scalars['ID']['output'];
  Index: Index;
  Int: Scalars['Int']['output'];
  InvalidInputValueError: GqlInvalidInputValueError;
  Issue: Omit<GqlIssue, 'activities' | 'cities' | 'comments' | 'groups' | 'likes' | 'organizations'> & { activities?: Maybe<GqlResolversParentTypes['Activities']>, cities?: Maybe<Array<GqlResolversParentTypes['City']>>, comments?: Maybe<GqlResolversParentTypes['Comments']>, groups?: Maybe<Array<GqlResolversParentTypes['Group']>>, likes?: Maybe<GqlResolversParentTypes['Likes']>, organizations?: Maybe<Array<GqlResolversParentTypes['Organization']>> };
  IssueAddCategoryInput: GqlIssueAddCategoryInput;
  IssueAddCategoryPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueAddCategoryPayload'];
  IssueAddCategorySuccess: Omit<GqlIssueAddCategorySuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssueAddCityInput: GqlIssueAddCityInput;
  IssueAddCityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueAddCityPayload'];
  IssueAddCitySuccess: Omit<GqlIssueAddCitySuccess, 'city' | 'issue'> & { city: GqlResolversParentTypes['City'], issue: GqlResolversParentTypes['Issue'] };
  IssueAddGroupInput: GqlIssueAddGroupInput;
  IssueAddGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueAddGroupPayload'];
  IssueAddGroupSuccess: Omit<GqlIssueAddGroupSuccess, 'group' | 'issue'> & { group: GqlResolversParentTypes['Group'], issue: GqlResolversParentTypes['Issue'] };
  IssueAddOrganizationInput: GqlIssueAddOrganizationInput;
  IssueAddOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueAddOrganizationPayload'];
  IssueAddOrganizationSuccess: Omit<GqlIssueAddOrganizationSuccess, 'issue' | 'organization'> & { issue: GqlResolversParentTypes['Issue'], organization: GqlResolversParentTypes['Organization'] };
  IssueAddSkillsetInput: GqlIssueAddSkillsetInput;
  IssueAddSkillsetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueAddSkillsetPayload'];
  IssueAddSkillsetSuccess: Omit<GqlIssueAddSkillsetSuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssueCategory: GqlIssueCategory;
  IssueCreateInput: GqlIssueCreateInput;
  IssueCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueCreatePayload'];
  IssueCreateSuccess: Omit<GqlIssueCreateSuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssueDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueDeletePayload'];
  IssueDeleteSuccess: GqlIssueDeleteSuccess;
  IssueEdge: Omit<GqlIssueEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Issue']> };
  IssueFilterInput: GqlIssueFilterInput;
  IssuePrivacyInput: GqlIssuePrivacyInput;
  IssueRemoveCategoryInput: GqlIssueRemoveCategoryInput;
  IssueRemoveCategoryPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueRemoveCategoryPayload'];
  IssueRemoveCategorySuccess: Omit<GqlIssueRemoveCategorySuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssueRemoveCityInput: GqlIssueRemoveCityInput;
  IssueRemoveCityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueRemoveCityPayload'];
  IssueRemoveCitySuccess: Omit<GqlIssueRemoveCitySuccess, 'city' | 'issue'> & { city: GqlResolversParentTypes['City'], issue: GqlResolversParentTypes['Issue'] };
  IssueRemoveGroupInput: GqlIssueRemoveGroupInput;
  IssueRemoveGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueRemoveGroupPayload'];
  IssueRemoveGroupSuccess: Omit<GqlIssueRemoveGroupSuccess, 'group' | 'issue'> & { group: GqlResolversParentTypes['Group'], issue: GqlResolversParentTypes['Issue'] };
  IssueRemoveOrganizationInput: GqlIssueRemoveOrganizationInput;
  IssueRemoveOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueRemoveOrganizationPayload'];
  IssueRemoveOrganizationSuccess: Omit<GqlIssueRemoveOrganizationSuccess, 'issue' | 'organization'> & { issue: GqlResolversParentTypes['Issue'], organization: GqlResolversParentTypes['Organization'] };
  IssueRemoveSkillsetInput: GqlIssueRemoveSkillsetInput;
  IssueRemoveSkillsetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueRemoveSkillsetPayload'];
  IssueRemoveSkillsetSuccess: Omit<GqlIssueRemoveSkillsetSuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssueSortInput: GqlIssueSortInput;
  IssueUpdateContentInput: GqlIssueUpdateContentInput;
  IssueUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueUpdateContentPayload'];
  IssueUpdateContentSuccess: Omit<GqlIssueUpdateContentSuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssueUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['IssueUpdatePrivacyPayload'];
  IssueUpdatePrivacySuccess: Omit<GqlIssueUpdatePrivacySuccess, 'issue'> & { issue: GqlResolversParentTypes['Issue'] };
  IssuesConnection: Omit<GqlIssuesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['IssueEdge']>>> };
  Like: Like;
  LikeAddEventInput: GqlLikeAddEventInput;
  LikeAddEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['LikeAddEventPayload'];
  LikeAddEventSuccess: Omit<GqlLikeAddEventSuccess, 'like'> & { like: GqlResolversParentTypes['Like'] };
  LikeDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['LikeDeletePayload'];
  LikeDeleteSuccess: GqlLikeDeleteSuccess;
  Likes: Omit<GqlLikes, 'data'> & { data: Array<GqlResolversParentTypes['Like']> };
  Mutation: {};
  Organization: Organization;
  OrganizationAddGroupInput: GqlOrganizationAddGroupInput;
  OrganizationAddGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationAddGroupPayload'];
  OrganizationAddGroupSuccess: Omit<GqlOrganizationAddGroupSuccess, 'group' | 'organization'> & { group: GqlResolversParentTypes['Group'], organization: GqlResolversParentTypes['Organization'] };
  OrganizationAddTargetInput: GqlOrganizationAddTargetInput;
  OrganizationAddTargetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationAddTargetPayload'];
  OrganizationAddTargetSuccess: Omit<GqlOrganizationAddTargetSuccess, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  OrganizationAddUserInput: GqlOrganizationAddUserInput;
  OrganizationAddUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationAddUserPayload'];
  OrganizationAddUserSuccess: Omit<GqlOrganizationAddUserSuccess, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  OrganizationCreateInput: GqlOrganizationCreateInput;
  OrganizationCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationCreatePayload'];
  OrganizationCreateSuccess: Omit<GqlOrganizationCreateSuccess, 'organization'> & { organization?: Maybe<GqlResolversParentTypes['Organization']> };
  OrganizationDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationDeletePayload'];
  OrganizationDeleteSuccess: GqlOrganizationDeleteSuccess;
  OrganizationEdge: Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Organization']> };
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationRemoveGroupInput: GqlOrganizationRemoveGroupInput;
  OrganizationRemoveGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationRemoveGroupPayload'];
  OrganizationRemoveGroupSuccess: Omit<GqlOrganizationRemoveGroupSuccess, 'group' | 'organization'> & { group: GqlResolversParentTypes['Group'], organization: GqlResolversParentTypes['Organization'] };
  OrganizationRemoveTargetInput: GqlOrganizationRemoveTargetInput;
  OrganizationRemoveTargetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationRemoveTargetPayload'];
  OrganizationRemoveTargetSuccess: Omit<GqlOrganizationRemoveTargetSuccess, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  OrganizationRemoveUserInput: GqlOrganizationRemoveUserInput;
  OrganizationRemoveUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationRemoveUserPayload'];
  OrganizationRemoveUserSuccess: Omit<GqlOrganizationRemoveUserSuccess, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  OrganizationSortInput: GqlOrganizationSortInput;
  OrganizationUpdateContentInput: GqlOrganizationUpdateContentInput;
  OrganizationUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationUpdateContentPayload'];
  OrganizationUpdateContentSuccess: Omit<GqlOrganizationUpdateContentSuccess, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  OrganizationUpdateDefaultInput: GqlOrganizationUpdateDefaultInput;
  OrganizationUpdateDefaultPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationUpdateDefaultPayload'];
  OrganizationUpdateDefaultSuccess: Omit<GqlOrganizationUpdateDefaultSuccess, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  OrganizationUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationUpdatePrivacyPayload'];
  OrganizationUpdatePrivacySuccess: Omit<GqlOrganizationUpdatePrivacySuccess, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  Organizations: Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversParentTypes['Organization']> };
  OrganizationsConnection: Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OrganizationEdge']>>> };
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Query: {};
  Skillset: GqlSkillset;
  State: State;
  String: Scalars['String']['output'];
  Target: Target;
  TargetAddGroupInput: GqlTargetAddGroupInput;
  TargetAddGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetAddGroupPayload'];
  TargetAddGroupSuccess: Omit<GqlTargetAddGroupSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  TargetAddOrganizationInput: GqlTargetAddOrganizationInput;
  TargetAddOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetAddOrganizationPayload'];
  TargetAddOrganizationSuccess: Omit<GqlTargetAddOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  TargetCreateInput: GqlTargetCreateInput;
  TargetCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetCreatePayload'];
  TargetCreateSuccess: Omit<GqlTargetCreateSuccess, 'target'> & { target?: Maybe<GqlResolversParentTypes['Target']> };
  TargetDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetDeletePayload'];
  TargetDeleteSuccess: GqlTargetDeleteSuccess;
  TargetEdge: Omit<GqlTargetEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Target']> };
  TargetFilterInput: GqlTargetFilterInput;
  TargetRemoveGroupInput: GqlTargetRemoveGroupInput;
  TargetRemoveGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetRemoveGroupPayload'];
  TargetRemoveGroupSuccess: Omit<GqlTargetRemoveGroupSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  TargetRemoveOrganizationInput: GqlTargetRemoveOrganizationInput;
  TargetRemoveOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetRemoveOrganizationPayload'];
  TargetRemoveOrganizationSuccess: Omit<GqlTargetRemoveOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  TargetSortInput: GqlTargetSortInput;
  TargetUpdateContentInput: GqlTargetUpdateContentInput;
  TargetUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetUpdateContentPayload'];
  TargetUpdateContentSuccess: Omit<GqlTargetUpdateContentSuccess, 'target'> & { target?: Maybe<GqlResolversParentTypes['Target']> };
  TargetUpdateIndexInput: GqlTargetUpdateIndexInput;
  TargetUpdateIndexPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetUpdateIndexPayload'];
  TargetUpdateIndexSuccess: Omit<GqlTargetUpdateIndexSuccess, 'index' | 'target'> & { index: GqlResolversParentTypes['Index'], target: GqlResolversParentTypes['Target'] };
  TargetsConnection: Omit<GqlTargetsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TargetEdge']>>> };
  User: User;
  UserAddActivityInput: GqlUserAddActivityInput;
  UserAddGroupInput: GqlUserAddGroupInput;
  UserAddOrganizationInput: GqlUserAddOrganizationInput;
  UserCreateInput: GqlUserCreateInput;
  UserCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserCreatePayload'];
  UserCreateSuccess: Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  UserDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserDeletePayload'];
  UserDeleteSuccess: GqlUserDeleteSuccess;
  UserEdge: Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['User']> };
  UserFilterInput: GqlUserFilterInput;
  UserRemoveActivityInput: GqlUserRemoveActivityInput;
  UserRemoveGroupInput: GqlUserRemoveGroupInput;
  UserRemoveOrganizationInput: GqlUserRemoveOrganizationInput;
  UserSortInput: GqlUserSortInput;
  UserSwitchPrivacyInput: GqlUserSwitchPrivacyInput;
  UserSwitchPrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserSwitchPrivacyPayload'];
  UserSwitchPrivacySuccess: Omit<GqlUserSwitchPrivacySuccess, 'user'> & { user: GqlResolversParentTypes['User'] };
  UserUpdateActivityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateActivityPayload'];
  UserUpdateActivitySuccess: Omit<GqlUserUpdateActivitySuccess, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user?: Maybe<GqlResolversParentTypes['User']> };
  UserUpdateContentInput: GqlUserUpdateContentInput;
  UserUpdateContentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateContentPayload'];
  UserUpdateContentSuccess: Omit<GqlUserUpdateContentSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  UserUpdateGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateGroupPayload'];
  UserUpdateGroupSuccess: Omit<GqlUserUpdateGroupSuccess, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  UserUpdateOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdateOrganizationPayload'];
  UserUpdateOrganizationSuccess: Omit<GqlUserUpdateOrganizationSuccess, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  UsersConnection: Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['UserEdge']>>> };
}>;

export type GqlActivitiesResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Activities'] = GqlResolversParentTypes['Activities']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Activity']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivitiesConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivitiesConnection'] = GqlResolversParentTypes['ActivitiesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['ActivityEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Activity'] = GqlResolversParentTypes['Activity']> = ResolversObject<{
  application?: Resolver<Maybe<GqlResolversTypes['Application']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  issue?: Resolver<Maybe<GqlResolversTypes['Issue']>, ParentType, ContextType>;
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  remark?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityCreatePayload'] = GqlResolversParentTypes['ActivityCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityCreateSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityCreateSuccess'] = GqlResolversParentTypes['ActivityCreateSuccess']> = ResolversObject<{
  activity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityDeletePayload'] = GqlResolversParentTypes['ActivityDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityDeleteSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityDeleteSuccess'] = GqlResolversParentTypes['ActivityDeleteSuccess']> = ResolversObject<{
  activityId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityEdge'] = GqlResolversParentTypes['ActivityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivitySwitchPrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivitySwitchPrivacyPayload'] = GqlResolversParentTypes['ActivitySwitchPrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivitySwitchPrivacySuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivitySwitchPrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivitySwitchPrivacySuccess'] = GqlResolversParentTypes['ActivitySwitchPrivacySuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateContentPayload'] = GqlResolversParentTypes['ActivityUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityUpdateContentSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateContentSuccess'] = GqlResolversParentTypes['ActivityUpdateContentSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityUpdateEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateEventPayload'] = GqlResolversParentTypes['ActivityUpdateEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityUpdateEventSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityUpdateEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateEventSuccess'] = GqlResolversParentTypes['ActivityUpdateEventSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityUpdateUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateUserPayload'] = GqlResolversParentTypes['ActivityUpdateUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityUpdateUserSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityUpdateUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateUserSuccess'] = GqlResolversParentTypes['ActivityUpdateUserSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAgendaResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Agenda'] = GqlResolversParentTypes['Agenda']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Application'] = GqlResolversParentTypes['Application']> = ResolversObject<{
  activity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType>;
  approvals?: Resolver<Maybe<Array<GqlResolversTypes['ApplicationConfirmation']>>, ParentType, ContextType>;
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  submittedAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationAddConfirmationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationAddConfirmationPayload'] = GqlResolversParentTypes['ApplicationAddConfirmationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationAddConfirmationSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationAddConfirmationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationAddConfirmationSuccess'] = GqlResolversParentTypes['ApplicationAddConfirmationSuccess']> = ResolversObject<{
  application?: Resolver<GqlResolversTypes['Application'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationConfirmationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationConfirmation'] = GqlResolversParentTypes['ApplicationConfirmation']> = ResolversObject<{
  application?: Resolver<Maybe<GqlResolversTypes['Application']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  confirmedBy?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  isApproved?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationCreatePayload'] = GqlResolversParentTypes['ApplicationCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationCreateSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationCreateSuccess'] = GqlResolversParentTypes['ApplicationCreateSuccess']> = ResolversObject<{
  application?: Resolver<GqlResolversTypes['Application'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationDeleteConfirmationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationDeleteConfirmationPayload'] = GqlResolversParentTypes['ApplicationDeleteConfirmationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationDeleteConfirmationSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationDeleteConfirmationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationDeleteConfirmationSuccess'] = GqlResolversParentTypes['ApplicationDeleteConfirmationSuccess']> = ResolversObject<{
  applicationConfirmationId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  applicationId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationDeletePayload'] = GqlResolversParentTypes['ApplicationDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationDeleteSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationDeleteSuccess'] = GqlResolversParentTypes['ApplicationDeleteSuccess']> = ResolversObject<{
  applicationId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationEdge'] = GqlResolversParentTypes['ApplicationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Application']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationSwitchIsApprovedPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationSwitchIsApprovedPayload'] = GqlResolversParentTypes['ApplicationSwitchIsApprovedPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationSwitchIsApprovedSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationSwitchIsApprovedSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationSwitchIsApprovedSuccess'] = GqlResolversParentTypes['ApplicationSwitchIsApprovedSuccess']> = ResolversObject<{
  application?: Resolver<GqlResolversTypes['Application'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationSwitchPrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationSwitchPrivacyPayload'] = GqlResolversParentTypes['ApplicationSwitchPrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationSwitchPrivacySuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationSwitchPrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationSwitchPrivacySuccess'] = GqlResolversParentTypes['ApplicationSwitchPrivacySuccess']> = ResolversObject<{
  application?: Resolver<GqlResolversTypes['Application'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationUpdateCommentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationUpdateCommentPayload'] = GqlResolversParentTypes['ApplicationUpdateCommentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationUpdateCommentSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationUpdateCommentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationUpdateCommentSuccess'] = GqlResolversParentTypes['ApplicationUpdateCommentSuccess']> = ResolversObject<{
  application?: Resolver<GqlResolversTypes['Application'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationUpdateConfirmationCommentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationUpdateConfirmationCommentPayload'] = GqlResolversParentTypes['ApplicationUpdateConfirmationCommentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ApplicationUpdateConfirmationCommentSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlApplicationUpdateConfirmationCommentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationUpdateConfirmationCommentSuccess'] = GqlResolversParentTypes['ApplicationUpdateConfirmationCommentSuccess']> = ResolversObject<{
  application?: Resolver<GqlResolversTypes['Application'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlApplicationsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ApplicationsConnection'] = GqlResolversParentTypes['ApplicationsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['ApplicationEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type GqlCommentResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Comment'] = GqlResolversParentTypes['Comment']> = ResolversObject<{
  content?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  postedAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommentAddEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentAddEventPayload'] = GqlResolversParentTypes['CommentAddEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommentAddEventSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommentAddEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentAddEventSuccess'] = GqlResolversParentTypes['CommentAddEventSuccess']> = ResolversObject<{
  comment?: Resolver<GqlResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommentDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentDeletePayload'] = GqlResolversParentTypes['CommentDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommentDeleteSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommentDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentDeleteSuccess'] = GqlResolversParentTypes['CommentDeleteSuccess']> = ResolversObject<{
  commentId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommentUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentUpdateContentPayload'] = GqlResolversParentTypes['CommentUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommentUpdateContentSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommentUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentUpdateContentSuccess'] = GqlResolversParentTypes['CommentUpdateContentSuccess']> = ResolversObject<{
  comment?: Resolver<GqlResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommentsResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Comments'] = GqlResolversParentTypes['Comments']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Comment']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommonErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommonError'] = GqlResolversParentTypes['CommonError']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlComplexQueryErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ComplexQueryError'] = GqlResolversParentTypes['ComplexQueryError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCurrentUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CurrentUserPayload'] = GqlResolversParentTypes['CurrentUserPayload']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCustomTokenCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CustomTokenCreatePayload'] = GqlResolversParentTypes['CustomTokenCreatePayload']> = ResolversObject<{
  idToken?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlDatetimeScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Datetime'], any> {
  name: 'Datetime';
}

export type GqlEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Edge'] = GqlResolversParentTypes['Edge']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityEdge' | 'ApplicationEdge' | 'EventEdge' | 'GroupEdge' | 'IssueEdge' | 'OrganizationEdge' | 'TargetEdge' | 'UserEdge', ParentType, ContextType>;
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Error'] = GqlResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
}>;

export type GqlEventResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Event'] = GqlResolversParentTypes['Event']> = ResolversObject<{
  activities?: Resolver<Maybe<GqlResolversTypes['Activities']>, ParentType, ContextType>;
  agendas?: Resolver<Maybe<Array<GqlResolversTypes['Agenda']>>, ParentType, ContextType>;
  cities?: Resolver<Maybe<Array<GqlResolversTypes['City']>>, ParentType, ContextType>;
  comments?: Resolver<Maybe<GqlResolversTypes['Comments']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<GqlResolversTypes['Group']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  likes?: Resolver<Maybe<GqlResolversTypes['Likes']>, ParentType, ContextType>;
  organizations?: Resolver<Maybe<Array<GqlResolversTypes['Organization']>>, ParentType, ContextType>;
  plannedEndsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  plannedStartsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  skillsets?: Resolver<Maybe<Array<GqlResolversTypes['Skillset']>>, ParentType, ContextType>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventDeletePayload'] = GqlResolversParentTypes['EventDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventDeleteSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventDeleteSuccess'] = GqlResolversParentTypes['EventDeleteSuccess']> = ResolversObject<{
  eventId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventEdge'] = GqlResolversParentTypes['EventEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventPlanPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventPlanPayload'] = GqlResolversParentTypes['EventPlanPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventPlanSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventPlanSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventPlanSuccess'] = GqlResolversParentTypes['EventPlanSuccess']> = ResolversObject<{
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateContentPayload'] = GqlResolversParentTypes['EventUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventUpdateContentSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateContentSuccess'] = GqlResolversParentTypes['EventUpdateContentSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventUpdateGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateGroupPayload'] = GqlResolversParentTypes['EventUpdateGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventUpdateGroupSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventUpdateGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateGroupSuccess'] = GqlResolversParentTypes['EventUpdateGroupSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventUpdateOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateOrganizationPayload'] = GqlResolversParentTypes['EventUpdateOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventUpdateOrganizationSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventUpdateOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateOrganizationSuccess'] = GqlResolversParentTypes['EventUpdateOrganizationSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdatePrivacyPayload'] = GqlResolversParentTypes['EventUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventUpdatePrivacySuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdatePrivacySuccess'] = GqlResolversParentTypes['EventUpdatePrivacySuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventsConnection'] = GqlResolversParentTypes['EventsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['EventEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlFieldResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Field'] = GqlResolversParentTypes['Field']> = ResolversObject<{
  message?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Group'] = GqlResolversParentTypes['Group']> = ResolversObject<{
  agendas?: Resolver<Maybe<Array<GqlResolversTypes['Agenda']>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  children?: Resolver<Maybe<Array<GqlResolversTypes['Group']>>, ParentType, ContextType>;
  cities?: Resolver<Maybe<Array<GqlResolversTypes['City']>>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  events?: Resolver<Maybe<Array<GqlResolversTypes['Event']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  parent?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType>;
  targets?: Resolver<Maybe<Array<GqlResolversTypes['Target']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<GqlResolversTypes['User']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupChangeOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupChangeOrganizationPayload'] = GqlResolversParentTypes['GroupChangeOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupChangeOrganizationSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupChangeOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupChangeOrganizationSuccess'] = GqlResolversParentTypes['GroupChangeOrganizationSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupCreatePayload'] = GqlResolversParentTypes['GroupCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupCreateSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupCreateSuccess'] = GqlResolversParentTypes['GroupCreateSuccess']> = ResolversObject<{
  group?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupDeletePayload'] = GqlResolversParentTypes['GroupDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupDeleteSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupDeleteSuccess'] = GqlResolversParentTypes['GroupDeleteSuccess']> = ResolversObject<{
  groupId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupEdge'] = GqlResolversParentTypes['GroupEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdateChildPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateChildPayload'] = GqlResolversParentTypes['GroupUpdateChildPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateChildSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateChildSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateChildSuccess'] = GqlResolversParentTypes['GroupUpdateChildSuccess']> = ResolversObject<{
  child?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateContentPayload'] = GqlResolversParentTypes['GroupUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateContentSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateContentSuccess'] = GqlResolversParentTypes['GroupUpdateContentSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdateEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateEventPayload'] = GqlResolversParentTypes['GroupUpdateEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateEventSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateEventSuccess'] = GqlResolversParentTypes['GroupUpdateEventSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdateParentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateParentPayload'] = GqlResolversParentTypes['GroupUpdateParentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateParentSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateParentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateParentSuccess'] = GqlResolversParentTypes['GroupUpdateParentSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  parent?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdateTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateTargetPayload'] = GqlResolversParentTypes['GroupUpdateTargetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateTargetSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateTargetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateTargetSuccess'] = GqlResolversParentTypes['GroupUpdateTargetSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdateUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateUserPayload'] = GqlResolversParentTypes['GroupUpdateUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateUserSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateUserSuccess'] = GqlResolversParentTypes['GroupUpdateUserSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupsConnection'] = GqlResolversParentTypes['GroupsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['GroupEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIndexResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Index'] = GqlResolversParentTypes['Index']> = ResolversObject<{
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  valueType?: Resolver<GqlResolversTypes['ValueType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlInvalidInputValueErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['InvalidInputValueError'] = GqlResolversParentTypes['InvalidInputValueError']> = ResolversObject<{
  fields?: Resolver<Maybe<Array<GqlResolversTypes['Field']>>, ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  statusCode?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Issue'] = GqlResolversParentTypes['Issue']> = ResolversObject<{
  activities?: Resolver<Maybe<GqlResolversTypes['Activities']>, ParentType, ContextType>;
  cities?: Resolver<Maybe<Array<GqlResolversTypes['City']>>, ParentType, ContextType>;
  comments?: Resolver<Maybe<GqlResolversTypes['Comments']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<GqlResolversTypes['Group']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  issueCategories?: Resolver<Maybe<Array<GqlResolversTypes['IssueCategory']>>, ParentType, ContextType>;
  likes?: Resolver<Maybe<GqlResolversTypes['Likes']>, ParentType, ContextType>;
  organizations?: Resolver<Maybe<Array<GqlResolversTypes['Organization']>>, ParentType, ContextType>;
  skillsets?: Resolver<Maybe<Array<GqlResolversTypes['Skillset']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueAddCategoryPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddCategoryPayload'] = GqlResolversParentTypes['IssueAddCategoryPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueAddCategorySuccess', ParentType, ContextType>;
}>;

export type GqlIssueAddCategorySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddCategorySuccess'] = GqlResolversParentTypes['IssueAddCategorySuccess']> = ResolversObject<{
  category?: Resolver<GqlResolversTypes['IssueCategory'], ParentType, ContextType>;
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueAddCityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddCityPayload'] = GqlResolversParentTypes['IssueAddCityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueAddCitySuccess', ParentType, ContextType>;
}>;

export type GqlIssueAddCitySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddCitySuccess'] = GqlResolversParentTypes['IssueAddCitySuccess']> = ResolversObject<{
  city?: Resolver<GqlResolversTypes['City'], ParentType, ContextType>;
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueAddGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddGroupPayload'] = GqlResolversParentTypes['IssueAddGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueAddGroupSuccess', ParentType, ContextType>;
}>;

export type GqlIssueAddGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddGroupSuccess'] = GqlResolversParentTypes['IssueAddGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueAddOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddOrganizationPayload'] = GqlResolversParentTypes['IssueAddOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueAddOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlIssueAddOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddOrganizationSuccess'] = GqlResolversParentTypes['IssueAddOrganizationSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueAddSkillsetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddSkillsetPayload'] = GqlResolversParentTypes['IssueAddSkillsetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueAddSkillsetSuccess', ParentType, ContextType>;
}>;

export type GqlIssueAddSkillsetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueAddSkillsetSuccess'] = GqlResolversParentTypes['IssueAddSkillsetSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  skillset?: Resolver<GqlResolversTypes['Skillset'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueCategoryResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueCategory'] = GqlResolversParentTypes['IssueCategory']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueCreatePayload'] = GqlResolversParentTypes['IssueCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueCreateSuccess', ParentType, ContextType>;
}>;

export type GqlIssueCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueCreateSuccess'] = GqlResolversParentTypes['IssueCreateSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueDeletePayload'] = GqlResolversParentTypes['IssueDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlIssueDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueDeleteSuccess'] = GqlResolversParentTypes['IssueDeleteSuccess']> = ResolversObject<{
  issueId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueEdge'] = GqlResolversParentTypes['IssueEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Issue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueRemoveCategoryPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveCategoryPayload'] = GqlResolversParentTypes['IssueRemoveCategoryPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueRemoveCategorySuccess', ParentType, ContextType>;
}>;

export type GqlIssueRemoveCategorySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveCategorySuccess'] = GqlResolversParentTypes['IssueRemoveCategorySuccess']> = ResolversObject<{
  category?: Resolver<GqlResolversTypes['IssueCategory'], ParentType, ContextType>;
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueRemoveCityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveCityPayload'] = GqlResolversParentTypes['IssueRemoveCityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueRemoveCitySuccess', ParentType, ContextType>;
}>;

export type GqlIssueRemoveCitySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveCitySuccess'] = GqlResolversParentTypes['IssueRemoveCitySuccess']> = ResolversObject<{
  city?: Resolver<GqlResolversTypes['City'], ParentType, ContextType>;
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueRemoveGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveGroupPayload'] = GqlResolversParentTypes['IssueRemoveGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueRemoveGroupSuccess', ParentType, ContextType>;
}>;

export type GqlIssueRemoveGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveGroupSuccess'] = GqlResolversParentTypes['IssueRemoveGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueRemoveOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveOrganizationPayload'] = GqlResolversParentTypes['IssueRemoveOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueRemoveOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlIssueRemoveOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveOrganizationSuccess'] = GqlResolversParentTypes['IssueRemoveOrganizationSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueRemoveSkillsetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveSkillsetPayload'] = GqlResolversParentTypes['IssueRemoveSkillsetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueRemoveSkillsetSuccess', ParentType, ContextType>;
}>;

export type GqlIssueRemoveSkillsetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueRemoveSkillsetSuccess'] = GqlResolversParentTypes['IssueRemoveSkillsetSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  skillset?: Resolver<GqlResolversTypes['Skillset'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueUpdateContentPayload'] = GqlResolversParentTypes['IssueUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlIssueUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueUpdateContentSuccess'] = GqlResolversParentTypes['IssueUpdateContentSuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssueUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueUpdatePrivacyPayload'] = GqlResolversParentTypes['IssueUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'IssueUpdatePrivacySuccess', ParentType, ContextType>;
}>;

export type GqlIssueUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssueUpdatePrivacySuccess'] = GqlResolversParentTypes['IssueUpdatePrivacySuccess']> = ResolversObject<{
  issue?: Resolver<GqlResolversTypes['Issue'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlIssuesConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['IssuesConnection'] = GqlResolversParentTypes['IssuesConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['IssueEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlLikeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Like'] = GqlResolversParentTypes['Like']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
  postedAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlLikeAddEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['LikeAddEventPayload'] = GqlResolversParentTypes['LikeAddEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'LikeAddEventSuccess', ParentType, ContextType>;
}>;

export type GqlLikeAddEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['LikeAddEventSuccess'] = GqlResolversParentTypes['LikeAddEventSuccess']> = ResolversObject<{
  like?: Resolver<GqlResolversTypes['Like'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlLikeDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['LikeDeletePayload'] = GqlResolversParentTypes['LikeDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'LikeDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlLikeDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['LikeDeleteSuccess'] = GqlResolversParentTypes['LikeDeleteSuccess']> = ResolversObject<{
  likeId?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlLikesResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Likes'] = GqlResolversParentTypes['Likes']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Like']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMutationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Mutation'] = GqlResolversParentTypes['Mutation']> = ResolversObject<{
  activityAddEvent?: Resolver<Maybe<GqlResolversTypes['ActivityUpdateEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityAddEventArgs, 'id' | 'input'>>;
  activityAddUser?: Resolver<Maybe<GqlResolversTypes['ActivityUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityAddUserArgs, 'id' | 'input'>>;
  activityCreate?: Resolver<Maybe<GqlResolversTypes['ActivityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityCreateArgs, 'input'>>;
  activityDelete?: Resolver<Maybe<GqlResolversTypes['ActivityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityDeleteArgs, 'id'>>;
  activityPublish?: Resolver<Maybe<GqlResolversTypes['ActivitySwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityPublishArgs, 'id' | 'input'>>;
  activityRemoveEvent?: Resolver<Maybe<GqlResolversTypes['ActivityUpdateEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityRemoveEventArgs, 'id' | 'input'>>;
  activityRemoveUser?: Resolver<Maybe<GqlResolversTypes['ActivityUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityRemoveUserArgs, 'id' | 'input'>>;
  activityUnpublish?: Resolver<Maybe<GqlResolversTypes['ActivitySwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityUnpublishArgs, 'id' | 'input'>>;
  activityUpdateContent?: Resolver<Maybe<GqlResolversTypes['ActivityUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityUpdateContentArgs, 'id' | 'input'>>;
  applicationAddConfirmation?: Resolver<Maybe<GqlResolversTypes['ApplicationAddConfirmationPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationAddConfirmationArgs, 'id' | 'input'>>;
  applicationApproval?: Resolver<Maybe<GqlResolversTypes['ApplicationSwitchIsApprovedPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationApprovalArgs, 'id' | 'input'>>;
  applicationCreate?: Resolver<Maybe<GqlResolversTypes['ApplicationCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationCreateArgs, 'input'>>;
  applicationDelete?: Resolver<Maybe<GqlResolversTypes['ApplicationDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationDeleteArgs, 'id'>>;
  applicationDeleteConfirmation?: Resolver<Maybe<GqlResolversTypes['ApplicationDeleteConfirmationPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationDeleteConfirmationArgs, 'id' | 'input'>>;
  applicationPublish?: Resolver<Maybe<GqlResolversTypes['ApplicationSwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationPublishArgs, 'id'>>;
  applicationRefusal?: Resolver<Maybe<GqlResolversTypes['ApplicationSwitchIsApprovedPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationRefusalArgs, 'id' | 'input'>>;
  applicationUnpublish?: Resolver<Maybe<GqlResolversTypes['ApplicationSwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationUnpublishArgs, 'id'>>;
  applicationUpdateComment?: Resolver<Maybe<GqlResolversTypes['ApplicationUpdateCommentPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationUpdateCommentArgs, 'id' | 'input'>>;
  applicationUpdateConfirmationComment?: Resolver<Maybe<GqlResolversTypes['ApplicationUpdateConfirmationCommentPayload']>, ParentType, ContextType, RequireFields<GqlMutationApplicationUpdateConfirmationCommentArgs, 'id' | 'input'>>;
  commentAddEvent?: Resolver<Maybe<GqlResolversTypes['CommentAddEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationCommentAddEventArgs, 'input'>>;
  commentDelete?: Resolver<Maybe<GqlResolversTypes['CommentDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommentDeleteArgs, 'id'>>;
  commentUpdateContent?: Resolver<Maybe<GqlResolversTypes['CommentUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationCommentUpdateContentArgs, 'id' | 'input'>>;
  eventAddGroup?: Resolver<Maybe<GqlResolversTypes['EventUpdateGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventAddGroupArgs, 'id' | 'input'>>;
  eventAddOrganization?: Resolver<Maybe<GqlResolversTypes['EventUpdateOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventAddOrganizationArgs, 'id' | 'input'>>;
  eventDelete?: Resolver<Maybe<GqlResolversTypes['EventDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationEventDeleteArgs, 'id'>>;
  eventPlan?: Resolver<Maybe<GqlResolversTypes['EventPlanPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventPlanArgs, 'input'>>;
  eventPublish?: Resolver<Maybe<GqlResolversTypes['EventUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventPublishArgs, 'id'>>;
  eventRemoveGroup?: Resolver<Maybe<GqlResolversTypes['EventUpdateGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventRemoveGroupArgs, 'id' | 'input'>>;
  eventRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['EventUpdateOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventRemoveOrganizationArgs, 'id' | 'input'>>;
  eventUnpublish?: Resolver<Maybe<GqlResolversTypes['EventUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventUnpublishArgs, 'id'>>;
  eventUpdateContent?: Resolver<Maybe<GqlResolversTypes['EventUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventUpdateContentArgs, 'id' | 'input'>>;
  groupAddChild?: Resolver<Maybe<GqlResolversTypes['GroupUpdateChildPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddChildArgs, 'id' | 'input'>>;
  groupAddEvent?: Resolver<Maybe<GqlResolversTypes['GroupUpdateEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddEventArgs, 'id' | 'input'>>;
  groupAddParent?: Resolver<Maybe<GqlResolversTypes['GroupUpdateParentPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddParentArgs, 'id' | 'input'>>;
  groupAddTarget?: Resolver<Maybe<GqlResolversTypes['GroupUpdateTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddTargetArgs, 'id' | 'input'>>;
  groupAddUser?: Resolver<Maybe<GqlResolversTypes['GroupUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddUserArgs, 'id' | 'input'>>;
  groupChangeOrganization?: Resolver<Maybe<GqlResolversTypes['GroupChangeOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupChangeOrganizationArgs, 'id' | 'input'>>;
  groupCreate?: Resolver<Maybe<GqlResolversTypes['GroupCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupCreateArgs, 'input'>>;
  groupDelete?: Resolver<Maybe<GqlResolversTypes['GroupDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupDeleteArgs, 'id'>>;
  groupRemoveChild?: Resolver<Maybe<GqlResolversTypes['GroupUpdateChildPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveChildArgs, 'id' | 'input'>>;
  groupRemoveEvent?: Resolver<Maybe<GqlResolversTypes['GroupUpdateEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveEventArgs, 'id' | 'input'>>;
  groupRemoveParent?: Resolver<Maybe<GqlResolversTypes['GroupUpdateParentPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveParentArgs, 'id' | 'input'>>;
  groupRemoveTarget?: Resolver<Maybe<GqlResolversTypes['GroupUpdateTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveTargetArgs, 'id' | 'input'>>;
  groupRemoveUser?: Resolver<Maybe<GqlResolversTypes['GroupUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveUserArgs, 'id' | 'input'>>;
  groupUpdateContent?: Resolver<Maybe<GqlResolversTypes['GroupUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupUpdateContentArgs, 'id' | 'input'>>;
  issueAddCategory?: Resolver<Maybe<GqlResolversTypes['IssueAddCategoryPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueAddCategoryArgs, 'id' | 'input'>>;
  issueAddCity?: Resolver<Maybe<GqlResolversTypes['IssueAddCityPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueAddCityArgs, 'id' | 'input'>>;
  issueAddGroup?: Resolver<Maybe<GqlResolversTypes['IssueAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueAddGroupArgs, 'id' | 'input'>>;
  issueAddOrganization?: Resolver<Maybe<GqlResolversTypes['IssueAddOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueAddOrganizationArgs, 'id' | 'input'>>;
  issueAddSkillset?: Resolver<Maybe<GqlResolversTypes['IssueAddSkillsetPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueAddSkillsetArgs, 'id' | 'input'>>;
  issueCreate?: Resolver<Maybe<GqlResolversTypes['IssueCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueCreateArgs, 'input'>>;
  issueDelete?: Resolver<Maybe<GqlResolversTypes['IssueDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueDeleteArgs, 'id'>>;
  issuePublish?: Resolver<Maybe<GqlResolversTypes['IssueUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssuePublishArgs, 'id' | 'input'>>;
  issueRemoveCategory?: Resolver<Maybe<GqlResolversTypes['IssueRemoveCategoryPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueRemoveCategoryArgs, 'id' | 'input'>>;
  issueRemoveCity?: Resolver<Maybe<GqlResolversTypes['IssueRemoveCityPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueRemoveCityArgs, 'id' | 'input'>>;
  issueRemoveGroup?: Resolver<Maybe<GqlResolversTypes['IssueRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueRemoveGroupArgs, 'id' | 'input'>>;
  issueRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['IssueRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueRemoveOrganizationArgs, 'id' | 'input'>>;
  issueRemoveSkillset?: Resolver<Maybe<GqlResolversTypes['IssueRemoveSkillsetPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueRemoveSkillsetArgs, 'id' | 'input'>>;
  issueUnpublish?: Resolver<Maybe<GqlResolversTypes['IssueUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueUnpublishArgs, 'id' | 'input'>>;
  issueUpdateContent?: Resolver<Maybe<GqlResolversTypes['IssueUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationIssueUpdateContentArgs, 'id' | 'input'>>;
  likeAddEvent?: Resolver<Maybe<GqlResolversTypes['LikeAddEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationLikeAddEventArgs, 'input'>>;
  likeDelete?: Resolver<Maybe<GqlResolversTypes['LikeDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationLikeDeleteArgs, 'id'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  organizationAddGroup?: Resolver<Maybe<GqlResolversTypes['OrganizationAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationAddGroupArgs, 'id' | 'input'>>;
  organizationAddTarget?: Resolver<Maybe<GqlResolversTypes['OrganizationAddTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationAddTargetArgs, 'id' | 'input'>>;
  organizationAddUser?: Resolver<Maybe<GqlResolversTypes['OrganizationAddUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationAddUserArgs, 'id' | 'input'>>;
  organizationCreate?: Resolver<Maybe<GqlResolversTypes['OrganizationCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationCreateArgs, 'input'>>;
  organizationDelete?: Resolver<Maybe<GqlResolversTypes['OrganizationDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationDeleteArgs, 'id'>>;
  organizationPublish?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationPublishArgs, 'id'>>;
  organizationRemoveGroup?: Resolver<Maybe<GqlResolversTypes['OrganizationRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationRemoveGroupArgs, 'id' | 'input'>>;
  organizationRemoveTarget?: Resolver<Maybe<GqlResolversTypes['OrganizationRemoveTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationRemoveTargetArgs, 'id' | 'input'>>;
  organizationRemoveUser?: Resolver<Maybe<GqlResolversTypes['OrganizationRemoveUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationRemoveUserArgs, 'id' | 'input'>>;
  organizationUnpublish?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationUnpublishArgs, 'id'>>;
  organizationUpdateContent?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationUpdateContentArgs, 'id' | 'input'>>;
  organizationUpdateDefault?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdateDefaultPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationUpdateDefaultArgs, 'id' | 'input'>>;
  targetAddGroup?: Resolver<Maybe<GqlResolversTypes['TargetAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetAddGroupArgs, 'id' | 'input'>>;
  targetAddOrganization?: Resolver<Maybe<GqlResolversTypes['TargetAddOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetAddOrganizationArgs, 'id' | 'input'>>;
  targetCreate?: Resolver<Maybe<GqlResolversTypes['TargetCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetCreateArgs, 'input'>>;
  targetDelete?: Resolver<Maybe<GqlResolversTypes['TargetDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetDeleteArgs, 'id'>>;
  targetRemoveGroup?: Resolver<Maybe<GqlResolversTypes['TargetRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetRemoveGroupArgs, 'id' | 'input'>>;
  targetRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['TargetRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetRemoveOrganizationArgs, 'id' | 'input'>>;
  targetUpdateContent?: Resolver<Maybe<GqlResolversTypes['TargetUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetUpdateContentArgs, 'id' | 'input'>>;
  targetUpdateIndex?: Resolver<Maybe<GqlResolversTypes['TargetUpdateIndexPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetUpdateIndexArgs, 'id' | 'input'>>;
  userAddActivity?: Resolver<Maybe<GqlResolversTypes['UserUpdateActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddActivityArgs, 'id' | 'input'>>;
  userAddGroup?: Resolver<Maybe<GqlResolversTypes['UserUpdateGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddGroupArgs, 'id' | 'input'>>;
  userAddOrganization?: Resolver<Maybe<GqlResolversTypes['UserUpdateOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddOrganizationArgs, 'id' | 'input'>>;
  userCreate?: Resolver<Maybe<GqlResolversTypes['UserCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserCreateArgs, 'input'>>;
  userDelete?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteArgs, 'id'>>;
  userPublish?: Resolver<Maybe<GqlResolversTypes['UserSwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserPublishArgs, 'id' | 'input'>>;
  userRemoveActivity?: Resolver<Maybe<GqlResolversTypes['UserUpdateActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveActivityArgs, 'id' | 'input'>>;
  userRemoveGroup?: Resolver<Maybe<GqlResolversTypes['UserUpdateGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveGroupArgs, 'id' | 'input'>>;
  userRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['UserUpdateOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveOrganizationArgs, 'id' | 'input'>>;
  userUnpublish?: Resolver<Maybe<GqlResolversTypes['UserSwitchPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUnpublishArgs, 'id' | 'input'>>;
  userUpdateContent?: Resolver<Maybe<GqlResolversTypes['UserUpdateContentPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateContentArgs, 'id' | 'input'>>;
}>;

export type GqlOrganizationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Organization'] = GqlResolversParentTypes['Organization']> = ResolversObject<{
  address1?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  address2?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  agendas?: Resolver<Maybe<Array<GqlResolversTypes['Agenda']>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  cities?: Resolver<Maybe<Array<GqlResolversTypes['City']>>, ParentType, ContextType>;
  city?: Resolver<GqlResolversTypes['City'], ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  entity?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  entityPosition?: Resolver<Maybe<GqlResolversTypes['EntityPosition']>, ParentType, ContextType>;
  establishedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  events?: Resolver<Maybe<Array<GqlResolversTypes['Event']>>, ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<GqlResolversTypes['Group']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<GqlResolversTypes['State'], ParentType, ContextType>;
  targets?: Resolver<Maybe<Array<GqlResolversTypes['Target']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<GqlResolversTypes['User']>>, ParentType, ContextType>;
  website?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  zipcode?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationAddGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationAddGroupPayload'] = GqlResolversParentTypes['OrganizationAddGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationAddGroupSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationAddGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationAddGroupSuccess'] = GqlResolversParentTypes['OrganizationAddGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationAddTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationAddTargetPayload'] = GqlResolversParentTypes['OrganizationAddTargetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationAddTargetSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationAddTargetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationAddTargetSuccess'] = GqlResolversParentTypes['OrganizationAddTargetSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationAddUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationAddUserPayload'] = GqlResolversParentTypes['OrganizationAddUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationAddUserSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationAddUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationAddUserSuccess'] = GqlResolversParentTypes['OrganizationAddUserSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationCreatePayload'] = GqlResolversParentTypes['OrganizationCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationCreateSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationCreateSuccess'] = GqlResolversParentTypes['OrganizationCreateSuccess']> = ResolversObject<{
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationDeletePayload'] = GqlResolversParentTypes['OrganizationDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationDeleteSuccess'] = GqlResolversParentTypes['OrganizationDeleteSuccess']> = ResolversObject<{
  organizationId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationEdge'] = GqlResolversParentTypes['OrganizationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationRemoveGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationRemoveGroupPayload'] = GqlResolversParentTypes['OrganizationRemoveGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationRemoveGroupSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationRemoveGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationRemoveGroupSuccess'] = GqlResolversParentTypes['OrganizationRemoveGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationRemoveTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationRemoveTargetPayload'] = GqlResolversParentTypes['OrganizationRemoveTargetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationRemoveTargetSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationRemoveTargetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationRemoveTargetSuccess'] = GqlResolversParentTypes['OrganizationRemoveTargetSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationRemoveUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationRemoveUserPayload'] = GqlResolversParentTypes['OrganizationRemoveUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationRemoveUserSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationRemoveUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationRemoveUserSuccess'] = GqlResolversParentTypes['OrganizationRemoveUserSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdateContentPayload'] = GqlResolversParentTypes['OrganizationUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdateContentSuccess'] = GqlResolversParentTypes['OrganizationUpdateContentSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationUpdateDefaultPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdateDefaultPayload'] = GqlResolversParentTypes['OrganizationUpdateDefaultPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationUpdateDefaultSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationUpdateDefaultSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdateDefaultSuccess'] = GqlResolversParentTypes['OrganizationUpdateDefaultSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdatePrivacyPayload'] = GqlResolversParentTypes['OrganizationUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationUpdatePrivacySuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdatePrivacySuccess'] = GqlResolversParentTypes['OrganizationUpdatePrivacySuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationsResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Organizations'] = GqlResolversParentTypes['Organizations']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationsConnection'] = GqlResolversParentTypes['OrganizationsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['OrganizationEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
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

export type GqlQueryResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Query'] = GqlResolversParentTypes['Query']> = ResolversObject<{
  activities?: Resolver<GqlResolversTypes['ActivitiesConnection'], ParentType, ContextType, Partial<GqlQueryActivitiesArgs>>;
  activity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType, RequireFields<GqlQueryActivityArgs, 'id'>>;
  agendas?: Resolver<Array<GqlResolversTypes['Agenda']>, ParentType, ContextType>;
  application?: Resolver<Maybe<GqlResolversTypes['Application']>, ParentType, ContextType, RequireFields<GqlQueryApplicationArgs, 'id'>>;
  applications?: Resolver<GqlResolversTypes['ApplicationsConnection'], ParentType, ContextType, Partial<GqlQueryApplicationsArgs>>;
  cities?: Resolver<Array<GqlResolversTypes['City']>, ParentType, ContextType, Partial<GqlQueryCitiesArgs>>;
  currentUser?: Resolver<Maybe<GqlResolversTypes['CurrentUserPayload']>, ParentType, ContextType>;
  echo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlQueryEventArgs, 'id'>>;
  events?: Resolver<GqlResolversTypes['EventsConnection'], ParentType, ContextType, Partial<GqlQueryEventsArgs>>;
  group?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlQueryGroupArgs, 'id'>>;
  groups?: Resolver<GqlResolversTypes['GroupsConnection'], ParentType, ContextType, Partial<GqlQueryGroupsArgs>>;
  issue?: Resolver<Maybe<GqlResolversTypes['Issue']>, ParentType, ContextType, RequireFields<GqlQueryIssueArgs, 'id'>>;
  issues?: Resolver<GqlResolversTypes['IssuesConnection'], ParentType, ContextType, Partial<GqlQueryIssuesArgs>>;
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlQueryOrganizationArgs, 'id'>>;
  organizations?: Resolver<GqlResolversTypes['OrganizationsConnection'], ParentType, ContextType, Partial<GqlQueryOrganizationsArgs>>;
  states?: Resolver<Array<GqlResolversTypes['State']>, ParentType, ContextType, Partial<GqlQueryStatesArgs>>;
  target?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType, RequireFields<GqlQueryTargetArgs, 'id'>>;
  targets?: Resolver<GqlResolversTypes['TargetsConnection'], ParentType, ContextType, Partial<GqlQueryTargetsArgs>>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlQueryUserArgs, 'id'>>;
  users?: Resolver<GqlResolversTypes['UsersConnection'], ParentType, ContextType, Partial<GqlQueryUsersArgs>>;
}>;

export type GqlSkillsetResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Skillset'] = GqlResolversParentTypes['Skillset']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlStateResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['State'] = GqlResolversParentTypes['State']> = ResolversObject<{
  code?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  countryCode?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Target'] = GqlResolversParentTypes['Target']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  group?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  index?: Resolver<Maybe<GqlResolversTypes['Index']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  validFrom?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  validTo?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  value?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetAddGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetAddGroupPayload'] = GqlResolversParentTypes['TargetAddGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetAddGroupSuccess', ParentType, ContextType>;
}>;

export type GqlTargetAddGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetAddGroupSuccess'] = GqlResolversParentTypes['TargetAddGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetAddOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetAddOrganizationPayload'] = GqlResolversParentTypes['TargetAddOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetAddOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlTargetAddOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetAddOrganizationSuccess'] = GqlResolversParentTypes['TargetAddOrganizationSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetCreatePayload'] = GqlResolversParentTypes['TargetCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetCreateSuccess', ParentType, ContextType>;
}>;

export type GqlTargetCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetCreateSuccess'] = GqlResolversParentTypes['TargetCreateSuccess']> = ResolversObject<{
  target?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetDeletePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetDeletePayload'] = GqlResolversParentTypes['TargetDeletePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetDeleteSuccess', ParentType, ContextType>;
}>;

export type GqlTargetDeleteSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetDeleteSuccess'] = GqlResolversParentTypes['TargetDeleteSuccess']> = ResolversObject<{
  targetId?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetEdge'] = GqlResolversParentTypes['TargetEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetRemoveGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetRemoveGroupPayload'] = GqlResolversParentTypes['TargetRemoveGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetRemoveGroupSuccess', ParentType, ContextType>;
}>;

export type GqlTargetRemoveGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetRemoveGroupSuccess'] = GqlResolversParentTypes['TargetRemoveGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetRemoveOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetRemoveOrganizationPayload'] = GqlResolversParentTypes['TargetRemoveOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetRemoveOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlTargetRemoveOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetRemoveOrganizationSuccess'] = GqlResolversParentTypes['TargetRemoveOrganizationSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateContentPayload'] = GqlResolversParentTypes['TargetUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlTargetUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateContentSuccess'] = GqlResolversParentTypes['TargetUpdateContentSuccess']> = ResolversObject<{
  target?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetUpdateIndexPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateIndexPayload'] = GqlResolversParentTypes['TargetUpdateIndexPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetUpdateIndexSuccess', ParentType, ContextType>;
}>;

export type GqlTargetUpdateIndexSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateIndexSuccess'] = GqlResolversParentTypes['TargetUpdateIndexSuccess']> = ResolversObject<{
  index?: Resolver<GqlResolversTypes['Index'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetsConnection'] = GqlResolversParentTypes['TargetsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TargetEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['User'] = GqlResolversParentTypes['User']> = ResolversObject<{
  activities?: Resolver<Maybe<Array<GqlResolversTypes['Activity']>>, ParentType, ContextType>;
  agendas?: Resolver<Maybe<Array<GqlResolversTypes['Agenda']>>, ParentType, ContextType>;
  bio?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  cities?: Resolver<Maybe<Array<GqlResolversTypes['City']>>, ParentType, ContextType>;
  comments?: Resolver<Maybe<Array<GqlResolversTypes['Comment']>>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  email?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  groups?: Resolver<Maybe<Array<GqlResolversTypes['Group']>>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  lastName?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  likes?: Resolver<Maybe<Array<GqlResolversTypes['Like']>>, ParentType, ContextType>;
  middleName?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  organizations?: Resolver<Maybe<Array<GqlResolversTypes['Organization']>>, ParentType, ContextType>;
  sysRole?: Resolver<GqlResolversTypes['SysRole'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
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

export type GqlUserUpdateActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateActivityPayload'] = GqlResolversParentTypes['UserUpdateActivityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateActivitySuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateActivitySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateActivitySuccess'] = GqlResolversParentTypes['UserUpdateActivitySuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateContentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateContentPayload'] = GqlResolversParentTypes['UserUpdateContentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateContentSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateContentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateContentSuccess'] = GqlResolversParentTypes['UserUpdateContentSuccess']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateGroupPayload'] = GqlResolversParentTypes['UserUpdateGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateGroupSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateGroupSuccess'] = GqlResolversParentTypes['UserUpdateGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateOrganizationPayload'] = GqlResolversParentTypes['UserUpdateOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdateOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateOrganizationSuccess'] = GqlResolversParentTypes['UserUpdateOrganizationSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUsersConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UsersConnection'] = GqlResolversParentTypes['UsersConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlResolvers<ContextType = Context> = ResolversObject<{
  Activities?: GqlActivitiesResolvers<ContextType>;
  ActivitiesConnection?: GqlActivitiesConnectionResolvers<ContextType>;
  Activity?: GqlActivityResolvers<ContextType>;
  ActivityCreatePayload?: GqlActivityCreatePayloadResolvers<ContextType>;
  ActivityCreateSuccess?: GqlActivityCreateSuccessResolvers<ContextType>;
  ActivityDeletePayload?: GqlActivityDeletePayloadResolvers<ContextType>;
  ActivityDeleteSuccess?: GqlActivityDeleteSuccessResolvers<ContextType>;
  ActivityEdge?: GqlActivityEdgeResolvers<ContextType>;
  ActivitySwitchPrivacyPayload?: GqlActivitySwitchPrivacyPayloadResolvers<ContextType>;
  ActivitySwitchPrivacySuccess?: GqlActivitySwitchPrivacySuccessResolvers<ContextType>;
  ActivityUpdateContentPayload?: GqlActivityUpdateContentPayloadResolvers<ContextType>;
  ActivityUpdateContentSuccess?: GqlActivityUpdateContentSuccessResolvers<ContextType>;
  ActivityUpdateEventPayload?: GqlActivityUpdateEventPayloadResolvers<ContextType>;
  ActivityUpdateEventSuccess?: GqlActivityUpdateEventSuccessResolvers<ContextType>;
  ActivityUpdateUserPayload?: GqlActivityUpdateUserPayloadResolvers<ContextType>;
  ActivityUpdateUserSuccess?: GqlActivityUpdateUserSuccessResolvers<ContextType>;
  Agenda?: GqlAgendaResolvers<ContextType>;
  Application?: GqlApplicationResolvers<ContextType>;
  ApplicationAddConfirmationPayload?: GqlApplicationAddConfirmationPayloadResolvers<ContextType>;
  ApplicationAddConfirmationSuccess?: GqlApplicationAddConfirmationSuccessResolvers<ContextType>;
  ApplicationConfirmation?: GqlApplicationConfirmationResolvers<ContextType>;
  ApplicationCreatePayload?: GqlApplicationCreatePayloadResolvers<ContextType>;
  ApplicationCreateSuccess?: GqlApplicationCreateSuccessResolvers<ContextType>;
  ApplicationDeleteConfirmationPayload?: GqlApplicationDeleteConfirmationPayloadResolvers<ContextType>;
  ApplicationDeleteConfirmationSuccess?: GqlApplicationDeleteConfirmationSuccessResolvers<ContextType>;
  ApplicationDeletePayload?: GqlApplicationDeletePayloadResolvers<ContextType>;
  ApplicationDeleteSuccess?: GqlApplicationDeleteSuccessResolvers<ContextType>;
  ApplicationEdge?: GqlApplicationEdgeResolvers<ContextType>;
  ApplicationSwitchIsApprovedPayload?: GqlApplicationSwitchIsApprovedPayloadResolvers<ContextType>;
  ApplicationSwitchIsApprovedSuccess?: GqlApplicationSwitchIsApprovedSuccessResolvers<ContextType>;
  ApplicationSwitchPrivacyPayload?: GqlApplicationSwitchPrivacyPayloadResolvers<ContextType>;
  ApplicationSwitchPrivacySuccess?: GqlApplicationSwitchPrivacySuccessResolvers<ContextType>;
  ApplicationUpdateCommentPayload?: GqlApplicationUpdateCommentPayloadResolvers<ContextType>;
  ApplicationUpdateCommentSuccess?: GqlApplicationUpdateCommentSuccessResolvers<ContextType>;
  ApplicationUpdateConfirmationCommentPayload?: GqlApplicationUpdateConfirmationCommentPayloadResolvers<ContextType>;
  ApplicationUpdateConfirmationCommentSuccess?: GqlApplicationUpdateConfirmationCommentSuccessResolvers<ContextType>;
  ApplicationsConnection?: GqlApplicationsConnectionResolvers<ContextType>;
  AuthError?: GqlAuthErrorResolvers<ContextType>;
  City?: GqlCityResolvers<ContextType>;
  Comment?: GqlCommentResolvers<ContextType>;
  CommentAddEventPayload?: GqlCommentAddEventPayloadResolvers<ContextType>;
  CommentAddEventSuccess?: GqlCommentAddEventSuccessResolvers<ContextType>;
  CommentDeletePayload?: GqlCommentDeletePayloadResolvers<ContextType>;
  CommentDeleteSuccess?: GqlCommentDeleteSuccessResolvers<ContextType>;
  CommentUpdateContentPayload?: GqlCommentUpdateContentPayloadResolvers<ContextType>;
  CommentUpdateContentSuccess?: GqlCommentUpdateContentSuccessResolvers<ContextType>;
  Comments?: GqlCommentsResolvers<ContextType>;
  CommonError?: GqlCommonErrorResolvers<ContextType>;
  ComplexQueryError?: GqlComplexQueryErrorResolvers<ContextType>;
  CurrentUserPayload?: GqlCurrentUserPayloadResolvers<ContextType>;
  CustomTokenCreatePayload?: GqlCustomTokenCreatePayloadResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Event?: GqlEventResolvers<ContextType>;
  EventDeletePayload?: GqlEventDeletePayloadResolvers<ContextType>;
  EventDeleteSuccess?: GqlEventDeleteSuccessResolvers<ContextType>;
  EventEdge?: GqlEventEdgeResolvers<ContextType>;
  EventPlanPayload?: GqlEventPlanPayloadResolvers<ContextType>;
  EventPlanSuccess?: GqlEventPlanSuccessResolvers<ContextType>;
  EventUpdateContentPayload?: GqlEventUpdateContentPayloadResolvers<ContextType>;
  EventUpdateContentSuccess?: GqlEventUpdateContentSuccessResolvers<ContextType>;
  EventUpdateGroupPayload?: GqlEventUpdateGroupPayloadResolvers<ContextType>;
  EventUpdateGroupSuccess?: GqlEventUpdateGroupSuccessResolvers<ContextType>;
  EventUpdateOrganizationPayload?: GqlEventUpdateOrganizationPayloadResolvers<ContextType>;
  EventUpdateOrganizationSuccess?: GqlEventUpdateOrganizationSuccessResolvers<ContextType>;
  EventUpdatePrivacyPayload?: GqlEventUpdatePrivacyPayloadResolvers<ContextType>;
  EventUpdatePrivacySuccess?: GqlEventUpdatePrivacySuccessResolvers<ContextType>;
  EventsConnection?: GqlEventsConnectionResolvers<ContextType>;
  Field?: GqlFieldResolvers<ContextType>;
  Group?: GqlGroupResolvers<ContextType>;
  GroupChangeOrganizationPayload?: GqlGroupChangeOrganizationPayloadResolvers<ContextType>;
  GroupChangeOrganizationSuccess?: GqlGroupChangeOrganizationSuccessResolvers<ContextType>;
  GroupCreatePayload?: GqlGroupCreatePayloadResolvers<ContextType>;
  GroupCreateSuccess?: GqlGroupCreateSuccessResolvers<ContextType>;
  GroupDeletePayload?: GqlGroupDeletePayloadResolvers<ContextType>;
  GroupDeleteSuccess?: GqlGroupDeleteSuccessResolvers<ContextType>;
  GroupEdge?: GqlGroupEdgeResolvers<ContextType>;
  GroupUpdateChildPayload?: GqlGroupUpdateChildPayloadResolvers<ContextType>;
  GroupUpdateChildSuccess?: GqlGroupUpdateChildSuccessResolvers<ContextType>;
  GroupUpdateContentPayload?: GqlGroupUpdateContentPayloadResolvers<ContextType>;
  GroupUpdateContentSuccess?: GqlGroupUpdateContentSuccessResolvers<ContextType>;
  GroupUpdateEventPayload?: GqlGroupUpdateEventPayloadResolvers<ContextType>;
  GroupUpdateEventSuccess?: GqlGroupUpdateEventSuccessResolvers<ContextType>;
  GroupUpdateParentPayload?: GqlGroupUpdateParentPayloadResolvers<ContextType>;
  GroupUpdateParentSuccess?: GqlGroupUpdateParentSuccessResolvers<ContextType>;
  GroupUpdateTargetPayload?: GqlGroupUpdateTargetPayloadResolvers<ContextType>;
  GroupUpdateTargetSuccess?: GqlGroupUpdateTargetSuccessResolvers<ContextType>;
  GroupUpdateUserPayload?: GqlGroupUpdateUserPayloadResolvers<ContextType>;
  GroupUpdateUserSuccess?: GqlGroupUpdateUserSuccessResolvers<ContextType>;
  GroupsConnection?: GqlGroupsConnectionResolvers<ContextType>;
  Index?: GqlIndexResolvers<ContextType>;
  InvalidInputValueError?: GqlInvalidInputValueErrorResolvers<ContextType>;
  Issue?: GqlIssueResolvers<ContextType>;
  IssueAddCategoryPayload?: GqlIssueAddCategoryPayloadResolvers<ContextType>;
  IssueAddCategorySuccess?: GqlIssueAddCategorySuccessResolvers<ContextType>;
  IssueAddCityPayload?: GqlIssueAddCityPayloadResolvers<ContextType>;
  IssueAddCitySuccess?: GqlIssueAddCitySuccessResolvers<ContextType>;
  IssueAddGroupPayload?: GqlIssueAddGroupPayloadResolvers<ContextType>;
  IssueAddGroupSuccess?: GqlIssueAddGroupSuccessResolvers<ContextType>;
  IssueAddOrganizationPayload?: GqlIssueAddOrganizationPayloadResolvers<ContextType>;
  IssueAddOrganizationSuccess?: GqlIssueAddOrganizationSuccessResolvers<ContextType>;
  IssueAddSkillsetPayload?: GqlIssueAddSkillsetPayloadResolvers<ContextType>;
  IssueAddSkillsetSuccess?: GqlIssueAddSkillsetSuccessResolvers<ContextType>;
  IssueCategory?: GqlIssueCategoryResolvers<ContextType>;
  IssueCreatePayload?: GqlIssueCreatePayloadResolvers<ContextType>;
  IssueCreateSuccess?: GqlIssueCreateSuccessResolvers<ContextType>;
  IssueDeletePayload?: GqlIssueDeletePayloadResolvers<ContextType>;
  IssueDeleteSuccess?: GqlIssueDeleteSuccessResolvers<ContextType>;
  IssueEdge?: GqlIssueEdgeResolvers<ContextType>;
  IssueRemoveCategoryPayload?: GqlIssueRemoveCategoryPayloadResolvers<ContextType>;
  IssueRemoveCategorySuccess?: GqlIssueRemoveCategorySuccessResolvers<ContextType>;
  IssueRemoveCityPayload?: GqlIssueRemoveCityPayloadResolvers<ContextType>;
  IssueRemoveCitySuccess?: GqlIssueRemoveCitySuccessResolvers<ContextType>;
  IssueRemoveGroupPayload?: GqlIssueRemoveGroupPayloadResolvers<ContextType>;
  IssueRemoveGroupSuccess?: GqlIssueRemoveGroupSuccessResolvers<ContextType>;
  IssueRemoveOrganizationPayload?: GqlIssueRemoveOrganizationPayloadResolvers<ContextType>;
  IssueRemoveOrganizationSuccess?: GqlIssueRemoveOrganizationSuccessResolvers<ContextType>;
  IssueRemoveSkillsetPayload?: GqlIssueRemoveSkillsetPayloadResolvers<ContextType>;
  IssueRemoveSkillsetSuccess?: GqlIssueRemoveSkillsetSuccessResolvers<ContextType>;
  IssueUpdateContentPayload?: GqlIssueUpdateContentPayloadResolvers<ContextType>;
  IssueUpdateContentSuccess?: GqlIssueUpdateContentSuccessResolvers<ContextType>;
  IssueUpdatePrivacyPayload?: GqlIssueUpdatePrivacyPayloadResolvers<ContextType>;
  IssueUpdatePrivacySuccess?: GqlIssueUpdatePrivacySuccessResolvers<ContextType>;
  IssuesConnection?: GqlIssuesConnectionResolvers<ContextType>;
  Like?: GqlLikeResolvers<ContextType>;
  LikeAddEventPayload?: GqlLikeAddEventPayloadResolvers<ContextType>;
  LikeAddEventSuccess?: GqlLikeAddEventSuccessResolvers<ContextType>;
  LikeDeletePayload?: GqlLikeDeletePayloadResolvers<ContextType>;
  LikeDeleteSuccess?: GqlLikeDeleteSuccessResolvers<ContextType>;
  Likes?: GqlLikesResolvers<ContextType>;
  Mutation?: GqlMutationResolvers<ContextType>;
  Organization?: GqlOrganizationResolvers<ContextType>;
  OrganizationAddGroupPayload?: GqlOrganizationAddGroupPayloadResolvers<ContextType>;
  OrganizationAddGroupSuccess?: GqlOrganizationAddGroupSuccessResolvers<ContextType>;
  OrganizationAddTargetPayload?: GqlOrganizationAddTargetPayloadResolvers<ContextType>;
  OrganizationAddTargetSuccess?: GqlOrganizationAddTargetSuccessResolvers<ContextType>;
  OrganizationAddUserPayload?: GqlOrganizationAddUserPayloadResolvers<ContextType>;
  OrganizationAddUserSuccess?: GqlOrganizationAddUserSuccessResolvers<ContextType>;
  OrganizationCreatePayload?: GqlOrganizationCreatePayloadResolvers<ContextType>;
  OrganizationCreateSuccess?: GqlOrganizationCreateSuccessResolvers<ContextType>;
  OrganizationDeletePayload?: GqlOrganizationDeletePayloadResolvers<ContextType>;
  OrganizationDeleteSuccess?: GqlOrganizationDeleteSuccessResolvers<ContextType>;
  OrganizationEdge?: GqlOrganizationEdgeResolvers<ContextType>;
  OrganizationRemoveGroupPayload?: GqlOrganizationRemoveGroupPayloadResolvers<ContextType>;
  OrganizationRemoveGroupSuccess?: GqlOrganizationRemoveGroupSuccessResolvers<ContextType>;
  OrganizationRemoveTargetPayload?: GqlOrganizationRemoveTargetPayloadResolvers<ContextType>;
  OrganizationRemoveTargetSuccess?: GqlOrganizationRemoveTargetSuccessResolvers<ContextType>;
  OrganizationRemoveUserPayload?: GqlOrganizationRemoveUserPayloadResolvers<ContextType>;
  OrganizationRemoveUserSuccess?: GqlOrganizationRemoveUserSuccessResolvers<ContextType>;
  OrganizationUpdateContentPayload?: GqlOrganizationUpdateContentPayloadResolvers<ContextType>;
  OrganizationUpdateContentSuccess?: GqlOrganizationUpdateContentSuccessResolvers<ContextType>;
  OrganizationUpdateDefaultPayload?: GqlOrganizationUpdateDefaultPayloadResolvers<ContextType>;
  OrganizationUpdateDefaultSuccess?: GqlOrganizationUpdateDefaultSuccessResolvers<ContextType>;
  OrganizationUpdatePrivacyPayload?: GqlOrganizationUpdatePrivacyPayloadResolvers<ContextType>;
  OrganizationUpdatePrivacySuccess?: GqlOrganizationUpdatePrivacySuccessResolvers<ContextType>;
  Organizations?: GqlOrganizationsResolvers<ContextType>;
  OrganizationsConnection?: GqlOrganizationsConnectionResolvers<ContextType>;
  PageInfo?: GqlPageInfoResolvers<ContextType>;
  Paging?: GqlPagingResolvers<ContextType>;
  Query?: GqlQueryResolvers<ContextType>;
  Skillset?: GqlSkillsetResolvers<ContextType>;
  State?: GqlStateResolvers<ContextType>;
  Target?: GqlTargetResolvers<ContextType>;
  TargetAddGroupPayload?: GqlTargetAddGroupPayloadResolvers<ContextType>;
  TargetAddGroupSuccess?: GqlTargetAddGroupSuccessResolvers<ContextType>;
  TargetAddOrganizationPayload?: GqlTargetAddOrganizationPayloadResolvers<ContextType>;
  TargetAddOrganizationSuccess?: GqlTargetAddOrganizationSuccessResolvers<ContextType>;
  TargetCreatePayload?: GqlTargetCreatePayloadResolvers<ContextType>;
  TargetCreateSuccess?: GqlTargetCreateSuccessResolvers<ContextType>;
  TargetDeletePayload?: GqlTargetDeletePayloadResolvers<ContextType>;
  TargetDeleteSuccess?: GqlTargetDeleteSuccessResolvers<ContextType>;
  TargetEdge?: GqlTargetEdgeResolvers<ContextType>;
  TargetRemoveGroupPayload?: GqlTargetRemoveGroupPayloadResolvers<ContextType>;
  TargetRemoveGroupSuccess?: GqlTargetRemoveGroupSuccessResolvers<ContextType>;
  TargetRemoveOrganizationPayload?: GqlTargetRemoveOrganizationPayloadResolvers<ContextType>;
  TargetRemoveOrganizationSuccess?: GqlTargetRemoveOrganizationSuccessResolvers<ContextType>;
  TargetUpdateContentPayload?: GqlTargetUpdateContentPayloadResolvers<ContextType>;
  TargetUpdateContentSuccess?: GqlTargetUpdateContentSuccessResolvers<ContextType>;
  TargetUpdateIndexPayload?: GqlTargetUpdateIndexPayloadResolvers<ContextType>;
  TargetUpdateIndexSuccess?: GqlTargetUpdateIndexSuccessResolvers<ContextType>;
  TargetsConnection?: GqlTargetsConnectionResolvers<ContextType>;
  User?: GqlUserResolvers<ContextType>;
  UserCreatePayload?: GqlUserCreatePayloadResolvers<ContextType>;
  UserCreateSuccess?: GqlUserCreateSuccessResolvers<ContextType>;
  UserDeletePayload?: GqlUserDeletePayloadResolvers<ContextType>;
  UserDeleteSuccess?: GqlUserDeleteSuccessResolvers<ContextType>;
  UserEdge?: GqlUserEdgeResolvers<ContextType>;
  UserSwitchPrivacyPayload?: GqlUserSwitchPrivacyPayloadResolvers<ContextType>;
  UserSwitchPrivacySuccess?: GqlUserSwitchPrivacySuccessResolvers<ContextType>;
  UserUpdateActivityPayload?: GqlUserUpdateActivityPayloadResolvers<ContextType>;
  UserUpdateActivitySuccess?: GqlUserUpdateActivitySuccessResolvers<ContextType>;
  UserUpdateContentPayload?: GqlUserUpdateContentPayloadResolvers<ContextType>;
  UserUpdateContentSuccess?: GqlUserUpdateContentSuccessResolvers<ContextType>;
  UserUpdateGroupPayload?: GqlUserUpdateGroupPayloadResolvers<ContextType>;
  UserUpdateGroupSuccess?: GqlUserUpdateGroupSuccessResolvers<ContextType>;
  UserUpdateOrganizationPayload?: GqlUserUpdateOrganizationPayloadResolvers<ContextType>;
  UserUpdateOrganizationSuccess?: GqlUserUpdateOrganizationSuccessResolvers<ContextType>;
  UsersConnection?: GqlUsersConnectionResolvers<ContextType>;
}>;


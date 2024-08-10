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
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endsAt: Scalars['Datetime']['output'];
  event: GqlEvent;
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isPublic: Scalars['Boolean']['output'];
  remark?: Maybe<Scalars['String']['output']>;
  startsAt: Scalars['Datetime']['output'];
  totalMinutes: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
};

export type GqlActivityAddEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlActivityAddEventPayload = GqlActivityAddEventSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityAddEventSuccess = {
  __typename?: 'ActivityAddEventSuccess';
  activity: GqlActivity;
  event: GqlEvent;
};

export type GqlActivityAddUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlActivityAddUserPayload = GqlActivityAddUserSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityAddUserSuccess = {
  __typename?: 'ActivityAddUserSuccess';
  activity: GqlActivity;
  user: GqlUser;
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
  keyword?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlActivityInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  eventId: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlActivityPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlActivityRemoveEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlActivityRemoveEventPayload = GqlActivityRemoveEventSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityRemoveEventSuccess = {
  __typename?: 'ActivityRemoveEventSuccess';
  activity: GqlActivity;
  event: GqlEvent;
};

export type GqlActivitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlActivityUpdatePayload = GqlActivityUpdateSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityUpdatePrivacyPayload = GqlActivityUpdatePrivacySuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityUpdatePrivacySuccess = {
  __typename?: 'ActivityUpdatePrivacySuccess';
  activity: GqlActivity;
};

export type GqlActivityUpdateSuccess = {
  __typename?: 'ActivityUpdateSuccess';
  activity: GqlActivity;
};

export type GqlActivityUpdateUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlActivityUpdateUserPayload = GqlActivityUpdateUserSuccess | GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlActivityUpdateUserSuccess = {
  __typename?: 'ActivityUpdateUserSuccess';
  activity: GqlActivity;
  user: GqlUser;
};

export type GqlAgenda = {
  __typename?: 'Agenda';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
};

export type GqlAuthError = GqlError & {
  __typename?: 'AuthError';
  message: Scalars['String']['output'];
  path: Array<Scalars['String']['output']>;
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
  event: GqlEvent;
  id: Scalars['ID']['output'];
  postedAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
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

export type GqlCommentUpdateInput = {
  content?: InputMaybe<Scalars['String']['input']>;
};

export type GqlCommentUpdatePayload = GqlAuthError | GqlCommentUpdateSuccess | GqlComplexQueryError | GqlInvalidInputValueError;

export type GqlCommentUpdateSuccess = {
  __typename?: 'CommentUpdateSuccess';
  comment: GqlComment;
};

export type GqlComments = {
  __typename?: 'Comments';
  data: Array<GqlComment>;
  total: Scalars['Int']['output'];
};

export type GqlComplexQueryError = GqlError & {
  __typename?: 'ComplexQueryError';
  message: Scalars['String']['output'];
  path: Array<Scalars['String']['output']>;
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
  path: Array<Scalars['String']['output']>;
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
  startsAt: Scalars['Datetime']['output'];
  totalMinutes: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlEventAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlEventAddGroupPayload = GqlAuthError | GqlComplexQueryError | GqlEventAddGroupSuccess | GqlInvalidInputValueError;

export type GqlEventAddGroupSuccess = {
  __typename?: 'EventAddGroupSuccess';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlEventAddOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlEventAddOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlEventAddOrganizationSuccess | GqlInvalidInputValueError;

export type GqlEventAddOrganizationSuccess = {
  __typename?: 'EventAddOrganizationSuccess';
  event: GqlEvent;
  organization: GqlOrganization;
};

export type GqlEventCreatePayload = GqlAuthError | GqlComplexQueryError | GqlEventCreateSuccess | GqlInvalidInputValueError;

export type GqlEventCreateSuccess = {
  __typename?: 'EventCreateSuccess';
  event?: Maybe<GqlEvent>;
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

export type GqlEventInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  plannedEndsAt?: InputMaybe<Scalars['Datetime']['input']>;
  plannedStartsAt?: InputMaybe<Scalars['Datetime']['input']>;
  startsAt: Scalars['Datetime']['input'];
};

export type GqlEventPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlEventRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlEventRemoveGroupPayload = GqlAuthError | GqlComplexQueryError | GqlEventRemoveGroupSuccess | GqlInvalidInputValueError;

export type GqlEventRemoveGroupSuccess = {
  __typename?: 'EventRemoveGroupSuccess';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlEventRemoveOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlEventRemoveOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlEventRemoveOrganizationSuccess | GqlInvalidInputValueError;

export type GqlEventRemoveOrganizationSuccess = {
  __typename?: 'EventRemoveOrganizationSuccess';
  event: GqlEvent;
  organization: GqlOrganization;
};

export type GqlEventSortInput = {
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlEventUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlEventUpdateSuccess | GqlInvalidInputValueError;

export type GqlEventUpdatePrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlEventUpdatePrivacySuccess | GqlInvalidInputValueError;

export type GqlEventUpdatePrivacySuccess = {
  __typename?: 'EventUpdatePrivacySuccess';
  event: GqlEvent;
};

export type GqlEventUpdateSuccess = {
  __typename?: 'EventUpdateSuccess';
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

export type GqlGroupAddChildPayload = GqlAuthError | GqlComplexQueryError | GqlGroupAddChildSuccess | GqlInvalidInputValueError;

export type GqlGroupAddChildSuccess = {
  __typename?: 'GroupAddChildSuccess';
  child: GqlGroup;
  group: GqlGroup;
};

export type GqlGroupAddEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlGroupAddEventPayload = GqlAuthError | GqlComplexQueryError | GqlGroupAddEventSuccess | GqlInvalidInputValueError;

export type GqlGroupAddEventSuccess = {
  __typename?: 'GroupAddEventSuccess';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlGroupAddParentInput = {
  parentId: Scalars['String']['input'];
};

export type GqlGroupAddParentPayload = GqlAuthError | GqlComplexQueryError | GqlGroupAddParentSuccess | GqlInvalidInputValueError;

export type GqlGroupAddParentSuccess = {
  __typename?: 'GroupAddParentSuccess';
  group: GqlGroup;
  parent: GqlGroup;
};

export type GqlGroupAddTargetInput = {
  targetId: Scalars['String']['input'];
};

export type GqlGroupAddTargetPayload = GqlAuthError | GqlComplexQueryError | GqlGroupAddTargetSuccess | GqlInvalidInputValueError;

export type GqlGroupAddTargetSuccess = {
  __typename?: 'GroupAddTargetSuccess';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlGroupAddUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlGroupAddUserPayload = GqlAuthError | GqlComplexQueryError | GqlGroupAddUserSuccess | GqlInvalidInputValueError;

export type GqlGroupAddUserSuccess = {
  __typename?: 'GroupAddUserSuccess';
  group: GqlGroup;
  user: GqlUser;
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
  keyword?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlGroupInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlGroupRemoveChildInput = {
  childId: Scalars['String']['input'];
};

export type GqlGroupRemoveChildPayload = GqlAuthError | GqlComplexQueryError | GqlGroupRemoveChildSuccess | GqlInvalidInputValueError;

export type GqlGroupRemoveChildSuccess = {
  __typename?: 'GroupRemoveChildSuccess';
  child: GqlGroup;
  group: GqlGroup;
};

export type GqlGroupRemoveEventInput = {
  eventId: Scalars['String']['input'];
};

export type GqlGroupRemoveEventPayload = GqlAuthError | GqlComplexQueryError | GqlGroupRemoveEventSuccess | GqlInvalidInputValueError;

export type GqlGroupRemoveEventSuccess = {
  __typename?: 'GroupRemoveEventSuccess';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlGroupRemoveParentInput = {
  parentId: Scalars['String']['input'];
};

export type GqlGroupRemoveParentPayload = GqlAuthError | GqlComplexQueryError | GqlGroupRemoveParentSuccess | GqlInvalidInputValueError;

export type GqlGroupRemoveParentSuccess = {
  __typename?: 'GroupRemoveParentSuccess';
  group: GqlGroup;
  parent: GqlGroup;
};

export type GqlGroupRemoveTargetInput = {
  targetId: Scalars['String']['input'];
};

export type GqlGroupRemoveTargetPayload = GqlAuthError | GqlComplexQueryError | GqlGroupRemoveTargetSuccess | GqlInvalidInputValueError;

export type GqlGroupRemoveTargetSuccess = {
  __typename?: 'GroupRemoveTargetSuccess';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlGroupRemoveUserInput = {
  userId: Scalars['String']['input'];
};

export type GqlGroupRemoveUserPayload = GqlAuthError | GqlComplexQueryError | GqlGroupRemoveUserSuccess | GqlInvalidInputValueError;

export type GqlGroupRemoveUserSuccess = {
  __typename?: 'GroupRemoveUserSuccess';
  group: GqlGroup;
  user: GqlUser;
};

export type GqlGroupSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlGroupUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlGroupUpdateSuccess | GqlInvalidInputValueError;

export type GqlGroupUpdateSuccess = {
  __typename?: 'GroupUpdateSuccess';
  group: GqlGroup;
};

export type GqlGroupsConnection = {
  __typename?: 'GroupsConnection';
  edges?: Maybe<Array<Maybe<GqlGroupEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlIndex = {
  __typename?: 'Index';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  valueType: GqlValueType;
};

export type GqlInvalidInputValueError = GqlError & {
  __typename?: 'InvalidInputValueError';
  fields: Array<Maybe<GqlField>>;
  message: Scalars['String']['output'];
  path: Array<Scalars['String']['output']>;
};

export type GqlLike = {
  __typename?: 'Like';
  createdAt: Scalars['Datetime']['output'];
  event: GqlEvent;
  postedAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
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
  activityAddEvent?: Maybe<GqlActivityAddEventPayload>;
  activityAddUser?: Maybe<GqlActivityAddUserPayload>;
  activityCreate?: Maybe<GqlActivityCreatePayload>;
  activityDelete?: Maybe<GqlActivityDeletePayload>;
  activityPublish?: Maybe<GqlActivityUpdatePrivacyPayload>;
  activityRemoveEvent?: Maybe<GqlActivityRemoveEventPayload>;
  activityUnpublish?: Maybe<GqlActivityUpdatePrivacyPayload>;
  activityUpdate?: Maybe<GqlActivityUpdatePayload>;
  activityUpdateUser?: Maybe<GqlActivityUpdateUserPayload>;
  commentAddEvent?: Maybe<GqlCommentAddEventPayload>;
  commentDelete?: Maybe<GqlCommentDeletePayload>;
  commentUpdate?: Maybe<GqlCommentUpdatePayload>;
  eventAddGroup?: Maybe<GqlEventAddGroupPayload>;
  eventAddOrganization?: Maybe<GqlEventAddOrganizationPayload>;
  eventCreate?: Maybe<GqlEventCreatePayload>;
  eventDelete?: Maybe<GqlEventDeletePayload>;
  eventPublish?: Maybe<GqlEventUpdatePrivacyPayload>;
  eventRemoveGroup?: Maybe<GqlEventRemoveGroupPayload>;
  eventRemoveOrganization?: Maybe<GqlEventRemoveOrganizationPayload>;
  eventUnpublish?: Maybe<GqlEventUpdatePrivacyPayload>;
  eventUpdate?: Maybe<GqlEventUpdatePayload>;
  groupAddChild?: Maybe<GqlGroupAddChildPayload>;
  groupAddEvent?: Maybe<GqlGroupAddEventPayload>;
  groupAddParent?: Maybe<GqlGroupAddParentPayload>;
  groupAddTarget?: Maybe<GqlGroupAddTargetPayload>;
  groupAddUser?: Maybe<GqlGroupAddUserPayload>;
  groupCreate?: Maybe<GqlGroupCreatePayload>;
  groupDelete?: Maybe<GqlGroupDeletePayload>;
  groupRemoveChild?: Maybe<GqlGroupRemoveChildPayload>;
  groupRemoveEvent?: Maybe<GqlGroupRemoveEventPayload>;
  groupRemoveParent?: Maybe<GqlGroupRemoveParentPayload>;
  groupRemoveTarget?: Maybe<GqlGroupRemoveTargetPayload>;
  groupRemoveUser?: Maybe<GqlGroupRemoveUserPayload>;
  groupUpdate?: Maybe<GqlGroupUpdatePayload>;
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
  organizationUpdate?: Maybe<GqlOrganizationUpdatePayload>;
  targetAddGroup?: Maybe<GqlTargetAddGroupPayload>;
  targetAddOrganization?: Maybe<GqlTargetAddOrganizationPayload>;
  targetCreate?: Maybe<GqlTargetCreatePayload>;
  targetDelete?: Maybe<GqlTargetDeletePayload>;
  targetRemoveGroup?: Maybe<GqlTargetRemoveGroupPayload>;
  targetRemoveOrganization?: Maybe<GqlTargetRemoveOrganizationPayload>;
  targetUpdate?: Maybe<GqlTargetUpdatePayload>;
  targetUpdateIndex?: Maybe<GqlTargetUpdateIndexPayload>;
  userAddActivity?: Maybe<GqlUserAddActivityPayload>;
  userAddGroup?: Maybe<GqlUserAddGroupPayload>;
  userAddOrganization?: Maybe<GqlUserRemoveOrganizationPayload>;
  userCreate?: Maybe<GqlUserCreatePayload>;
  userDelete?: Maybe<GqlUserDeletePayload>;
  userPublish?: Maybe<GqlUserUpdatePrivacyPayload>;
  userRemoveActivity?: Maybe<GqlUserRemoveActivityPayload>;
  userRemoveGroup?: Maybe<GqlUserRemoveGroupPayload>;
  userRemoveOrganization?: Maybe<GqlUserRemoveOrganizationPayload>;
  userUnpublish?: Maybe<GqlUserUpdatePrivacyPayload>;
  userUpdate?: Maybe<GqlUserUpdatePayload>;
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
  input: GqlActivityInput;
};


export type GqlMutationActivityDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationActivityPublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityPrivacyInput;
};


export type GqlMutationActivityRemoveEventArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityRemoveEventInput;
};


export type GqlMutationActivityUnpublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityPrivacyInput;
};


export type GqlMutationActivityUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityInput;
};


export type GqlMutationActivityUpdateUserArgs = {
  id: Scalars['ID']['input'];
  input: GqlActivityUpdateUserInput;
};


export type GqlMutationCommentAddEventArgs = {
  input: GqlCommentAddEventInput;
};


export type GqlMutationCommentDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationCommentUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlCommentUpdateInput;
};


export type GqlMutationEventAddGroupArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventAddGroupInput;
};


export type GqlMutationEventAddOrganizationArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventAddOrganizationInput;
};


export type GqlMutationEventCreateArgs = {
  input: GqlEventInput;
};


export type GqlMutationEventDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationEventPublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventPrivacyInput;
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
  input: GqlEventPrivacyInput;
};


export type GqlMutationEventUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlEventInput;
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


export type GqlMutationGroupCreateArgs = {
  input: GqlGroupInput;
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


export type GqlMutationGroupUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlGroupInput;
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
  input: GqlOrganizationInput;
};


export type GqlMutationOrganizationDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationOrganizationPublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationPrivacyInput;
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
  input: GqlOrganizationPrivacyInput;
};


export type GqlMutationOrganizationUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlOrganizationInput;
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
  input: GqlTargetInput;
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


export type GqlMutationTargetUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlTargetInput;
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
  input: GqlUserInput;
};


export type GqlMutationUserDeleteArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationUserPublishArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserPrivacyInput;
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
  input: GqlUserPrivacyInput;
};


export type GqlMutationUserUpdateArgs = {
  id: Scalars['ID']['input'];
  input: GqlUserInput;
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

export type GqlOrganizationInput = {
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
  website?: InputMaybe<Scalars['String']['input']>;
  zipcode: Scalars['String']['input'];
};

export type GqlOrganizationPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
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

export type GqlOrganizationUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationUpdateSuccess;

export type GqlOrganizationUpdatePrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlOrganizationUpdatePrivacySuccess;

export type GqlOrganizationUpdatePrivacySuccess = {
  __typename?: 'OrganizationUpdatePrivacySuccess';
  organization: GqlOrganization;
};

export type GqlOrganizationUpdateSuccess = {
  __typename?: 'OrganizationUpdateSuccess';
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
  cities: Array<GqlCity>;
  echo: Scalars['String']['output'];
  event?: Maybe<GqlEvent>;
  events: GqlEventsConnection;
  group?: Maybe<GqlGroup>;
  groups: GqlGroupsConnection;
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

export type GqlTargetInput = {
  groupId: Scalars['String']['input'];
  indexId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  validFrom: Scalars['Datetime']['input'];
  validTo: Scalars['Datetime']['input'];
  value: Scalars['Float']['input'];
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

export type GqlTargetUpdateIndexInput = {
  indexId: Scalars['Int']['input'];
};

export type GqlTargetUpdateIndexPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetUpdateIndexSuccess;

export type GqlTargetUpdateIndexSuccess = {
  __typename?: 'TargetUpdateIndexSuccess';
  index: GqlIndex;
  target: GqlTarget;
};

export type GqlTargetUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlTargetUpdateSuccess;

export type GqlTargetUpdateSuccess = {
  __typename?: 'TargetUpdateSuccess';
  target?: Maybe<GqlTarget>;
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
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
};

export type GqlUserAddActivityInput = {
  activityId: Scalars['String']['input'];
};

export type GqlUserAddActivityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserAddActivitySuccess;

export type GqlUserAddActivitySuccess = {
  __typename?: 'UserAddActivitySuccess';
  activity: GqlActivity;
  user?: Maybe<GqlUser>;
};

export type GqlUserAddGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlUserAddGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserAddGroupSuccess;

export type GqlUserAddGroupSuccess = {
  __typename?: 'UserAddGroupSuccess';
  group: GqlGroup;
  user: GqlUser;
};

export type GqlUserAddOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlUserAddOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserAddOrganizationSuccess;

export type GqlUserAddOrganizationSuccess = {
  __typename?: 'UserAddOrganizationSuccess';
  organization: GqlOrganization;
  user: GqlUser;
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

export type GqlUserInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlUserRemoveActivityInput = {
  activityId: Scalars['String']['input'];
};

export type GqlUserRemoveActivityPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserRemoveActivitySuccess;

export type GqlUserRemoveActivitySuccess = {
  __typename?: 'UserRemoveActivitySuccess';
  activity: GqlActivity;
  user: GqlUser;
};

export type GqlUserRemoveGroupInput = {
  groupId: Scalars['String']['input'];
};

export type GqlUserRemoveGroupPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserRemoveGroupSuccess;

export type GqlUserRemoveGroupSuccess = {
  __typename?: 'UserRemoveGroupSuccess';
  group: GqlGroup;
  user: GqlUser;
};

export type GqlUserRemoveOrganizationInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlUserRemoveOrganizationPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserRemoveOrganizationSuccess;

export type GqlUserRemoveOrganizationSuccess = {
  __typename?: 'UserRemoveOrganizationSuccess';
  organization: GqlOrganization;
  user: GqlUser;
};

export type GqlUserSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlUserUpdatePayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdateSuccess;

export type GqlUserUpdatePrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserUpdatePrivacySuccess;

export type GqlUserUpdatePrivacySuccess = {
  __typename?: 'UserUpdatePrivacySuccess';
  user: GqlUser;
};

export type GqlUserUpdateSuccess = {
  __typename?: 'UserUpdateSuccess';
  user?: Maybe<GqlUser>;
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
  ActivityAddEventPayload: ( Omit<GqlActivityAddEventSuccess, 'activity' | 'event'> & { activity: _RefType['Activity'], event: _RefType['Event'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityAddUserPayload: ( Omit<GqlActivityAddUserSuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user: _RefType['User'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityCreatePayload: ( Omit<GqlActivityCreateSuccess, 'activity'> & { activity?: Maybe<_RefType['Activity']> } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityDeletePayload: ( GqlActivityDeleteSuccess ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityRemoveEventPayload: ( Omit<GqlActivityRemoveEventSuccess, 'activity' | 'event'> & { activity: _RefType['Activity'], event: _RefType['Event'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityUpdatePayload: ( Omit<GqlActivityUpdateSuccess, 'activity'> & { activity: _RefType['Activity'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityUpdatePrivacyPayload: ( Omit<GqlActivityUpdatePrivacySuccess, 'activity'> & { activity: _RefType['Activity'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  ActivityUpdateUserPayload: ( Omit<GqlActivityUpdateUserSuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user: _RefType['User'] } ) | ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommentAddEventPayload: ( GqlAuthError ) | ( Omit<GqlCommentAddEventSuccess, 'comment'> & { comment: _RefType['Comment'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommentDeletePayload: ( GqlAuthError ) | ( GqlCommentDeleteSuccess ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  CommentUpdatePayload: ( GqlAuthError ) | ( Omit<GqlCommentUpdateSuccess, 'comment'> & { comment: _RefType['Comment'] } ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
  EventAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventAddGroupSuccess, 'event' | 'group'> & { event: _RefType['Event'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  EventAddOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventAddOrganizationSuccess, 'event' | 'organization'> & { event: _RefType['Event'], organization: _RefType['Organization'] } ) | ( GqlInvalidInputValueError );
  EventCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventCreateSuccess, 'event'> & { event?: Maybe<_RefType['Event']> } ) | ( GqlInvalidInputValueError );
  EventDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlEventDeleteSuccess ) | ( GqlInvalidInputValueError );
  EventRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventRemoveGroupSuccess, 'event' | 'group'> & { event: _RefType['Event'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  EventRemoveOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventRemoveOrganizationSuccess, 'event' | 'organization'> & { event: _RefType['Event'], organization: _RefType['Organization'] } ) | ( GqlInvalidInputValueError );
  EventUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventUpdateSuccess, 'event'> & { event: _RefType['Event'] } ) | ( GqlInvalidInputValueError );
  EventUpdatePrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlEventUpdatePrivacySuccess, 'event'> & { event: _RefType['Event'] } ) | ( GqlInvalidInputValueError );
  GroupAddChildPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupAddChildSuccess, 'child' | 'group'> & { child: _RefType['Group'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupAddEventPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupAddEventSuccess, 'event' | 'group'> & { event: _RefType['Event'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupAddParentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupAddParentSuccess, 'group' | 'parent'> & { group: _RefType['Group'], parent: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupAddTargetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupAddTargetSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } ) | ( GqlInvalidInputValueError );
  GroupAddUserPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupAddUserSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } ) | ( GqlInvalidInputValueError );
  GroupCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupCreateSuccess, 'group'> & { group?: Maybe<_RefType['Group']> } ) | ( GqlInvalidInputValueError );
  GroupDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlGroupDeleteSuccess ) | ( GqlInvalidInputValueError );
  GroupRemoveChildPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupRemoveChildSuccess, 'child' | 'group'> & { child: _RefType['Group'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupRemoveEventPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupRemoveEventSuccess, 'event' | 'group'> & { event: _RefType['Event'], group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupRemoveParentPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupRemoveParentSuccess, 'group' | 'parent'> & { group: _RefType['Group'], parent: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
  GroupRemoveTargetPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupRemoveTargetSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } ) | ( GqlInvalidInputValueError );
  GroupRemoveUserPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupRemoveUserSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } ) | ( GqlInvalidInputValueError );
  GroupUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( Omit<GqlGroupUpdateSuccess, 'group'> & { group: _RefType['Group'] } ) | ( GqlInvalidInputValueError );
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
  OrganizationUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationUpdateSuccess, 'organization'> & { organization: _RefType['Organization'] } );
  OrganizationUpdatePrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlOrganizationUpdatePrivacySuccess, 'organization'> & { organization: _RefType['Organization'] } );
  TargetAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetAddGroupSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } );
  TargetAddOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetAddOrganizationSuccess, 'organization' | 'target'> & { organization: _RefType['Organization'], target: _RefType['Target'] } );
  TargetCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetCreateSuccess, 'target'> & { target?: Maybe<_RefType['Target']> } );
  TargetDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlTargetDeleteSuccess );
  TargetRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetRemoveGroupSuccess, 'group' | 'target'> & { group: _RefType['Group'], target: _RefType['Target'] } );
  TargetRemoveOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetRemoveOrganizationSuccess, 'organization' | 'target'> & { organization: _RefType['Organization'], target: _RefType['Target'] } );
  TargetUpdateIndexPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetUpdateIndexSuccess, 'index' | 'target'> & { index: _RefType['Index'], target: _RefType['Target'] } );
  TargetUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlTargetUpdateSuccess, 'target'> & { target?: Maybe<_RefType['Target']> } );
  UserAddActivityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserAddActivitySuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user?: Maybe<_RefType['User']> } );
  UserAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserAddGroupSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } );
  UserAddOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserAddOrganizationSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
  UserCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UserDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUserDeleteSuccess );
  UserRemoveActivityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserRemoveActivitySuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user: _RefType['User'] } );
  UserRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserRemoveGroupSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } );
  UserRemoveOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserRemoveOrganizationSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
  UserUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UserUpdatePrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdatePrivacySuccess, 'user'> & { user: _RefType['User'] } );
}>;

/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlActivityEdge, 'node'> & { node?: Maybe<_RefType['Activity']> } ) | ( Omit<GqlEventEdge, 'node'> & { node?: Maybe<_RefType['Event']> } ) | ( Omit<GqlGroupEdge, 'node'> & { node?: Maybe<_RefType['Group']> } ) | ( Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<_RefType['Organization']> } ) | ( Omit<GqlTargetEdge, 'node'> & { node?: Maybe<_RefType['Target']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } );
  Error: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  Activities: ResolverTypeWrapper<Omit<GqlActivities, 'data'> & { data: Array<GqlResolversTypes['Activity']> }>;
  ActivitiesConnection: ResolverTypeWrapper<Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ActivityEdge']>>> }>;
  Activity: ResolverTypeWrapper<Activity>;
  ActivityAddEventInput: GqlActivityAddEventInput;
  ActivityAddEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityAddEventPayload']>;
  ActivityAddEventSuccess: ResolverTypeWrapper<Omit<GqlActivityAddEventSuccess, 'activity' | 'event'> & { activity: GqlResolversTypes['Activity'], event: GqlResolversTypes['Event'] }>;
  ActivityAddUserInput: GqlActivityAddUserInput;
  ActivityAddUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityAddUserPayload']>;
  ActivityAddUserSuccess: ResolverTypeWrapper<Omit<GqlActivityAddUserSuccess, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user: GqlResolversTypes['User'] }>;
  ActivityCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityCreatePayload']>;
  ActivityCreateSuccess: ResolverTypeWrapper<Omit<GqlActivityCreateSuccess, 'activity'> & { activity?: Maybe<GqlResolversTypes['Activity']> }>;
  ActivityDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityDeletePayload']>;
  ActivityDeleteSuccess: ResolverTypeWrapper<GqlActivityDeleteSuccess>;
  ActivityEdge: ResolverTypeWrapper<Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Activity']> }>;
  ActivityFilterInput: GqlActivityFilterInput;
  ActivityInput: GqlActivityInput;
  ActivityPrivacyInput: GqlActivityPrivacyInput;
  ActivityRemoveEventInput: GqlActivityRemoveEventInput;
  ActivityRemoveEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityRemoveEventPayload']>;
  ActivityRemoveEventSuccess: ResolverTypeWrapper<Omit<GqlActivityRemoveEventSuccess, 'activity' | 'event'> & { activity: GqlResolversTypes['Activity'], event: GqlResolversTypes['Event'] }>;
  ActivitySortInput: GqlActivitySortInput;
  ActivityUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityUpdatePayload']>;
  ActivityUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityUpdatePrivacyPayload']>;
  ActivityUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlActivityUpdatePrivacySuccess, 'activity'> & { activity: GqlResolversTypes['Activity'] }>;
  ActivityUpdateSuccess: ResolverTypeWrapper<Omit<GqlActivityUpdateSuccess, 'activity'> & { activity: GqlResolversTypes['Activity'] }>;
  ActivityUpdateUserInput: GqlActivityUpdateUserInput;
  ActivityUpdateUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['ActivityUpdateUserPayload']>;
  ActivityUpdateUserSuccess: ResolverTypeWrapper<Omit<GqlActivityUpdateUserSuccess, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user: GqlResolversTypes['User'] }>;
  Agenda: ResolverTypeWrapper<Agenda>;
  AuthError: ResolverTypeWrapper<GqlAuthError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  City: ResolverTypeWrapper<City>;
  Comment: ResolverTypeWrapper<Comment>;
  CommentAddEventInput: GqlCommentAddEventInput;
  CommentAddEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommentAddEventPayload']>;
  CommentAddEventSuccess: ResolverTypeWrapper<Omit<GqlCommentAddEventSuccess, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  CommentDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommentDeletePayload']>;
  CommentDeleteSuccess: ResolverTypeWrapper<GqlCommentDeleteSuccess>;
  CommentUpdateInput: GqlCommentUpdateInput;
  CommentUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['CommentUpdatePayload']>;
  CommentUpdateSuccess: ResolverTypeWrapper<Omit<GqlCommentUpdateSuccess, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  Comments: ResolverTypeWrapper<Omit<GqlComments, 'data'> & { data: Array<GqlResolversTypes['Comment']> }>;
  ComplexQueryError: ResolverTypeWrapper<GqlComplexQueryError>;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  EntityPosition: GqlEntityPosition;
  Error: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Error']>;
  Event: ResolverTypeWrapper<Event>;
  EventAddGroupInput: GqlEventAddGroupInput;
  EventAddGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventAddGroupPayload']>;
  EventAddGroupSuccess: ResolverTypeWrapper<Omit<GqlEventAddGroupSuccess, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  EventAddOrganizationInput: GqlEventAddOrganizationInput;
  EventAddOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventAddOrganizationPayload']>;
  EventAddOrganizationSuccess: ResolverTypeWrapper<Omit<GqlEventAddOrganizationSuccess, 'event' | 'organization'> & { event: GqlResolversTypes['Event'], organization: GqlResolversTypes['Organization'] }>;
  EventCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventCreatePayload']>;
  EventCreateSuccess: ResolverTypeWrapper<Omit<GqlEventCreateSuccess, 'event'> & { event?: Maybe<GqlResolversTypes['Event']> }>;
  EventDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventDeletePayload']>;
  EventDeleteSuccess: ResolverTypeWrapper<GqlEventDeleteSuccess>;
  EventEdge: ResolverTypeWrapper<Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Event']> }>;
  EventFilterInput: GqlEventFilterInput;
  EventInput: GqlEventInput;
  EventPrivacyInput: GqlEventPrivacyInput;
  EventRemoveGroupInput: GqlEventRemoveGroupInput;
  EventRemoveGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventRemoveGroupPayload']>;
  EventRemoveGroupSuccess: ResolverTypeWrapper<Omit<GqlEventRemoveGroupSuccess, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  EventRemoveOrganizationInput: GqlEventRemoveOrganizationInput;
  EventRemoveOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventRemoveOrganizationPayload']>;
  EventRemoveOrganizationSuccess: ResolverTypeWrapper<Omit<GqlEventRemoveOrganizationSuccess, 'event' | 'organization'> & { event: GqlResolversTypes['Event'], organization: GqlResolversTypes['Organization'] }>;
  EventSortInput: GqlEventSortInput;
  EventUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventUpdatePayload']>;
  EventUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['EventUpdatePrivacyPayload']>;
  EventUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlEventUpdatePrivacySuccess, 'event'> & { event: GqlResolversTypes['Event'] }>;
  EventUpdateSuccess: ResolverTypeWrapper<Omit<GqlEventUpdateSuccess, 'event'> & { event: GqlResolversTypes['Event'] }>;
  EventsConnection: ResolverTypeWrapper<Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['EventEdge']>>> }>;
  Field: ResolverTypeWrapper<GqlField>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Group: ResolverTypeWrapper<Group>;
  GroupAddChildInput: GqlGroupAddChildInput;
  GroupAddChildPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupAddChildPayload']>;
  GroupAddChildSuccess: ResolverTypeWrapper<Omit<GqlGroupAddChildSuccess, 'child' | 'group'> & { child: GqlResolversTypes['Group'], group: GqlResolversTypes['Group'] }>;
  GroupAddEventInput: GqlGroupAddEventInput;
  GroupAddEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupAddEventPayload']>;
  GroupAddEventSuccess: ResolverTypeWrapper<Omit<GqlGroupAddEventSuccess, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  GroupAddParentInput: GqlGroupAddParentInput;
  GroupAddParentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupAddParentPayload']>;
  GroupAddParentSuccess: ResolverTypeWrapper<Omit<GqlGroupAddParentSuccess, 'group' | 'parent'> & { group: GqlResolversTypes['Group'], parent: GqlResolversTypes['Group'] }>;
  GroupAddTargetInput: GqlGroupAddTargetInput;
  GroupAddTargetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupAddTargetPayload']>;
  GroupAddTargetSuccess: ResolverTypeWrapper<Omit<GqlGroupAddTargetSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  GroupAddUserInput: GqlGroupAddUserInput;
  GroupAddUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupAddUserPayload']>;
  GroupAddUserSuccess: ResolverTypeWrapper<Omit<GqlGroupAddUserSuccess, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  GroupCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupCreatePayload']>;
  GroupCreateSuccess: ResolverTypeWrapper<Omit<GqlGroupCreateSuccess, 'group'> & { group?: Maybe<GqlResolversTypes['Group']> }>;
  GroupDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupDeletePayload']>;
  GroupDeleteSuccess: ResolverTypeWrapper<GqlGroupDeleteSuccess>;
  GroupEdge: ResolverTypeWrapper<Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Group']> }>;
  GroupFilterInput: GqlGroupFilterInput;
  GroupInput: GqlGroupInput;
  GroupRemoveChildInput: GqlGroupRemoveChildInput;
  GroupRemoveChildPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupRemoveChildPayload']>;
  GroupRemoveChildSuccess: ResolverTypeWrapper<Omit<GqlGroupRemoveChildSuccess, 'child' | 'group'> & { child: GqlResolversTypes['Group'], group: GqlResolversTypes['Group'] }>;
  GroupRemoveEventInput: GqlGroupRemoveEventInput;
  GroupRemoveEventPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupRemoveEventPayload']>;
  GroupRemoveEventSuccess: ResolverTypeWrapper<Omit<GqlGroupRemoveEventSuccess, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  GroupRemoveParentInput: GqlGroupRemoveParentInput;
  GroupRemoveParentPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupRemoveParentPayload']>;
  GroupRemoveParentSuccess: ResolverTypeWrapper<Omit<GqlGroupRemoveParentSuccess, 'group' | 'parent'> & { group: GqlResolversTypes['Group'], parent: GqlResolversTypes['Group'] }>;
  GroupRemoveTargetInput: GqlGroupRemoveTargetInput;
  GroupRemoveTargetPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupRemoveTargetPayload']>;
  GroupRemoveTargetSuccess: ResolverTypeWrapper<Omit<GqlGroupRemoveTargetSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  GroupRemoveUserInput: GqlGroupRemoveUserInput;
  GroupRemoveUserPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupRemoveUserPayload']>;
  GroupRemoveUserSuccess: ResolverTypeWrapper<Omit<GqlGroupRemoveUserSuccess, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  GroupSortInput: GqlGroupSortInput;
  GroupUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['GroupUpdatePayload']>;
  GroupUpdateSuccess: ResolverTypeWrapper<Omit<GqlGroupUpdateSuccess, 'group'> & { group: GqlResolversTypes['Group'] }>;
  GroupsConnection: ResolverTypeWrapper<Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['GroupEdge']>>> }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Index: ResolverTypeWrapper<Index>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputValueError: ResolverTypeWrapper<GqlInvalidInputValueError>;
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
  OrganizationCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationCreatePayload']>;
  OrganizationCreateSuccess: ResolverTypeWrapper<Omit<GqlOrganizationCreateSuccess, 'organization'> & { organization?: Maybe<GqlResolversTypes['Organization']> }>;
  OrganizationDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationDeletePayload']>;
  OrganizationDeleteSuccess: ResolverTypeWrapper<GqlOrganizationDeleteSuccess>;
  OrganizationEdge: ResolverTypeWrapper<Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Organization']> }>;
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationInput: GqlOrganizationInput;
  OrganizationPrivacyInput: GqlOrganizationPrivacyInput;
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
  OrganizationUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationUpdatePayload']>;
  OrganizationUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['OrganizationUpdatePrivacyPayload']>;
  OrganizationUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlOrganizationUpdatePrivacySuccess, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  OrganizationUpdateSuccess: ResolverTypeWrapper<Omit<GqlOrganizationUpdateSuccess, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  Organizations: ResolverTypeWrapper<Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversTypes['Organization']> }>;
  OrganizationsConnection: ResolverTypeWrapper<Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OrganizationEdge']>>> }>;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Query: ResolverTypeWrapper<{}>;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Target: ResolverTypeWrapper<Target>;
  TargetAddGroupInput: GqlTargetAddGroupInput;
  TargetAddGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetAddGroupPayload']>;
  TargetAddGroupSuccess: ResolverTypeWrapper<Omit<GqlTargetAddGroupSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  TargetAddOrganizationInput: GqlTargetAddOrganizationInput;
  TargetAddOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetAddOrganizationPayload']>;
  TargetAddOrganizationSuccess: ResolverTypeWrapper<Omit<GqlTargetAddOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  TargetCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetCreatePayload']>;
  TargetCreateSuccess: ResolverTypeWrapper<Omit<GqlTargetCreateSuccess, 'target'> & { target?: Maybe<GqlResolversTypes['Target']> }>;
  TargetDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetDeletePayload']>;
  TargetDeleteSuccess: ResolverTypeWrapper<GqlTargetDeleteSuccess>;
  TargetEdge: ResolverTypeWrapper<Omit<GqlTargetEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Target']> }>;
  TargetFilterInput: GqlTargetFilterInput;
  TargetInput: GqlTargetInput;
  TargetRemoveGroupInput: GqlTargetRemoveGroupInput;
  TargetRemoveGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetRemoveGroupPayload']>;
  TargetRemoveGroupSuccess: ResolverTypeWrapper<Omit<GqlTargetRemoveGroupSuccess, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  TargetRemoveOrganizationInput: GqlTargetRemoveOrganizationInput;
  TargetRemoveOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetRemoveOrganizationPayload']>;
  TargetRemoveOrganizationSuccess: ResolverTypeWrapper<Omit<GqlTargetRemoveOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  TargetSortInput: GqlTargetSortInput;
  TargetUpdateIndexInput: GqlTargetUpdateIndexInput;
  TargetUpdateIndexPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetUpdateIndexPayload']>;
  TargetUpdateIndexSuccess: ResolverTypeWrapper<Omit<GqlTargetUpdateIndexSuccess, 'index' | 'target'> & { index: GqlResolversTypes['Index'], target: GqlResolversTypes['Target'] }>;
  TargetUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['TargetUpdatePayload']>;
  TargetUpdateSuccess: ResolverTypeWrapper<Omit<GqlTargetUpdateSuccess, 'target'> & { target?: Maybe<GqlResolversTypes['Target']> }>;
  TargetsConnection: ResolverTypeWrapper<Omit<GqlTargetsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TargetEdge']>>> }>;
  User: ResolverTypeWrapper<User>;
  UserAddActivityInput: GqlUserAddActivityInput;
  UserAddActivityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserAddActivityPayload']>;
  UserAddActivitySuccess: ResolverTypeWrapper<Omit<GqlUserAddActivitySuccess, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user?: Maybe<GqlResolversTypes['User']> }>;
  UserAddGroupInput: GqlUserAddGroupInput;
  UserAddGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserAddGroupPayload']>;
  UserAddGroupSuccess: ResolverTypeWrapper<Omit<GqlUserAddGroupSuccess, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  UserAddOrganizationInput: GqlUserAddOrganizationInput;
  UserAddOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserAddOrganizationPayload']>;
  UserAddOrganizationSuccess: ResolverTypeWrapper<Omit<GqlUserAddOrganizationSuccess, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  UserCreatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserCreatePayload']>;
  UserCreateSuccess: ResolverTypeWrapper<Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UserDeletePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserDeletePayload']>;
  UserDeleteSuccess: ResolverTypeWrapper<GqlUserDeleteSuccess>;
  UserEdge: ResolverTypeWrapper<Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversTypes['User']> }>;
  UserFilterInput: GqlUserFilterInput;
  UserInput: GqlUserInput;
  UserPrivacyInput: GqlUserPrivacyInput;
  UserRemoveActivityInput: GqlUserRemoveActivityInput;
  UserRemoveActivityPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserRemoveActivityPayload']>;
  UserRemoveActivitySuccess: ResolverTypeWrapper<Omit<GqlUserRemoveActivitySuccess, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user: GqlResolversTypes['User'] }>;
  UserRemoveGroupInput: GqlUserRemoveGroupInput;
  UserRemoveGroupPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserRemoveGroupPayload']>;
  UserRemoveGroupSuccess: ResolverTypeWrapper<Omit<GqlUserRemoveGroupSuccess, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  UserRemoveOrganizationInput: GqlUserRemoveOrganizationInput;
  UserRemoveOrganizationPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserRemoveOrganizationPayload']>;
  UserRemoveOrganizationSuccess: ResolverTypeWrapper<Omit<GqlUserRemoveOrganizationSuccess, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  UserSortInput: GqlUserSortInput;
  UserUpdatePayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdatePayload']>;
  UserUpdatePrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserUpdatePrivacyPayload']>;
  UserUpdatePrivacySuccess: ResolverTypeWrapper<Omit<GqlUserUpdatePrivacySuccess, 'user'> & { user: GqlResolversTypes['User'] }>;
  UserUpdateSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UsersConnection: ResolverTypeWrapper<Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>> }>;
  ValueType: GqlValueType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlResolversParentTypes = ResolversObject<{
  Activities: Omit<GqlActivities, 'data'> & { data: Array<GqlResolversParentTypes['Activity']> };
  ActivitiesConnection: Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ActivityEdge']>>> };
  Activity: Activity;
  ActivityAddEventInput: GqlActivityAddEventInput;
  ActivityAddEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityAddEventPayload'];
  ActivityAddEventSuccess: Omit<GqlActivityAddEventSuccess, 'activity' | 'event'> & { activity: GqlResolversParentTypes['Activity'], event: GqlResolversParentTypes['Event'] };
  ActivityAddUserInput: GqlActivityAddUserInput;
  ActivityAddUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityAddUserPayload'];
  ActivityAddUserSuccess: Omit<GqlActivityAddUserSuccess, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user: GqlResolversParentTypes['User'] };
  ActivityCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityCreatePayload'];
  ActivityCreateSuccess: Omit<GqlActivityCreateSuccess, 'activity'> & { activity?: Maybe<GqlResolversParentTypes['Activity']> };
  ActivityDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityDeletePayload'];
  ActivityDeleteSuccess: GqlActivityDeleteSuccess;
  ActivityEdge: Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Activity']> };
  ActivityFilterInput: GqlActivityFilterInput;
  ActivityInput: GqlActivityInput;
  ActivityPrivacyInput: GqlActivityPrivacyInput;
  ActivityRemoveEventInput: GqlActivityRemoveEventInput;
  ActivityRemoveEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityRemoveEventPayload'];
  ActivityRemoveEventSuccess: Omit<GqlActivityRemoveEventSuccess, 'activity' | 'event'> & { activity: GqlResolversParentTypes['Activity'], event: GqlResolversParentTypes['Event'] };
  ActivitySortInput: GqlActivitySortInput;
  ActivityUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityUpdatePayload'];
  ActivityUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityUpdatePrivacyPayload'];
  ActivityUpdatePrivacySuccess: Omit<GqlActivityUpdatePrivacySuccess, 'activity'> & { activity: GqlResolversParentTypes['Activity'] };
  ActivityUpdateSuccess: Omit<GqlActivityUpdateSuccess, 'activity'> & { activity: GqlResolversParentTypes['Activity'] };
  ActivityUpdateUserInput: GqlActivityUpdateUserInput;
  ActivityUpdateUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['ActivityUpdateUserPayload'];
  ActivityUpdateUserSuccess: Omit<GqlActivityUpdateUserSuccess, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user: GqlResolversParentTypes['User'] };
  Agenda: Agenda;
  AuthError: GqlAuthError;
  Boolean: Scalars['Boolean']['output'];
  City: City;
  Comment: Comment;
  CommentAddEventInput: GqlCommentAddEventInput;
  CommentAddEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommentAddEventPayload'];
  CommentAddEventSuccess: Omit<GqlCommentAddEventSuccess, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  CommentDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommentDeletePayload'];
  CommentDeleteSuccess: GqlCommentDeleteSuccess;
  CommentUpdateInput: GqlCommentUpdateInput;
  CommentUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['CommentUpdatePayload'];
  CommentUpdateSuccess: Omit<GqlCommentUpdateSuccess, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  Comments: Omit<GqlComments, 'data'> & { data: Array<GqlResolversParentTypes['Comment']> };
  ComplexQueryError: GqlComplexQueryError;
  Datetime: Scalars['Datetime']['output'];
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Error: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Error'];
  Event: Event;
  EventAddGroupInput: GqlEventAddGroupInput;
  EventAddGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventAddGroupPayload'];
  EventAddGroupSuccess: Omit<GqlEventAddGroupSuccess, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  EventAddOrganizationInput: GqlEventAddOrganizationInput;
  EventAddOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventAddOrganizationPayload'];
  EventAddOrganizationSuccess: Omit<GqlEventAddOrganizationSuccess, 'event' | 'organization'> & { event: GqlResolversParentTypes['Event'], organization: GqlResolversParentTypes['Organization'] };
  EventCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventCreatePayload'];
  EventCreateSuccess: Omit<GqlEventCreateSuccess, 'event'> & { event?: Maybe<GqlResolversParentTypes['Event']> };
  EventDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventDeletePayload'];
  EventDeleteSuccess: GqlEventDeleteSuccess;
  EventEdge: Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Event']> };
  EventFilterInput: GqlEventFilterInput;
  EventInput: GqlEventInput;
  EventPrivacyInput: GqlEventPrivacyInput;
  EventRemoveGroupInput: GqlEventRemoveGroupInput;
  EventRemoveGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventRemoveGroupPayload'];
  EventRemoveGroupSuccess: Omit<GqlEventRemoveGroupSuccess, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  EventRemoveOrganizationInput: GqlEventRemoveOrganizationInput;
  EventRemoveOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventRemoveOrganizationPayload'];
  EventRemoveOrganizationSuccess: Omit<GqlEventRemoveOrganizationSuccess, 'event' | 'organization'> & { event: GqlResolversParentTypes['Event'], organization: GqlResolversParentTypes['Organization'] };
  EventSortInput: GqlEventSortInput;
  EventUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventUpdatePayload'];
  EventUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['EventUpdatePrivacyPayload'];
  EventUpdatePrivacySuccess: Omit<GqlEventUpdatePrivacySuccess, 'event'> & { event: GqlResolversParentTypes['Event'] };
  EventUpdateSuccess: Omit<GqlEventUpdateSuccess, 'event'> & { event: GqlResolversParentTypes['Event'] };
  EventsConnection: Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['EventEdge']>>> };
  Field: GqlField;
  Float: Scalars['Float']['output'];
  Group: Group;
  GroupAddChildInput: GqlGroupAddChildInput;
  GroupAddChildPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupAddChildPayload'];
  GroupAddChildSuccess: Omit<GqlGroupAddChildSuccess, 'child' | 'group'> & { child: GqlResolversParentTypes['Group'], group: GqlResolversParentTypes['Group'] };
  GroupAddEventInput: GqlGroupAddEventInput;
  GroupAddEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupAddEventPayload'];
  GroupAddEventSuccess: Omit<GqlGroupAddEventSuccess, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  GroupAddParentInput: GqlGroupAddParentInput;
  GroupAddParentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupAddParentPayload'];
  GroupAddParentSuccess: Omit<GqlGroupAddParentSuccess, 'group' | 'parent'> & { group: GqlResolversParentTypes['Group'], parent: GqlResolversParentTypes['Group'] };
  GroupAddTargetInput: GqlGroupAddTargetInput;
  GroupAddTargetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupAddTargetPayload'];
  GroupAddTargetSuccess: Omit<GqlGroupAddTargetSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  GroupAddUserInput: GqlGroupAddUserInput;
  GroupAddUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupAddUserPayload'];
  GroupAddUserSuccess: Omit<GqlGroupAddUserSuccess, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  GroupCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupCreatePayload'];
  GroupCreateSuccess: Omit<GqlGroupCreateSuccess, 'group'> & { group?: Maybe<GqlResolversParentTypes['Group']> };
  GroupDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupDeletePayload'];
  GroupDeleteSuccess: GqlGroupDeleteSuccess;
  GroupEdge: Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Group']> };
  GroupFilterInput: GqlGroupFilterInput;
  GroupInput: GqlGroupInput;
  GroupRemoveChildInput: GqlGroupRemoveChildInput;
  GroupRemoveChildPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupRemoveChildPayload'];
  GroupRemoveChildSuccess: Omit<GqlGroupRemoveChildSuccess, 'child' | 'group'> & { child: GqlResolversParentTypes['Group'], group: GqlResolversParentTypes['Group'] };
  GroupRemoveEventInput: GqlGroupRemoveEventInput;
  GroupRemoveEventPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupRemoveEventPayload'];
  GroupRemoveEventSuccess: Omit<GqlGroupRemoveEventSuccess, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  GroupRemoveParentInput: GqlGroupRemoveParentInput;
  GroupRemoveParentPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupRemoveParentPayload'];
  GroupRemoveParentSuccess: Omit<GqlGroupRemoveParentSuccess, 'group' | 'parent'> & { group: GqlResolversParentTypes['Group'], parent: GqlResolversParentTypes['Group'] };
  GroupRemoveTargetInput: GqlGroupRemoveTargetInput;
  GroupRemoveTargetPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupRemoveTargetPayload'];
  GroupRemoveTargetSuccess: Omit<GqlGroupRemoveTargetSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  GroupRemoveUserInput: GqlGroupRemoveUserInput;
  GroupRemoveUserPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupRemoveUserPayload'];
  GroupRemoveUserSuccess: Omit<GqlGroupRemoveUserSuccess, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  GroupSortInput: GqlGroupSortInput;
  GroupUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['GroupUpdatePayload'];
  GroupUpdateSuccess: Omit<GqlGroupUpdateSuccess, 'group'> & { group: GqlResolversParentTypes['Group'] };
  GroupsConnection: Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['GroupEdge']>>> };
  ID: Scalars['ID']['output'];
  Index: Index;
  Int: Scalars['Int']['output'];
  InvalidInputValueError: GqlInvalidInputValueError;
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
  OrganizationCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationCreatePayload'];
  OrganizationCreateSuccess: Omit<GqlOrganizationCreateSuccess, 'organization'> & { organization?: Maybe<GqlResolversParentTypes['Organization']> };
  OrganizationDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationDeletePayload'];
  OrganizationDeleteSuccess: GqlOrganizationDeleteSuccess;
  OrganizationEdge: Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Organization']> };
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationInput: GqlOrganizationInput;
  OrganizationPrivacyInput: GqlOrganizationPrivacyInput;
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
  OrganizationUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationUpdatePayload'];
  OrganizationUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['OrganizationUpdatePrivacyPayload'];
  OrganizationUpdatePrivacySuccess: Omit<GqlOrganizationUpdatePrivacySuccess, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  OrganizationUpdateSuccess: Omit<GqlOrganizationUpdateSuccess, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  Organizations: Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversParentTypes['Organization']> };
  OrganizationsConnection: Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OrganizationEdge']>>> };
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Query: {};
  State: State;
  String: Scalars['String']['output'];
  Target: Target;
  TargetAddGroupInput: GqlTargetAddGroupInput;
  TargetAddGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetAddGroupPayload'];
  TargetAddGroupSuccess: Omit<GqlTargetAddGroupSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  TargetAddOrganizationInput: GqlTargetAddOrganizationInput;
  TargetAddOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetAddOrganizationPayload'];
  TargetAddOrganizationSuccess: Omit<GqlTargetAddOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  TargetCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetCreatePayload'];
  TargetCreateSuccess: Omit<GqlTargetCreateSuccess, 'target'> & { target?: Maybe<GqlResolversParentTypes['Target']> };
  TargetDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetDeletePayload'];
  TargetDeleteSuccess: GqlTargetDeleteSuccess;
  TargetEdge: Omit<GqlTargetEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Target']> };
  TargetFilterInput: GqlTargetFilterInput;
  TargetInput: GqlTargetInput;
  TargetRemoveGroupInput: GqlTargetRemoveGroupInput;
  TargetRemoveGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetRemoveGroupPayload'];
  TargetRemoveGroupSuccess: Omit<GqlTargetRemoveGroupSuccess, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  TargetRemoveOrganizationInput: GqlTargetRemoveOrganizationInput;
  TargetRemoveOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetRemoveOrganizationPayload'];
  TargetRemoveOrganizationSuccess: Omit<GqlTargetRemoveOrganizationSuccess, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  TargetSortInput: GqlTargetSortInput;
  TargetUpdateIndexInput: GqlTargetUpdateIndexInput;
  TargetUpdateIndexPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetUpdateIndexPayload'];
  TargetUpdateIndexSuccess: Omit<GqlTargetUpdateIndexSuccess, 'index' | 'target'> & { index: GqlResolversParentTypes['Index'], target: GqlResolversParentTypes['Target'] };
  TargetUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['TargetUpdatePayload'];
  TargetUpdateSuccess: Omit<GqlTargetUpdateSuccess, 'target'> & { target?: Maybe<GqlResolversParentTypes['Target']> };
  TargetsConnection: Omit<GqlTargetsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TargetEdge']>>> };
  User: User;
  UserAddActivityInput: GqlUserAddActivityInput;
  UserAddActivityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserAddActivityPayload'];
  UserAddActivitySuccess: Omit<GqlUserAddActivitySuccess, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user?: Maybe<GqlResolversParentTypes['User']> };
  UserAddGroupInput: GqlUserAddGroupInput;
  UserAddGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserAddGroupPayload'];
  UserAddGroupSuccess: Omit<GqlUserAddGroupSuccess, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  UserAddOrganizationInput: GqlUserAddOrganizationInput;
  UserAddOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserAddOrganizationPayload'];
  UserAddOrganizationSuccess: Omit<GqlUserAddOrganizationSuccess, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  UserCreatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserCreatePayload'];
  UserCreateSuccess: Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
  UserDeletePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserDeletePayload'];
  UserDeleteSuccess: GqlUserDeleteSuccess;
  UserEdge: Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['User']> };
  UserFilterInput: GqlUserFilterInput;
  UserInput: GqlUserInput;
  UserPrivacyInput: GqlUserPrivacyInput;
  UserRemoveActivityInput: GqlUserRemoveActivityInput;
  UserRemoveActivityPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserRemoveActivityPayload'];
  UserRemoveActivitySuccess: Omit<GqlUserRemoveActivitySuccess, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user: GqlResolversParentTypes['User'] };
  UserRemoveGroupInput: GqlUserRemoveGroupInput;
  UserRemoveGroupPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserRemoveGroupPayload'];
  UserRemoveGroupSuccess: Omit<GqlUserRemoveGroupSuccess, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  UserRemoveOrganizationInput: GqlUserRemoveOrganizationInput;
  UserRemoveOrganizationPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserRemoveOrganizationPayload'];
  UserRemoveOrganizationSuccess: Omit<GqlUserRemoveOrganizationSuccess, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  UserSortInput: GqlUserSortInput;
  UserUpdatePayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdatePayload'];
  UserUpdatePrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserUpdatePrivacyPayload'];
  UserUpdatePrivacySuccess: Omit<GqlUserUpdatePrivacySuccess, 'user'> & { user: GqlResolversParentTypes['User'] };
  UserUpdateSuccess: Omit<GqlUserUpdateSuccess, 'user'> & { user?: Maybe<GqlResolversParentTypes['User']> };
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
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  remark?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  totalMinutes?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityAddEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityAddEventPayload'] = GqlResolversParentTypes['ActivityAddEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityAddEventSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityAddEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityAddEventSuccess'] = GqlResolversParentTypes['ActivityAddEventSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityAddUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityAddUserPayload'] = GqlResolversParentTypes['ActivityAddUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityAddUserSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityAddUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityAddUserSuccess'] = GqlResolversParentTypes['ActivityAddUserSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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

export type GqlActivityRemoveEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityRemoveEventPayload'] = GqlResolversParentTypes['ActivityRemoveEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityRemoveEventSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityRemoveEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityRemoveEventSuccess'] = GqlResolversParentTypes['ActivityRemoveEventSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdatePayload'] = GqlResolversParentTypes['ActivityUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityUpdateSuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdatePrivacyPayload'] = GqlResolversParentTypes['ActivityUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityUpdatePrivacySuccess' | 'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlActivityUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdatePrivacySuccess'] = GqlResolversParentTypes['ActivityUpdatePrivacySuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlActivityUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityUpdateSuccess'] = GqlResolversParentTypes['ActivityUpdateSuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
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
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAuthErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AuthError'] = GqlResolversParentTypes['AuthError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<Array<GqlResolversTypes['String']>, ParentType, ContextType>;
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
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  postedAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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

export type GqlCommentUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentUpdatePayload'] = GqlResolversParentTypes['CommentUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'CommentUpdateSuccess' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlCommentUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['CommentUpdateSuccess'] = GqlResolversParentTypes['CommentUpdateSuccess']> = ResolversObject<{
  comment?: Resolver<GqlResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlCommentsResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Comments'] = GqlResolversParentTypes['Comments']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Comment']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlComplexQueryErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ComplexQueryError'] = GqlResolversParentTypes['ComplexQueryError']> = ResolversObject<{
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<Array<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface GqlDatetimeScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Datetime'], any> {
  name: 'Datetime';
}

export type GqlEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Edge'] = GqlResolversParentTypes['Edge']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityEdge' | 'EventEdge' | 'GroupEdge' | 'OrganizationEdge' | 'TargetEdge' | 'UserEdge', ParentType, ContextType>;
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
}>;

export type GqlErrorResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Error'] = GqlResolversParentTypes['Error']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError', ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<Array<GqlResolversTypes['String']>, ParentType, ContextType>;
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
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  totalMinutes?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventAddGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventAddGroupPayload'] = GqlResolversParentTypes['EventAddGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventAddGroupSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventAddGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventAddGroupSuccess'] = GqlResolversParentTypes['EventAddGroupSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventAddOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventAddOrganizationPayload'] = GqlResolversParentTypes['EventAddOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventAddOrganizationSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventAddOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventAddOrganizationSuccess'] = GqlResolversParentTypes['EventAddOrganizationSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventCreatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventCreatePayload'] = GqlResolversParentTypes['EventCreatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventCreateSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventCreateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventCreateSuccess'] = GqlResolversParentTypes['EventCreateSuccess']> = ResolversObject<{
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
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

export type GqlEventRemoveGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventRemoveGroupPayload'] = GqlResolversParentTypes['EventRemoveGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventRemoveGroupSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventRemoveGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventRemoveGroupSuccess'] = GqlResolversParentTypes['EventRemoveGroupSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventRemoveOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventRemoveOrganizationPayload'] = GqlResolversParentTypes['EventRemoveOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventRemoveOrganizationSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventRemoveOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventRemoveOrganizationSuccess'] = GqlResolversParentTypes['EventRemoveOrganizationSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdatePayload'] = GqlResolversParentTypes['EventUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventUpdateSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdatePrivacyPayload'] = GqlResolversParentTypes['EventUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'EventUpdatePrivacySuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlEventUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdatePrivacySuccess'] = GqlResolversParentTypes['EventUpdatePrivacySuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventUpdateSuccess'] = GqlResolversParentTypes['EventUpdateSuccess']> = ResolversObject<{
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

export type GqlGroupAddChildPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddChildPayload'] = GqlResolversParentTypes['GroupAddChildPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupAddChildSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupAddChildSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddChildSuccess'] = GqlResolversParentTypes['GroupAddChildSuccess']> = ResolversObject<{
  child?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupAddEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddEventPayload'] = GqlResolversParentTypes['GroupAddEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupAddEventSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupAddEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddEventSuccess'] = GqlResolversParentTypes['GroupAddEventSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupAddParentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddParentPayload'] = GqlResolversParentTypes['GroupAddParentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupAddParentSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupAddParentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddParentSuccess'] = GqlResolversParentTypes['GroupAddParentSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  parent?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupAddTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddTargetPayload'] = GqlResolversParentTypes['GroupAddTargetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupAddTargetSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupAddTargetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddTargetSuccess'] = GqlResolversParentTypes['GroupAddTargetSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupAddUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddUserPayload'] = GqlResolversParentTypes['GroupAddUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupAddUserSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupAddUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupAddUserSuccess'] = GqlResolversParentTypes['GroupAddUserSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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

export type GqlGroupRemoveChildPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveChildPayload'] = GqlResolversParentTypes['GroupRemoveChildPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupRemoveChildSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupRemoveChildSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveChildSuccess'] = GqlResolversParentTypes['GroupRemoveChildSuccess']> = ResolversObject<{
  child?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupRemoveEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveEventPayload'] = GqlResolversParentTypes['GroupRemoveEventPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupRemoveEventSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupRemoveEventSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveEventSuccess'] = GqlResolversParentTypes['GroupRemoveEventSuccess']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupRemoveParentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveParentPayload'] = GqlResolversParentTypes['GroupRemoveParentPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupRemoveParentSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupRemoveParentSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveParentSuccess'] = GqlResolversParentTypes['GroupRemoveParentSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  parent?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupRemoveTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveTargetPayload'] = GqlResolversParentTypes['GroupRemoveTargetPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupRemoveTargetSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupRemoveTargetSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveTargetSuccess'] = GqlResolversParentTypes['GroupRemoveTargetSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupRemoveUserPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveUserPayload'] = GqlResolversParentTypes['GroupRemoveUserPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupRemoveUserSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupRemoveUserSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupRemoveUserSuccess'] = GqlResolversParentTypes['GroupRemoveUserSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlGroupUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdatePayload'] = GqlResolversParentTypes['GroupUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'GroupUpdateSuccess' | 'InvalidInputValueError', ParentType, ContextType>;
}>;

export type GqlGroupUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupUpdateSuccess'] = GqlResolversParentTypes['GroupUpdateSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
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
  fields?: Resolver<Array<Maybe<GqlResolversTypes['Field']>>, ParentType, ContextType>;
  message?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  path?: Resolver<Array<GqlResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlLikeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Like'] = GqlResolversParentTypes['Like']> = ResolversObject<{
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  postedAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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
  activityAddEvent?: Resolver<Maybe<GqlResolversTypes['ActivityAddEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityAddEventArgs, 'id' | 'input'>>;
  activityAddUser?: Resolver<Maybe<GqlResolversTypes['ActivityAddUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityAddUserArgs, 'id' | 'input'>>;
  activityCreate?: Resolver<Maybe<GqlResolversTypes['ActivityCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityCreateArgs, 'input'>>;
  activityDelete?: Resolver<Maybe<GqlResolversTypes['ActivityDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityDeleteArgs, 'id'>>;
  activityPublish?: Resolver<Maybe<GqlResolversTypes['ActivityUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityPublishArgs, 'id' | 'input'>>;
  activityRemoveEvent?: Resolver<Maybe<GqlResolversTypes['ActivityRemoveEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityRemoveEventArgs, 'id' | 'input'>>;
  activityUnpublish?: Resolver<Maybe<GqlResolversTypes['ActivityUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityUnpublishArgs, 'id' | 'input'>>;
  activityUpdate?: Resolver<Maybe<GqlResolversTypes['ActivityUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityUpdateArgs, 'id' | 'input'>>;
  activityUpdateUser?: Resolver<Maybe<GqlResolversTypes['ActivityUpdateUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationActivityUpdateUserArgs, 'id' | 'input'>>;
  commentAddEvent?: Resolver<Maybe<GqlResolversTypes['CommentAddEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationCommentAddEventArgs, 'input'>>;
  commentDelete?: Resolver<Maybe<GqlResolversTypes['CommentDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommentDeleteArgs, 'id'>>;
  commentUpdate?: Resolver<Maybe<GqlResolversTypes['CommentUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationCommentUpdateArgs, 'id' | 'input'>>;
  eventAddGroup?: Resolver<Maybe<GqlResolversTypes['EventAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventAddGroupArgs, 'id' | 'input'>>;
  eventAddOrganization?: Resolver<Maybe<GqlResolversTypes['EventAddOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventAddOrganizationArgs, 'id' | 'input'>>;
  eventCreate?: Resolver<Maybe<GqlResolversTypes['EventCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationEventCreateArgs, 'input'>>;
  eventDelete?: Resolver<Maybe<GqlResolversTypes['EventDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationEventDeleteArgs, 'id'>>;
  eventPublish?: Resolver<Maybe<GqlResolversTypes['EventUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventPublishArgs, 'id' | 'input'>>;
  eventRemoveGroup?: Resolver<Maybe<GqlResolversTypes['EventRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventRemoveGroupArgs, 'id' | 'input'>>;
  eventRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['EventRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventRemoveOrganizationArgs, 'id' | 'input'>>;
  eventUnpublish?: Resolver<Maybe<GqlResolversTypes['EventUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationEventUnpublishArgs, 'id' | 'input'>>;
  eventUpdate?: Resolver<Maybe<GqlResolversTypes['EventUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationEventUpdateArgs, 'id' | 'input'>>;
  groupAddChild?: Resolver<Maybe<GqlResolversTypes['GroupAddChildPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddChildArgs, 'id' | 'input'>>;
  groupAddEvent?: Resolver<Maybe<GqlResolversTypes['GroupAddEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddEventArgs, 'id' | 'input'>>;
  groupAddParent?: Resolver<Maybe<GqlResolversTypes['GroupAddParentPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddParentArgs, 'id' | 'input'>>;
  groupAddTarget?: Resolver<Maybe<GqlResolversTypes['GroupAddTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddTargetArgs, 'id' | 'input'>>;
  groupAddUser?: Resolver<Maybe<GqlResolversTypes['GroupAddUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupAddUserArgs, 'id' | 'input'>>;
  groupCreate?: Resolver<Maybe<GqlResolversTypes['GroupCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupCreateArgs, 'input'>>;
  groupDelete?: Resolver<Maybe<GqlResolversTypes['GroupDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupDeleteArgs, 'id'>>;
  groupRemoveChild?: Resolver<Maybe<GqlResolversTypes['GroupRemoveChildPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveChildArgs, 'id' | 'input'>>;
  groupRemoveEvent?: Resolver<Maybe<GqlResolversTypes['GroupRemoveEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveEventArgs, 'id' | 'input'>>;
  groupRemoveParent?: Resolver<Maybe<GqlResolversTypes['GroupRemoveParentPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveParentArgs, 'id' | 'input'>>;
  groupRemoveTarget?: Resolver<Maybe<GqlResolversTypes['GroupRemoveTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveTargetArgs, 'id' | 'input'>>;
  groupRemoveUser?: Resolver<Maybe<GqlResolversTypes['GroupRemoveUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupRemoveUserArgs, 'id' | 'input'>>;
  groupUpdate?: Resolver<Maybe<GqlResolversTypes['GroupUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationGroupUpdateArgs, 'id' | 'input'>>;
  likeAddEvent?: Resolver<Maybe<GqlResolversTypes['LikeAddEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationLikeAddEventArgs, 'input'>>;
  likeDelete?: Resolver<Maybe<GqlResolversTypes['LikeDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationLikeDeleteArgs, 'id'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  organizationAddGroup?: Resolver<Maybe<GqlResolversTypes['OrganizationAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationAddGroupArgs, 'id' | 'input'>>;
  organizationAddTarget?: Resolver<Maybe<GqlResolversTypes['OrganizationAddTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationAddTargetArgs, 'id' | 'input'>>;
  organizationAddUser?: Resolver<Maybe<GqlResolversTypes['OrganizationAddUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationAddUserArgs, 'id' | 'input'>>;
  organizationCreate?: Resolver<Maybe<GqlResolversTypes['OrganizationCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationCreateArgs, 'input'>>;
  organizationDelete?: Resolver<Maybe<GqlResolversTypes['OrganizationDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationDeleteArgs, 'id'>>;
  organizationPublish?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationPublishArgs, 'id' | 'input'>>;
  organizationRemoveGroup?: Resolver<Maybe<GqlResolversTypes['OrganizationRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationRemoveGroupArgs, 'id' | 'input'>>;
  organizationRemoveTarget?: Resolver<Maybe<GqlResolversTypes['OrganizationRemoveTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationRemoveTargetArgs, 'id' | 'input'>>;
  organizationRemoveUser?: Resolver<Maybe<GqlResolversTypes['OrganizationRemoveUserPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationRemoveUserArgs, 'id' | 'input'>>;
  organizationUnpublish?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationUnpublishArgs, 'id' | 'input'>>;
  organizationUpdate?: Resolver<Maybe<GqlResolversTypes['OrganizationUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationOrganizationUpdateArgs, 'id' | 'input'>>;
  targetAddGroup?: Resolver<Maybe<GqlResolversTypes['TargetAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetAddGroupArgs, 'id' | 'input'>>;
  targetAddOrganization?: Resolver<Maybe<GqlResolversTypes['TargetAddOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetAddOrganizationArgs, 'id' | 'input'>>;
  targetCreate?: Resolver<Maybe<GqlResolversTypes['TargetCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetCreateArgs, 'input'>>;
  targetDelete?: Resolver<Maybe<GqlResolversTypes['TargetDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetDeleteArgs, 'id'>>;
  targetRemoveGroup?: Resolver<Maybe<GqlResolversTypes['TargetRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetRemoveGroupArgs, 'id' | 'input'>>;
  targetRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['TargetRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetRemoveOrganizationArgs, 'id' | 'input'>>;
  targetUpdate?: Resolver<Maybe<GqlResolversTypes['TargetUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetUpdateArgs, 'id' | 'input'>>;
  targetUpdateIndex?: Resolver<Maybe<GqlResolversTypes['TargetUpdateIndexPayload']>, ParentType, ContextType, RequireFields<GqlMutationTargetUpdateIndexArgs, 'id' | 'input'>>;
  userAddActivity?: Resolver<Maybe<GqlResolversTypes['UserAddActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddActivityArgs, 'id' | 'input'>>;
  userAddGroup?: Resolver<Maybe<GqlResolversTypes['UserAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddGroupArgs, 'id' | 'input'>>;
  userAddOrganization?: Resolver<Maybe<GqlResolversTypes['UserRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddOrganizationArgs, 'id' | 'input'>>;
  userCreate?: Resolver<Maybe<GqlResolversTypes['UserCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserCreateArgs, 'input'>>;
  userDelete?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteArgs, 'id'>>;
  userPublish?: Resolver<Maybe<GqlResolversTypes['UserUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserPublishArgs, 'id' | 'input'>>;
  userRemoveActivity?: Resolver<Maybe<GqlResolversTypes['UserRemoveActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveActivityArgs, 'id' | 'input'>>;
  userRemoveGroup?: Resolver<Maybe<GqlResolversTypes['UserRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveGroupArgs, 'id' | 'input'>>;
  userRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['UserRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveOrganizationArgs, 'id' | 'input'>>;
  userUnpublish?: Resolver<Maybe<GqlResolversTypes['UserUpdatePrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUnpublishArgs, 'id' | 'input'>>;
  userUpdate?: Resolver<Maybe<GqlResolversTypes['UserUpdatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUpdateArgs, 'id' | 'input'>>;
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

export type GqlOrganizationUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdatePayload'] = GqlResolversParentTypes['OrganizationUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdatePrivacyPayload'] = GqlResolversParentTypes['OrganizationUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'OrganizationUpdatePrivacySuccess', ParentType, ContextType>;
}>;

export type GqlOrganizationUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdatePrivacySuccess'] = GqlResolversParentTypes['OrganizationUpdatePrivacySuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationUpdateSuccess'] = GqlResolversParentTypes['OrganizationUpdateSuccess']> = ResolversObject<{
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
  cities?: Resolver<Array<GqlResolversTypes['City']>, ParentType, ContextType, Partial<GqlQueryCitiesArgs>>;
  echo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  event?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlQueryEventArgs, 'id'>>;
  events?: Resolver<GqlResolversTypes['EventsConnection'], ParentType, ContextType, Partial<GqlQueryEventsArgs>>;
  group?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlQueryGroupArgs, 'id'>>;
  groups?: Resolver<GqlResolversTypes['GroupsConnection'], ParentType, ContextType, Partial<GqlQueryGroupsArgs>>;
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlQueryOrganizationArgs, 'id'>>;
  organizations?: Resolver<GqlResolversTypes['OrganizationsConnection'], ParentType, ContextType, Partial<GqlQueryOrganizationsArgs>>;
  states?: Resolver<Array<GqlResolversTypes['State']>, ParentType, ContextType, Partial<GqlQueryStatesArgs>>;
  target?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType, RequireFields<GqlQueryTargetArgs, 'id'>>;
  targets?: Resolver<GqlResolversTypes['TargetsConnection'], ParentType, ContextType, Partial<GqlQueryTargetsArgs>>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlQueryUserArgs, 'id'>>;
  users?: Resolver<GqlResolversTypes['UsersConnection'], ParentType, ContextType, Partial<GqlQueryUsersArgs>>;
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

export type GqlTargetUpdateIndexPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateIndexPayload'] = GqlResolversParentTypes['TargetUpdateIndexPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetUpdateIndexSuccess', ParentType, ContextType>;
}>;

export type GqlTargetUpdateIndexSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateIndexSuccess'] = GqlResolversParentTypes['TargetUpdateIndexSuccess']> = ResolversObject<{
  index?: Resolver<GqlResolversTypes['Index'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdatePayload'] = GqlResolversParentTypes['TargetUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'TargetUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlTargetUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetUpdateSuccess'] = GqlResolversParentTypes['TargetUpdateSuccess']> = ResolversObject<{
  target?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType>;
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
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserAddActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserAddActivityPayload'] = GqlResolversParentTypes['UserAddActivityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserAddActivitySuccess', ParentType, ContextType>;
}>;

export type GqlUserAddActivitySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserAddActivitySuccess'] = GqlResolversParentTypes['UserAddActivitySuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserAddGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserAddGroupPayload'] = GqlResolversParentTypes['UserAddGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserAddGroupSuccess', ParentType, ContextType>;
}>;

export type GqlUserAddGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserAddGroupSuccess'] = GqlResolversParentTypes['UserAddGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserAddOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserAddOrganizationPayload'] = GqlResolversParentTypes['UserAddOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserAddOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlUserAddOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserAddOrganizationSuccess'] = GqlResolversParentTypes['UserAddOrganizationSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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

export type GqlUserRemoveActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserRemoveActivityPayload'] = GqlResolversParentTypes['UserRemoveActivityPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserRemoveActivitySuccess', ParentType, ContextType>;
}>;

export type GqlUserRemoveActivitySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserRemoveActivitySuccess'] = GqlResolversParentTypes['UserRemoveActivitySuccess']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserRemoveGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserRemoveGroupPayload'] = GqlResolversParentTypes['UserRemoveGroupPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserRemoveGroupSuccess', ParentType, ContextType>;
}>;

export type GqlUserRemoveGroupSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserRemoveGroupSuccess'] = GqlResolversParentTypes['UserRemoveGroupSuccess']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserRemoveOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserRemoveOrganizationPayload'] = GqlResolversParentTypes['UserRemoveOrganizationPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserRemoveOrganizationSuccess', ParentType, ContextType>;
}>;

export type GqlUserRemoveOrganizationSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserRemoveOrganizationSuccess'] = GqlResolversParentTypes['UserRemoveOrganizationSuccess']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdatePayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdatePayload'] = GqlResolversParentTypes['UserUpdatePayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdateSuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdatePrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdatePrivacyPayload'] = GqlResolversParentTypes['UserUpdatePrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserUpdatePrivacySuccess', ParentType, ContextType>;
}>;

export type GqlUserUpdatePrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdatePrivacySuccess'] = GqlResolversParentTypes['UserUpdatePrivacySuccess']> = ResolversObject<{
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUserUpdateSuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserUpdateSuccess'] = GqlResolversParentTypes['UserUpdateSuccess']> = ResolversObject<{
  user?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
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
  ActivityAddEventPayload?: GqlActivityAddEventPayloadResolvers<ContextType>;
  ActivityAddEventSuccess?: GqlActivityAddEventSuccessResolvers<ContextType>;
  ActivityAddUserPayload?: GqlActivityAddUserPayloadResolvers<ContextType>;
  ActivityAddUserSuccess?: GqlActivityAddUserSuccessResolvers<ContextType>;
  ActivityCreatePayload?: GqlActivityCreatePayloadResolvers<ContextType>;
  ActivityCreateSuccess?: GqlActivityCreateSuccessResolvers<ContextType>;
  ActivityDeletePayload?: GqlActivityDeletePayloadResolvers<ContextType>;
  ActivityDeleteSuccess?: GqlActivityDeleteSuccessResolvers<ContextType>;
  ActivityEdge?: GqlActivityEdgeResolvers<ContextType>;
  ActivityRemoveEventPayload?: GqlActivityRemoveEventPayloadResolvers<ContextType>;
  ActivityRemoveEventSuccess?: GqlActivityRemoveEventSuccessResolvers<ContextType>;
  ActivityUpdatePayload?: GqlActivityUpdatePayloadResolvers<ContextType>;
  ActivityUpdatePrivacyPayload?: GqlActivityUpdatePrivacyPayloadResolvers<ContextType>;
  ActivityUpdatePrivacySuccess?: GqlActivityUpdatePrivacySuccessResolvers<ContextType>;
  ActivityUpdateSuccess?: GqlActivityUpdateSuccessResolvers<ContextType>;
  ActivityUpdateUserPayload?: GqlActivityUpdateUserPayloadResolvers<ContextType>;
  ActivityUpdateUserSuccess?: GqlActivityUpdateUserSuccessResolvers<ContextType>;
  Agenda?: GqlAgendaResolvers<ContextType>;
  AuthError?: GqlAuthErrorResolvers<ContextType>;
  City?: GqlCityResolvers<ContextType>;
  Comment?: GqlCommentResolvers<ContextType>;
  CommentAddEventPayload?: GqlCommentAddEventPayloadResolvers<ContextType>;
  CommentAddEventSuccess?: GqlCommentAddEventSuccessResolvers<ContextType>;
  CommentDeletePayload?: GqlCommentDeletePayloadResolvers<ContextType>;
  CommentDeleteSuccess?: GqlCommentDeleteSuccessResolvers<ContextType>;
  CommentUpdatePayload?: GqlCommentUpdatePayloadResolvers<ContextType>;
  CommentUpdateSuccess?: GqlCommentUpdateSuccessResolvers<ContextType>;
  Comments?: GqlCommentsResolvers<ContextType>;
  ComplexQueryError?: GqlComplexQueryErrorResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Event?: GqlEventResolvers<ContextType>;
  EventAddGroupPayload?: GqlEventAddGroupPayloadResolvers<ContextType>;
  EventAddGroupSuccess?: GqlEventAddGroupSuccessResolvers<ContextType>;
  EventAddOrganizationPayload?: GqlEventAddOrganizationPayloadResolvers<ContextType>;
  EventAddOrganizationSuccess?: GqlEventAddOrganizationSuccessResolvers<ContextType>;
  EventCreatePayload?: GqlEventCreatePayloadResolvers<ContextType>;
  EventCreateSuccess?: GqlEventCreateSuccessResolvers<ContextType>;
  EventDeletePayload?: GqlEventDeletePayloadResolvers<ContextType>;
  EventDeleteSuccess?: GqlEventDeleteSuccessResolvers<ContextType>;
  EventEdge?: GqlEventEdgeResolvers<ContextType>;
  EventRemoveGroupPayload?: GqlEventRemoveGroupPayloadResolvers<ContextType>;
  EventRemoveGroupSuccess?: GqlEventRemoveGroupSuccessResolvers<ContextType>;
  EventRemoveOrganizationPayload?: GqlEventRemoveOrganizationPayloadResolvers<ContextType>;
  EventRemoveOrganizationSuccess?: GqlEventRemoveOrganizationSuccessResolvers<ContextType>;
  EventUpdatePayload?: GqlEventUpdatePayloadResolvers<ContextType>;
  EventUpdatePrivacyPayload?: GqlEventUpdatePrivacyPayloadResolvers<ContextType>;
  EventUpdatePrivacySuccess?: GqlEventUpdatePrivacySuccessResolvers<ContextType>;
  EventUpdateSuccess?: GqlEventUpdateSuccessResolvers<ContextType>;
  EventsConnection?: GqlEventsConnectionResolvers<ContextType>;
  Field?: GqlFieldResolvers<ContextType>;
  Group?: GqlGroupResolvers<ContextType>;
  GroupAddChildPayload?: GqlGroupAddChildPayloadResolvers<ContextType>;
  GroupAddChildSuccess?: GqlGroupAddChildSuccessResolvers<ContextType>;
  GroupAddEventPayload?: GqlGroupAddEventPayloadResolvers<ContextType>;
  GroupAddEventSuccess?: GqlGroupAddEventSuccessResolvers<ContextType>;
  GroupAddParentPayload?: GqlGroupAddParentPayloadResolvers<ContextType>;
  GroupAddParentSuccess?: GqlGroupAddParentSuccessResolvers<ContextType>;
  GroupAddTargetPayload?: GqlGroupAddTargetPayloadResolvers<ContextType>;
  GroupAddTargetSuccess?: GqlGroupAddTargetSuccessResolvers<ContextType>;
  GroupAddUserPayload?: GqlGroupAddUserPayloadResolvers<ContextType>;
  GroupAddUserSuccess?: GqlGroupAddUserSuccessResolvers<ContextType>;
  GroupCreatePayload?: GqlGroupCreatePayloadResolvers<ContextType>;
  GroupCreateSuccess?: GqlGroupCreateSuccessResolvers<ContextType>;
  GroupDeletePayload?: GqlGroupDeletePayloadResolvers<ContextType>;
  GroupDeleteSuccess?: GqlGroupDeleteSuccessResolvers<ContextType>;
  GroupEdge?: GqlGroupEdgeResolvers<ContextType>;
  GroupRemoveChildPayload?: GqlGroupRemoveChildPayloadResolvers<ContextType>;
  GroupRemoveChildSuccess?: GqlGroupRemoveChildSuccessResolvers<ContextType>;
  GroupRemoveEventPayload?: GqlGroupRemoveEventPayloadResolvers<ContextType>;
  GroupRemoveEventSuccess?: GqlGroupRemoveEventSuccessResolvers<ContextType>;
  GroupRemoveParentPayload?: GqlGroupRemoveParentPayloadResolvers<ContextType>;
  GroupRemoveParentSuccess?: GqlGroupRemoveParentSuccessResolvers<ContextType>;
  GroupRemoveTargetPayload?: GqlGroupRemoveTargetPayloadResolvers<ContextType>;
  GroupRemoveTargetSuccess?: GqlGroupRemoveTargetSuccessResolvers<ContextType>;
  GroupRemoveUserPayload?: GqlGroupRemoveUserPayloadResolvers<ContextType>;
  GroupRemoveUserSuccess?: GqlGroupRemoveUserSuccessResolvers<ContextType>;
  GroupUpdatePayload?: GqlGroupUpdatePayloadResolvers<ContextType>;
  GroupUpdateSuccess?: GqlGroupUpdateSuccessResolvers<ContextType>;
  GroupsConnection?: GqlGroupsConnectionResolvers<ContextType>;
  Index?: GqlIndexResolvers<ContextType>;
  InvalidInputValueError?: GqlInvalidInputValueErrorResolvers<ContextType>;
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
  OrganizationUpdatePayload?: GqlOrganizationUpdatePayloadResolvers<ContextType>;
  OrganizationUpdatePrivacyPayload?: GqlOrganizationUpdatePrivacyPayloadResolvers<ContextType>;
  OrganizationUpdatePrivacySuccess?: GqlOrganizationUpdatePrivacySuccessResolvers<ContextType>;
  OrganizationUpdateSuccess?: GqlOrganizationUpdateSuccessResolvers<ContextType>;
  Organizations?: GqlOrganizationsResolvers<ContextType>;
  OrganizationsConnection?: GqlOrganizationsConnectionResolvers<ContextType>;
  PageInfo?: GqlPageInfoResolvers<ContextType>;
  Paging?: GqlPagingResolvers<ContextType>;
  Query?: GqlQueryResolvers<ContextType>;
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
  TargetUpdateIndexPayload?: GqlTargetUpdateIndexPayloadResolvers<ContextType>;
  TargetUpdateIndexSuccess?: GqlTargetUpdateIndexSuccessResolvers<ContextType>;
  TargetUpdatePayload?: GqlTargetUpdatePayloadResolvers<ContextType>;
  TargetUpdateSuccess?: GqlTargetUpdateSuccessResolvers<ContextType>;
  TargetsConnection?: GqlTargetsConnectionResolvers<ContextType>;
  User?: GqlUserResolvers<ContextType>;
  UserAddActivityPayload?: GqlUserAddActivityPayloadResolvers<ContextType>;
  UserAddActivitySuccess?: GqlUserAddActivitySuccessResolvers<ContextType>;
  UserAddGroupPayload?: GqlUserAddGroupPayloadResolvers<ContextType>;
  UserAddGroupSuccess?: GqlUserAddGroupSuccessResolvers<ContextType>;
  UserAddOrganizationPayload?: GqlUserAddOrganizationPayloadResolvers<ContextType>;
  UserAddOrganizationSuccess?: GqlUserAddOrganizationSuccessResolvers<ContextType>;
  UserCreatePayload?: GqlUserCreatePayloadResolvers<ContextType>;
  UserCreateSuccess?: GqlUserCreateSuccessResolvers<ContextType>;
  UserDeletePayload?: GqlUserDeletePayloadResolvers<ContextType>;
  UserDeleteSuccess?: GqlUserDeleteSuccessResolvers<ContextType>;
  UserEdge?: GqlUserEdgeResolvers<ContextType>;
  UserRemoveActivityPayload?: GqlUserRemoveActivityPayloadResolvers<ContextType>;
  UserRemoveActivitySuccess?: GqlUserRemoveActivitySuccessResolvers<ContextType>;
  UserRemoveGroupPayload?: GqlUserRemoveGroupPayloadResolvers<ContextType>;
  UserRemoveGroupSuccess?: GqlUserRemoveGroupSuccessResolvers<ContextType>;
  UserRemoveOrganizationPayload?: GqlUserRemoveOrganizationPayloadResolvers<ContextType>;
  UserRemoveOrganizationSuccess?: GqlUserRemoveOrganizationSuccessResolvers<ContextType>;
  UserUpdatePayload?: GqlUserUpdatePayloadResolvers<ContextType>;
  UserUpdatePrivacyPayload?: GqlUserUpdatePrivacyPayloadResolvers<ContextType>;
  UserUpdatePrivacySuccess?: GqlUserUpdatePrivacySuccessResolvers<ContextType>;
  UserUpdateSuccess?: GqlUserUpdateSuccessResolvers<ContextType>;
  UsersConnection?: GqlUsersConnectionResolvers<ContextType>;
}>;


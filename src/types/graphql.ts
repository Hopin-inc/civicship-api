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

export type GqlActivitySortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  startsAt?: InputMaybe<GqlSortDirection>;
};

export type GqlAddChildGroupToGroupInput = {
  childId: Scalars['String']['input'];
};

export type GqlAddChildGroupToGroupPayload = {
  __typename?: 'AddChildGroupToGroupPayload';
  child: GqlGroup;
  group: GqlGroup;
};

export type GqlAddCommentToEventInput = {
  content: Scalars['String']['input'];
  eventId: Scalars['String']['input'];
  postedAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlAddCommentToEventPayload = {
  __typename?: 'AddCommentToEventPayload';
  comment: GqlComment;
};

export type GqlAddEventOfGroupInput = {
  eventId: Scalars['String']['input'];
};

export type GqlAddEventOfGroupPayload = {
  __typename?: 'AddEventOfGroupPayload';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlAddEventToActivityInput = {
  eventId: Scalars['String']['input'];
};

export type GqlAddEventToActivityPayload = {
  __typename?: 'AddEventToActivityPayload';
  activity: GqlActivity;
  event: GqlEvent;
};

export type GqlAddGroupToTargetInput = {
  groupId: Scalars['String']['input'];
};

export type GqlAddGroupToTargetPayload = {
  __typename?: 'AddGroupToTargetPayload';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlAddLikeToEventInput = {
  eventId: Scalars['String']['input'];
  postedAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlAddLikeToEventPayload = {
  __typename?: 'AddLikeToEventPayload';
  like: GqlLike;
};

export type GqlAddOrganizationToTargetInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlAddOrganizationToTargetPayload = {
  __typename?: 'AddOrganizationToTargetPayload';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlAddParentGroupToGroupInput = {
  parentId: Scalars['String']['input'];
};

export type GqlAddParentGroupToGroupPayload = {
  __typename?: 'AddParentGroupToGroupPayload';
  group: GqlGroup;
  parent: GqlGroup;
};

export type GqlAddTargetInOrganizationInput = {
  targetId: Scalars['String']['input'];
};

export type GqlAddTargetInOrganizationPayload = {
  __typename?: 'AddTargetInOrganizationPayload';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlAddTargetToGroupInput = {
  targetId: Scalars['String']['input'];
};

export type GqlAddTargetToGroupPayload = {
  __typename?: 'AddTargetToGroupPayload';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlAddUserInOrganizationInput = {
  userId: Scalars['String']['input'];
};

export type GqlAddUserInOrganizationPayload = {
  __typename?: 'AddUserInOrganizationPayload';
  organization: GqlOrganization;
  user: GqlUser;
};

export type GqlAddUserToActivityInput = {
  userId: Scalars['String']['input'];
};

export type GqlAddUserToActivityPayload = {
  __typename?: 'AddUserToActivityPayload';
  activity: GqlActivity;
  user: GqlUser;
};

export type GqlAddUserToGroupInput = {
  userId: Scalars['String']['input'];
};

export type GqlAddUserToGroupPayload = {
  __typename?: 'AddUserToGroupPayload';
  group: GqlGroup;
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

export type GqlCreateActivityInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  eventId: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic: Scalars['Boolean']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlCreateEventInput = {
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
  startsAt: Scalars['Datetime']['input'];
};

export type GqlCreateGroupInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  childrenIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GqlCreateOrganizationInput = {
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

export type GqlCreateTargetInput = {
  groupId: Scalars['String']['input'];
  indexId: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  organizationId: Scalars['String']['input'];
  validFrom: Scalars['Datetime']['input'];
  validTo: Scalars['Datetime']['input'];
  value: Scalars['Float']['input'];
};

export type GqlDeleteCommentFromEventPayload = {
  __typename?: 'DeleteCommentFromEventPayload';
  comment: GqlComment;
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
  comments?: Maybe<GqlComments>;
  createdAt: Scalars['Datetime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  endsAt: Scalars['Datetime']['output'];
  id: Scalars['ID']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  isPublic: Scalars['Boolean']['output'];
  likes?: Maybe<GqlLikes>;
  plannedEndsAt?: Maybe<Scalars['Datetime']['output']>;
  plannedStartsAt?: Maybe<Scalars['Datetime']['output']>;
  startsAt: Scalars['Datetime']['output'];
  totalMinutes: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
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

export type GqlEventSortInput = {
  startsAt?: InputMaybe<GqlSortDirection>;
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

export type GqlGroupSortInput = {
  createdAt?: InputMaybe<GqlSortDirection>;
  updatedAt?: InputMaybe<GqlSortDirection>;
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

export type GqlLikes = {
  __typename?: 'Likes';
  data: Array<GqlLike>;
  total: Scalars['Int']['output'];
};

export type GqlMutation = {
  __typename?: 'Mutation';
  UpdateUserOfActivity?: Maybe<GqlUpdateUserOfActivityPayload>;
  addChildGroupToGroup?: Maybe<GqlAddChildGroupToGroupPayload>;
  addCommentToEvent?: Maybe<GqlAddCommentToEventPayload>;
  addEventOfGroup?: Maybe<GqlAddEventOfGroupPayload>;
  addEventToActivity?: Maybe<GqlAddEventToActivityPayload>;
  addGroupToTarget?: Maybe<GqlAddGroupToTargetPayload>;
  addLikeToEvent?: Maybe<GqlAddLikeToEventPayload>;
  addOrganizationToTarget?: Maybe<GqlAddOrganizationToTargetPayload>;
  addParentGroupToGroup?: Maybe<GqlAddParentGroupToGroupPayload>;
  addTargetInOrganization?: Maybe<GqlAddTargetInOrganizationPayload>;
  addTargetToGroup?: Maybe<GqlAddTargetToGroupPayload>;
  addUserInOrganization?: Maybe<GqlAddUserInOrganizationPayload>;
  addUserToActivity?: Maybe<GqlAddUserToActivityPayload>;
  addUserToGroup?: Maybe<GqlAddUserToGroupPayload>;
  createActivity?: Maybe<GqlActivity>;
  createEvent?: Maybe<GqlEvent>;
  createGroup?: Maybe<GqlGroup>;
  createOrganization?: Maybe<GqlOrganization>;
  createTarget?: Maybe<GqlTarget>;
  deleteActivity?: Maybe<GqlActivity>;
  deleteCommentFromEvent?: Maybe<GqlDeleteCommentFromEventPayload>;
  deleteEvent?: Maybe<GqlEvent>;
  deleteGroup?: Maybe<GqlGroup>;
  deleteOrganization?: Maybe<GqlOrganization>;
  deleteTarget?: Maybe<GqlTarget>;
  mutationEcho: Scalars['String']['output'];
  removeChildGroupFromParent?: Maybe<GqlRemoveChildGroupFromParentPayload>;
  removeEventFromActivity?: Maybe<GqlRemoveEventFromActivityPayload>;
  removeEventFromGroup?: Maybe<GqlRemoveEventFromGroupPayload>;
  removeGroupFromTarget?: Maybe<GqlRemoveGroupFromTargetPayload>;
  removeLikeFromEvent?: Maybe<GqlRemoveLikeFromEventPayload>;
  removeOrganizationFromTarget?: Maybe<GqlRemoveOrganizationFromTargetPayload>;
  removeParentGroupFromParent?: Maybe<GqlRemoveParentGroupFromParentPayload>;
  removeTargetFromGroup?: Maybe<GqlRemoveTargetFromGroupPayload>;
  removeTargetFromOrganization?: Maybe<GqlRemoveTargetFromOrganizationPayload>;
  removeUserFromGroup?: Maybe<GqlRemoveUserFromGroupPayload>;
  removeUserFromOrganization?: Maybe<GqlRemoveUserFromOrganizationPayload>;
  updateActivityInfo?: Maybe<GqlUpdateActivityInfoPayload>;
  updateActivityPrivacy?: Maybe<GqlUpdateActivityPrivacyPayload>;
  updateCommentOfEvent?: Maybe<GqlUpdateCommentOfEventPayload>;
  updateEventInfo?: Maybe<GqlUpdateEventInfoPayload>;
  updateGroupInfo?: Maybe<GqlUpdateGroupInfoPayload>;
  updateGroupOfOrganization?: Maybe<GqlUpdateGroupOfOrganizationPayload>;
  updateIndexOfTarget?: Maybe<GqlUpdateIndexOfTargetPayload>;
  updateOrganizationDefaultInfo?: Maybe<GqlUpdateOrganizationDefaultInfoPayload>;
  updateOrganizationOverview?: Maybe<GqlUpdateOrganizationOverviewPayload>;
  updateTargetInfo?: Maybe<GqlUpdateTargetInfoPayload>;
  userAddActivity?: Maybe<GqlUserAddActivityPayload>;
  userAddGroup?: Maybe<GqlUserAddGroupPayload>;
  userAddOrganization?: Maybe<GqlUserRemoveOrganizationPayload>;
  userCreate?: Maybe<GqlUserCreatePayload>;
  userDelete?: Maybe<GqlUserDeletePayload>;
  userPublish?: Maybe<GqlUserPrivacyPayload>;
  userRemoveActivity?: Maybe<GqlUserRemoveActivityPayload>;
  userRemoveGroup?: Maybe<GqlUserRemoveGroupPayload>;
  userRemoveOrganization?: Maybe<GqlUserRemoveOrganizationPayload>;
  userUnpublish?: Maybe<GqlUserPrivacyPayload>;
  userUpdate?: Maybe<GqlUserUpdatePayload>;
};


export type GqlMutationUpdateUserOfActivityArgs = {
  content: GqlUpdateUserOfActivityInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddChildGroupToGroupArgs = {
  content: GqlAddChildGroupToGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddCommentToEventArgs = {
  content: GqlAddCommentToEventInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddEventOfGroupArgs = {
  content: GqlAddEventOfGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddEventToActivityArgs = {
  content: GqlAddEventToActivityInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddGroupToTargetArgs = {
  content: GqlAddGroupToTargetInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddLikeToEventArgs = {
  content: GqlAddLikeToEventInput;
};


export type GqlMutationAddOrganizationToTargetArgs = {
  content: GqlAddOrganizationToTargetInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddParentGroupToGroupArgs = {
  content: GqlAddParentGroupToGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddTargetInOrganizationArgs = {
  content: GqlAddTargetInOrganizationInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddTargetToGroupArgs = {
  content: GqlAddTargetToGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddUserInOrganizationArgs = {
  content: GqlAddUserInOrganizationInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddUserToActivityArgs = {
  content: GqlAddUserToActivityInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationAddUserToGroupArgs = {
  content: GqlAddUserToGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationCreateActivityArgs = {
  content: GqlCreateActivityInput;
};


export type GqlMutationCreateEventArgs = {
  content: GqlCreateEventInput;
};


export type GqlMutationCreateGroupArgs = {
  content: GqlCreateGroupInput;
};


export type GqlMutationCreateOrganizationArgs = {
  content: GqlCreateOrganizationInput;
};


export type GqlMutationCreateTargetArgs = {
  content: GqlCreateTargetInput;
};


export type GqlMutationDeleteActivityArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationDeleteCommentFromEventArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationDeleteEventArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationDeleteGroupArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationDeleteOrganizationArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationDeleteTargetArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveChildGroupFromParentArgs = {
  content: GqlRemoveChildGroupFromParentInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveEventFromActivityArgs = {
  content: GqlRemoveEventFromActivityInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveEventFromGroupArgs = {
  content: GqlRemoveEventFromGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveGroupFromTargetArgs = {
  content: GqlRemoveGroupFromTargetInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveLikeFromEventArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveOrganizationFromTargetArgs = {
  content: GqlRemoveOrganizationFromTargetInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveParentGroupFromParentArgs = {
  content: GqlRemoveParentGroupFromParentInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveTargetFromGroupArgs = {
  content: GqlRemoveTargetFromGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveTargetFromOrganizationArgs = {
  content: GqlRemoveTargetFromOrganizationInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveUserFromGroupArgs = {
  content: GqlRemoveUserFromGroupInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveUserFromOrganizationArgs = {
  content: GqlRemoveUserFromOrganizationInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateActivityInfoArgs = {
  content: GqlUpdateActivityInfoInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateActivityPrivacyArgs = {
  content: GqlUpdateActivityPrivacyInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateCommentOfEventArgs = {
  content: GqlUpdateCommentOfEventInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateEventInfoArgs = {
  content: GqlUpdateEventInfoInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateGroupInfoArgs = {
  content: GqlUpdateGroupInfoInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateGroupOfOrganizationArgs = {
  content: GqlUpdateGroupOfOrganizationInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateIndexOfTargetArgs = {
  content: GqlUpdateIndexOfTargetInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateOrganizationDefaultInfoArgs = {
  content: GqlUpdateOrganizationDefaultInfoInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateOrganizationOverviewArgs = {
  content: GqlUpdateOrganizationOverviewInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateTargetInfoArgs = {
  content: GqlUpdateTargetInfoInput;
  id: Scalars['ID']['input'];
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
  name: Scalars['String']['output'];
  state: GqlState;
  targets?: Maybe<Array<GqlTarget>>;
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  users?: Maybe<Array<GqlUser>>;
  website?: Maybe<Scalars['String']['output']>;
  zipcode: Scalars['String']['output'];
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

export type GqlOrganizationSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
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

export type GqlRemoveChildGroupFromParentInput = {
  childId: Scalars['String']['input'];
};

export type GqlRemoveChildGroupFromParentPayload = {
  __typename?: 'RemoveChildGroupFromParentPayload';
  child: GqlGroup;
  group: GqlGroup;
};

export type GqlRemoveEventFromActivityInput = {
  eventId: Scalars['String']['input'];
};

export type GqlRemoveEventFromActivityPayload = {
  __typename?: 'RemoveEventFromActivityPayload';
  activity: GqlActivity;
  event: GqlEvent;
};

export type GqlRemoveEventFromGroupInput = {
  eventId: Scalars['String']['input'];
};

export type GqlRemoveEventFromGroupPayload = {
  __typename?: 'RemoveEventFromGroupPayload';
  event: GqlEvent;
  group: GqlGroup;
};

export type GqlRemoveGroupFromTargetInput = {
  groupId: Scalars['String']['input'];
};

export type GqlRemoveGroupFromTargetPayload = {
  __typename?: 'RemoveGroupFromTargetPayload';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlRemoveLikeFromEventPayload = {
  __typename?: 'RemoveLikeFromEventPayload';
  like: GqlLike;
};

export type GqlRemoveOrganizationFromTargetInput = {
  organizationId: Scalars['String']['input'];
};

export type GqlRemoveOrganizationFromTargetPayload = {
  __typename?: 'RemoveOrganizationFromTargetPayload';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlRemoveParentGroupFromParentInput = {
  parentId: Scalars['String']['input'];
};

export type GqlRemoveParentGroupFromParentPayload = {
  __typename?: 'RemoveParentGroupFromParentPayload';
  group: GqlGroup;
  parent: GqlGroup;
};

export type GqlRemoveTargetFromGroupInput = {
  targetId: Scalars['String']['input'];
};

export type GqlRemoveTargetFromGroupPayload = {
  __typename?: 'RemoveTargetFromGroupPayload';
  group: GqlGroup;
  target: GqlTarget;
};

export type GqlRemoveTargetFromOrganizationInput = {
  targetId: Scalars['String']['input'];
};

export type GqlRemoveTargetFromOrganizationPayload = {
  __typename?: 'RemoveTargetFromOrganizationPayload';
  organization: GqlOrganization;
  target: GqlTarget;
};

export type GqlRemoveUserFromGroupInput = {
  userId: Scalars['String']['input'];
};

export type GqlRemoveUserFromGroupPayload = {
  __typename?: 'RemoveUserFromGroupPayload';
  group: GqlGroup;
  user: GqlUser;
};

export type GqlRemoveUserFromOrganizationInput = {
  userId: Scalars['String']['input'];
};

export type GqlRemoveUserFromOrganizationPayload = {
  __typename?: 'RemoveUserFromOrganizationPayload';
  organization: GqlOrganization;
  user: GqlUser;
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

export type GqlTargetEdge = GqlEdge & {
  __typename?: 'TargetEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlTarget>;
};

export type GqlTargetFilterInput = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlTargetSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlTargetsConnection = {
  __typename?: 'TargetsConnection';
  edges?: Maybe<Array<Maybe<GqlTargetEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type GqlUpdateActivityInfoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
};

export type GqlUpdateActivityInfoPayload = {
  __typename?: 'UpdateActivityInfoPayload';
  activity: GqlActivity;
};

export type GqlUpdateActivityPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlUpdateActivityPrivacyPayload = {
  __typename?: 'UpdateActivityPrivacyPayload';
  activity: GqlActivity;
};

export type GqlUpdateCommentOfEventInput = {
  content?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUpdateCommentOfEventPayload = {
  __typename?: 'UpdateCommentOfEventPayload';
  comment: GqlComment;
};

export type GqlUpdateEventInfoInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt?: InputMaybe<Scalars['Datetime']['input']>;
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  organizationIds?: InputMaybe<Array<Scalars['String']['input']>>;
  plannedEndsAt?: InputMaybe<Scalars['Datetime']['input']>;
  plannedStartsAt?: InputMaybe<Scalars['Datetime']['input']>;
  startsAt?: InputMaybe<Scalars['Datetime']['input']>;
};

export type GqlUpdateEventInfoPayload = {
  __typename?: 'UpdateEventInfoPayload';
  event: GqlEvent;
};

export type GqlUpdateGroupInfoInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUpdateGroupInfoPayload = {
  __typename?: 'UpdateGroupInfoPayload';
  group: GqlGroup;
};

export type GqlUpdateGroupOfOrganizationInput = {
  groupId: Scalars['String']['input'];
};

export type GqlUpdateGroupOfOrganizationPayload = {
  __typename?: 'UpdateGroupOfOrganizationPayload';
  group: GqlGroup;
  organization: GqlOrganization;
};

export type GqlUpdateIndexOfTargetInput = {
  indexId: Scalars['Int']['input'];
};

export type GqlUpdateIndexOfTargetPayload = {
  __typename?: 'UpdateIndexOfTargetPayload';
  index: GqlIndex;
  target: GqlTarget;
};

export type GqlUpdateOrganizationDefaultInfoInput = {
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

export type GqlUpdateOrganizationDefaultInfoPayload = {
  __typename?: 'UpdateOrganizationDefaultInfoPayload';
  organization: GqlOrganization;
};

export type GqlUpdateOrganizationOverviewInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUpdateOrganizationOverviewPayload = {
  __typename?: 'UpdateOrganizationOverviewPayload';
  organization: GqlOrganization;
};

export type GqlUpdateTargetInfoInput = {
  indexId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  validFrom?: InputMaybe<Scalars['Datetime']['input']>;
  validTo?: InputMaybe<Scalars['Datetime']['input']>;
  value?: InputMaybe<Scalars['Float']['input']>;
};

export type GqlUpdateTargetInfoPayload = {
  __typename?: 'UpdateTargetInfoPayload';
  indexId?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  validFrom?: Maybe<Scalars['Datetime']['output']>;
  validTo?: Maybe<Scalars['Datetime']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

export type GqlUpdateUserOfActivityInput = {
  userId: Scalars['String']['input'];
};

export type GqlUpdateUserOfActivityPayload = {
  __typename?: 'UpdateUserOfActivityPayload';
  activity: GqlActivity;
  user: GqlUser;
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
  isPublic: Scalars['Boolean']['input'];
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserPrivacyInput = {
  isPublic: Scalars['Boolean']['input'];
};

export type GqlUserPrivacyPayload = GqlAuthError | GqlComplexQueryError | GqlInvalidInputValueError | GqlUserPrivacySuccess;

export type GqlUserPrivacySuccess = {
  __typename?: 'UserPrivacySuccess';
  user: GqlUser;
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
  UserAddActivityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserAddActivitySuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user?: Maybe<_RefType['User']> } );
  UserAddGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserAddGroupSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } );
  UserAddOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserAddOrganizationSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
  UserCreatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserCreateSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
  UserDeletePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( GqlUserDeleteSuccess );
  UserPrivacyPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserPrivacySuccess, 'user'> & { user: _RefType['User'] } );
  UserRemoveActivityPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserRemoveActivitySuccess, 'activity' | 'user'> & { activity: _RefType['Activity'], user: _RefType['User'] } );
  UserRemoveGroupPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserRemoveGroupSuccess, 'group' | 'user'> & { group: _RefType['Group'], user: _RefType['User'] } );
  UserRemoveOrganizationPayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserRemoveOrganizationSuccess, 'organization' | 'user'> & { organization: _RefType['Organization'], user: _RefType['User'] } );
  UserUpdatePayload: ( GqlAuthError ) | ( GqlComplexQueryError ) | ( GqlInvalidInputValueError ) | ( Omit<GqlUserUpdateSuccess, 'user'> & { user?: Maybe<_RefType['User']> } );
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
  ActivityEdge: ResolverTypeWrapper<Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Activity']> }>;
  ActivityFilterInput: GqlActivityFilterInput;
  ActivitySortInput: GqlActivitySortInput;
  AddChildGroupToGroupInput: GqlAddChildGroupToGroupInput;
  AddChildGroupToGroupPayload: ResolverTypeWrapper<Omit<GqlAddChildGroupToGroupPayload, 'child' | 'group'> & { child: GqlResolversTypes['Group'], group: GqlResolversTypes['Group'] }>;
  AddCommentToEventInput: GqlAddCommentToEventInput;
  AddCommentToEventPayload: ResolverTypeWrapper<Omit<GqlAddCommentToEventPayload, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  AddEventOfGroupInput: GqlAddEventOfGroupInput;
  AddEventOfGroupPayload: ResolverTypeWrapper<Omit<GqlAddEventOfGroupPayload, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  AddEventToActivityInput: GqlAddEventToActivityInput;
  AddEventToActivityPayload: ResolverTypeWrapper<Omit<GqlAddEventToActivityPayload, 'activity' | 'event'> & { activity: GqlResolversTypes['Activity'], event: GqlResolversTypes['Event'] }>;
  AddGroupToTargetInput: GqlAddGroupToTargetInput;
  AddGroupToTargetPayload: ResolverTypeWrapper<Omit<GqlAddGroupToTargetPayload, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  AddLikeToEventInput: GqlAddLikeToEventInput;
  AddLikeToEventPayload: ResolverTypeWrapper<Omit<GqlAddLikeToEventPayload, 'like'> & { like: GqlResolversTypes['Like'] }>;
  AddOrganizationToTargetInput: GqlAddOrganizationToTargetInput;
  AddOrganizationToTargetPayload: ResolverTypeWrapper<Omit<GqlAddOrganizationToTargetPayload, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  AddParentGroupToGroupInput: GqlAddParentGroupToGroupInput;
  AddParentGroupToGroupPayload: ResolverTypeWrapper<Omit<GqlAddParentGroupToGroupPayload, 'group' | 'parent'> & { group: GqlResolversTypes['Group'], parent: GqlResolversTypes['Group'] }>;
  AddTargetInOrganizationInput: GqlAddTargetInOrganizationInput;
  AddTargetInOrganizationPayload: ResolverTypeWrapper<Omit<GqlAddTargetInOrganizationPayload, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  AddTargetToGroupInput: GqlAddTargetToGroupInput;
  AddTargetToGroupPayload: ResolverTypeWrapper<Omit<GqlAddTargetToGroupPayload, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  AddUserInOrganizationInput: GqlAddUserInOrganizationInput;
  AddUserInOrganizationPayload: ResolverTypeWrapper<Omit<GqlAddUserInOrganizationPayload, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  AddUserToActivityInput: GqlAddUserToActivityInput;
  AddUserToActivityPayload: ResolverTypeWrapper<Omit<GqlAddUserToActivityPayload, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user: GqlResolversTypes['User'] }>;
  AddUserToGroupInput: GqlAddUserToGroupInput;
  AddUserToGroupPayload: ResolverTypeWrapper<Omit<GqlAddUserToGroupPayload, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  Agenda: ResolverTypeWrapper<Agenda>;
  AuthError: ResolverTypeWrapper<GqlAuthError>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  City: ResolverTypeWrapper<City>;
  Comment: ResolverTypeWrapper<Comment>;
  Comments: ResolverTypeWrapper<Omit<GqlComments, 'data'> & { data: Array<GqlResolversTypes['Comment']> }>;
  ComplexQueryError: ResolverTypeWrapper<GqlComplexQueryError>;
  CreateActivityInput: GqlCreateActivityInput;
  CreateEventInput: GqlCreateEventInput;
  CreateGroupInput: GqlCreateGroupInput;
  CreateOrganizationInput: GqlCreateOrganizationInput;
  CreateTargetInput: GqlCreateTargetInput;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  DeleteCommentFromEventPayload: ResolverTypeWrapper<Omit<GqlDeleteCommentFromEventPayload, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  EntityPosition: GqlEntityPosition;
  Error: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Error']>;
  Event: ResolverTypeWrapper<Event>;
  EventEdge: ResolverTypeWrapper<Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Event']> }>;
  EventFilterInput: GqlEventFilterInput;
  EventSortInput: GqlEventSortInput;
  EventsConnection: ResolverTypeWrapper<Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['EventEdge']>>> }>;
  Field: ResolverTypeWrapper<GqlField>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Group: ResolverTypeWrapper<Group>;
  GroupEdge: ResolverTypeWrapper<Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Group']> }>;
  GroupFilterInput: GqlGroupFilterInput;
  GroupSortInput: GqlGroupSortInput;
  GroupsConnection: ResolverTypeWrapper<Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['GroupEdge']>>> }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Index: ResolverTypeWrapper<Index>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvalidInputValueError: ResolverTypeWrapper<GqlInvalidInputValueError>;
  Like: ResolverTypeWrapper<Like>;
  Likes: ResolverTypeWrapper<Omit<GqlLikes, 'data'> & { data: Array<GqlResolversTypes['Like']> }>;
  Mutation: ResolverTypeWrapper<{}>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationEdge: ResolverTypeWrapper<Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Organization']> }>;
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationSortInput: GqlOrganizationSortInput;
  Organizations: ResolverTypeWrapper<Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversTypes['Organization']> }>;
  OrganizationsConnection: ResolverTypeWrapper<Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OrganizationEdge']>>> }>;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Query: ResolverTypeWrapper<{}>;
  RemoveChildGroupFromParentInput: GqlRemoveChildGroupFromParentInput;
  RemoveChildGroupFromParentPayload: ResolverTypeWrapper<Omit<GqlRemoveChildGroupFromParentPayload, 'child' | 'group'> & { child: GqlResolversTypes['Group'], group: GqlResolversTypes['Group'] }>;
  RemoveEventFromActivityInput: GqlRemoveEventFromActivityInput;
  RemoveEventFromActivityPayload: ResolverTypeWrapper<Omit<GqlRemoveEventFromActivityPayload, 'activity' | 'event'> & { activity: GqlResolversTypes['Activity'], event: GqlResolversTypes['Event'] }>;
  RemoveEventFromGroupInput: GqlRemoveEventFromGroupInput;
  RemoveEventFromGroupPayload: ResolverTypeWrapper<Omit<GqlRemoveEventFromGroupPayload, 'event' | 'group'> & { event: GqlResolversTypes['Event'], group: GqlResolversTypes['Group'] }>;
  RemoveGroupFromTargetInput: GqlRemoveGroupFromTargetInput;
  RemoveGroupFromTargetPayload: ResolverTypeWrapper<Omit<GqlRemoveGroupFromTargetPayload, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  RemoveLikeFromEventPayload: ResolverTypeWrapper<Omit<GqlRemoveLikeFromEventPayload, 'like'> & { like: GqlResolversTypes['Like'] }>;
  RemoveOrganizationFromTargetInput: GqlRemoveOrganizationFromTargetInput;
  RemoveOrganizationFromTargetPayload: ResolverTypeWrapper<Omit<GqlRemoveOrganizationFromTargetPayload, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  RemoveParentGroupFromParentInput: GqlRemoveParentGroupFromParentInput;
  RemoveParentGroupFromParentPayload: ResolverTypeWrapper<Omit<GqlRemoveParentGroupFromParentPayload, 'group' | 'parent'> & { group: GqlResolversTypes['Group'], parent: GqlResolversTypes['Group'] }>;
  RemoveTargetFromGroupInput: GqlRemoveTargetFromGroupInput;
  RemoveTargetFromGroupPayload: ResolverTypeWrapper<Omit<GqlRemoveTargetFromGroupPayload, 'group' | 'target'> & { group: GqlResolversTypes['Group'], target: GqlResolversTypes['Target'] }>;
  RemoveTargetFromOrganizationInput: GqlRemoveTargetFromOrganizationInput;
  RemoveTargetFromOrganizationPayload: ResolverTypeWrapper<Omit<GqlRemoveTargetFromOrganizationPayload, 'organization' | 'target'> & { organization: GqlResolversTypes['Organization'], target: GqlResolversTypes['Target'] }>;
  RemoveUserFromGroupInput: GqlRemoveUserFromGroupInput;
  RemoveUserFromGroupPayload: ResolverTypeWrapper<Omit<GqlRemoveUserFromGroupPayload, 'group' | 'user'> & { group: GqlResolversTypes['Group'], user: GqlResolversTypes['User'] }>;
  RemoveUserFromOrganizationInput: GqlRemoveUserFromOrganizationInput;
  RemoveUserFromOrganizationPayload: ResolverTypeWrapper<Omit<GqlRemoveUserFromOrganizationPayload, 'organization' | 'user'> & { organization: GqlResolversTypes['Organization'], user: GqlResolversTypes['User'] }>;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Target: ResolverTypeWrapper<Target>;
  TargetEdge: ResolverTypeWrapper<Omit<GqlTargetEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Target']> }>;
  TargetFilterInput: GqlTargetFilterInput;
  TargetSortInput: GqlTargetSortInput;
  TargetsConnection: ResolverTypeWrapper<Omit<GqlTargetsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['TargetEdge']>>> }>;
  UpdateActivityInfoInput: GqlUpdateActivityInfoInput;
  UpdateActivityInfoPayload: ResolverTypeWrapper<Omit<GqlUpdateActivityInfoPayload, 'activity'> & { activity: GqlResolversTypes['Activity'] }>;
  UpdateActivityPrivacyInput: GqlUpdateActivityPrivacyInput;
  UpdateActivityPrivacyPayload: ResolverTypeWrapper<Omit<GqlUpdateActivityPrivacyPayload, 'activity'> & { activity: GqlResolversTypes['Activity'] }>;
  UpdateCommentOfEventInput: GqlUpdateCommentOfEventInput;
  UpdateCommentOfEventPayload: ResolverTypeWrapper<Omit<GqlUpdateCommentOfEventPayload, 'comment'> & { comment: GqlResolversTypes['Comment'] }>;
  UpdateEventInfoInput: GqlUpdateEventInfoInput;
  UpdateEventInfoPayload: ResolverTypeWrapper<Omit<GqlUpdateEventInfoPayload, 'event'> & { event: GqlResolversTypes['Event'] }>;
  UpdateGroupInfoInput: GqlUpdateGroupInfoInput;
  UpdateGroupInfoPayload: ResolverTypeWrapper<Omit<GqlUpdateGroupInfoPayload, 'group'> & { group: GqlResolversTypes['Group'] }>;
  UpdateGroupOfOrganizationInput: GqlUpdateGroupOfOrganizationInput;
  UpdateGroupOfOrganizationPayload: ResolverTypeWrapper<Omit<GqlUpdateGroupOfOrganizationPayload, 'group' | 'organization'> & { group: GqlResolversTypes['Group'], organization: GqlResolversTypes['Organization'] }>;
  UpdateIndexOfTargetInput: GqlUpdateIndexOfTargetInput;
  UpdateIndexOfTargetPayload: ResolverTypeWrapper<Omit<GqlUpdateIndexOfTargetPayload, 'index' | 'target'> & { index: GqlResolversTypes['Index'], target: GqlResolversTypes['Target'] }>;
  UpdateOrganizationDefaultInfoInput: GqlUpdateOrganizationDefaultInfoInput;
  UpdateOrganizationDefaultInfoPayload: ResolverTypeWrapper<Omit<GqlUpdateOrganizationDefaultInfoPayload, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  UpdateOrganizationOverviewInput: GqlUpdateOrganizationOverviewInput;
  UpdateOrganizationOverviewPayload: ResolverTypeWrapper<Omit<GqlUpdateOrganizationOverviewPayload, 'organization'> & { organization: GqlResolversTypes['Organization'] }>;
  UpdateTargetInfoInput: GqlUpdateTargetInfoInput;
  UpdateTargetInfoPayload: ResolverTypeWrapper<GqlUpdateTargetInfoPayload>;
  UpdateUserOfActivityInput: GqlUpdateUserOfActivityInput;
  UpdateUserOfActivityPayload: ResolverTypeWrapper<Omit<GqlUpdateUserOfActivityPayload, 'activity' | 'user'> & { activity: GqlResolversTypes['Activity'], user: GqlResolversTypes['User'] }>;
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
  UserPrivacyPayload: ResolverTypeWrapper<GqlResolversUnionTypes<GqlResolversTypes>['UserPrivacyPayload']>;
  UserPrivacySuccess: ResolverTypeWrapper<Omit<GqlUserPrivacySuccess, 'user'> & { user: GqlResolversTypes['User'] }>;
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
  UserUpdateSuccess: ResolverTypeWrapper<Omit<GqlUserUpdateSuccess, 'user'> & { user?: Maybe<GqlResolversTypes['User']> }>;
  UsersConnection: ResolverTypeWrapper<Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>> }>;
  ValueType: GqlValueType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlResolversParentTypes = ResolversObject<{
  Activities: Omit<GqlActivities, 'data'> & { data: Array<GqlResolversParentTypes['Activity']> };
  ActivitiesConnection: Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ActivityEdge']>>> };
  Activity: Activity;
  ActivityEdge: Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Activity']> };
  ActivityFilterInput: GqlActivityFilterInput;
  ActivitySortInput: GqlActivitySortInput;
  AddChildGroupToGroupInput: GqlAddChildGroupToGroupInput;
  AddChildGroupToGroupPayload: Omit<GqlAddChildGroupToGroupPayload, 'child' | 'group'> & { child: GqlResolversParentTypes['Group'], group: GqlResolversParentTypes['Group'] };
  AddCommentToEventInput: GqlAddCommentToEventInput;
  AddCommentToEventPayload: Omit<GqlAddCommentToEventPayload, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  AddEventOfGroupInput: GqlAddEventOfGroupInput;
  AddEventOfGroupPayload: Omit<GqlAddEventOfGroupPayload, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  AddEventToActivityInput: GqlAddEventToActivityInput;
  AddEventToActivityPayload: Omit<GqlAddEventToActivityPayload, 'activity' | 'event'> & { activity: GqlResolversParentTypes['Activity'], event: GqlResolversParentTypes['Event'] };
  AddGroupToTargetInput: GqlAddGroupToTargetInput;
  AddGroupToTargetPayload: Omit<GqlAddGroupToTargetPayload, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  AddLikeToEventInput: GqlAddLikeToEventInput;
  AddLikeToEventPayload: Omit<GqlAddLikeToEventPayload, 'like'> & { like: GqlResolversParentTypes['Like'] };
  AddOrganizationToTargetInput: GqlAddOrganizationToTargetInput;
  AddOrganizationToTargetPayload: Omit<GqlAddOrganizationToTargetPayload, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  AddParentGroupToGroupInput: GqlAddParentGroupToGroupInput;
  AddParentGroupToGroupPayload: Omit<GqlAddParentGroupToGroupPayload, 'group' | 'parent'> & { group: GqlResolversParentTypes['Group'], parent: GqlResolversParentTypes['Group'] };
  AddTargetInOrganizationInput: GqlAddTargetInOrganizationInput;
  AddTargetInOrganizationPayload: Omit<GqlAddTargetInOrganizationPayload, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  AddTargetToGroupInput: GqlAddTargetToGroupInput;
  AddTargetToGroupPayload: Omit<GqlAddTargetToGroupPayload, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  AddUserInOrganizationInput: GqlAddUserInOrganizationInput;
  AddUserInOrganizationPayload: Omit<GqlAddUserInOrganizationPayload, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  AddUserToActivityInput: GqlAddUserToActivityInput;
  AddUserToActivityPayload: Omit<GqlAddUserToActivityPayload, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user: GqlResolversParentTypes['User'] };
  AddUserToGroupInput: GqlAddUserToGroupInput;
  AddUserToGroupPayload: Omit<GqlAddUserToGroupPayload, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  Agenda: Agenda;
  AuthError: GqlAuthError;
  Boolean: Scalars['Boolean']['output'];
  City: City;
  Comment: Comment;
  Comments: Omit<GqlComments, 'data'> & { data: Array<GqlResolversParentTypes['Comment']> };
  ComplexQueryError: GqlComplexQueryError;
  CreateActivityInput: GqlCreateActivityInput;
  CreateEventInput: GqlCreateEventInput;
  CreateGroupInput: GqlCreateGroupInput;
  CreateOrganizationInput: GqlCreateOrganizationInput;
  CreateTargetInput: GqlCreateTargetInput;
  Datetime: Scalars['Datetime']['output'];
  DeleteCommentFromEventPayload: Omit<GqlDeleteCommentFromEventPayload, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Error: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Error'];
  Event: Event;
  EventEdge: Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Event']> };
  EventFilterInput: GqlEventFilterInput;
  EventSortInput: GqlEventSortInput;
  EventsConnection: Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['EventEdge']>>> };
  Field: GqlField;
  Float: Scalars['Float']['output'];
  Group: Group;
  GroupEdge: Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Group']> };
  GroupFilterInput: GqlGroupFilterInput;
  GroupSortInput: GqlGroupSortInput;
  GroupsConnection: Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['GroupEdge']>>> };
  ID: Scalars['ID']['output'];
  Index: Index;
  Int: Scalars['Int']['output'];
  InvalidInputValueError: GqlInvalidInputValueError;
  Like: Like;
  Likes: Omit<GqlLikes, 'data'> & { data: Array<GqlResolversParentTypes['Like']> };
  Mutation: {};
  Organization: Organization;
  OrganizationEdge: Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Organization']> };
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationSortInput: GqlOrganizationSortInput;
  Organizations: Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversParentTypes['Organization']> };
  OrganizationsConnection: Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OrganizationEdge']>>> };
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Query: {};
  RemoveChildGroupFromParentInput: GqlRemoveChildGroupFromParentInput;
  RemoveChildGroupFromParentPayload: Omit<GqlRemoveChildGroupFromParentPayload, 'child' | 'group'> & { child: GqlResolversParentTypes['Group'], group: GqlResolversParentTypes['Group'] };
  RemoveEventFromActivityInput: GqlRemoveEventFromActivityInput;
  RemoveEventFromActivityPayload: Omit<GqlRemoveEventFromActivityPayload, 'activity' | 'event'> & { activity: GqlResolversParentTypes['Activity'], event: GqlResolversParentTypes['Event'] };
  RemoveEventFromGroupInput: GqlRemoveEventFromGroupInput;
  RemoveEventFromGroupPayload: Omit<GqlRemoveEventFromGroupPayload, 'event' | 'group'> & { event: GqlResolversParentTypes['Event'], group: GqlResolversParentTypes['Group'] };
  RemoveGroupFromTargetInput: GqlRemoveGroupFromTargetInput;
  RemoveGroupFromTargetPayload: Omit<GqlRemoveGroupFromTargetPayload, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  RemoveLikeFromEventPayload: Omit<GqlRemoveLikeFromEventPayload, 'like'> & { like: GqlResolversParentTypes['Like'] };
  RemoveOrganizationFromTargetInput: GqlRemoveOrganizationFromTargetInput;
  RemoveOrganizationFromTargetPayload: Omit<GqlRemoveOrganizationFromTargetPayload, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  RemoveParentGroupFromParentInput: GqlRemoveParentGroupFromParentInput;
  RemoveParentGroupFromParentPayload: Omit<GqlRemoveParentGroupFromParentPayload, 'group' | 'parent'> & { group: GqlResolversParentTypes['Group'], parent: GqlResolversParentTypes['Group'] };
  RemoveTargetFromGroupInput: GqlRemoveTargetFromGroupInput;
  RemoveTargetFromGroupPayload: Omit<GqlRemoveTargetFromGroupPayload, 'group' | 'target'> & { group: GqlResolversParentTypes['Group'], target: GqlResolversParentTypes['Target'] };
  RemoveTargetFromOrganizationInput: GqlRemoveTargetFromOrganizationInput;
  RemoveTargetFromOrganizationPayload: Omit<GqlRemoveTargetFromOrganizationPayload, 'organization' | 'target'> & { organization: GqlResolversParentTypes['Organization'], target: GqlResolversParentTypes['Target'] };
  RemoveUserFromGroupInput: GqlRemoveUserFromGroupInput;
  RemoveUserFromGroupPayload: Omit<GqlRemoveUserFromGroupPayload, 'group' | 'user'> & { group: GqlResolversParentTypes['Group'], user: GqlResolversParentTypes['User'] };
  RemoveUserFromOrganizationInput: GqlRemoveUserFromOrganizationInput;
  RemoveUserFromOrganizationPayload: Omit<GqlRemoveUserFromOrganizationPayload, 'organization' | 'user'> & { organization: GqlResolversParentTypes['Organization'], user: GqlResolversParentTypes['User'] };
  State: State;
  String: Scalars['String']['output'];
  Target: Target;
  TargetEdge: Omit<GqlTargetEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Target']> };
  TargetFilterInput: GqlTargetFilterInput;
  TargetSortInput: GqlTargetSortInput;
  TargetsConnection: Omit<GqlTargetsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['TargetEdge']>>> };
  UpdateActivityInfoInput: GqlUpdateActivityInfoInput;
  UpdateActivityInfoPayload: Omit<GqlUpdateActivityInfoPayload, 'activity'> & { activity: GqlResolversParentTypes['Activity'] };
  UpdateActivityPrivacyInput: GqlUpdateActivityPrivacyInput;
  UpdateActivityPrivacyPayload: Omit<GqlUpdateActivityPrivacyPayload, 'activity'> & { activity: GqlResolversParentTypes['Activity'] };
  UpdateCommentOfEventInput: GqlUpdateCommentOfEventInput;
  UpdateCommentOfEventPayload: Omit<GqlUpdateCommentOfEventPayload, 'comment'> & { comment: GqlResolversParentTypes['Comment'] };
  UpdateEventInfoInput: GqlUpdateEventInfoInput;
  UpdateEventInfoPayload: Omit<GqlUpdateEventInfoPayload, 'event'> & { event: GqlResolversParentTypes['Event'] };
  UpdateGroupInfoInput: GqlUpdateGroupInfoInput;
  UpdateGroupInfoPayload: Omit<GqlUpdateGroupInfoPayload, 'group'> & { group: GqlResolversParentTypes['Group'] };
  UpdateGroupOfOrganizationInput: GqlUpdateGroupOfOrganizationInput;
  UpdateGroupOfOrganizationPayload: Omit<GqlUpdateGroupOfOrganizationPayload, 'group' | 'organization'> & { group: GqlResolversParentTypes['Group'], organization: GqlResolversParentTypes['Organization'] };
  UpdateIndexOfTargetInput: GqlUpdateIndexOfTargetInput;
  UpdateIndexOfTargetPayload: Omit<GqlUpdateIndexOfTargetPayload, 'index' | 'target'> & { index: GqlResolversParentTypes['Index'], target: GqlResolversParentTypes['Target'] };
  UpdateOrganizationDefaultInfoInput: GqlUpdateOrganizationDefaultInfoInput;
  UpdateOrganizationDefaultInfoPayload: Omit<GqlUpdateOrganizationDefaultInfoPayload, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  UpdateOrganizationOverviewInput: GqlUpdateOrganizationOverviewInput;
  UpdateOrganizationOverviewPayload: Omit<GqlUpdateOrganizationOverviewPayload, 'organization'> & { organization: GqlResolversParentTypes['Organization'] };
  UpdateTargetInfoInput: GqlUpdateTargetInfoInput;
  UpdateTargetInfoPayload: GqlUpdateTargetInfoPayload;
  UpdateUserOfActivityInput: GqlUpdateUserOfActivityInput;
  UpdateUserOfActivityPayload: Omit<GqlUpdateUserOfActivityPayload, 'activity' | 'user'> & { activity: GqlResolversParentTypes['Activity'], user: GqlResolversParentTypes['User'] };
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
  UserPrivacyPayload: GqlResolversUnionTypes<GqlResolversParentTypes>['UserPrivacyPayload'];
  UserPrivacySuccess: Omit<GqlUserPrivacySuccess, 'user'> & { user: GqlResolversParentTypes['User'] };
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

export type GqlActivityEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['ActivityEdge'] = GqlResolversParentTypes['ActivityEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddChildGroupToGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddChildGroupToGroupPayload'] = GqlResolversParentTypes['AddChildGroupToGroupPayload']> = ResolversObject<{
  child?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddCommentToEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddCommentToEventPayload'] = GqlResolversParentTypes['AddCommentToEventPayload']> = ResolversObject<{
  comment?: Resolver<GqlResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddEventOfGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddEventOfGroupPayload'] = GqlResolversParentTypes['AddEventOfGroupPayload']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddEventToActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddEventToActivityPayload'] = GqlResolversParentTypes['AddEventToActivityPayload']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddGroupToTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddGroupToTargetPayload'] = GqlResolversParentTypes['AddGroupToTargetPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddLikeToEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddLikeToEventPayload'] = GqlResolversParentTypes['AddLikeToEventPayload']> = ResolversObject<{
  like?: Resolver<GqlResolversTypes['Like'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddOrganizationToTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddOrganizationToTargetPayload'] = GqlResolversParentTypes['AddOrganizationToTargetPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddParentGroupToGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddParentGroupToGroupPayload'] = GqlResolversParentTypes['AddParentGroupToGroupPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  parent?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddTargetInOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddTargetInOrganizationPayload'] = GqlResolversParentTypes['AddTargetInOrganizationPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddTargetToGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddTargetToGroupPayload'] = GqlResolversParentTypes['AddTargetToGroupPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddUserInOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddUserInOrganizationPayload'] = GqlResolversParentTypes['AddUserInOrganizationPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddUserToActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddUserToActivityPayload'] = GqlResolversParentTypes['AddUserToActivityPayload']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlAddUserToGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['AddUserToGroupPayload'] = GqlResolversParentTypes['AddUserToGroupPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
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

export type GqlDeleteCommentFromEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['DeleteCommentFromEventPayload'] = GqlResolversParentTypes['DeleteCommentFromEventPayload']> = ResolversObject<{
  comment?: Resolver<GqlResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

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
  comments?: Resolver<Maybe<GqlResolversTypes['Comments']>, ParentType, ContextType>;
  createdAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  endsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<GqlResolversTypes['String']>>, ParentType, ContextType>;
  isPublic?: Resolver<GqlResolversTypes['Boolean'], ParentType, ContextType>;
  likes?: Resolver<Maybe<GqlResolversTypes['Likes']>, ParentType, ContextType>;
  plannedEndsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  plannedStartsAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  startsAt?: Resolver<GqlResolversTypes['Datetime'], ParentType, ContextType>;
  totalMinutes?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlEventEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['EventEdge'] = GqlResolversParentTypes['EventEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType>;
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

export type GqlGroupEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['GroupEdge'] = GqlResolversParentTypes['GroupEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType>;
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

export type GqlLikesResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Likes'] = GqlResolversParentTypes['Likes']> = ResolversObject<{
  data?: Resolver<Array<GqlResolversTypes['Like']>, ParentType, ContextType>;
  total?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlMutationResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Mutation'] = GqlResolversParentTypes['Mutation']> = ResolversObject<{
  UpdateUserOfActivity?: Resolver<Maybe<GqlResolversTypes['UpdateUserOfActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateUserOfActivityArgs, 'content' | 'id'>>;
  addChildGroupToGroup?: Resolver<Maybe<GqlResolversTypes['AddChildGroupToGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddChildGroupToGroupArgs, 'content' | 'id'>>;
  addCommentToEvent?: Resolver<Maybe<GqlResolversTypes['AddCommentToEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddCommentToEventArgs, 'content' | 'id'>>;
  addEventOfGroup?: Resolver<Maybe<GqlResolversTypes['AddEventOfGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddEventOfGroupArgs, 'content' | 'id'>>;
  addEventToActivity?: Resolver<Maybe<GqlResolversTypes['AddEventToActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddEventToActivityArgs, 'content' | 'id'>>;
  addGroupToTarget?: Resolver<Maybe<GqlResolversTypes['AddGroupToTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddGroupToTargetArgs, 'content' | 'id'>>;
  addLikeToEvent?: Resolver<Maybe<GqlResolversTypes['AddLikeToEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddLikeToEventArgs, 'content'>>;
  addOrganizationToTarget?: Resolver<Maybe<GqlResolversTypes['AddOrganizationToTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddOrganizationToTargetArgs, 'content' | 'id'>>;
  addParentGroupToGroup?: Resolver<Maybe<GqlResolversTypes['AddParentGroupToGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddParentGroupToGroupArgs, 'content' | 'id'>>;
  addTargetInOrganization?: Resolver<Maybe<GqlResolversTypes['AddTargetInOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddTargetInOrganizationArgs, 'content' | 'id'>>;
  addTargetToGroup?: Resolver<Maybe<GqlResolversTypes['AddTargetToGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddTargetToGroupArgs, 'content' | 'id'>>;
  addUserInOrganization?: Resolver<Maybe<GqlResolversTypes['AddUserInOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddUserInOrganizationArgs, 'content' | 'id'>>;
  addUserToActivity?: Resolver<Maybe<GqlResolversTypes['AddUserToActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddUserToActivityArgs, 'content' | 'id'>>;
  addUserToGroup?: Resolver<Maybe<GqlResolversTypes['AddUserToGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationAddUserToGroupArgs, 'content' | 'id'>>;
  createActivity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType, RequireFields<GqlMutationCreateActivityArgs, 'content'>>;
  createEvent?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlMutationCreateEventArgs, 'content'>>;
  createGroup?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlMutationCreateGroupArgs, 'content'>>;
  createOrganization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlMutationCreateOrganizationArgs, 'content'>>;
  createTarget?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType, RequireFields<GqlMutationCreateTargetArgs, 'content'>>;
  deleteActivity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType, RequireFields<GqlMutationDeleteActivityArgs, 'id'>>;
  deleteCommentFromEvent?: Resolver<Maybe<GqlResolversTypes['DeleteCommentFromEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationDeleteCommentFromEventArgs, 'id'>>;
  deleteEvent?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlMutationDeleteEventArgs, 'id'>>;
  deleteGroup?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlMutationDeleteGroupArgs, 'id'>>;
  deleteOrganization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlMutationDeleteOrganizationArgs, 'id'>>;
  deleteTarget?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType, RequireFields<GqlMutationDeleteTargetArgs, 'id'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  removeChildGroupFromParent?: Resolver<Maybe<GqlResolversTypes['RemoveChildGroupFromParentPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveChildGroupFromParentArgs, 'content' | 'id'>>;
  removeEventFromActivity?: Resolver<Maybe<GqlResolversTypes['RemoveEventFromActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveEventFromActivityArgs, 'content' | 'id'>>;
  removeEventFromGroup?: Resolver<Maybe<GqlResolversTypes['RemoveEventFromGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveEventFromGroupArgs, 'content' | 'id'>>;
  removeGroupFromTarget?: Resolver<Maybe<GqlResolversTypes['RemoveGroupFromTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveGroupFromTargetArgs, 'content' | 'id'>>;
  removeLikeFromEvent?: Resolver<Maybe<GqlResolversTypes['RemoveLikeFromEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveLikeFromEventArgs, 'id'>>;
  removeOrganizationFromTarget?: Resolver<Maybe<GqlResolversTypes['RemoveOrganizationFromTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveOrganizationFromTargetArgs, 'content' | 'id'>>;
  removeParentGroupFromParent?: Resolver<Maybe<GqlResolversTypes['RemoveParentGroupFromParentPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveParentGroupFromParentArgs, 'content' | 'id'>>;
  removeTargetFromGroup?: Resolver<Maybe<GqlResolversTypes['RemoveTargetFromGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveTargetFromGroupArgs, 'content' | 'id'>>;
  removeTargetFromOrganization?: Resolver<Maybe<GqlResolversTypes['RemoveTargetFromOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveTargetFromOrganizationArgs, 'content' | 'id'>>;
  removeUserFromGroup?: Resolver<Maybe<GqlResolversTypes['RemoveUserFromGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveUserFromGroupArgs, 'content' | 'id'>>;
  removeUserFromOrganization?: Resolver<Maybe<GqlResolversTypes['RemoveUserFromOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationRemoveUserFromOrganizationArgs, 'content' | 'id'>>;
  updateActivityInfo?: Resolver<Maybe<GqlResolversTypes['UpdateActivityInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateActivityInfoArgs, 'content' | 'id'>>;
  updateActivityPrivacy?: Resolver<Maybe<GqlResolversTypes['UpdateActivityPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateActivityPrivacyArgs, 'content' | 'id'>>;
  updateCommentOfEvent?: Resolver<Maybe<GqlResolversTypes['UpdateCommentOfEventPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateCommentOfEventArgs, 'content' | 'id'>>;
  updateEventInfo?: Resolver<Maybe<GqlResolversTypes['UpdateEventInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateEventInfoArgs, 'content' | 'id'>>;
  updateGroupInfo?: Resolver<Maybe<GqlResolversTypes['UpdateGroupInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateGroupInfoArgs, 'content' | 'id'>>;
  updateGroupOfOrganization?: Resolver<Maybe<GqlResolversTypes['UpdateGroupOfOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateGroupOfOrganizationArgs, 'content' | 'id'>>;
  updateIndexOfTarget?: Resolver<Maybe<GqlResolversTypes['UpdateIndexOfTargetPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateIndexOfTargetArgs, 'content' | 'id'>>;
  updateOrganizationDefaultInfo?: Resolver<Maybe<GqlResolversTypes['UpdateOrganizationDefaultInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateOrganizationDefaultInfoArgs, 'content' | 'id'>>;
  updateOrganizationOverview?: Resolver<Maybe<GqlResolversTypes['UpdateOrganizationOverviewPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateOrganizationOverviewArgs, 'content' | 'id'>>;
  updateTargetInfo?: Resolver<Maybe<GqlResolversTypes['UpdateTargetInfoPayload']>, ParentType, ContextType, RequireFields<GqlMutationUpdateTargetInfoArgs, 'content' | 'id'>>;
  userAddActivity?: Resolver<Maybe<GqlResolversTypes['UserAddActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddActivityArgs, 'id' | 'input'>>;
  userAddGroup?: Resolver<Maybe<GqlResolversTypes['UserAddGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddGroupArgs, 'id' | 'input'>>;
  userAddOrganization?: Resolver<Maybe<GqlResolversTypes['UserRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserAddOrganizationArgs, 'id' | 'input'>>;
  userCreate?: Resolver<Maybe<GqlResolversTypes['UserCreatePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserCreateArgs, 'input'>>;
  userDelete?: Resolver<Maybe<GqlResolversTypes['UserDeletePayload']>, ParentType, ContextType, RequireFields<GqlMutationUserDeleteArgs, 'id'>>;
  userPublish?: Resolver<Maybe<GqlResolversTypes['UserPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserPublishArgs, 'id' | 'input'>>;
  userRemoveActivity?: Resolver<Maybe<GqlResolversTypes['UserRemoveActivityPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveActivityArgs, 'id' | 'input'>>;
  userRemoveGroup?: Resolver<Maybe<GqlResolversTypes['UserRemoveGroupPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveGroupArgs, 'id' | 'input'>>;
  userRemoveOrganization?: Resolver<Maybe<GqlResolversTypes['UserRemoveOrganizationPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserRemoveOrganizationArgs, 'id' | 'input'>>;
  userUnpublish?: Resolver<Maybe<GqlResolversTypes['UserPrivacyPayload']>, ParentType, ContextType, RequireFields<GqlMutationUserUnpublishArgs, 'id' | 'input'>>;
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
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<GqlResolversTypes['State'], ParentType, ContextType>;
  targets?: Resolver<Maybe<Array<GqlResolversTypes['Target']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  users?: Resolver<Maybe<Array<GqlResolversTypes['User']>>, ParentType, ContextType>;
  website?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  zipcode?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlOrganizationEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['OrganizationEdge'] = GqlResolversParentTypes['OrganizationEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
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

export type GqlRemoveChildGroupFromParentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveChildGroupFromParentPayload'] = GqlResolversParentTypes['RemoveChildGroupFromParentPayload']> = ResolversObject<{
  child?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveEventFromActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveEventFromActivityPayload'] = GqlResolversParentTypes['RemoveEventFromActivityPayload']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveEventFromGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveEventFromGroupPayload'] = GqlResolversParentTypes['RemoveEventFromGroupPayload']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveGroupFromTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveGroupFromTargetPayload'] = GqlResolversParentTypes['RemoveGroupFromTargetPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveLikeFromEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveLikeFromEventPayload'] = GqlResolversParentTypes['RemoveLikeFromEventPayload']> = ResolversObject<{
  like?: Resolver<GqlResolversTypes['Like'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveOrganizationFromTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveOrganizationFromTargetPayload'] = GqlResolversParentTypes['RemoveOrganizationFromTargetPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveParentGroupFromParentPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveParentGroupFromParentPayload'] = GqlResolversParentTypes['RemoveParentGroupFromParentPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  parent?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveTargetFromGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveTargetFromGroupPayload'] = GqlResolversParentTypes['RemoveTargetFromGroupPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveTargetFromOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveTargetFromOrganizationPayload'] = GqlResolversParentTypes['RemoveTargetFromOrganizationPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveUserFromGroupPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveUserFromGroupPayload'] = GqlResolversParentTypes['RemoveUserFromGroupPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlRemoveUserFromOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['RemoveUserFromOrganizationPayload'] = GqlResolversParentTypes['RemoveUserFromOrganizationPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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

export type GqlTargetEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetEdge'] = GqlResolversParentTypes['TargetEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['Target']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlTargetsConnectionResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['TargetsConnection'] = GqlResolversParentTypes['TargetsConnection']> = ResolversObject<{
  edges?: Resolver<Maybe<Array<Maybe<GqlResolversTypes['TargetEdge']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<GqlResolversTypes['PageInfo'], ParentType, ContextType>;
  totalCount?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateActivityInfoPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateActivityInfoPayload'] = GqlResolversParentTypes['UpdateActivityInfoPayload']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateActivityPrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateActivityPrivacyPayload'] = GqlResolversParentTypes['UpdateActivityPrivacyPayload']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateCommentOfEventPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateCommentOfEventPayload'] = GqlResolversParentTypes['UpdateCommentOfEventPayload']> = ResolversObject<{
  comment?: Resolver<GqlResolversTypes['Comment'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateEventInfoPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateEventInfoPayload'] = GqlResolversParentTypes['UpdateEventInfoPayload']> = ResolversObject<{
  event?: Resolver<GqlResolversTypes['Event'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateGroupInfoPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateGroupInfoPayload'] = GqlResolversParentTypes['UpdateGroupInfoPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateGroupOfOrganizationPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateGroupOfOrganizationPayload'] = GqlResolversParentTypes['UpdateGroupOfOrganizationPayload']> = ResolversObject<{
  group?: Resolver<GqlResolversTypes['Group'], ParentType, ContextType>;
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateIndexOfTargetPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateIndexOfTargetPayload'] = GqlResolversParentTypes['UpdateIndexOfTargetPayload']> = ResolversObject<{
  index?: Resolver<GqlResolversTypes['Index'], ParentType, ContextType>;
  target?: Resolver<GqlResolversTypes['Target'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateOrganizationDefaultInfoPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateOrganizationDefaultInfoPayload'] = GqlResolversParentTypes['UpdateOrganizationDefaultInfoPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateOrganizationOverviewPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateOrganizationOverviewPayload'] = GqlResolversParentTypes['UpdateOrganizationOverviewPayload']> = ResolversObject<{
  organization?: Resolver<GqlResolversTypes['Organization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateTargetInfoPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateTargetInfoPayload'] = GqlResolversParentTypes['UpdateTargetInfoPayload']> = ResolversObject<{
  indexId?: Resolver<Maybe<GqlResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  validFrom?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  validTo?: Resolver<Maybe<GqlResolversTypes['Datetime']>, ParentType, ContextType>;
  value?: Resolver<Maybe<GqlResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GqlUpdateUserOfActivityPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UpdateUserOfActivityPayload'] = GqlResolversParentTypes['UpdateUserOfActivityPayload']> = ResolversObject<{
  activity?: Resolver<GqlResolversTypes['Activity'], ParentType, ContextType>;
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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

export type GqlUserPrivacyPayloadResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserPrivacyPayload'] = GqlResolversParentTypes['UserPrivacyPayload']> = ResolversObject<{
  __resolveType: TypeResolveFn<'AuthError' | 'ComplexQueryError' | 'InvalidInputValueError' | 'UserPrivacySuccess', ParentType, ContextType>;
}>;

export type GqlUserPrivacySuccessResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserPrivacySuccess'] = GqlResolversParentTypes['UserPrivacySuccess']> = ResolversObject<{
  user?: Resolver<GqlResolversTypes['User'], ParentType, ContextType>;
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
  ActivityEdge?: GqlActivityEdgeResolvers<ContextType>;
  AddChildGroupToGroupPayload?: GqlAddChildGroupToGroupPayloadResolvers<ContextType>;
  AddCommentToEventPayload?: GqlAddCommentToEventPayloadResolvers<ContextType>;
  AddEventOfGroupPayload?: GqlAddEventOfGroupPayloadResolvers<ContextType>;
  AddEventToActivityPayload?: GqlAddEventToActivityPayloadResolvers<ContextType>;
  AddGroupToTargetPayload?: GqlAddGroupToTargetPayloadResolvers<ContextType>;
  AddLikeToEventPayload?: GqlAddLikeToEventPayloadResolvers<ContextType>;
  AddOrganizationToTargetPayload?: GqlAddOrganizationToTargetPayloadResolvers<ContextType>;
  AddParentGroupToGroupPayload?: GqlAddParentGroupToGroupPayloadResolvers<ContextType>;
  AddTargetInOrganizationPayload?: GqlAddTargetInOrganizationPayloadResolvers<ContextType>;
  AddTargetToGroupPayload?: GqlAddTargetToGroupPayloadResolvers<ContextType>;
  AddUserInOrganizationPayload?: GqlAddUserInOrganizationPayloadResolvers<ContextType>;
  AddUserToActivityPayload?: GqlAddUserToActivityPayloadResolvers<ContextType>;
  AddUserToGroupPayload?: GqlAddUserToGroupPayloadResolvers<ContextType>;
  Agenda?: GqlAgendaResolvers<ContextType>;
  AuthError?: GqlAuthErrorResolvers<ContextType>;
  City?: GqlCityResolvers<ContextType>;
  Comment?: GqlCommentResolvers<ContextType>;
  Comments?: GqlCommentsResolvers<ContextType>;
  ComplexQueryError?: GqlComplexQueryErrorResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  DeleteCommentFromEventPayload?: GqlDeleteCommentFromEventPayloadResolvers<ContextType>;
  Edge?: GqlEdgeResolvers<ContextType>;
  Error?: GqlErrorResolvers<ContextType>;
  Event?: GqlEventResolvers<ContextType>;
  EventEdge?: GqlEventEdgeResolvers<ContextType>;
  EventsConnection?: GqlEventsConnectionResolvers<ContextType>;
  Field?: GqlFieldResolvers<ContextType>;
  Group?: GqlGroupResolvers<ContextType>;
  GroupEdge?: GqlGroupEdgeResolvers<ContextType>;
  GroupsConnection?: GqlGroupsConnectionResolvers<ContextType>;
  Index?: GqlIndexResolvers<ContextType>;
  InvalidInputValueError?: GqlInvalidInputValueErrorResolvers<ContextType>;
  Like?: GqlLikeResolvers<ContextType>;
  Likes?: GqlLikesResolvers<ContextType>;
  Mutation?: GqlMutationResolvers<ContextType>;
  Organization?: GqlOrganizationResolvers<ContextType>;
  OrganizationEdge?: GqlOrganizationEdgeResolvers<ContextType>;
  Organizations?: GqlOrganizationsResolvers<ContextType>;
  OrganizationsConnection?: GqlOrganizationsConnectionResolvers<ContextType>;
  PageInfo?: GqlPageInfoResolvers<ContextType>;
  Paging?: GqlPagingResolvers<ContextType>;
  Query?: GqlQueryResolvers<ContextType>;
  RemoveChildGroupFromParentPayload?: GqlRemoveChildGroupFromParentPayloadResolvers<ContextType>;
  RemoveEventFromActivityPayload?: GqlRemoveEventFromActivityPayloadResolvers<ContextType>;
  RemoveEventFromGroupPayload?: GqlRemoveEventFromGroupPayloadResolvers<ContextType>;
  RemoveGroupFromTargetPayload?: GqlRemoveGroupFromTargetPayloadResolvers<ContextType>;
  RemoveLikeFromEventPayload?: GqlRemoveLikeFromEventPayloadResolvers<ContextType>;
  RemoveOrganizationFromTargetPayload?: GqlRemoveOrganizationFromTargetPayloadResolvers<ContextType>;
  RemoveParentGroupFromParentPayload?: GqlRemoveParentGroupFromParentPayloadResolvers<ContextType>;
  RemoveTargetFromGroupPayload?: GqlRemoveTargetFromGroupPayloadResolvers<ContextType>;
  RemoveTargetFromOrganizationPayload?: GqlRemoveTargetFromOrganizationPayloadResolvers<ContextType>;
  RemoveUserFromGroupPayload?: GqlRemoveUserFromGroupPayloadResolvers<ContextType>;
  RemoveUserFromOrganizationPayload?: GqlRemoveUserFromOrganizationPayloadResolvers<ContextType>;
  State?: GqlStateResolvers<ContextType>;
  Target?: GqlTargetResolvers<ContextType>;
  TargetEdge?: GqlTargetEdgeResolvers<ContextType>;
  TargetsConnection?: GqlTargetsConnectionResolvers<ContextType>;
  UpdateActivityInfoPayload?: GqlUpdateActivityInfoPayloadResolvers<ContextType>;
  UpdateActivityPrivacyPayload?: GqlUpdateActivityPrivacyPayloadResolvers<ContextType>;
  UpdateCommentOfEventPayload?: GqlUpdateCommentOfEventPayloadResolvers<ContextType>;
  UpdateEventInfoPayload?: GqlUpdateEventInfoPayloadResolvers<ContextType>;
  UpdateGroupInfoPayload?: GqlUpdateGroupInfoPayloadResolvers<ContextType>;
  UpdateGroupOfOrganizationPayload?: GqlUpdateGroupOfOrganizationPayloadResolvers<ContextType>;
  UpdateIndexOfTargetPayload?: GqlUpdateIndexOfTargetPayloadResolvers<ContextType>;
  UpdateOrganizationDefaultInfoPayload?: GqlUpdateOrganizationDefaultInfoPayloadResolvers<ContextType>;
  UpdateOrganizationOverviewPayload?: GqlUpdateOrganizationOverviewPayloadResolvers<ContextType>;
  UpdateTargetInfoPayload?: GqlUpdateTargetInfoPayloadResolvers<ContextType>;
  UpdateUserOfActivityPayload?: GqlUpdateUserOfActivityPayloadResolvers<ContextType>;
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
  UserPrivacyPayload?: GqlUserPrivacyPayloadResolvers<ContextType>;
  UserPrivacySuccess?: GqlUserPrivacySuccessResolvers<ContextType>;
  UserRemoveActivityPayload?: GqlUserRemoveActivityPayloadResolvers<ContextType>;
  UserRemoveActivitySuccess?: GqlUserRemoveActivitySuccessResolvers<ContextType>;
  UserRemoveGroupPayload?: GqlUserRemoveGroupPayloadResolvers<ContextType>;
  UserRemoveGroupSuccess?: GqlUserRemoveGroupSuccessResolvers<ContextType>;
  UserRemoveOrganizationPayload?: GqlUserRemoveOrganizationPayloadResolvers<ContextType>;
  UserRemoveOrganizationSuccess?: GqlUserRemoveOrganizationSuccessResolvers<ContextType>;
  UserUpdatePayload?: GqlUserUpdatePayloadResolvers<ContextType>;
  UserUpdateSuccess?: GqlUserUpdateSuccessResolvers<ContextType>;
  UsersConnection?: GqlUsersConnectionResolvers<ContextType>;
}>;


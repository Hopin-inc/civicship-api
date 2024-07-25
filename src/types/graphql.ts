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

export type GqlActivityCreateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  eventId: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic: Scalars['Boolean']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
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

export type GqlActivityUpdateInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  endsAt: Scalars['Datetime']['input'];
  eventId: Scalars['String']['input'];
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  isPublic: Scalars['Boolean']['input'];
  remark?: InputMaybe<Scalars['String']['input']>;
  startsAt: Scalars['Datetime']['input'];
  userId: Scalars['String']['input'];
};

export type GqlAgenda = {
  __typename?: 'Agenda';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
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

export type GqlCommentCreateInput = {
  content: Scalars['String']['input'];
  eventId: Scalars['ID']['input'];
  postedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId: Scalars['ID']['input'];
};

export type GqlCommentUpdateInput = {
  content?: InputMaybe<Scalars['String']['input']>;
};

export type GqlComments = {
  __typename?: 'Comments';
  data: Array<GqlComment>;
  total: Scalars['Int']['output'];
};

export type GqlEdge = {
  cursor: Scalars['String']['output'];
};

export const GqlEntityPosition = {
  Prefix: 'PREFIX',
  Suffix: 'SUFFIX'
} as const;

export type GqlEntityPosition = typeof GqlEntityPosition[keyof typeof GqlEntityPosition];
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

export type GqlEventCreateInput = {
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

export type GqlEventUpdateInput = {
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

export type GqlEventsConnection = {
  __typename?: 'EventsConnection';
  edges?: Maybe<Array<Maybe<GqlEventEdge>>>;
  pageInfo: GqlPageInfo;
  totalCount: Scalars['Int']['output'];
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

export type GqlGroupCreateInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  childrenIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
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

export type GqlGroupUpdateInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  childrenIds?: InputMaybe<Array<Scalars['String']['input']>>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  eventIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  organizationId?: InputMaybe<Scalars['String']['input']>;
  parentId?: InputMaybe<Scalars['String']['input']>;
  targetIds?: InputMaybe<Array<Scalars['String']['input']>>;
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  valueType: GqlValueType;
};

export type GqlLike = {
  __typename?: 'Like';
  createdAt: Scalars['Datetime']['output'];
  event: GqlEvent;
  postedAt: Scalars['Datetime']['output'];
  updatedAt?: Maybe<Scalars['Datetime']['output']>;
  user: GqlUser;
};

export type GqlLikeCreateInput = {
  eventId: Scalars['ID']['input'];
  postedAt?: InputMaybe<Scalars['Datetime']['input']>;
  userId: Scalars['ID']['input'];
};

export type GqlLikes = {
  __typename?: 'Likes';
  data: Array<GqlLike>;
  total: Scalars['Int']['output'];
};

export type GqlMutation = {
  __typename?: 'Mutation';
  addLike?: Maybe<GqlLike>;
  createActivity?: Maybe<GqlActivity>;
  createComment?: Maybe<GqlComment>;
  createEvent?: Maybe<GqlEvent>;
  createGroup?: Maybe<GqlGroup>;
  createOrganization?: Maybe<GqlOrganization>;
  createUser?: Maybe<GqlUser>;
  deleteActivity?: Maybe<GqlActivity>;
  deleteComment?: Maybe<GqlComment>;
  deleteEvent?: Maybe<GqlEvent>;
  deleteGroup?: Maybe<GqlGroup>;
  deleteOrganization?: Maybe<GqlOrganization>;
  deleteUser?: Maybe<GqlUser>;
  mutationEcho: Scalars['String']['output'];
  removeLike?: Maybe<GqlLike>;
  updateActivity?: Maybe<GqlActivity>;
  updateComment?: Maybe<GqlComment>;
  updateEvent?: Maybe<GqlEvent>;
  updateGroup?: Maybe<GqlGroup>;
  updateOrganization?: Maybe<GqlOrganization>;
  updateUser?: Maybe<GqlUser>;
};


export type GqlMutationAddLikeArgs = {
  content: GqlLikeCreateInput;
};


export type GqlMutationCreateActivityArgs = {
  content: GqlActivityCreateInput;
};


export type GqlMutationCreateCommentArgs = {
  content: GqlCommentCreateInput;
};


export type GqlMutationCreateEventArgs = {
  content: GqlEventCreateInput;
};


export type GqlMutationCreateGroupArgs = {
  content: GqlGroupCreateInput;
};


export type GqlMutationCreateOrganizationArgs = {
  content: GqlOrganizationCreateInput;
};


export type GqlMutationCreateUserArgs = {
  content: GqlUserCreateInput;
};


export type GqlMutationDeleteActivityArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationDeleteCommentArgs = {
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


export type GqlMutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type GqlMutationRemoveLikeArgs = {
  eventId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};


export type GqlMutationUpdateActivityArgs = {
  content: GqlActivityUpdateInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateCommentArgs = {
  content: GqlCommentUpdateInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateEventArgs = {
  content: GqlEventUpdateInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateGroupArgs = {
  content: GqlGroupUpdateInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateOrganizationArgs = {
  content: GqlOrganizationUpdateInput;
  id: Scalars['ID']['input'];
};


export type GqlMutationUpdateUserArgs = {
  content: GqlUserUpdateInput;
  id: Scalars['ID']['input'];
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
  website?: InputMaybe<Scalars['String']['input']>;
  zipcode: Scalars['String']['input'];
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

export type GqlOrganizationUpdateInput = {
  address1: Scalars['String']['input'];
  address2?: InputMaybe<Scalars['String']['input']>;
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCode: Scalars['String']['input'];
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  entity?: InputMaybe<Scalars['String']['input']>;
  entityPosition?: InputMaybe<GqlEntityPosition>;
  establishedAt?: InputMaybe<Scalars['Datetime']['input']>;
  eventIds?: InputMaybe<Array<Scalars['String']['input']>>;
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  stateCode: Scalars['String']['input'];
  stateCountryCode: Scalars['String']['input'];
  targetIds?: InputMaybe<Array<Scalars['String']['input']>>;
  userIds?: InputMaybe<Array<Scalars['String']['input']>>;
  website?: InputMaybe<Scalars['String']['input']>;
  zipcode: Scalars['String']['input'];
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
  createdAt: Scalars['String']['output'];
  group?: Maybe<GqlGroup>;
  id: Scalars['ID']['output'];
  index?: Maybe<GqlIndex>;
  name: Scalars['String']['output'];
  organization?: Maybe<GqlOrganization>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  validFrom: Scalars['String']['output'];
  validTo: Scalars['String']['output'];
  value: Scalars['Float']['output'];
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

export type GqlUserCreateInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  isPublic: Scalars['Boolean']['input'];
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  organizationIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GqlUserEdge = GqlEdge & {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node?: Maybe<GqlUser>;
};

export type GqlUserFilterInput = {
  agendaId?: InputMaybe<Scalars['Int']['input']>;
  cityCode?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
};

export type GqlUserSortInput = {
  updatedAt?: InputMaybe<GqlSortDirection>;
};

export type GqlUserUpdateInput = {
  agendaIds?: InputMaybe<Array<Scalars['Int']['input']>>;
  bio?: InputMaybe<Scalars['String']['input']>;
  cityCodes?: InputMaybe<Array<Scalars['String']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  groupIds?: InputMaybe<Array<Scalars['String']['input']>>;
  image?: InputMaybe<Scalars['String']['input']>;
  isPublic: Scalars['Boolean']['input'];
  lastName: Scalars['String']['input'];
  middleName?: InputMaybe<Scalars['String']['input']>;
  organizationIds?: InputMaybe<Array<Scalars['String']['input']>>;
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


/** Mapping of interface types */
export type GqlResolversInterfaceTypes<_RefType extends Record<string, unknown>> = ResolversObject<{
  Edge: ( Omit<GqlActivityEdge, 'node'> & { node?: Maybe<_RefType['Activity']> } ) | ( Omit<GqlEventEdge, 'node'> & { node?: Maybe<_RefType['Event']> } ) | ( Omit<GqlGroupEdge, 'node'> & { node?: Maybe<_RefType['Group']> } ) | ( Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<_RefType['Organization']> } ) | ( Omit<GqlUserEdge, 'node'> & { node?: Maybe<_RefType['User']> } );
}>;

/** Mapping between all available schema types and the resolvers types */
export type GqlResolversTypes = ResolversObject<{
  Activities: ResolverTypeWrapper<Omit<GqlActivities, 'data'> & { data: Array<GqlResolversTypes['Activity']> }>;
  ActivitiesConnection: ResolverTypeWrapper<Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['ActivityEdge']>>> }>;
  Activity: ResolverTypeWrapper<Activity>;
  ActivityCreateInput: GqlActivityCreateInput;
  ActivityEdge: ResolverTypeWrapper<Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Activity']> }>;
  ActivityFilterInput: GqlActivityFilterInput;
  ActivitySortInput: GqlActivitySortInput;
  ActivityUpdateInput: GqlActivityUpdateInput;
  Agenda: ResolverTypeWrapper<Agenda>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  City: ResolverTypeWrapper<City>;
  Comment: ResolverTypeWrapper<Comment>;
  CommentCreateInput: GqlCommentCreateInput;
  CommentUpdateInput: GqlCommentUpdateInput;
  Comments: ResolverTypeWrapper<Omit<GqlComments, 'data'> & { data: Array<GqlResolversTypes['Comment']> }>;
  Datetime: ResolverTypeWrapper<Scalars['Datetime']['output']>;
  Edge: ResolverTypeWrapper<GqlResolversInterfaceTypes<GqlResolversTypes>['Edge']>;
  EntityPosition: GqlEntityPosition;
  Event: ResolverTypeWrapper<Event>;
  EventCreateInput: GqlEventCreateInput;
  EventEdge: ResolverTypeWrapper<Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Event']> }>;
  EventFilterInput: GqlEventFilterInput;
  EventSortInput: GqlEventSortInput;
  EventUpdateInput: GqlEventUpdateInput;
  EventsConnection: ResolverTypeWrapper<Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['EventEdge']>>> }>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  Group: ResolverTypeWrapper<Group>;
  GroupCreateInput: GqlGroupCreateInput;
  GroupEdge: ResolverTypeWrapper<Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Group']> }>;
  GroupFilterInput: GqlGroupFilterInput;
  GroupSortInput: GqlGroupSortInput;
  GroupUpdateInput: GqlGroupUpdateInput;
  GroupsConnection: ResolverTypeWrapper<Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['GroupEdge']>>> }>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Index: ResolverTypeWrapper<Index>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Like: ResolverTypeWrapper<Like>;
  LikeCreateInput: GqlLikeCreateInput;
  Likes: ResolverTypeWrapper<Omit<GqlLikes, 'data'> & { data: Array<GqlResolversTypes['Like']> }>;
  Mutation: ResolverTypeWrapper<{}>;
  Organization: ResolverTypeWrapper<Organization>;
  OrganizationCreateInput: GqlOrganizationCreateInput;
  OrganizationEdge: ResolverTypeWrapper<Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversTypes['Organization']> }>;
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationSortInput: GqlOrganizationSortInput;
  OrganizationUpdateInput: GqlOrganizationUpdateInput;
  Organizations: ResolverTypeWrapper<Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversTypes['Organization']> }>;
  OrganizationsConnection: ResolverTypeWrapper<Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['OrganizationEdge']>>> }>;
  PageInfo: ResolverTypeWrapper<GqlPageInfo>;
  Paging: ResolverTypeWrapper<GqlPaging>;
  Query: ResolverTypeWrapper<{}>;
  SortDirection: GqlSortDirection;
  State: ResolverTypeWrapper<State>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Target: ResolverTypeWrapper<Target>;
  User: ResolverTypeWrapper<User>;
  UserCreateInput: GqlUserCreateInput;
  UserEdge: ResolverTypeWrapper<Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversTypes['User']> }>;
  UserFilterInput: GqlUserFilterInput;
  UserSortInput: GqlUserSortInput;
  UserUpdateInput: GqlUserUpdateInput;
  UsersConnection: ResolverTypeWrapper<Omit<GqlUsersConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversTypes['UserEdge']>>> }>;
  ValueType: GqlValueType;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type GqlResolversParentTypes = ResolversObject<{
  Activities: Omit<GqlActivities, 'data'> & { data: Array<GqlResolversParentTypes['Activity']> };
  ActivitiesConnection: Omit<GqlActivitiesConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['ActivityEdge']>>> };
  Activity: Activity;
  ActivityCreateInput: GqlActivityCreateInput;
  ActivityEdge: Omit<GqlActivityEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Activity']> };
  ActivityFilterInput: GqlActivityFilterInput;
  ActivitySortInput: GqlActivitySortInput;
  ActivityUpdateInput: GqlActivityUpdateInput;
  Agenda: Agenda;
  Boolean: Scalars['Boolean']['output'];
  City: City;
  Comment: Comment;
  CommentCreateInput: GqlCommentCreateInput;
  CommentUpdateInput: GqlCommentUpdateInput;
  Comments: Omit<GqlComments, 'data'> & { data: Array<GqlResolversParentTypes['Comment']> };
  Datetime: Scalars['Datetime']['output'];
  Edge: GqlResolversInterfaceTypes<GqlResolversParentTypes>['Edge'];
  Event: Event;
  EventCreateInput: GqlEventCreateInput;
  EventEdge: Omit<GqlEventEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Event']> };
  EventFilterInput: GqlEventFilterInput;
  EventSortInput: GqlEventSortInput;
  EventUpdateInput: GqlEventUpdateInput;
  EventsConnection: Omit<GqlEventsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['EventEdge']>>> };
  Float: Scalars['Float']['output'];
  Group: Group;
  GroupCreateInput: GqlGroupCreateInput;
  GroupEdge: Omit<GqlGroupEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Group']> };
  GroupFilterInput: GqlGroupFilterInput;
  GroupSortInput: GqlGroupSortInput;
  GroupUpdateInput: GqlGroupUpdateInput;
  GroupsConnection: Omit<GqlGroupsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['GroupEdge']>>> };
  ID: Scalars['ID']['output'];
  Index: Index;
  Int: Scalars['Int']['output'];
  Like: Like;
  LikeCreateInput: GqlLikeCreateInput;
  Likes: Omit<GqlLikes, 'data'> & { data: Array<GqlResolversParentTypes['Like']> };
  Mutation: {};
  Organization: Organization;
  OrganizationCreateInput: GqlOrganizationCreateInput;
  OrganizationEdge: Omit<GqlOrganizationEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['Organization']> };
  OrganizationFilterInput: GqlOrganizationFilterInput;
  OrganizationSortInput: GqlOrganizationSortInput;
  OrganizationUpdateInput: GqlOrganizationUpdateInput;
  Organizations: Omit<GqlOrganizations, 'data'> & { data: Array<GqlResolversParentTypes['Organization']> };
  OrganizationsConnection: Omit<GqlOrganizationsConnection, 'edges'> & { edges?: Maybe<Array<Maybe<GqlResolversParentTypes['OrganizationEdge']>>> };
  PageInfo: GqlPageInfo;
  Paging: GqlPaging;
  Query: {};
  State: State;
  String: Scalars['String']['output'];
  Target: Target;
  User: User;
  UserCreateInput: GqlUserCreateInput;
  UserEdge: Omit<GqlUserEdge, 'node'> & { node?: Maybe<GqlResolversParentTypes['User']> };
  UserFilterInput: GqlUserFilterInput;
  UserSortInput: GqlUserSortInput;
  UserUpdateInput: GqlUserUpdateInput;
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

export type GqlAgendaResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Agenda'] = GqlResolversParentTypes['Agenda']> = ResolversObject<{
  description?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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

export interface GqlDatetimeScalarConfig extends GraphQLScalarTypeConfig<GqlResolversTypes['Datetime'], any> {
  name: 'Datetime';
}

export type GqlEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['Edge'] = GqlResolversParentTypes['Edge']> = ResolversObject<{
  __resolveType: TypeResolveFn<'ActivityEdge' | 'EventEdge' | 'GroupEdge' | 'OrganizationEdge' | 'UserEdge', ParentType, ContextType>;
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
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
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  valueType?: Resolver<GqlResolversTypes['ValueType'], ParentType, ContextType>;
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
  addLike?: Resolver<Maybe<GqlResolversTypes['Like']>, ParentType, ContextType, RequireFields<GqlMutationAddLikeArgs, 'content'>>;
  createActivity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType, RequireFields<GqlMutationCreateActivityArgs, 'content'>>;
  createComment?: Resolver<Maybe<GqlResolversTypes['Comment']>, ParentType, ContextType, RequireFields<GqlMutationCreateCommentArgs, 'content'>>;
  createEvent?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlMutationCreateEventArgs, 'content'>>;
  createGroup?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlMutationCreateGroupArgs, 'content'>>;
  createOrganization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlMutationCreateOrganizationArgs, 'content'>>;
  createUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlMutationCreateUserArgs, 'content'>>;
  deleteActivity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType, RequireFields<GqlMutationDeleteActivityArgs, 'id'>>;
  deleteComment?: Resolver<Maybe<GqlResolversTypes['Comment']>, ParentType, ContextType, RequireFields<GqlMutationDeleteCommentArgs, 'id'>>;
  deleteEvent?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlMutationDeleteEventArgs, 'id'>>;
  deleteGroup?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlMutationDeleteGroupArgs, 'id'>>;
  deleteOrganization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlMutationDeleteOrganizationArgs, 'id'>>;
  deleteUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlMutationDeleteUserArgs, 'id'>>;
  mutationEcho?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  removeLike?: Resolver<Maybe<GqlResolversTypes['Like']>, ParentType, ContextType, RequireFields<GqlMutationRemoveLikeArgs, 'eventId' | 'userId'>>;
  updateActivity?: Resolver<Maybe<GqlResolversTypes['Activity']>, ParentType, ContextType, RequireFields<GqlMutationUpdateActivityArgs, 'content' | 'id'>>;
  updateComment?: Resolver<Maybe<GqlResolversTypes['Comment']>, ParentType, ContextType, RequireFields<GqlMutationUpdateCommentArgs, 'content' | 'id'>>;
  updateEvent?: Resolver<Maybe<GqlResolversTypes['Event']>, ParentType, ContextType, RequireFields<GqlMutationUpdateEventArgs, 'content' | 'id'>>;
  updateGroup?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType, RequireFields<GqlMutationUpdateGroupArgs, 'content' | 'id'>>;
  updateOrganization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType, RequireFields<GqlMutationUpdateOrganizationArgs, 'content' | 'id'>>;
  updateUser?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType, RequireFields<GqlMutationUpdateUserArgs, 'content' | 'id'>>;
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
  createdAt?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  group?: Resolver<Maybe<GqlResolversTypes['Group']>, ParentType, ContextType>;
  id?: Resolver<GqlResolversTypes['ID'], ParentType, ContextType>;
  index?: Resolver<Maybe<GqlResolversTypes['Index']>, ParentType, ContextType>;
  name?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  organization?: Resolver<Maybe<GqlResolversTypes['Organization']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<GqlResolversTypes['String']>, ParentType, ContextType>;
  validFrom?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  validTo?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<GqlResolversTypes['Float'], ParentType, ContextType>;
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

export type GqlUserEdgeResolvers<ContextType = Context, ParentType extends GqlResolversParentTypes['UserEdge'] = GqlResolversParentTypes['UserEdge']> = ResolversObject<{
  cursor?: Resolver<GqlResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<Maybe<GqlResolversTypes['User']>, ParentType, ContextType>;
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
  Agenda?: GqlAgendaResolvers<ContextType>;
  City?: GqlCityResolvers<ContextType>;
  Comment?: GqlCommentResolvers<ContextType>;
  Comments?: GqlCommentsResolvers<ContextType>;
  Datetime?: GraphQLScalarType;
  Edge?: GqlEdgeResolvers<ContextType>;
  Event?: GqlEventResolvers<ContextType>;
  EventEdge?: GqlEventEdgeResolvers<ContextType>;
  EventsConnection?: GqlEventsConnectionResolvers<ContextType>;
  Group?: GqlGroupResolvers<ContextType>;
  GroupEdge?: GqlGroupEdgeResolvers<ContextType>;
  GroupsConnection?: GqlGroupsConnectionResolvers<ContextType>;
  Index?: GqlIndexResolvers<ContextType>;
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
  State?: GqlStateResolvers<ContextType>;
  Target?: GqlTargetResolvers<ContextType>;
  User?: GqlUserResolvers<ContextType>;
  UserEdge?: GqlUserEdgeResolvers<ContextType>;
  UsersConnection?: GqlUsersConnectionResolvers<ContextType>;
}>;


// export const Schema = [
//     `type Query {
//       testString: String
//     }
//     schema {
//       query: Query
//     }`,
//   ];
//   export default Schema;

import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools';
import { gql } from 'apollo-server';
import { Mocks } from './mocks';
import { Resolvers } from './resolvers';

export const typeDefs = gql`
  # declare custom scalars
  scalar Date
  
  # input for signing in users
  input SigninUserInput {
    workspaceName: String!
    email: String!
    password: String!
    username: String
  }

  # the wrapper type that will hold the edges and pageInfo fields
  type MessageConnection {
    edges: [MessageEdge]
    pageInfo: PageInfo!
  }

  # the type used for edges and will hold the node and cursor fields
  type MessageEdge {
    cursor: String!
    node: Message!
  }

  # the wrapper type that will hold the edges and pageInfo fields
  type TaskConnection {
    edges: [TaskEdge]
    pageInfo: PageInfo!
  }

  # the type used for edges and will hold the node and cursor fields
  type TaskEdge {
    cursor: String!
    node: Task!
  }

  # the type used for pageInfo and hold the hasPreviousPage and hasNextPage fields
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # a workspace entity
  type Workspace {
    id: Int! # unique id for the workspace
    name: String! # name of the workspace
    users: [User] # users in the workspace
  }

  # a group chat entity
  type Group {
    id: Int! # unique id for the group
    name: String # name of the group
    users: [User]! # users in the group
    ownerId: Int! # user id of the owner of the group
    messages(first: Int, after: String, last: Int, before: String): MessageConnection # messages sent to the group
  }

  # a user -- keep type really simple for now
  type User {
    id: Int! # unique id for the user
    email: String! # we will also require a unique email per user
    username: String # this is the name we'll show other users
    workspace: Workspace # the workspace the user belongs to
    messages: [Message] # messages sent by user
    groups: [Group] # groups the user belongs to
    userstories: [Userstory] # userstories the user belongs to
    friends: [User] # user's friends/contacts
    jwt: String # json web token for access
  }

  # a message sent from a user to a group
  type Message {
    id: Int! # unique id for message
    to: Group! # group message was sent in
    from: User! # user who sent the message
    text: String! # message text
    createdAt: Date! # when message was created
  }

  # states of a task
  enum TaskStateEnum {
    TO_DO
    IN_PROGRESS
    DONE
  }

  # a story entity
  type Userstory {
    id: Int! # unique id for the story
    name: String # name of the story
    users: [User]! # users in the story
    ownerId: Int! # user id of the owner of the user story group
    tasks(first: Int, after: String, last: Int, before: String): TaskConnection # tasks sent to the us
    count: Int
  }

  # a task entity
  type Task {
    id: Int! # unique id for the task
    title: String # title of the task
    belongsTo: Userstory! # the User Story the task belongs to
    from: User! # user who works on the task
    ownerId: Int # user id of the owner of the task
    state: TaskStateEnum!
    createdAt: Date! # when message was created
  }

  # query for types
  type Query {
    # Return a user by their email or id
    user(email: String, id: Int): User

    # Return messages sent by a user via userId
    # Return messages sent to a group via groupId
    messages(groupId: Int, userId: Int): [Message]

    # Return a group by its id
    group(id: Int!): Group
    
    # Return a User Story by its id
    userstory(id: Int!): Userstory

    # Return a task by its userstoryid
    # Return tasks via userId
    tasks(userstoryId: Int): [Task]
  }

  type Mutation {
    # createTask
    # send a message to a group
    # text is the message text
    # userId is the id of the user sending the message
    # groupId is the id of the group receiving the message
    createMessage(text: String!, groupId: Int!): Message # let user create message
    createGroup(name: String!, userIds: [Int]): Group # let user create group
    deleteGroup(id: Int!): Group # let user delete  group
    leaveGroup(id: Int!): Group # let user leave group
    updateGroup(id: Int!, name: String): Group
    updateUser(id: Int!, name: String!): User
    login(user: SigninUserInput!): User
    signup(user: SigninUserInput!): User
    updateUsername(username: String!): User
  }

  type Subscription {
    # Subscription fires on every message added
    # for any of the groups with one of these groupIds
    messageAdded(groupIds: [Int]): Message
    groupAdded(userId: Int): Group
    #usernameChanged(username: String!): User # update the username
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;
// export default Schema;

// export const executableSchema = makeExecutableSchema({
//   typeDefs: Schema,
//   resolvers: Resolvers,
// });

// addMockFunctionsToSchema({
//   schema: executableSchema,
//   mocks: Mocks,
//   preserveResolvers: true,
// });

export default typeDefs;


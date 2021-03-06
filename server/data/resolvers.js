import GraphQLDate from 'graphql-date';
import { withFilter } from 'apollo-server';
import { map } from 'lodash';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { Workspace, Userstory, Task, Group, Message, User } from './connectors';
import { pubsub } from '../subscriptions';
import { JWT_SECRET } from '../config';
import { 
  workspaceLogic, userstoryLogic, taskLogic, 
  groupLogic, messageLogic, userLogic, 
  subscriptionLogic } from './logic';
import { createGeneral, sendMessageChatbot } from './functions';

const MESSAGE_ADDED_TOPIC = 'messageAdded';
const GROUP_ADDED_TOPIC = 'groupAdded';
const USER_UPDATED_TOPIC = 'userUpdated';

export const resolvers = {
  Date: GraphQLDate,
  PageInfo: {
    // we will have each connection supply its own hasNextPage/hasPreviousPage functions!
    hasNextPage(connection, args) {
      return connection.hasNextPage();
    },
    hasPreviousPage(connection, args) {
      return connection.hasPreviousPage();
    },
  },
  Query: {
    group(_, args, ctx) {
      return groupLogic.query(_, args, ctx);
    },
    // messages(_, args) {
    //   return Message.findAll({
    //     where: args,
    //     order: [['createdAt', 'DESC']],
    //   });
    // },
    user(_, args, ctx) {
      return userLogic.query(_, args, ctx);
    },
    userstory(_, args, ctx) {
      return userstoryLogic.query(_, args, ctx);
    },
    tasks(_, args, ctx) {
      return taskLogic.query(_, args, ctx);
    },
  },
  Mutation: {
    updateUsername(_, args, ctx) {
      return userLogic.updateUsername(_, args, ctx);
    },
    createMessage(_, args, ctx) {
      return messageLogic.createMessage(_, args, ctx)
        .then((message) => {
          // Publish subscription notification with message
          pubsub.publish(MESSAGE_ADDED_TOPIC, { [MESSAGE_ADDED_TOPIC]: message });
          return message;
        });
    },
    createGroup(_, args, ctx) {
      return groupLogic.createGroup(_, args, ctx).then((group) => {
        pubsub.publish(GROUP_ADDED_TOPIC, { [GROUP_ADDED_TOPIC]: group });
        return group;
      });
    },
    deleteGroup(_, args, ctx) {
      return groupLogic.deleteGroup(_, args, ctx);
    },
    leaveGroup(_, args, ctx) {
      return groupLogic.leaveGroup(_, args, ctx);
    },
    updateGroup(_, args, ctx) {
      return groupLogic.updateGroup(_, args, ctx);
    },
    login(_, signinUserInput, ctx) {
      const { workspaceName, email, password } = signinUserInput.user;
      return Workspace.findOne({ where: { name: workspaceName }}).then((workspace) => {
        if(workspace) {
          // find user by email
          return User.findOne({ where: { email } }).then((user) => {
            console.log("-------------------")
            if (user) {
              // validate password
              return bcrypt.compare(password, user.password).then(res => {
                if (res) {
                  // create jwt
                  const token = jwt.sign({
                    id: user.id,
                    email: user.email,
                    version: user.version,
                  }, JWT_SECRET);
                  user.jwt = token;
                  ctx.user = Promise.resolve(user);
                  return user;
                }
              return Promise.reject('password incorrect');
              });
            }
            return Promise.reject('email not found');
          });
        }
        return Promise.reject('workspace not found');
      });
      
    },
    signup(_, signinUserInput, ctx) {
      const { workspaceName, email, password, username } = signinUserInput.user;
      return Workspace.findOne({ where: { name: workspaceName }}).then((workspaceExist) => {
        if(!workspaceExist) {
          // find user by email
          return User.findOne({ where: { email } }).then((existing) => {
            if (!existing) {
              // create new workspace
              return Workspace.create({
                name: workspaceName
              }).then((workspace) => {
                // hash password and create user
                return bcrypt.hash(password, 10).then(hash => User.create({
                  email,
                  password: hash,
                  username: username || email,
                  version: 1,
                })).then((user) => {
                  workspace.addUser(user);
                  user.setWorkspace(workspace);
                  createGeneral(user.id).then((group) => {
                    sendMessageChatbot(group.id, user.id)
                  });
                  const { id } = user;
                  const token = jwt.sign({ id, email, version: 1 }, JWT_SECRET);
                  user.jwt = token;
                  ctx.user = Promise.resolve(user);
                    return user;                  
                });
              })
            }
            return Promise.reject('email already exists'); // email already exists
          });
        }
        return Promise.reject('workspace already exits');
      })
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        (payload, args, ctx) => pubsub.asyncAuthIterator(
          MESSAGE_ADDED_TOPIC,
          subscriptionLogic.messageAdded(payload, args, ctx),
        ),
        (payload, args, ctx) => {
          return ctx.user.then((user) => {
            return Boolean(
              args.groupIds &&
              ~args.groupIds.indexOf(payload.messageAdded.groupId) &&
              user.id !== payload.messageAdded.userId, // don't send to user creating message
            );
          });
        },
      ),
    },
    groupAdded: {
      subscribe: withFilter(
        (payload, args, ctx) => pubsub.asyncAuthIterator(
          GROUP_ADDED_TOPIC,
          subscriptionLogic.groupAdded(payload, args, ctx),
        ),
        (payload, args, ctx) => {
          return ctx.user.then((user) => {
            return Boolean(
              args.userId &&
              ~map(payload.groupAdded.users, 'id').indexOf(args.userId) &&
              user.id !== payload.groupAdded.users[0].id, // don't send to user creating group
            );
          });
        },
      ),
    },
  },
  Group: {
    users(group, args, ctx) {
      return groupLogic.users(group, args, ctx);
    },
    messages(group, args, ctx) {
      return groupLogic.messages(group, args, ctx);
    },
    // ownerId(group, args, ctx) {
    //   return groupLogic.ownerId(group, args, ctx);
    // },
  },
  Userstory: {
    name(userstory, args, ctx) {
      return userstoryLogic.name(userstory, args, ctx);
    },
    users(userstory, args, ctx) {
      return userstoryLogic.users(userstory, args, ctx);
    },
    tasks(userstory, args, ctx) {
      return userstoryLogic.tasks(userstory, args, ctx);
    },
    count(userstory, args, ctx) {
      return userstoryLogic.count(userstory, args, ctx);
    }
  },
  Task: {
    title(task, args, ctx) {
      return taskLogic.title(task, args, ctx);
    },
    belongsTo(task, args, ctx) {
      return taskLogic.belongsTo(task, args, ctx);
    },
    from(task, args, ctx) {
      return taskLogic.from(task, args, ctx);
    },
    state(task, args, ctx) {
      return taskLogic.state(task, args, ctx);
    },
  },
  Message: {
    to(message, args, ctx) {
      return messageLogic.to(message, args, ctx);
    },
    from(message, args, ctx) {
      return messageLogic.from(message, args, ctx);
    },
  },
  User: {
    email(user, args, ctx) {
      return userLogic.email(user, args, ctx);
    },
    friends(user, args, ctx) {
      return userLogic.friends(user, args, ctx);
    },
    groups(user, args, ctx) {
      return userLogic.groups(user, args, ctx);
    },
    workspace(user, args, ctx) {
      return userLogic.workspace(user, args, ctx);
    },
    jwt(user, args, ctx) {
      return userLogic.jwt(user, args, ctx);
    },
    messages(user, args, ctx) {
      return userLogic.messages(user, args, ctx);
    },
    userstories(user, args, ctx) {
      return userLogic.userstories(user, args, ctx);
    },
  },
};
export default resolvers;
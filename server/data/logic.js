import { ApolloError, AuthenticationError, ForbiddenError } from 'apollo-server';
import { Workspace, Group, Message, User, Userstory, Task } from './connectors';
import { _ } from 'lodash';
import Sequelize from 'sequelize';
import { sendMessageChatbot, createGeneral } from './functions'

const Op = Sequelize.Op;

// reusable function to check for a user with context
function getAuthenticatedUser(ctx) {
  return ctx.user.then((user) => {
    if (!user) {
      throw new AuthenticationError('Unauthenticated user autentication');
    }
    return user;
  });
}

export const workspaceLogic = {
  users(workspace) {
    return workspace.getUsers({ attributes: ['id', 'username'] });
  },
  query(_, { id }, ctx) {
    return getAuthenticatedUser(ctx).then((user) => {
      Workspace.findOne({ 
        where: { id }
      })
      return Promise.reject('Unauthorized');
    });
  },
}

export const messageLogic = {
    from(message) {
        return message.getUser({ attributes: ['id', 'username'] });
    },
    to(message) {
        return message.getGroup({ attributes: ['id', 'name'] });
    },
    createMessage(_, { text, groupId }, ctx) {
        return getAuthenticatedUser(ctx)
        .then(user => user.getGroups({ where: { id: groupId }, attributes: ['id'] })
        .then((group) => {
            if (group.length) {
            return Message.create({
                userId: user.id,
                text,
                groupId,
            });
            }
            throw new ForbiddenError('Unauthorized message creation');
        }));
    },
};

export const userstoryLogic = {
  name(userstory, args, ctx) {
    // return getAuthenticatedUser(ctx).then((currentUser) => {
    //   if (currentUser.id === user.id) {
    //     return userstory.name;
    //   }
    //   throw new ForbiddenError('Unauthorized');
    // });
    // return Userstory.findOne({
    //   where: { id }
    // })
    return userstory.name
  },
  users(userstory, args, ctx) {
    return userstory.getUsers({ attributes: ['id', 'username'] });
  },
  tasks(userstory, { first, last, before, after }, ctx) {
    // return userstory.getTasks();
    // base query -- get messages from the right group
    const where = { userstoryId: userstory.id };

    // because we return messages from newest -> oldest
    // before actually means newer (date > cursor)
    // after actually means older (date < cursor)
    if (before) {
      // convert base-64 to utf8 iso date and use in Date constructor
      where.id = { $gt: Buffer.from(before, 'base64').toString() };
    }
    if (after) {
      where.id = { $lt: Buffer.from(after, 'base64').toString() };
    }
    return Task.findAll({
      where,
      order: [['id', 'DESC']],
      limit: first || last,
    }).then((tasks) => {
      const edges = tasks.map(task => ({
        cursor: Buffer.from(task.id.toString()).toString('base64'), // convert createdAt to cursor
        node: task, // the node is the message itself
      }));
      return {
        edges,
        pageInfo: {
          hasNextPage() {
            if (tasks.length < (last || first)) {
              return Promise.resolve(false);
            }
            return Task.findOne({
              where: {
                userstoryId: userstory.id,
                id: {
                  [before ? '$gt' : '$lt']: tasks[tasks.length - 1].id,
                },
              },
              order: [['id', 'DESC']],
            }).then(task => !!task);
          },
          hasPreviousPage() {
            return Task.findOne({
              where: {
                userstoryId: userstory.id,
                id: where.id,
              },
              order: [['id']],
            }).then(task => !!task);
          },
        },
      };
    });
  }, 
  count(userstory, args, ctx) {
    return userstory.countTasks();
  },
  query(_, { id }, ctx) {
    return getAuthenticatedUser(ctx).then(user => Userstory.findOne({
      where: { id },
      include: [{
        model: User,
        where: { id: user.id },
      }],
    }));
  },
}

export const taskLogic = {
  title(task, args, ctx) {
    // return getAuthenticatedUser(ctx).then((currentUser) => {
    //   if (currentUser.id === user.id) {
    //     return task.title;
    //   }
    //   throw new ForbiddenError('Unauthorized');
    // });
    return task.title;
  },
  belongsTo(task, args, ctx) {
    // return getAuthenticatedUser(ctx).then((currentUser) => {
    //   if (currentUser.id === user.id) {
    //     return task.getUserstory();
    //   }
    //   throw new ForbiddenError('Unauthorized');
    // });
    return task.getUserstory();
  },
  from(task, args, ctx) {
    // return getAuthenticatedUser(ctx).then((currentUser) => {
    //   if (currentUser.id === user.id) {
    //     return task.getUser();
    //   }
    //   throw new ForbiddenError('Unauthorized');
    // });
    return task.getUser();
  },
  state(task, args, ctx) {
    // return getAuthenticatedUser(ctx).then((currentUser) => {
    //   if (currentUser.id === user.id) {
    //     return task.title;
    //   }
    //   throw new ForbiddenError('Unauthorized');
    // });
    return task.state;
  },
  query(_, { userstoryId, userId }, ctx) {
    return Task.findAll({
      where: { userstoryId }
    })
  },
    // return getAuthenticatedUser(ctx).then(user => Task.findOne({
    //   where: { id },
    //   include: [{
    //     model: User,
    //     where: { id: user.id },
    //   }],
    // }));
}

export const groupLogic = {
  users(group) {
    return group.getUsers({ attributes: ['id', 'username'] });
  },
  messages(group, { first, last, before, after }) {
      // base query -- get messages from the right group
      const where = { groupId: group.id };

      // because we return messages from newest -> oldest
      // before actually means newer (date > cursor)
      // after actually means older (date < cursor)
      if (before) {
        // convert base-64 to utf8 iso date and use in Date constructor
        where.id = { $gt: Buffer.from(before, 'base64').toString() };
      }
      if (after) {
        where.id = { $lt: Buffer.from(after, 'base64').toString() };
      }
      return Message.findAll({
        where,
        order: [['id', 'DESC']],
        limit: first || last,
      }).then((messages) => {
        const edges = messages.map(message => ({
          cursor: Buffer.from(message.id.toString()).toString('base64'), // convert createdAt to cursor
          node: message, // the node is the message itself
        }));
        return {
          edges,
          pageInfo: {
            hasNextPage() {
              if (messages.length < (last || first)) {
                return Promise.resolve(false);
              }
              return Message.findOne({
                where: {
                  groupId: group.id,
                  id: {
                    [before ? '$gt' : '$lt']: messages[messages.length - 1].id,
                  },
                },
                order: [['id', 'DESC']],
              }).then(message => !!message);
            },
            hasPreviousPage() {
              return Message.findOne({
                where: {
                  groupId: group.id,
                  id: where.id,
                },
                order: [['id']],
              }).then(message => !!message);
            },
          },
        };
      });
  },
  query(_, { id }, ctx) {
    return getAuthenticatedUser(ctx).then(user => Group.findOne({
      where: { id },
      include: [{
        model: User,
        where: { id: user.id },
      }],
    }));
  },
  createGroup(_, { name, userIds }, ctx) {
    return getAuthenticatedUser(ctx)
      .then(user => user.getFriends({ where: { id: { [Op.in]: userIds } } })
      .then((friends) => {  // eslint-disable-line arrow-body-style
        return Group.create({
          name,
          ownerId: user.id,
        }).then((group) => {  // eslint-disable-line arrow-body-style
          sendMessageChatbot(group.id, user.id);
          return group.addUsers([user, ...friends]).then(() => {
            group.users = [user, ...friends];
            return group;
          });
        });
      }));
  },
  deleteGroup(_, { id }, ctx) {
    return getAuthenticatedUser(ctx).then((user) => { // eslint-disable-line arrow-body-style
      return Group.findOne({
        where: { id },
        include: [{
          model: User,
          where: { id: user.id },
        }],
      }).then(group => group.getUsers()
        .then(users => group.removeUsers(users))
        .then(() => Message.destroy({ where: { groupId: group.id } }))
        .then(() => group.destroy()));
    });
  },
  leaveGroup(_, { id }, ctx) {
    return getAuthenticatedUser(ctx).then((user) => {
      return Group.findOne({
        where: { id },
        include: [{
          model: User,
          where: { id: user.id },
        }],
      }).then((group) => {
        if (!group) {
          throw new ApolloError('No group found', 404);
        }
        return group.removeUser(user.id)
          .then(() => group.getUsers())
          .then((users) => {
            // if the last user is leaving, remove the group
            if (!users.length) {
              group.destroy();
            }
            return { id };
          });
      });
    });
  },
  updateGroup(_, { id, name }, ctx) {
    return getAuthenticatedUser(ctx).then((user) => {  // eslint-disable-line arrow-body-style
      return Group.findOne({
        where: { id },
        include: [{
          model: User,
          where: { id: user.id },
        }],
      }).then(group => group.update({ name }));
    });
  },
};

export const userLogic = {
  updateUsername(_, { username }, ctx) {
    return getAuthenticatedUser(ctx).then((user) => {
      return user.update({ username }).then(newUser => {
        ctx.user = Promise.resolve(newUser)
        return newUser;
      });
    });
  },
  email(user, args, ctx) {
    return getAuthenticatedUser(ctx).then((currentUser) => {
      if (currentUser.id === user.id) {
        return currentUser.email;
      }
      throw new ForbiddenError('Unauthorized');
    });
  },
  friends(user, args, ctx) {
    return getAuthenticatedUser(ctx).then((currentUser) => {
      if (currentUser.id !== user.id) {
        throw new ForbiddenError('Unauthorized');
      }
      return user.getFriends({ attributes: ['id', 'username'] });
    });
  },
  workspace(user, args, ctx) {
    return getAuthenticatedUser(ctx).then((currentUser) => {
      if (currentUser.id !== user.id) {
        throw new ForbiddenError('Unauthorized');
      }
      return user.getWorkspace();
    });
  },
  groups(user, args, ctx) {
    return getAuthenticatedUser(ctx).then((currentUser) => {
      if (currentUser.id !== user.id) {
        throw new ForbiddenError('Unauthorized');
      }
      return user.getGroups();
    });
  },
  userstories(user, args, ctx) {
    return getAuthenticatedUser(ctx).then((currentUser) => {
      if (currentUser.id !== user.id) {
        throw new ForbiddenError('Unauthorized');
      }
      return user.getUserstories();
    });
  },
  jwt(user) {
    return Promise.resolve(user.jwt);
  },
  messages(user, args, ctx) {
    return getAuthenticatedUser(ctx).then((currentUser) => {
      if (currentUser.id !== user.id) {
        throw new ForbiddenError('Unauthorized');
      }
      return Message.findAll({
        where: { userId: user.id },
        order: [['createdAt', 'DESC']],
      });
    });
  },
  query(_, args, ctx) {
    return getAuthenticatedUser(ctx).then((user) => {
      if (user.id === args.id || user.email === args.email) {
        return user;
      }
      throw new ForbiddenError('Unauthorized');
    });
  },
};

export const subscriptionLogic = {
    groupAdded(params, args, ctx) {
      return getAuthenticatedUser(ctx)
        .then((user) => {
          if (user.id !== args.userId) {
            throw new ForbiddenError('Unauthorized');
          }
          return Promise.resolve();
        });
    },
    messageAdded(params, args, ctx) {
      return getAuthenticatedUser(ctx)
        .then(user => user.getGroups({ where: { id: { [Op.in]: args.groupIds } }, attributes: ['id'] })
        .then((groups) => {
          // user attempted to subscribe to some groups without access
          if (args.groupIds.length > groups.length) {
            throw new ForbiddenError('Unauthorized');
          }
          return Promise.resolve();
        })
        .catch(err=> {
          console.log(err)
        }));
    },
  };
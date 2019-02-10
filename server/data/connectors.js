"use strict";


import { _ } from 'lodash';
import faker from 'faker';
import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';
import { createGeneral, sendMessageChatbot } from './functions';

// initialize our database
const db = new Sequelize('chask', null, null, {
  dialect: 'sqlite',
  storage: './chask.sqlite',
  logging: false, // mark this true if you want to see logs
  // operatorsAliases: false
});

// define workspaces
const WorkspaceModel = db.define('workspace', {
  name: { type: Sequelize.STRING },
});

// define groups
const UserstoryModel = db.define('userstory', {
  name: { type: Sequelize.STRING },
  ownerId: { type: Sequelize.INTEGER },
});

// define tasks
const TaskModel = db.define('task', {
  title: { type: Sequelize.STRING },
  state: { 
    type:   Sequelize.ENUM,
    values: ['TO_DO', 'IN_PROGRESS', 'DONE'],
    defaultValue: 'TO_DO'
  }
});

// define groups
const GroupModel = db.define('group', {
  name: { type: Sequelize.STRING },
  ownerId: { type: Sequelize.INTEGER },
});

// define messages
const MessageModel = db.define('message', {
  text: { type: Sequelize.STRING },
});

// define users
const UserModel = db.define('user', {
  email: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  version: { type: Sequelize.INTEGER }, // version of the password
});

UserModel.destroy({
  where: {},
  truncate: true
})
TaskModel.destroy({
  where: {},
  truncate: true
})
UserModel.destroy({ where: {}, truncate: true, force: true })

TaskModel.destroy({ where: {}, truncate: true, force: true })
// users have one workspace
UserModel.belongsTo(WorkspaceModel, { through: 'WorkspaceUser' });

// users belong to multiple groups
UserModel.belongsToMany(GroupModel, { through: 'GroupUser' });

// users belong to multiple user stories
UserModel.belongsToMany(UserstoryModel, { through: 'UserstoryUser' });

// users belong to multiple users as friends
UserModel.belongsToMany(UserModel, { through: 'Friends', as: 'friends' });

// messages are sent from users
MessageModel.belongsTo(UserModel);

// messages are sent to groups
MessageModel.belongsTo(GroupModel);

// tasks are created from users
TaskModel.belongsToMany(UserModel, { through: 'TaskUser' });
TaskModel.belongsTo(UserModel);

// tasks belong to user stories
TaskModel.belongsTo(UserstoryModel);

// user stories belong to multiple tasks
UserstoryModel.belongsToMany(TaskModel, { through: 'UserstoryTask' });

// workspaces have multiple users
WorkspaceModel.belongsToMany(UserModel, { through: 'WorkspaceUser' });

// user stories have multiple users
UserstoryModel.belongsToMany(UserModel, { through: 'UserstoryUser' });

// groups have multiple users
GroupModel.belongsToMany(UserModel, { through: 'GroupUser' });

// create fake starter data
const GROUPS = 1;
const USERS_PER_GROUP = 7;
const MESSAGES_PER_USER = 5;
faker.seed(123); // get consistent data every time we reload app

const mySalt = 10;

// we create the chat bot for Chask
db.sync({ force: true }).then(() => UserModel.create({
  email: "chatbot@gmail.com",
  username: "Chask.ChatBot",
  password: "chaskbot",
  version: 1,
}).then((userBot) => {
  console.log("--------------- chat bot ---------------")
  console.log(
    '{email, username, password, id}',
    `{${userBot.email}, ${userBot.username}, ${userBot.password}, ${userBot.id}}`
  );
  console.log("--------------- chat bot ---------------")
  return userBot;
}));

// fakes a bunch of groups, users, and messages
db.sync({ force: true }).then(() => WorkspaceModel.create({
  name: "testWorkspace",
}).then((workspaceTest) => _.times(GROUPS, () => GroupModel.create({
  // name: faker.lorem.words(3),
  name: "General Group",
  ownerId: 5
}).then(group => {
  // create a user story
  return UserstoryModel.create({
    name: "General User Story",
    ownerId: 5
  }).then(us => 
    _.times(USERS_PER_GROUP, () => {
    // console.log(Object.keys(group.__proto__));
    const password = faker.lorem.words(1);
    // const password = faker.internet.password();
    // <console.log(Object.keys(us.__proto__));
    return bcrypt.hash(password, mySalt).then(hash => group.createUser({
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: hash,
      version: 1,
    }).then((user) => {
      console.log(
        '{id, email, username, password}',
        `{${user.id}, ${user.email}, ${user.username}, ${password} }`
      );
      // create messages for each user
      _.times(MESSAGES_PER_USER, () => MessageModel.create({
        userId: user.id,
        groupId: group.id,
        text: faker.lorem.sentences(3),
      }));   
      //create tasks 
      TaskModel.create({
        userstoryId: us.id,
        userId: user.id,
        title: faker.lorem.words(2),
        ownerId: 5
      }).then((task) => {
        us.addTask(task).then(() => {
          console.log('count tasks----------------');
          us.countTasks().then(res => console.log(res));
        });
        task.setUserstory(us);
        // console.log(Object.keys(task.__proto__));
        console.log(
          '{Task id, title, state, userstoryId, userId}',
          `{${task.id}, ${task.title}, ${task.state}, ${task.userstoryId}, ${task.userId}}`
        );
        
        
      });
      if(user.hasUserstory())
        console.log("already added us")
      else 
        user.addUserstory(us);
      us.addUser(user);
      
      workspaceTest.addUser(user);
      user.setWorkspace(workspaceTest); 

      return user;
    }));
  }))
}).then((userPromises) => {
  // make users friends with all users in the group
  Promise.all(userPromises).then((users) => {
    _.each(users, (current, i) => {
      _.each(users, (user, j) => {
        if (i !== j) {
          current.addFriend(user);
        }
      });
    });
    if(workspaceTest.hasUsers())
        console.log("already added workspace")
    else {
      workspaceTest.addUsers(users);
    }
  });
}))));



const Workspace = db.models.workspace;
const Userstory = db.models.userstory;
const Task = db.models.task;
const Group = db.models.group;
const Message = db.models.message;
const User = db.models.user;

export { Workspace, Userstory, Task, Group, Message, User };
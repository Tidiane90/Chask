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
const UserStoryModel = db.define('userstory', {
  name: { type: Sequelize.STRING },
  ownerId: { type: Sequelize.INTEGER },
});

// define tasks
const TaskModel = db.define('task', {
  title: { type: Sequelize.STRING },
  state: { 
    type:   Sequelize.ENUM,
    values: ['TO DO', 'IN PROGRESS', 'DONE'],
    defaultValue: 'TO DO'
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
  //workSpaceId: { type: Sequelize.INTEGER },
  email: { type: Sequelize.STRING },
  username: { type: Sequelize.STRING },
  password: { type: Sequelize.STRING },
  version: { type: Sequelize.INTEGER }, // version of the password
});

// users have one workspace
UserModel.belongsTo(WorkspaceModel, { through: 'WorkspaceUser' });

// users belong to multiple groups
UserModel.belongsToMany(GroupModel, { through: 'GroupUser' });

// users belong to multiple user stories
UserModel.belongsToMany(UserStoryModel, { through: 'UserstoryUser' });

// users belong to multiple users as friends
UserModel.belongsToMany(UserModel, { through: 'Friends', as: 'friends' });

// messages are sent from users
MessageModel.belongsTo(UserModel);

// messages are sent to groups
MessageModel.belongsTo(GroupModel);

// tasks are created from users
TaskModel.belongsTo(UserModel);

// tasks belong to user stories
TaskModel.belongsTo(UserStoryModel);

// workspaces have multiple users
WorkspaceModel.belongsToMany(UserModel, { through: 'WorkspaceUser' });

// user stories have multiple users
UserStoryModel.belongsToMany(UserModel, { through: 'UserstoryUser' });

// groups have multiple users
GroupModel.belongsToMany(UserModel, { through: 'GroupUser' });

// create fake starter data
const GROUPS = 1;
const USERS_PER_GROUP = 7;
const MESSAGES_PER_USER = 5;
faker.seed(123); // get consistent data every time we reload app

const mySalt = 10;
let first = true;

db.sync({ force: true }).then(() => {
  UserStoryModel.create({
    name: "testUserStory",
    ownerId: 5
  }).then((us) => {
    TaskModel.create({
      title: "testTask"
    }).then((task) => {
      console.log(
        '{User story}',
        `{${us.id}, ${us.name}}`
      );
      console.log(
        '{Task}',
        `{${task.id}, ${task.title}, ${task.state}}`
      );
    })
  })
})

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
  name: "General",
  ownerId: 5
}).then(group => _.times(USERS_PER_GROUP, () => {
  // console.log(Object.keys(group.__proto__));
  const password = faker.lorem.words(1);
  // const password = faker.internet.password();
  
  return bcrypt.hash(password, mySalt).then(hash => group.createUser({
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: hash,
    version: 1,
  }).then((user) => {
    workspaceTest.addUser(user);
    user.setWorkspace(workspaceTest);
    // console.log("_____________________________");
    // console.log(user);
    // console.log("__________________dsd___________");
    // console.log(workspaceTest);
    console.log(
      '{id, email, username, password}',
      `{${user.id}, ${user.email}, ${user.username}, ${password} }`
    );
    _.times(MESSAGES_PER_USER, () => MessageModel.create({
      userId: user.id,
      groupId: group.id,
      text: faker.lorem.sentences(3),
    }));    

    return user;
  }));
})).then((userPromises) => {
  
  // make users friends with all users in the group
  Promise.all(userPromises).then((users) => {
    _.each(users, (current, i) => {
      // we add the workspace to the users
      // current.setWorkspace(workspaceTest);
      //console.log("current user")
      //console.log(current)
      //console.log(workspaceTest)
      // console.log(current.email + " " +current.workspaceId);
      // console.log(Object.keys(workspaceTest.__proto__));
      // console.log(Object.keys(current.__proto__));
      
        //workspaceTest.addUser(current)
      // console.log(current.getWorkspace());
      _.each(users, (user, j) => {
        if (i !== j) {
          current.addFriend(user);
          // console.log(current.getFriends());
        }
      });
    });
    if(workspaceTest.hasUsers())
        console.log("already added")
    else {
      workspaceTest.addUsers(users);
    }
    //workspaceTest.addUsers(...users);
    // workspaceTest.addUsers(users);
  
    // console.log(workspaceTest.getUsers());
    // users.addWorkspace(workspaceTest);
    // console.log("users => ");
    // console.log(users);
    // console.log(workspaceTest)
  });
}))));



const Workspace = db.models.workspace;
const UserStory = db.models.userstory;
const Group = db.models.group;
const Message = db.models.message;
const User = db.models.user;

export { Workspace, UserStory, Group, Message, User };
import { _ } from 'lodash';
import faker from 'faker';
import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';

// initialize our database
const db = new Sequelize('chask', null, null, {
  dialect: 'sqlite',
  storage: './chask.sqlite',
  logging: false, // mark this true if you want to see logs
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
  version: { type: Sequelize.INTEGER }, // version the password
});

// users belong to multiple groups
UserModel.belongsToMany(GroupModel, { through: 'GroupUser' });

// users belong to multiple users as friends
UserModel.belongsToMany(UserModel, { through: 'Friends', as: 'friends' });

// messages are sent from users
MessageModel.belongsTo(UserModel);

// messages are sent to groups
MessageModel.belongsTo(GroupModel);

// groups have multiple users
GroupModel.belongsToMany(UserModel, { through: 'GroupUser' });

// create fake starter data
const GROUPS = 4;
const USERS_PER_GROUP = 5;
const MESSAGES_PER_USER = 5;
faker.seed(123); // get consistent data every time we reload app

const mySalt = 10;
let first = true;
// let count = 0;
let ownerCount = 2;

db.sync({ force: true }).then( () => UserModel.create({
  email: "ChaskChatbot@gmail.com",
  username: "Chask.ChatBot",
  password: "chatbot",
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
db.sync({ force: true }).then(() => _.times(GROUPS, () => GroupModel.create({
  name: faker.lorem.words(3),
  ownerId: ownerCount++
}).then(group => _.times(USERS_PER_GROUP, () => {

  const password = faker.lorem.words(1);
  // const password = faker.internet.password();
  return bcrypt.hash(password, mySalt).then(hash => group.createUser({
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: hash,
    version: 1,
  }).then((user) => {
    console.log(
      '{email, username, password, id}',
      `{${user.email}, ${user.username}, ${password}, ${user.id}}`
    );
    _.times(MESSAGES_PER_USER, () => MessageModel.create({
      userId: user.id,
      groupId: group.id,
      text: faker.lorem.sentences(3),
    }));

    // if(count > GROUPS) {
    //   count = 0;
    //   first = true;
    // }    
    // if(first) {
    //   group.ownerId = user.id;
    //   first = false;
    // }
    // count = count+ 1;

    
    
    console.log(
      '{groupId, groupName, owner}',
      `{${group.id}, ${group.name}, ${group.ownerId}}`
    );

    return user;
  }));
})).then((userPromises) => {
  
  // make users friends with all users in the group
  Promise.all(userPromises).then((users) => {
    _.each(users, (current, i) => {
      _.each(users, (user, j) => {
        if (i !== j) {
          current.addFriend(user);
        }
      });
    });
  });
})));

const Group = db.models.group;
const Message = db.models.message;
const User = db.models.user;

export { Group, Message, User };
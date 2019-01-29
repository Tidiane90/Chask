import { Workspace, Task, Userstory, Group, Message, User } from './connectors';



// function to send a message through the chask chatbot
export function sendMessageChatbot(idGroup, idUserOwner) {
    User.findOne({
        where: { id: idUserOwner },
    }).then((userOwner) => {
        Message.create({
        userId: 1,
        groupId: idGroup,
        text: "Hello all, the owner of this group is " +userOwner.username +"!!!",
        })
    });
}


// function to cretae a general group when a workspace is created with a new user
export function createGeneralGroup(idUserOwner) {
    return User.findOne({
        where: { id: idUserOwner },
    }).then((userOwner) => {
        return Group.create({
            // name: faker.lorem.words(3),
            name: "General Group",
            ownerId: userOwner.id
        })
    });
}

export function createGeneralUserstory(idUserOwner) {
    return User.findOne({
        where: { id: idUserOwner },
    }).then((userOwner) => {
        return Userstory.create({
            // name: faker.lorem.words(3),
            name: "General User Story",
            ownerId: userOwner.id
        })
    });
}
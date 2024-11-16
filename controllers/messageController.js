import User from "../models/user.js";
import Message from "../models/message.js";

export const checkUser = async (socket, { currentUser, username }) => {
    try {
        const [targetUser, currentUserData] = await Promise.all([User.findOne({ username: username }), User.findOne({ username: currentUser })]);

        if (!targetUser) {
            socket.emit("errorMessage", `User ${username} not found`);
            return;
        }

        if (!currentUserData) {
            socket.emit("errorMessage", `Current user ${currentUser} not found`);
            return;
        }

        const updatedUser = await User.findByIdAndUpdate(currentUserData._id, { $addToSet: { friends: targetUser._id } }, { new: true });

        console.log("updateUser", updatedUser);
        socket.emit("userAdded", targetUser.username);
    } catch (error) {
        console.error("Error adding user as friend:", error);
        socket.emit("errorMessage", "An error occurred while adding the user as a friend.");
    }
};

export const sendPrivateMessage = async (socket, users, { sender, receiver, message }) => {
    try {
        const receiverSocketId = users[receiver];
        const [senderUser, receiverUser] = await Promise.all([User.findOne({ username: sender }), User.findOne({ username: receiver })]);

        if (!senderUser || !receiverUser) {
            socket.emit("errorMessage", "Sender or receiver not found.");
            return;
        }

        const newMessage = await Message.create({
            senderId: senderUser._id,
            receiverId: receiverUser._id,
            message: message
        });

        socket.emit("addElement", newMessage);

        if (receiverSocketId) {
            socket.to(receiverSocketId).emit("serverMessage", newMessage);
        }
    } catch (error) {
        console.error("Error sending private message:", error);
        socket.emit("errorMessage", "An error occurred while sending your message.");
    }
};

export const createGroup = (socket, { groupName }) => {
    socket.join(groupName);
    socket.emit("groupCreated", groupName);
};

export const joinGroup = (io, socket, { groupName }) => {
    socket.join(groupName);
    socket.emit("groupJoined", groupName);
    io.to(groupName).emit("newUserJoined", `${socket.id} has joined the group: ${groupName}`);
    console.log(`User ${socket.id} joined group: ${groupName}`);
};

export const sendGroupMessage = (io, { groupName, message, currentUser }) => {
    const timestamp = Date.now();
    io.to(groupName).emit("serverGroupMessage", { message, user: currentUser, timestamp });
    console.log(`Message sent to group ${groupName}:`, { message, currentUser });

};

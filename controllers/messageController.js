import User from "../models/user.js";
import Message from "../models/message.js";

export const sendPrivateMessage = async (socket, users, { sender, receiver, message }) => {
    try {
        const receiverSocketId = users[receiver];
        if (!receiverSocketId) {
            socket.emit("error_message", `User ${receiver} is not connected`);
            return;
        }

        const [findSender, findReceiver] = await Promise.all([User.findOne({ username: sender }), User.findOne({ username: receiver })]);

        if (findSender && findReceiver) {
            const newMessage = new Message({
                senderId: findSender._id,
                receiverId: findReceiver._id,
                message,
            });
            await newMessage.save();

            // Emit messages to both sender and receiver
            socket.emit("add_element", newMessage, sender);
            socket.to(receiverSocketId).emit("server_message", newMessage, sender);
        }
    } catch (error) {
        console.error("Error handling private message:", error);
        socket.emit("error_message", "An error occurred while sending your message.");
    }
};

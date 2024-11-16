import { checkUser, sendPrivateMessage, createGroup, joinGroup, sendGroupMessage } from "../controllers/messageController.js";

export const handleSockets = (io) => {
    const users = {};

    io.on("connection", (socket) => {
        console.log(`Server ${socket.id} connected`);

        socket.on("join", (currentUser) => {
            users[currentUser] = socket.id;
        });

        socket.on("checkUser", (data) => checkUser(socket, data));
        socket.on("privateMessage", (data) => sendPrivateMessage(socket, users, data));
        socket.on("createGroup", (data) => createGroup(socket, data));
        socket.on("joinGroup", (data) => joinGroup(io, socket, data));
        socket.on("groupMessage", (data) => sendGroupMessage(io, data));

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
            for (const [username, id] of Object.entries(users)) {
                if (id === socket.id) {
                    delete users[username];
                    break;
                }
            }
        });
    });
};

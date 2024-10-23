import { sendPrivateMessage } from "../controllers/messageController.js";

export const handleSockets = (io) => {
    const users = {};

    io.on("connection", (socket) => {
        console.log(`Server ${socket.id} connected`);

        socket.on("join", ({ user }) => {
            users[user] = socket.id;
        });

        socket.on("private_message", (data) => sendPrivateMessage(socket, users, data));

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

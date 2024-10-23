import { Server } from "socket.io";
import { handleSockets } from "../routes/messageRoutes.js";

export const setupSocket = (server) => {
    const io = new Server(server);
    handleSockets(io);
};

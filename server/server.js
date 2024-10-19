import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://127.0.0.1:5500", // Allowing Live Server
        methods: ["GET", "POST"],
    },
});

// Store connected server clients
const users = {};

// Handle socket connections
io.on("connection", (socket) => {
    console.log(`Server ${socket.id} connected`);

    socket.on("chat message", (message, user) => {
        console.log(`Message from Server ${socket.id}: ${message}`);
        users[socket.id] = user;
        socket.broadcast.emit("server-message", message, user);
    });

    socket.on("disconnect", () => {
        console.log(`Server ${socket.id} disconnected`);
        delete users[socket.id];
    });
});

server.listen(4000, () => {
    console.log("Server A listening on port 4000");
});

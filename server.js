import express from "express";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDb from "./config/db.js";
import { setupSocket } from "./config/socket.js";
import userRoutes from "./routes/userRoutes.js";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

// Setup directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Set up socket.io
setupSocket(server);

// Express app configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", userRoutes);

server.listen(4000, () => {
    console.log("Server A listening on port 4000");
    connectDb();
});

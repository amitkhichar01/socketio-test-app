import express from "express";
import { registerUser, addUser, getUserChat } from "../controllers/userController.js";

const router = express.Router();

router.get("/", registerUser);
router.post("/submit", addUser);
router.get("/:username", getUserChat);

export default router;

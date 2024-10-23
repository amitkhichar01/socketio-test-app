import express from "express";
import { getUserChat } from "../controllers/userController.js";

const router = express.Router();

router.get("/:username", getUserChat);

export default router;

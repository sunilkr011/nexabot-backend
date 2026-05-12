import express from "express";
import { sendMessage, getHistory } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", sendMessage);
router.get("/history/:sessionId", getHistory);

export default router;

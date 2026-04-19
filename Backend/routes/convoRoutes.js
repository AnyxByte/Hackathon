import express from "express";
import {
  deleteChat,
  fetchHistory,
  shareChat,
} from "../controllers/convoController.js";

const router = express.Router();

router.get("/fetchHistory", fetchHistory);
router.delete("/delete/:sessionId", deleteChat);
router.post("/share", shareChat);

export default router;

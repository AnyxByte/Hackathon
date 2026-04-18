import express from "express";
import { fetchHistory } from "../controllers/convoController.js";

const router = express.Router();

router.get("/fetchHistory", fetchHistory);

export default router;
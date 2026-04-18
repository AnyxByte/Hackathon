import express from "express";
import {
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", auth, updateUser);

export default router;

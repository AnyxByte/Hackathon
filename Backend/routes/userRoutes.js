import express from "express";
import {
  loginUser,
  registerUser,
  updateUser,
  fetchAllUsers,
} from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", auth, updateUser);
router.get("/allUsers", auth, fetchAllUsers);

export default router;

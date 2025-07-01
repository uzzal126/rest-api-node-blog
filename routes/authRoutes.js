import express from "express";
const router = express.Router();

import {
  getUserProfile,
  userLogin,
  userRegister,
} from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile", isAuthenticated, getUserProfile);

export default router;

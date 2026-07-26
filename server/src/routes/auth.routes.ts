import { Router } from "express";
import {
    registerUser,
    verifyUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    getMe
} from "../controllers/authcontroller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.post("/register", registerUser);
router.post("/verify-code", verifyUser);
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);

// Protected routes (require authorization middleware)
router.post("/logout", requireAuth, logoutUser);
router.get("/me", requireAuth, getMe);

export default router;
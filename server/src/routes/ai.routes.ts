import express from "express";
import { executeAIRequest } from "../ai/controllers/ai.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/chat
 * @desc Executes an AI generation request (Stateless, no memory, no history)
 * @access Private
 */
router.post("/chat", requireAuth, executeAIRequest);

export default router;

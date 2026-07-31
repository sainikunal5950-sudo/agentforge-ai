import { Response } from "express";
import { IAuthenticatedRequest } from "../../types/auth.types.js";
import { IAIRequest } from "../types/ai.types.js";
import { processAIRequestService } from "../services/ai.service.js";

/**
 * Controller to handle incoming AI generation requests.
 */
export const executeAIRequest = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const request: IAIRequest = req.body;

        // Delegate to the AI execution service
        const response = await processAIRequestService(userId, request);

        res.status(200).json({ success: true, data: response });
    } catch (error: any) {
        if (error.message === "No providers implemented yet.") {
            res.status(501).json({ success: false, message: error.message });
            return;
        }

        console.error(`[AI Controller Error]:`, error);
        res.status(500).json({ success: false, message: "Internal server error during AI execution." });
    }
};

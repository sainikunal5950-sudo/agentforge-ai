import { Response } from "express";
import { IAuthenticatedRequest } from "../../types/auth.types.js";
import { IAIRequest } from "../types/ai.types.js";
import { processAIRequestService } from "../services/ai.service.js";
import { handleErrorResponse } from "../../utils/error.utils.js";

/**
 * Controller to handle incoming AI generation requests.
 */
export const executeAIRequest = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const { agentId, message } = req.body;

        if (!agentId || typeof agentId !== 'string' || !agentId.trim()) {
            res.status(400).json({ success: false, message: "Missing or invalid required field: agentId" });
            return;
        }

        if (!message || typeof message !== 'string' || !message.trim()) {
            res.status(400).json({ success: false, message: "Missing or invalid required field: message" });
            return;
        }

        const request: IAIRequest = {
            agentId,
            messages: [{ role: "user", content: message }]
        };

        // Delegate to the AI execution service
        const response = await processAIRequestService(userId, request);

        res.status(200).json({ 
            success: true, 
            message: response.content,
            model: response.modelUsed,
            agentId: agentId,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        handleErrorResponse(res, error, "Internal server error during AI execution");
    }
};

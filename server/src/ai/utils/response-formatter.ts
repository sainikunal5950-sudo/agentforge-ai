import { IAIResponse } from "../types/ai.types.js";

/**
 * Normalizes raw responses from different AI providers into our unified IAIResponse format.
 */
export const formatResponse = (rawResponse: any, modelUsed: string): IAIResponse => {
    // Placeholder logic
    return {
        content: "Placeholder content",
        modelUsed: modelUsed,
        usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0
        }
    };
};

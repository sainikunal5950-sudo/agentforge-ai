import { IAIResponse } from "../types/ai.types.js";

/**
 * Normalizes raw responses from different AI providers into our unified IAIResponse format.
 */
export const formatResponse = (rawResponse: any, modelUsed: string): IAIResponse => {
    // If it's already an IAIResponse (like from OpenAIProvider), just return it
    if (rawResponse && typeof rawResponse.content === "string") {
        return rawResponse as IAIResponse;
    }

    // Fallback for providers that haven't normalized their responses yet
    return {
        content: rawResponse?.content || "No response received",
        modelUsed: modelUsed,
        usage: rawResponse?.usage
    };
};

import { IAIProvider } from "../providers/provider.interface.js";
import { IAIRequest } from "../types/ai.types.js";

/**
 * Determines which AI provider to use based on the preferred model and configuration.
 */
export const routeToProvider = (request: IAIRequest): IAIProvider => {
    // Placeholder logic for future routing (e.g. returning OpenAIProvider vs AnthropicProvider)
    throw new Error("No providers implemented yet.");
};

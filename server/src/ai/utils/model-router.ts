import { IAIProvider } from "../providers/provider.interface.js";
import { IAIRequest } from "../types/ai.types.js";
import { OpenAIProvider } from "../providers/openai.provider.js";
import { GeminiProvider } from "../providers/gemini.provider.js";
import { ClaudeProvider } from "../providers/claude.provider.js";
import { LocalProvider } from "../providers/local.provider.js";

import { GroqProvider } from "../providers/groq.provider.js";

/**
 * Determines which AI provider to use based on the preferred model and configuration.
 */
export const routeToProvider = (request: IAIRequest): IAIProvider => {
    // Since the user is prioritizing Groq, we'll default to llama-3.3-70b-versatile
    const model = (request.preferredModel || "llama-3.3-70b-versatile").toLowerCase();

    // Forcing all requests to use Groq API and model, as requested by user
    request.preferredModel = "llama-3.3-70b-versatile";
    return new GroqProvider();

    const error = new Error(`Unsupported model type or provider not configured for: ${request.preferredModel}`) as any;
    error.statusCode = 400;
    throw error;
};

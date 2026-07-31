import { IAIProvider } from "../providers/provider.interface.js";
import { IAIRequest } from "../types/ai.types.js";
import { OpenAIProvider } from "../providers/openai.provider.js";
import { GeminiProvider } from "../providers/gemini.provider.js";
import { ClaudeProvider } from "../providers/claude.provider.js";
import { LocalProvider } from "../providers/local.provider.js";

/**
 * Determines which AI provider to use based on the preferred model and configuration.
 */
export const routeToProvider = (request: IAIRequest): IAIProvider => {
    const model = (request.preferredModel || "gpt-4o").toLowerCase();

    if (model.startsWith("gpt-") || model.includes("openai")) {
        return new OpenAIProvider();
    }

    if (model.startsWith("gemini-")) {
        return new GeminiProvider();
    }

    if (model.startsWith("claude-")) {
        return new ClaudeProvider();
    }

    if (model.startsWith("llama-") || model.startsWith("local") || model.startsWith("mistral-")) {
        return new LocalProvider();
    }

    throw new Error(`Unsupported model type or provider not configured for: ${request.preferredModel}`);
};

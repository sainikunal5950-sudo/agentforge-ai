import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export type AIProviderName = "OpenAI" | "Gemini" | "Claude" | "Local";

export interface IAIProvider {
    /**
     * Name of the provider (e.g. OpenAI, Anthropic, MockProvider)
     */
    name: AIProviderName;

    /**
     * Executes the AI request against the external API and returns a unified response format.
     */
    generateResponse(request: IAIRequest): Promise<IAIResponse>;
}

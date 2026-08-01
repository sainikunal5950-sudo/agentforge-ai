import { IAIProvider, AIProviderName } from "./provider.interface.js";
import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export class LocalProvider implements IAIProvider {
    name: AIProviderName = "Local";

    async generateResponse(request: IAIRequest): Promise<IAIResponse> {
        // Placeholder for future local LLM (e.g. Ollama, LMStudio) implementation
        const error = new Error("LocalProvider not implemented yet.") as any;
        error.statusCode = 501;
        throw error;
    }
}

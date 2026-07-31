import { IAIProvider, AIProviderName } from "./provider.interface.js";
import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export class GeminiProvider implements IAIProvider {
    name: AIProviderName = "Gemini";

    async generateResponse(request: IAIRequest): Promise<IAIResponse> {
        // Placeholder for future Gemini SDK implementation
        throw new Error("GeminiProvider not implemented yet.");
    }
}

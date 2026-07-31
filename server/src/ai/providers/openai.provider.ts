import { IAIProvider, AIProviderName } from "./provider.interface.js";
import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export class OpenAIProvider implements IAIProvider {
    name: AIProviderName = "OpenAI";

    async generateResponse(request: IAIRequest): Promise<IAIResponse> {
        // Placeholder for future OpenAI SDK implementation
        throw new Error("OpenAIProvider not implemented yet.");
    }
}

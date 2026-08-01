import { IAIProvider, AIProviderName } from "./provider.interface.js";
import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export class ClaudeProvider implements IAIProvider {
    name: AIProviderName = "Claude";

    async generateResponse(request: IAIRequest): Promise<IAIResponse> {
        // Placeholder for future Anthropic SDK implementation
        const error = new Error("ClaudeProvider not implemented yet.") as any;
        error.statusCode = 501;
        throw error;
    }
}

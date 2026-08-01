import { GoogleGenAI } from "@google/genai";
import { IAIProvider, AIProviderName } from "./provider.interface.js";
import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export class GeminiProvider implements IAIProvider {
    name: AIProviderName = "Gemini";
    private client: GoogleGenAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[GeminiProvider] Initialization failed: GEMINI_API_KEY is not defined in the environment.");
            const error = new Error("System configuration error: AI provider is missing credentials.");
            (error as any).statusCode = 500;
            throw error;
        }

        this.client = new GoogleGenAI({ apiKey });
    }

    async generateResponse(request: IAIRequest): Promise<IAIResponse> {
        try {
            // Default model if not specified
            const modelName = request.preferredModel || "gemini-2.0-flash";
            
            // Extract the final user prompt (which contains System, Goal, and User message)
            const promptContent = request.messages[request.messages.length - 1]?.content || "";

            // Call the Gemini API using the new @google/genai SDK
            const response = await this.client.models.generateContent({
                model: modelName,
                contents: promptContent,
                config: {
                    temperature: request.temperature ?? 0.7,
                }
            });

            const text = response.text || "";
            
            // Try to extract usage metadata if available
            let usage;
            if (response.usageMetadata) {
                usage = {
                    promptTokens: response.usageMetadata.promptTokenCount || 0,
                    completionTokens: response.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata.totalTokenCount || 0
                };
            }

            return {
                content: text,
                modelUsed: modelName,
                usage
            };

        } catch (error: any) {
            console.error("[GeminiProvider] Error generating response:", error.message || error);
            
            const apiError = new Error("AI Execution failed") as any;
            const errorMessage = (error.message || "").toLowerCase();
            const status = error.status || (error.response && error.response.status);
            
            // Map Gemini specific errors
            if (errorMessage.includes("api key not valid") || errorMessage.includes("forbidden") || status === 403 || status === 401) {
                apiError.message = "Authentication failed with the AI provider. Check API key configuration.";
                apiError.statusCode = 500; // Hide 403/401 as 500 to prevent key leakage
            } else if (errorMessage.includes("quota") || errorMessage.includes("rate limit") || status === 429) {
                apiError.message = "Rate limit exceeded for the AI provider. Please try again later.";
                apiError.statusCode = 429;
            } else if (errorMessage.includes("not found") || errorMessage.includes("model") || status === 404) {
                apiError.message = `AI provider rejected the request: Model not found or invalid (${request.preferredModel})`;
                apiError.statusCode = 400;
            } else {
                apiError.message = `AI provider encountered an error: ${error.message}`;
                apiError.statusCode = status || 502; // Bad Gateway
            }

            throw apiError;
        }
    }
}

import OpenAI from "openai";
import { IAIProvider, AIProviderName } from "./provider.interface.js";
import { IAIRequest, IAIResponse } from "../types/ai.types.js";

export class GroqProvider implements IAIProvider {
    name: AIProviderName = "Groq";
    private client: OpenAI;

    constructor() {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error("[GroqProvider] Initialization failed: GROQ_API_KEY is not defined in the environment.");
            const error = new Error("System configuration error: AI provider is missing credentials.");
            (error as any).statusCode = 500;
            throw error;
        }

        // Groq is fully compatible with the OpenAI SDK
        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1"
        });
    }

    async generateResponse(request: IAIRequest): Promise<IAIResponse> {
        try {
            // Ensure model is set, default to a robust Groq model
            const model = request.preferredModel || "llama-3.3-70b-versatile";

            const messages = request.messages.map(msg => ({
                role: msg.role === "assistant" ? "assistant" : (msg.role === "system" ? "system" : "user") as "assistant" | "system" | "user",
                content: msg.content
            }));

            const response = await this.client.chat.completions.create({
                model: model,
                messages: messages,
                temperature: request.temperature ?? 0.7,
                stream: false,
            });

            const content = response.choices[0]?.message?.content || "";
            const usage = response.usage ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens
            } : undefined;

            return {
                content,
                modelUsed: response.model || model, 
                usage
            };

        } catch (error: any) {
            console.error("[GroqProvider] Error generating response:", error.message || error);
            
            const apiError = new Error("AI Execution failed") as any;
            
            if (error instanceof OpenAI.APIError) {
                if (error.status === 429) {
                    apiError.message = "Rate limit exceeded for the AI provider. Please try again later.";
                    apiError.statusCode = 429;
                } else if (error.status === 401) {
                    apiError.message = "Authentication failed with the AI provider. Check API key configuration.";
                    apiError.statusCode = 500; 
                } else if (error.status === 400) {
                    apiError.message = `AI provider rejected the request: ${error.message}`;
                    apiError.statusCode = 400;
                } else {
                    apiError.message = `AI provider encountered an error: ${error.message}`;
                    apiError.statusCode = error.status || 502;
                }
            } else {
                apiError.message = "An unexpected error occurred while communicating with the AI.";
                apiError.statusCode = 500;
            }

            throw apiError;
        }
    }
}

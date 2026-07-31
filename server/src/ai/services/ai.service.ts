import { IAIRequest, IAIResponse } from "../types/ai.types.js";
import { routeToProvider } from "../utils/model-router.js";
import { buildPrompt } from "../utils/prompt-builder.js";
import { formatResponse } from "../utils/response-formatter.js";

/**
 * Core service logic for the AI execution engine.
 * Validates the request, determines the correct provider, executes the generation,
 * and formats the result.
 */
export const processAIRequestService = async (userId: string, request: IAIRequest): Promise<IAIResponse> => {
    // 1. Build the prompt/context based on the agent's memory and configuration
    // (We will fetch the actual agent configuration later. For now, pass a dummy config and the last message content).
    const userMessage = request.messages[request.messages.length - 1]?.content || "";
    const finalPromptString = buildPrompt({}, userMessage);

    // 2. Select the correct AI provider based on the preferred model
    const provider = routeToProvider(request);

    // 3. Execute the AI generation request via the provider interface
    const rawResponse = await provider.generateResponse({
        ...request,
        messages: [{ role: "user", content: finalPromptString }] // Send the structured prompt string
    });

    // 4. Format and normalize the response before sending it back
    return formatResponse(rawResponse, request.preferredModel || "unknown");
};

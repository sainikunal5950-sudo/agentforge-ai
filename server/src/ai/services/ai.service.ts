import { IAIRequest, IAIResponse } from "../types/ai.types.js";
import { routeToProvider } from "../utils/model-router.js";
import { buildPrompt } from "../utils/prompt-builder.js";
import { formatResponse } from "../utils/response-formatter.js";
import { getAgentConfigService } from "../../services/agent.config.service.js";

/**
 * Core service logic for the AI execution engine.
 * Validates the request, determines the correct provider, executes the generation,
 * and formats the result.
 */
export const processAIRequestService = async (userId: string, request: IAIRequest): Promise<IAIResponse> => {
    // 1. Load Agent & Configuration (implicitly validates user ownership)
    const agentConfig = await getAgentConfigService(userId, request.agentId);

    // 2. Extract user message and build the prompt
    // Assuming the last message in the array is the current user request
    const userMessage = request.messages[request.messages.length - 1]?.content || "";
    const finalPromptString = buildPrompt(agentConfig, userMessage);

    // 3. Determine the model to use (allow request to override agent default)
    const modelToUse = request.preferredModel || agentConfig.preferredModel || "gpt-4o";
    const requestWithModel: IAIRequest = {
        ...request,
        preferredModel: modelToUse,
        temperature: request.temperature ?? agentConfig.temperature ?? 0.7,
        messages: [{ role: "user", content: finalPromptString }] // Overwrite messages with the structured prompt
    };

    // 4. Select the correct AI provider
    const provider = routeToProvider(requestWithModel);

    // 5. Execute the AI generation request via the provider interface
    const rawResponse = await provider.generateResponse(requestWithModel);

    // 6. Format and normalize the response before sending it back
    return formatResponse(rawResponse, modelToUse);
};

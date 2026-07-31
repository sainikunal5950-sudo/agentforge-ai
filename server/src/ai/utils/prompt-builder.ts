import { IAgentConfigResponse } from "../../types/agent.types.js";

/**
 * Builds the final prompt to be sent to the AI provider.
 * Injects the agent's persona (role, goal, instructions) and formats the conversation.
 */
export const buildPrompt = (agent: IAgentConfigResponse, userMessage: string): string => {
    let prompt = "--------------------------------\n\n";

    if (agent.role) {
        prompt += `You are a ${agent.role}.\n\n`;
    } else {
        prompt += `You are an AI Assistant.\n\n`;
    }

    if (agent.goal) {
        prompt += `Goal:\n\n${agent.goal}\n\n`;
    }

    if (agent.systemPrompt) {
        prompt += `Instructions:\n\n${agent.systemPrompt}\n\n`;
    }

    prompt += "--------------------------------\n\n";
    prompt += `User:\n\n${userMessage}\n\n`;
    prompt += "--------------------------------";

    return prompt;
};

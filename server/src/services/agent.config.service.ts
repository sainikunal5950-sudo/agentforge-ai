import { 
    IAgentResponse,
    IAgentConfigResponse,
    IUpdateAgentConfigInput,
    IUpdateAgentStatusInput,
    IUpdateAgentModelInput,
    IUpdateAgentMemoryInput,
    IUpdateAgentExecutionModeInput
} from "../types/agent.types.js";
import { fetchAndVerifyAgent, mapToAgentResponse } from "../utils/agent.utils.js";

/**
 * @function getAgentConfigService
 * @desc Retrieves the configuration fields of a specific agent.
 */
export const getAgentConfigService = async (userId: string, agentId: string): Promise<IAgentConfigResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);
    return {
        role: agent.role,
        goal: agent.goal,
        agentType: agent.agentType,
        systemPrompt: agent.systemPrompt,
        preferredModel: agent.preferredModel,
        temperature: agent.temperature,
        skills: agent.skills,
        memoryEnabled: agent.memoryEnabled,
        executionMode: agent.executionMode,
        visibility: agent.visibility,
        status: agent.status
    };
};

/**
 * @function updateAgentConfigService
 * @desc Updates the configuration fields of an agent.
 */
export const updateAgentConfigService = async (userId: string, agentId: string, input: IUpdateAgentConfigInput): Promise<IAgentConfigResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);

    if (input.role !== undefined) agent.role = input.role;
    if (input.goal !== undefined) agent.goal = input.goal;
    if (input.agentType !== undefined) agent.agentType = input.agentType;
    if (input.systemPrompt !== undefined) agent.systemPrompt = input.systemPrompt;
    if (input.preferredModel !== undefined) agent.preferredModel = input.preferredModel;
    if (input.temperature !== undefined) agent.temperature = input.temperature;
    if (input.skills !== undefined) agent.skills = input.skills;
    if (input.memoryEnabled !== undefined) agent.memoryEnabled = input.memoryEnabled;
    if (input.executionMode !== undefined) agent.executionMode = input.executionMode;
    if (input.visibility !== undefined) agent.visibility = input.visibility;
    if (input.status !== undefined) agent.status = input.status;

    await agent.save();

    return getAgentConfigService(userId, agentId);
};

/**
 * @function updateAgentStatusService
 * @desc Updates only the status of an agent.
 */
export const updateAgentStatusService = async (userId: string, agentId: string, input: IUpdateAgentStatusInput): Promise<IAgentResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);
    agent.status = input.status;
    const updatedAgent = await agent.save();
    return mapToAgentResponse(updatedAgent);
};

/**
 * @function updateAgentModelService
 * @desc Updates the preferred model and optionally temperature of an agent.
 */
export const updateAgentModelService = async (userId: string, agentId: string, input: IUpdateAgentModelInput): Promise<IAgentResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);
    agent.preferredModel = input.preferredModel;
    if (input.temperature !== undefined) agent.temperature = input.temperature;
    const updatedAgent = await agent.save();
    return mapToAgentResponse(updatedAgent);
};

/**
 * @function updateAgentMemoryService
 * @desc Updates the memory enabled toggle of an agent.
 */
export const updateAgentMemoryService = async (userId: string, agentId: string, input: IUpdateAgentMemoryInput): Promise<IAgentResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);
    agent.memoryEnabled = input.memoryEnabled;
    const updatedAgent = await agent.save();
    return mapToAgentResponse(updatedAgent);
};

/**
 * @function updateAgentExecutionModeService
 * @desc Updates the execution mode of an agent.
 */
export const updateAgentExecutionModeService = async (userId: string, agentId: string, input: IUpdateAgentExecutionModeInput): Promise<IAgentResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);
    agent.executionMode = input.executionMode;
    const updatedAgent = await agent.save();
    return mapToAgentResponse(updatedAgent);
};

import { Agent } from "../models/agent.model.js";
import { mapToAgentResponse, fetchAndVerifyAgent } from "../utils/agent.utils.js";
import { 
    ICreateAgentInput, 
    IUpdateAgentInput, 
    IAgentResponse,
    IAgentConfigResponse,
    IUpdateAgentConfigInput,
    IUpdateAgentStatusInput,
    IUpdateAgentModelInput,
    IUpdateAgentMemoryInput,
    IUpdateAgentExecutionModeInput
} from "../types/agent.types.js";
// ─── 1. Why the Service Layer Exists ──────────────────────────────────────────
// The Service Layer is the absolute heart of the application's architecture. 
// It exists to decouple pure BUSINESS LOGIC from HTTP concerns (Controllers) 
// and Database constraints (Models).
// By isolating this logic here:
// - Reusability: This service can be called by an HTTP Controller, a WebSocket event, 
//   or a Background CRON Job without changing a single line of code.
// - Testability: We can easily unit test the business rules without needing to mock 
//   Express `req` and `res` objects.
// - Separation of Concerns: Controllers only care about "How did the request come in?",
//   while Services only care about "What are the rules of the business?".



/**
 * @function createAgentService
 * @desc Creates a new agent linked to the authenticated user.
 */
export const createAgentService = async (userId: string, input: ICreateAgentInput): Promise<IAgentResponse> => {
    // Database Query: Agent.create()
    // Why: We use .create() to instantiate a new document and save it to MongoDB in one atomic step.
    // It automatically applies the default values and schema validation rules defined in agent.model.ts.
    const newAgent = await Agent.create({
        owner: userId,
        name: input.name,
        description: input.description,
        role: input.role,
        goal: input.goal,
        agentType: input.agentType,
        systemPrompt: input.systemPrompt,
        preferredModel: input.preferredModel,
        temperature: input.temperature,
        skills: input.skills,
        memoryEnabled: input.memoryEnabled,
        executionMode: input.executionMode,
        visibility: input.visibility,
        status: input.status
    });

    return mapToAgentResponse(newAgent);
};

/**
 * @function getAgentsService
 * @desc Retrieves all agents owned by a specific user.
 */
export const getAgentsService = async (userId: string): Promise<IAgentResponse[]> => {
    // Database Query: Agent.find({ owner: userId })
    // Why: We use .find() to retrieve an array of documents.
    // We STRICTLY filter by `owner: userId` to enforce Tenant Isolation. 
    // A user can never accidentally query another user's agents.
    // .sort({ createdAt: -1 }) ensures we return the newest agents first.
    const agents = await Agent.find({ owner: userId }).sort({ createdAt: -1 });

    return agents.map(mapToAgentResponse);
};



/**
 * @function getAgentByIdService
 * @desc Retrieves a specific agent by ID, validating ownership securely.
 */
export const getAgentByIdService = async (userId: string, agentId: string): Promise<IAgentResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);
    return mapToAgentResponse(agent);
};

/**
 * @function updateAgentService
 * @desc Updates specific fields on an agent, validating ownership.
 */
export const updateAgentService = async (userId: string, agentId: string, input: IUpdateAgentInput): Promise<IAgentResponse> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);

    // 5. Update only allowed fields to prevent mass assignment vulnerabilities
    if (input.name !== undefined) agent.name = input.name;
    if (input.description !== undefined) agent.description = input.description;
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

    // 6. Save and return updated document
    const updatedAgent = await agent.save();

    return mapToAgentResponse(updatedAgent);
};

/**
 * @function deleteAgentService
 * @desc Deletes an agent from the database securely.
 */
export const deleteAgentService = async (userId: string, agentId: string): Promise<void> => {
    const agent = await fetchAndVerifyAgent(userId, agentId);

    // 5. Delete the agent securely
    await agent.deleteOne();
    
    // Future Extensibility Note: If we had a Vector Database or external integrations linked to this agent,
    // this service function would act as the orchestrator to cascade the deletion 
    // (e.g., calling pinecone.deleteNamespace(agentId)) before resolving.
};



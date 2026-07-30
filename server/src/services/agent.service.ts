import { Agent, IAgent } from "../models/agent.model.js";
import { ICreateAgentInput, IUpdateAgentInput, IAgentResponse } from "../types/agent.types.js";

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
 * Helper function to map a Mongoose Agent document to the clean IAgentResponse format.
 * This prevents leaking internal MongoDB details (like _id or __v) to the client.
 */
const mapToAgentResponse = (agent: IAgent): IAgentResponse => {
    return {
        id: agent._id.toString(),
        ownerId: agent.owner.toString(),
        name: agent.name,
        description: agent.description,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt
    };
};

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
        description: input.description
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
    // Database Query: Agent.findOne({ _id: agentId, owner: userId })
    // Why: We use .findOne() instead of .findById(). 
    // .findById(agentId) is INSECURE because it ignores ownership and could lead to IDOR vulnerabilities.
    // By querying BOTH _id and owner, we guarantee the user is strictly authorized to view this exact agent.
    const agent = await Agent.findOne({ _id: agentId, owner: userId });

    if (!agent) {
        // Meaningful Error: If the agent doesn't exist OR the user doesn't own it, 
        // we throw a generic error. We intentionally do not differentiate between 
        // "Not Found" and "Forbidden" here to prevent malicious users from discovering 
        // if another user's Agent ID exists.
        throw new Error("Agent not found or you do not have permission to access it.");
    }

    return mapToAgentResponse(agent);
};

/**
 * @function updateAgentService
 * @desc Updates specific fields on an agent, validating ownership.
 */
export const updateAgentService = async (userId: string, agentId: string, input: IUpdateAgentInput): Promise<IAgentResponse> => {
    // Database Query: Agent.findOneAndUpdate(...)
    // Why: 
    // 1. Filter: {_id, owner} strictly enforces ownership before attempting an update.
    // 2. Update: {$set: input} safely patches only the fields provided in the input.
    // 3. Options: {new: true} tells Mongoose to return the fully updated document, not the old stale one.
    // 4. Options: {runValidators: true} ensures the schema validations (like maxlength limits) run on the update.
    const updatedAgent = await Agent.findOneAndUpdate(
        { _id: agentId, owner: userId },
        { $set: input },
        { new: true, runValidators: true }
    );

    if (!updatedAgent) {
        // Meaningful Error: Protects against silent failures.
        throw new Error("Failed to update: Agent not found or unauthorized.");
    }

    return mapToAgentResponse(updatedAgent);
};

/**
 * @function deleteAgentService
 * @desc Deletes an agent from the database securely.
 */
export const deleteAgentService = async (userId: string, agentId: string): Promise<void> => {
    // Database Query: Agent.findOneAndDelete({ _id: agentId, owner: userId })
    // Why: We use .findOneAndDelete() to safely remove the document in one step,
    // explicitly ensuring the `owner` matches the authenticated `userId`.
    const deletedAgent = await Agent.findOneAndDelete({ _id: agentId, owner: userId });

    if (!deletedAgent) {
        // Meaningful Error: Thrown if the user tries to delete an agent they don't own 
        // or that was already deleted previously.
        throw new Error("Failed to delete: Agent not found or unauthorized.");
    }
    
    // Future Extensibility Note: If we had a Vector Database or external integrations linked to this agent,
    // this service function would act as the orchestrator to cascade the deletion 
    // (e.g., calling pinecone.deleteNamespace(agentId)) before resolving.
};

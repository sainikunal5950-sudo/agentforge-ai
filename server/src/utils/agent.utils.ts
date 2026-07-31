import mongoose from "mongoose";
import { Agent, IAgent } from "../models/agent.model.js";
import { IAgentResponse } from "../types/agent.types.js";

/**
 * Helper function to map a Mongoose Agent document to the clean IAgentResponse format.
 * This prevents leaking internal MongoDB details (like _id or __v) to the client.
 */
export const mapToAgentResponse = (agent: IAgent): IAgentResponse => {
    return {
        id: agent._id.toString(),
        ownerId: agent.owner.toString(),
        name: agent.name,
        description: agent.description,
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
        status: agent.status,
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt
    };
};

/**
 * @function fetchAndVerifyAgent
 * @desc Retrieves a specific agent by ID, validating ownership securely.
 */
export const fetchAndVerifyAgent = async (userId: string, agentId: string): Promise<IAgent> => {
    // 1. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(agentId)) {
        const error = new Error("Invalid agent ID format");
        (error as any).statusCode = 400;
        throw error;
    }

    // 2. Fetch the agent by ID
    const agent = await Agent.findById(agentId);

    // 3. Check existence (404)
    if (!agent) {
        const error = new Error("Agent not found");
        (error as any).statusCode = 404;
        throw error;
    }

    // 4. Check ownership (403)
    if (agent.owner.toString() !== userId) {
        const error = new Error("Forbidden: You do not own this agent");
        (error as any).statusCode = 403;
        throw error;
    }

    return agent;
};

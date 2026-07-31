import { Response } from "express";
import { IAuthenticatedRequest } from "../types/auth.types.js";
import { 
    ICreateAgentInput, 
    IUpdateAgentInput,
    IUpdateAgentConfigInput,
    IUpdateAgentStatusInput,
    IUpdateAgentModelInput,
    IUpdateAgentMemoryInput,
    IUpdateAgentExecutionModeInput
} from "../types/agent.types.js";
import {
    createAgentService,
    getAgentsService,
    getAgentByIdService,
    updateAgentService,
    deleteAgentService
} from "../services/agent.service.js";
import {
    getAgentConfigService,
    updateAgentConfigService,
    updateAgentStatusService,
    updateAgentModelService,
    updateAgentMemoryService,
    updateAgentExecutionModeService
} from "../services/agent.config.service.js";

// ─── The Request-Response Lifecycle in Controllers ─────────────────────────────
// The Controller acts strictly as the "Traffic Cop" or "Orchestrator" of our application.
// Its complete lifecycle is:
// 1. Receive: Intercept the incoming HTTP Request (req) from the Express Router.
// 2. Extract: Pull out necessary data from req.body (payload), req.params (URL variables), 
//    and req.user (injected securely by the auth middleware).
// 3. Delegate: Pass the extracted data as clean arguments into the Service Layer, 
//    which handles the actual "business logic", authorization rules, and database interactions.
// 4. Respond: Take the exact result returned by the Service and formulate an HTTP Response (res)
//    with the correct semantic status code (e.g., 201 Created, 200 OK) and send it as JSON.
// 5. Catch: If anything fails in the Service Layer (e.g. validation error, not found), 
//    catch the error and map it to an HTTP error response (e.g., 400 Bad Request).
//
// By ensuring NO business logic lives here, we make the codebase modular, testable, and robust.

// By ensuring NO business logic lives here, we make the codebase modular, testable, and robust.

/**
 * Maps varying errors (Mongoose Validation, DB Conflict, Service Thrown Errors) to 
 * standardized HTTP Status Codes and clear error messages.
 */
const handleErrorResponse = (res: Response, error: any, defaultMessage: string = "Internal server error"): void => {
    // 1. Service Layer Errors (Explicitly thrown with .statusCode like 403, 404)
    if (error.statusCode) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
    }
    
    // 2. Mongoose Validation Errors (400)
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err: any) => err.message).join(", ");
        res.status(400).json({ success: false, message: `Validation Error: ${messages}` });
        return;
    }
    
    // 3. Mongoose Cast Errors (Invalid ObjectId format thrown by Mongoose directly) (400)
    if (error.name === "CastError") {
        res.status(400).json({ success: false, message: `Invalid format for ${error.path}` });
        return;
    }

    // 4. MongoDB Duplicate Key Conflict (409)
    if (error.code === 11000) {
        res.status(409).json({ success: false, message: "Conflict: An agent with this unique property already exists." });
        return;
    }

    // 5. Unhandled Exceptions (500)
    console.error(`[Agent API Error]:`, error);
    res.status(500).json({ success: false, message: defaultMessage });
};

/**
 * @function createAgent
 * @desc Extracts payload from req.body and the authenticated user's ID to create a new agent.
 * @lifecycle Handles HTTP POST Request -> Extracts Data -> Calls Service -> Returns HTTP 201 (Created)
 */
export const createAgent = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const input: ICreateAgentInput = req.body;

        // Delegate all heavy lifting to the service layer
        const newAgent = await createAgentService(userId, input);

        // Respond with HTTP 201 Created, standard when a new resource is successfully inserted
        res.status(201).json(newAgent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to create agent");
    }
};

/**
 * @function getAgents
 * @desc Retrieves all agents owned by the currently authenticated user.
 * @lifecycle Handles HTTP GET Request -> Extracts User ID -> Calls Service -> Returns HTTP 200 (OK)
 */
export const getAgents = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();

        // Delegate fetching logic to service layer
        const agents = await getAgentsService(userId);

        // Respond with HTTP 200 OK with the array of agents
        res.status(200).json(agents);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to retrieve agents");
    }
};

/**
 * @function getAgentById
 * @desc Extracts the agent ID from URL parameters to fetch a specific agent.
 * @lifecycle Handles HTTP GET Request -> Extracts Params -> Calls Service -> Returns HTTP 200 (OK)
 */
export const getAgentById = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString(); // Extracted from /api/agents/:id

        // Delegate fetching logic to service layer
        const agent = await getAgentByIdService(userId, agentId);

        // Respond with HTTP 200 OK containing the single agent object
        res.status(200).json(agent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to retrieve agent");
    }
};

/**
 * @function updateAgent
 * @desc Extracts agent ID and updated fields from body to modify an existing agent.
 * @lifecycle Handles HTTP PUT Request -> Extracts Params & Body -> Calls Service -> Returns HTTP 200 (OK)
 */
export const updateAgent = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const input: IUpdateAgentInput = req.body;

        // Delegate update logic to service layer
        const updatedAgent = await updateAgentService(userId, agentId, input);

        // Respond with HTTP 200 OK and the newly updated agent state
        res.status(200).json(updatedAgent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to update agent");
    }
};

/**
 * @function deleteAgent
 * @desc Extracts agent ID from URL parameters and initiates deletion.
 * @lifecycle Handles HTTP DELETE Request -> Extracts Params -> Calls Service -> Returns HTTP 200 (OK)
 */
export const deleteAgent = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();

        // Delegate deletion logic to service layer
        await deleteAgentService(userId, agentId);

        // Respond with HTTP 200 OK. 
        // Note: 204 No Content is also acceptable for DELETEs, but 200 allows us to send a JSON success message.
        res.status(200).json({ message: "Agent deleted successfully" });
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to delete agent");
    }
};

// ─── Agent Configuration Controllers ───────────────────────────────────────────

export const getAgentConfig = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const config = await getAgentConfigService(userId, agentId);
        res.status(200).json(config);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to retrieve agent configuration");
    }
};

export const updateAgentConfig = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const input: IUpdateAgentConfigInput = req.body;
        const updatedConfig = await updateAgentConfigService(userId, agentId, input);
        res.status(200).json(updatedConfig);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to update agent configuration");
    }
};

export const updateAgentStatus = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const input: IUpdateAgentStatusInput = req.body;
        const updatedAgent = await updateAgentStatusService(userId, agentId, input);
        res.status(200).json(updatedAgent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to update agent status");
    }
};

export const updateAgentModel = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const input: IUpdateAgentModelInput = req.body;
        const updatedAgent = await updateAgentModelService(userId, agentId, input);
        res.status(200).json(updatedAgent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to update agent model");
    }
};

export const updateAgentMemory = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const input: IUpdateAgentMemoryInput = req.body;
        const updatedAgent = await updateAgentMemoryService(userId, agentId, input);
        res.status(200).json(updatedAgent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to update agent memory");
    }
};

export const updateAgentExecutionMode = async (req: IAuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id.toString();
        const agentId = req.params.id.toString();
        const input: IUpdateAgentExecutionModeInput = req.body;
        const updatedAgent = await updateAgentExecutionModeService(userId, agentId, input);
        res.status(200).json(updatedAgent);
    } catch (error: any) {
        handleErrorResponse(res, error, "Failed to update agent execution mode");
    }
};

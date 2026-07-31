import { Types } from "mongoose";

// ─── 1. Why Interfaces are Required ───────────────────────────────────────────
// Interfaces act as explicit contracts within our codebase. When data flows from 
// the Frontend -> Router -> Controller -> Service, interfaces ensure that every layer 
// agrees on the exact shape of the data. They act as the single source of truth 
// for what a valid "Agent Create Payload" or "Agent Response" looks like.

// ─── 2. How TypeScript Improves Type Safety ───────────────────────────────────
// Without TypeScript, data is dynamic (like 'any'), meaning typos or missing fields 
// (e.g., sending `desc` instead of `description`) won't be caught until the code crashes 
// in production. TypeScript analyzes these interfaces during development, catching errors 
// instantly and providing rich IDE auto-completion. This completely eliminates an entire 
// category of runtime errors.

// ─── 3. Request / Response Typing ─────────────────────────────────────────────
// We heavily separate our types into Request Inputs and Response Outputs.
// - Input Types (Requests): Represent the exact, often restricted, payload we expect 
//   from the client (e.g., a user can't send `createdAt` in a create request).
// - Output Types (Responses): Represent the sanitized, predictable JSON we send back. 
//   This ensures we don't accidentally leak internal MongoDB constructs (like `__v` or raw `_id` objects).


// ─── 4. Interface Definitions ─────────────────────────────────────────────────

/**
 * Base configuration properties shared across multiple inputs and responses.
 */
export interface IBaseAgentConfig {
    role?: string;
    goal?: string;
    agentType?: string;
    systemPrompt?: string;
    preferredModel?: string;
    temperature?: number;
    skills?: string[];
    memoryEnabled?: boolean;
    executionMode?: 'manual' | 'automatic';
    visibility?: 'private' | 'team' | 'public';
    status?: 'active' | 'inactive' | 'archived';
}

/**
 * ICreateAgentInput
 * Represents the incoming HTTP Request body for POST /api/agents.
 */
export interface ICreateAgentInput extends IBaseAgentConfig {
    name: string;
    description?: string;
}

/**
 * IUpdateAgentInput
 * Represents the incoming HTTP Request body for PUT /api/agents/:id.
 */
export interface IUpdateAgentInput extends IBaseAgentConfig {
    name?: string;
    description?: string;
}

/**
 * IAgentResponse
 * Represents the outgoing HTTP Response payload sent back to the frontend.
 */
export interface IAgentResponse extends IBaseAgentConfig {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * IAgentFilterParams
 * Represents optional query parameters for GET /api/agents.
 */
export interface IAgentFilterParams {
    search?: string; // To search by agent name
    page?: number;
    limit?: number;
}

/**
 * Configuration-specific interfaces for the Agent Configuration APIs.
 */
export interface IAgentConfigResponse extends IBaseAgentConfig {}
export interface IUpdateAgentConfigInput extends IBaseAgentConfig {}

export interface IUpdateAgentStatusInput {
    status: 'active' | 'inactive' | 'archived';
}

export interface IUpdateAgentModelInput {
    preferredModel: string;
    temperature?: number;
}

export interface IUpdateAgentMemoryInput {
    memoryEnabled: boolean;
}

export interface IUpdateAgentExecutionModeInput {
    executionMode: 'manual' | 'automatic';
}

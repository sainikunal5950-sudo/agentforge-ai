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
 * ICreateAgentInput
 * Represents the incoming HTTP Request body for POST /api/agents.
 * We only allow the user to define the name and an optional description.
 * Notice we do NOT include 'owner' here, because the owner is securely 
 * extracted from the JWT token in the Auth Middleware, not trusted from the client payload.
 */
export interface ICreateAgentInput {
    name: string;
    description?: string;
}

/**
 * IUpdateAgentInput
 * Represents the incoming HTTP Request body for PATCH /api/agents/:id.
 * All fields are optional because a user might only want to update the name, 
 * or only the description, without sending the entire object.
 */
export interface IUpdateAgentInput {
    name?: string;
    description?: string;
}

/**
 * IAgentResponse
 * Represents the outgoing HTTP Response payload sent back to the frontend.
 * We map MongoDB's internal `_id` (ObjectId) to a clean `id` (string) for easier 
 * JSON serialization and frontend consumption.
 */
export interface IAgentResponse {
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
 * Allows the client to filter or paginate the list of their agents.
 */
export interface IAgentFilterParams {
    search?: string; // To search by agent name
    page?: number;
    limit?: number;
}

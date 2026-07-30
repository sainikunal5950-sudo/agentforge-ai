import { Router } from "express";
import {
    createAgent,
    getAgents,
    getAgentById,
    updateAgent,
    deleteAgent
} from "../controllers/agent.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

// Note: This router is meant to be mounted in app.ts at the "/api/agents" path.
// e.g., app.use("/api/agents", agentRoutes);
const router = Router();

// ─── 1. The Complete Request Lifecycle ────────────────────────────────────────
// When a client makes an API request to an endpoint defined in this file,
// it goes through the following multi-layered lifecycle:
// 
// 1. Client (Frontend/Mobile) sends an HTTP Request (e.g., POST /api/agents) with a JWT in the Authorization header.
// 2. Express receives the request and matches the path and HTTP method in this router.
// 3. The `requireAuth` middleware executes FIRST. It intercepts the request, extracts the JWT, verifies its signature,
//    and attaches the authenticated user data to the `req.user` object. 
//    * If verification fails (expired/invalid), `requireAuth` returns a 401 Unauthorized,
//      short-circuiting the lifecycle immediately (no business logic runs).
// 4. If `requireAuth` succeeds, it calls `next()`, passing execution to the designated Controller function.
// 5. The Controller handles the HTTP mechanics: extracting `req.body` (payload), `req.params.id` (URL params), 
//    and `req.user._id` (from middleware), and calls the underlying Service to perform the actual business logic.
//    * Important: The Router and Controller contain NO business logic; they only orchestrate the flow.
// 6. The Controller receives the result from the Service and formats an HTTP Response (e.g., 201 Created or 200 OK),
//    sending the JSON output back to the Client.

// ─── 2. Why REST APIs Use Specific HTTP Methods ───────────────────────────────
// REST (Representational State Transfer) relies on semantic HTTP methods to describe the ACTION 
// being performed on a Resource (in this case, 'agents'). This standardizes APIs and makes them predictable.
// 
// - POST:   Used to CREATE a new resource. The client sends data, and the server dictates the new ID.
// - GET:    Used to READ or retrieve resources. It is an "idempotent" operation (calling it 100 times doesn't change data).
// - PUT:    Used to fully REPLACE/UPDATE an existing resource by its known ID.
// - DELETE: Used to REMOVE/DESTROY a resource by its known ID.

// ─── 3. Routes Definitions ────────────────────────────────────────────────────
// All routes below are protected by the `requireAuth` middleware, meaning anonymous
// requests will be rejected before ever reaching the controller logic.

/**
 * @route   POST / (translates to POST /api/agents)
 * @desc    Create a new agent for the authenticated user.
 * @access  Private (Requires Authentication)
 * @explanation The POST method is used because we are submitting new data payload to the server 
 *              to instantiate a completely distinct new entity in the database.
 */
router.post("/", requireAuth, createAgent);

/**
 * @route   GET / (translates to GET /api/agents)
 * @desc    Get a list of all agents owned by the authenticated user.
 * @access  Private (Requires Authentication)
 * @explanation The GET method is used because we are strictly fetching a list of existing resources 
 *              without mutating or changing their state.
 */
router.get("/", requireAuth, getAgents);

/**
 * @route   GET /:id (translates to GET /api/agents/:id)
 * @desc    Get a single specific agent by its ID, ensuring the authenticated user owns it.
 * @access  Private (Requires Authentication)
 * @explanation The GET method fetches a single resource defined by the unique path parameter (:id).
 */
router.get("/:id", requireAuth, getAgentById);

/**
 * @route   PUT /:id (translates to PUT /api/agents/:id)
 * @desc    Update an existing agent by its ID.
 * @access  Private (Requires Authentication)
 * @explanation PUT is used here to modify or replace the existing state of a resource identified by the :id.
 *              The client sends the updated fields in the request body.
 */
router.put("/:id", requireAuth, updateAgent);

/**
 * @route   DELETE /:id (translates to DELETE /api/agents/:id)
 * @desc    Delete a specific agent by its ID.
 * @access  Private (Requires Authentication)
 * @explanation DELETE clearly communicates the intent to destroy the resource identified by the :id path parameter.
 */
router.delete("/:id", requireAuth, deleteAgent);

// Export the router to be mounted in the main Express application.
export default router;

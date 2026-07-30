import mongoose, { Schema, Document } from "mongoose";

// ─── Agent Document Interface ──────────────────────────────────────────────────
// This interface defines the TypeScript types for the Agent document, ensuring
// type safety across the application when interacting with Agent data.
export interface IAgent extends Document {
    // owner: A reference to the User document that created this agent.
    // Why it exists: To enforce owner-based authorization and tenant isolation. 
    // An agent must belong to a single user who controls it.
    owner: mongoose.Types.ObjectId;
    
    // name: The display name of the agent.
    // Why it exists: Allows users to identify their distinct agents (e.g., "Code Assistant").
    name: string;
    
    // description: A brief summary of what the agent does or its persona.
    // Why it exists: Provides context and purpose for the agent to the user.
    description: string;

    // Note: createdAt and updatedAt are automatically managed by Mongoose via timestamps.
    // 
    // Future Extensibility:
    // This model is the core "hub". In the future, it will easily expand to include:
    // - systemPrompt (string): To define the core instructions and persona of the agent.
    // - tools (Array of Strings/ObjectIds): To grant the agent capabilities (e.g. web search).
    // - memoryEnabled (boolean): To toggle whether this agent retains long-term context.
    // - configuration (Embedded Sub-doc): For LLM settings like temperature, max_tokens, modelName.
    // - isActive (boolean): To allow users to temporarily pause/disable an agent.
}

// ─── Mongoose Schema ───────────────────────────────────────────────────────────
// This schema maps our interface to the actual MongoDB collection structure, 
// including validation rules and relationships.
const AgentSchema = new Schema<IAgent>(
    {
        // owner field definition
        // Type is Schema.Types.ObjectId to create a relationship (MongoDB foreign key equivalent).
        // ref: "User" tells Mongoose which collection this ID points to, enabling .populate("owner").
        // required: true ensures an agent cannot exist orphan without an owner.
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // name field definition
        // type: String defines the data type.
        // required: true ensures every agent has an identity.
        // trim: true automatically removes leading/trailing spaces before saving.
        // maxlength: Enforced at the DB level for defense-in-depth against massive string payloads.
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: [100, "Name must not exceed 100 characters"],
        },

        // description field definition
        // Optional string to describe the agent's specific role.
        // default: "" ensures it's always a string rather than null/undefined.
        // trim: true cleans the input.
        // maxlength: Limits size to prevent abuse.
        description: {
            type: String,
            default: "",
            trim: true,
            maxlength: [500, "Description must not exceed 500 characters"],
        },
    },
    {
        // timestamps: true tells Mongoose to automatically append and manage 
        // createdAt and updatedAt Date fields on every document mutation.
        // Why it exists: Crucial for sorting lists of agents, auditing, and cache invalidation.
        timestamps: true,
    }
);

// ─── Model Export ──────────────────────────────────────────────────────────────
// Compiles the schema into a Mongoose model named "Agent", which provides 
// the static methods for querying and mutating the agents collection in the database.
export const Agent = mongoose.model<IAgent>("Agent", AgentSchema);

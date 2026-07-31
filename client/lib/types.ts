// ─────────────────────────────────────────────────────────────────────────────
// lib/types.ts — Shared TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────
//
// PURPOSE:
//   Define all shared data shapes used across the dashboard.
//   TypeScript interfaces act as contracts — they tell the compiler (and the
//   developer) exactly what shape a value must have.
//
//   Centralizing types here means:
//   - One change propagates everywhere automatically
//   - Components can be type-checked against real API responses
//   - Auto-complete works in every file that imports from here
// ─────────────────────────────────────────────────────────────────────────────

// ── Generic API Response Wrapper ─────────────────────────────────────────────
// Every endpoint returns { success, message?, data? }
// The generic <T> parameter lets us type the data field per endpoint.
export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// ── API State (managed by useApiCall hook) ────────────────────────────────────
// Tracks the full lifecycle of a single API call.
export interface ApiState<T = unknown> {
    loading: boolean;
    data: ApiResponse<T> | null;
    error: string | null;
    statusCode: number | null;
    timestamp: string | null;
}

// ── User Data Shapes ──────────────────────────────────────────────────────────

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
}

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    bio?: string;
    phone?: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
}

export interface UserSettings {
    theme?: string;
    notifications?: boolean;
}

// ── Request Body Shapes ───────────────────────────────────────────────────────

export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface VerifyInput {
    email: string;
    verifyCode: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface UpdateProfileInput {
    name?: string;
    bio?: string;
    phone?: string;
}

export interface UpdatePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateSettingsInput {
    theme?: string;
    notifications?: boolean;
}

// ── Navigation Items ──────────────────────────────────────────────────────────

export interface NavItem {
    label: string;
    path: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    description: string;
    isProtected: boolean;
}

// ── API Endpoint Info (displayed in ApiCard) ──────────────────────────────────

export interface EndpointInfo {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    description: string;
    requiresAuth: boolean;
    requestBody?: Record<string, string>;
}

// ── Agent Data Shapes ────────────────────────────────────────────────────────

export interface BaseAgentConfig {
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

export interface Agent extends BaseAgentConfig {
    id: string;
    ownerId: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAgentInput extends BaseAgentConfig {
    name: string;
    description: string;
}

export interface UpdateAgentInput extends BaseAgentConfig {
    name?: string;
    description?: string;
}

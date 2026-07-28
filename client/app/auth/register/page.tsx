"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/register/page.tsx — POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
// Tests new user registration. Sends name, email, password to Express.
// The backend hashes the password with bcrypt, stores the user in MongoDB,
// generates an OTP, and sends it via email (Resend API).
// The response does NOT include any cookies — login happens after verification.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import type { Metadata } from "next";
import ApiCard from "@/components/ui/ApiCard";
import FormField from "@/components/ui/FormField";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";
import { RegisterInput } from "@/lib/types";

// Metadata must be in a Server Component — for client pages use generateMetadata or title tag
// Since this is "use client", we set it via <title> in a parent server segment.

export default function RegisterPage() {
    const { state, execute } = useApiCall();
    const [form, setForm] = useState<RegisterInput>({ name: "", email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        await execute(() => api.post("/api/auth/register", form));
    };

    return (
        <div className="space-y-6">
            <ApiCard
                method="POST"
                endpoint="/api/auth/register"
                description="Creates a new user account. Sends a 6-digit OTP to the provided email. Account is inactive until email is verified."
                requiresAuth={false}
                state={state}
                requestBody={state.data ? (form as unknown as Record<string, unknown>) : undefined}
            >
                <div className="space-y-4">
                    <FormField
                        label="Full Name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={form.name}
                        onChange={handleChange}
                        hint="Stored as-is in MongoDB. No normalization."
                    />
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleChange}
                        hint="Must be unique. Used as the login identifier."
                    />
                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        hint="Hashed with bcrypt before storing. Never stored in plain text."
                    />
                    <ActionButton
                        label="POST /api/auth/register"
                        loadingLabel="Registering..."
                        loading={state.loading}
                        onClick={handleSubmit}
                        disabled={!form.name || !form.email || !form.password}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Registration Lifecycle"
                explanation="When you click Register, Axios sends a POST request to http://localhost:5000/api/auth/register with the form data as a JSON body. Express receives it, the registerUser controller calls registerUserService, which: (1) checks if email already exists in MongoDB, (2) hashes the password with bcrypt (10 salt rounds — irreversible), (3) generates a 6-digit OTP, (4) saves the user with isVerified=false, (5) sends the OTP email via Resend. The response returns the user object but NO cookies — cookies are only set after the user proves they control the email."
                flowSteps={[
                    { label: "Button Click", detail: "React calls handleSubmit()" },
                    { label: "Axios POST", detail: "api.post('/api/auth/register', { name, email, password })" },
                    { label: "Express Router", detail: "router.post('/register', registerUser)" },
                    { label: "Controller", detail: "registerUser() extracts req.body, calls service" },
                    { label: "Service: registerUserService", detail: "Validates uniqueness, hashes password, generates OTP" },
                    { label: "MongoDB", detail: "User.create({ name, email, password: hash, verifyCode: otp, isVerified: false })" },
                    { label: "Resend Email API", detail: "Sends OTP to user's email" },
                    { label: "HTTP 201 Response", detail: "{ success: true, data: { id, name, email, isVerified: false } }" },
                    { label: "React State Update", detail: "useApiCall sets data + statusCode, component re-renders" },
                ]}
                securityNotes={[
                    "Password is hashed with bcrypt — the original password is mathematically unrecoverable",
                    "OTP has an expiry (MongoDB TTL index) — expired codes are rejected",
                    "No cookies are set at registration — this prevents unverified accounts from accessing protected routes",
                    "isVerified:false means requireAuth middleware will reject login even with a valid token",
                ]}
            />
        </div>
    );
}

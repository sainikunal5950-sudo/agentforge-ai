"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/auth/verify/page.tsx — POST /api/auth/verify-code
// ─────────────────────────────────────────────────────────────────────────────
// Tests email OTP verification. After Register sends an OTP to the user's
// email, this endpoint verifies it and marks isVerified=true on the user.
// Until this step completes, login returns 403 Forbidden.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ApiCard from "@/components/ui/ApiCard";
import FormField from "@/components/ui/FormField";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";
import { VerifyInput } from "@/lib/types";

export default function VerifyPage() {
    const { state, execute } = useApiCall();
    const [form, setForm] = useState<VerifyInput>({ email: "", verifyCode: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        await execute(() => api.post("/api/auth/verify-code", form));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-5 py-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">📧</span>
                <div>
                    <p className="text-sm font-medium text-cyan-300">Check your email first</p>
                    <p className="text-xs text-white/40 mt-0.5">
                        After registering, check the email inbox for a 6-digit OTP. Enter it below along with the same email.
                    </p>
                </div>
            </div>

            <ApiCard
                method="POST"
                endpoint="/api/auth/verify-code"
                description="Verifies the user's email using a 6-digit OTP sent during registration. Sets isVerified=true in MongoDB. Login is only possible after this step."
                requiresAuth={false}
                state={state}
                requestBody={state.data ? (form as unknown as Record<string, unknown>) : undefined}
            >
                <div className="space-y-4">
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={handleChange}
                        hint="Same email used during registration"
                    />
                    <FormField
                        label="OTP Code"
                        name="verifyCode"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={form.verifyCode}
                        onChange={handleChange}
                        hint="6-digit code from your email inbox"
                    />
                    <ActionButton
                        label="POST /api/auth/verify-code"
                        loadingLabel="Verifying..."
                        loading={state.loading}
                        onClick={handleSubmit}
                        disabled={!form.email || form.verifyCode.length < 4}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Why Email Verification Exists"
                explanation="Email verification prevents fake accounts and ensures the user actually controls the email address they registered with. The backend stores a verifyCode (OTP) on the user document when registering. When this endpoint is called, it compares the submitted code with the stored one. On match: isVerified is set to true. The requireAuth middleware checks this flag — even if someone gets a valid JWT, if isVerified is false, they receive 403 Forbidden. This two-step registration pattern is industry standard."
                flowSteps={[
                    { label: "Button Click", detail: "React calls handleSubmit()" },
                    { label: "Axios POST", detail: "api.post('/api/auth/verify-code', { email, verifyCode })" },
                    { label: "Express Router", detail: "router.post('/verify-code', verifyUser)" },
                    { label: "Controller: verifyUser", detail: "Calls verifyUserService(req.body)" },
                    { label: "Service: verifyUserService", detail: "User.findOne({ email }) → compare codes → check expiry" },
                    { label: "MongoDB Update", detail: "User.updateOne({ isVerified: true, verifyCode: null })" },
                    { label: "HTTP 200 Response", detail: "{ success: true, message: 'Email verified successfully' }" },
                    { label: "React State Update", detail: "User can now proceed to Login" },
                ]}
                securityNotes={[
                    "OTP is a short-lived, single-use code — reuse after verification is rejected",
                    "isVerified:false blocks even valid JWT holders — authentication ≠ authorization",
                    "The verifyCode field is cleared from the DB after successful verification",
                    "Rate limiting would prevent brute-force OTP guessing in production",
                ]}
            />
        </div>
    );
}

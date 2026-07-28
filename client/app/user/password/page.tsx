"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/user/password/page.tsx — PUT /api/user/password
// ─────────────────────────────────────────────────────────────────────────────
// Tests password change. Requires the user's CURRENT password to be provided
// as proof of identity before allowing the new password to be set.
// This is a critical security pattern — without it, anyone who gains access
// to a logged-in browser could silently change the password.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ApiCard from "@/components/ui/ApiCard";
import FormField from "@/components/ui/FormField";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";
import { UpdatePasswordInput } from "@/lib/types";

export default function PasswordPage() {
    const { state, execute } = useApiCall();
    const [form, setForm] = useState<UpdatePasswordInput>({ currentPassword: "", newPassword: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        await execute(() => api.put("/api/user/password", form));
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-3 flex items-start gap-3">
                <span className="text-lg">🔑</span>
                <div>
                    <p className="text-sm font-medium text-amber-300">Current Password Required</p>
                    <p className="text-xs text-white/40 mt-0.5">
                        Providing the current password prevents unauthorized changes even if
                        your session token is somehow compromised.
                    </p>
                </div>
            </div>

            <ApiCard
                method="PUT"
                endpoint="/api/user/password"
                description="Changes the authenticated user's password. Requires the current password as proof of identity. The service verifies it via bcrypt.compare() before hashing and saving the new password."
                requiresAuth={true}
                state={state}
                requestBody={state.data ? { currentPassword: "[hidden]", newPassword: "[hidden]" } : undefined}
            >
                <div className="space-y-4">
                    <FormField
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        placeholder="Your current password"
                        value={form.currentPassword}
                        onChange={handleChange}
                        hint="Verified against the stored bcrypt hash"
                    />
                    <FormField
                        label="New Password"
                        name="newPassword"
                        type="password"
                        placeholder="New secure password"
                        value={form.newPassword}
                        onChange={handleChange}
                        hint="Will be hashed with bcrypt before storage"
                    />
                    <ActionButton
                        label="PUT /api/user/password"
                        loadingLabel="Changing password..."
                        loading={state.loading}
                        onClick={handleSubmit}
                        disabled={!form.currentPassword || !form.newPassword}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Password Change Security Pattern"
                explanation="A password change endpoint that doesn't verify the current password is a critical security vulnerability. Here's why: if an attacker steals a browser session (via physical access, XSS, etc.), they would be able to lock the real user out of their account permanently by changing the password. By requiring bcrypt.compare(currentPassword, user.password) before accepting the new password, we ensure that changing the password requires proof of knowing the OLD password. The new password is then hashed with a new bcrypt salt and saved. Existing sessions are NOT invalidated in this implementation, but production systems often clear refresh tokens after password changes."
                flowSteps={[
                    { label: "PUT Request → requireAuth", detail: "accessToken cookie verified, req.user attached" },
                    { label: "updateUserPassword controller", detail: "Extracts { currentPassword, newPassword } from req.body" },
                    { label: "Presence check", detail: "Both fields required — 400 if either missing" },
                    { label: "changeUserPasswordService(userId, { currentPassword, newPassword })", detail: "Service layer owns all logic" },
                    { label: "User.findById(userId).select('+password')", detail: "Must explicitly select password (excluded by default)" },
                    { label: "bcrypt.compare(currentPassword, user.password)", detail: "Returns false → throws 'Current password is incorrect'" },
                    { label: "bcrypt.hash(newPassword, 10)", detail: "New password hashed with fresh salt" },
                    { label: "user.password = newHash → user.save()", detail: "Old hash permanently replaced" },
                    { label: "HTTP 200 → { success: true, message: 'Password changed' }", detail: "No token data in response" },
                ]}
                securityNotes={[
                    "currentPassword verification prevents account hijacking via stolen sessions",
                    "Password hashed with bcrypt — the new bcrypt hash uses a fresh random salt",
                    "Response confirms success but never echoes any password back",
                    "Production: should also invalidate all existing refresh tokens after password change",
                    "401 returned for wrong currentPassword, 400 for validation errors — different status codes matter",
                ]}
            />
        </div>
    );
}

"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/user/account/page.tsx — DELETE /api/user/account
// ─────────────────────────────────────────────────────────────────────────────
// Tests permanent account deletion. Requires password confirmation.
// This is a destructive, irreversible operation — the UI includes a warning
// dialog and a confirmation checkbox before enabling the delete button.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ApiCard from "@/components/ui/ApiCard";
import FormField from "@/components/ui/FormField";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";

export default function AccountPage() {
    const { state, execute } = useApiCall();
    const [password, setPassword] = useState("");
    const [confirmed, setConfirmed] = useState(false);

    const handleDelete = async () => {
        await execute(() => api.delete("/api/user/account", { data: { password } }));
    };

    return (
        <div className="space-y-6">
            {/* Danger Banner */}
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
                <p className="text-sm font-semibold text-red-400 mb-1">⚠ Destructive Operation</p>
                <p className="text-xs text-white/50">
                    Account deletion is <strong className="text-white/70">permanent and irreversible</strong>.
                    This deletes the user document from MongoDB and clears all authentication cookies.
                    Password confirmation is required as a last line of defense.
                </p>
            </div>

            <ApiCard
                method="DELETE"
                endpoint="/api/user/account"
                description="Permanently deletes the authenticated user's account. Requires password confirmation. The service verifies the password, deletes the MongoDB document, and the controller clears auth cookies."
                requiresAuth={true}
                state={state}
                requestBody={state.data ? { password: "[hidden]" } : undefined}
            >
                <div className="space-y-4">
                    <FormField
                        label="Confirm Your Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password to confirm deletion"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {/* Confirmation Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-red-500"
                            id="delete-confirm"
                        />
                        <span className="text-sm text-white/50">
                            I understand this action is permanent. My account, profile data,
                            and all associated records will be permanently deleted.
                        </span>
                    </label>

                    <ActionButton
                        label="DELETE /api/user/account"
                        loadingLabel="Deleting account..."
                        loading={state.loading}
                        onClick={handleDelete}
                        variant="danger"
                        disabled={!password || !confirmed}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Why DELETE Requires a Body + Password Confirmation"
                explanation="HTTP DELETE requests don't conventionally include a body, but it's technically allowed (RFC 7231). We use a body here to pass the password confirmation. The backend requires this because: (1) session tokens can be stolen — someone with access to the browser would otherwise be able to delete the account, (2) the irreversible nature warrants an extra verification step. The service: finds the user, calls bcrypt.compare(password, user.password), on match deletes the user document from MongoDB. The controller then calls res.clearCookie() for both tokens. After this, the deleted user ID in the JWT is invalid — User.findById() would return null, so even a cached token is useless."
                flowSteps={[
                    { label: "DELETE Request → requireAuth", detail: "accessToken cookie verified, req.user attached" },
                    { label: "deleteUserAccount controller", detail: "Extracts { password } from req.body (body allowed on DELETE)" },
                    { label: "deleteUserAccountService(userId, password)", detail: "Service handles all business logic" },
                    { label: "User.findById(userId)", detail: "Fetches user including password for bcrypt comparison" },
                    { label: "bcrypt.compare(password, user.password)", detail: "false → throws 'Incorrect password' → 401" },
                    { label: "User.findByIdAndDelete(userId)", detail: "Permanently removes the MongoDB document" },
                    { label: "Controller: res.clearCookie('accessToken')", detail: "Clears HTTP-only access token cookie" },
                    { label: "Controller: res.clearCookie('refreshToken')", detail: "Clears HTTP-only refresh token cookie" },
                    { label: "HTTP 200 → { success: true, message: 'Account deleted' }", detail: "Session fully terminated" },
                ]}
                securityNotes={[
                    "Password confirmation prevents account deletion via stolen session token",
                    "User.findByIdAndDelete() is atomic — the document is gone in a single operation",
                    "Even if the attacker reuses the old JWT, User.findById() returns null → requireAuth returns 401",
                    "res.clearCookie() ensures the browser doesn't keep stale cookies referencing the deleted user",
                    "This is a HARD delete — no soft delete / archival in this implementation",
                ]}
            />
        </div>
    );
}

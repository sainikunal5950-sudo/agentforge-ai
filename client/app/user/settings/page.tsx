"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/user/settings/page.tsx — GET + PUT /api/user/settings
// ─────────────────────────────────────────────────────────────────────────────
// Two panels: fetch user settings and update them partially.
// Settings are a sub-document on the User model: { theme, notifications }.
// The PUT uses MongoDB $set for targeted updates — changing theme doesn't
// reset notifications (partial update pattern).
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ApiCard from "@/components/ui/ApiCard";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";
import { UpdateSettingsInput } from "@/lib/types";

export default function SettingsPage() {
    const getState = useApiCall();
    const updateState = useApiCall();
    const [settings, setSettings] = useState<UpdateSettingsInput>({ theme: "dark", notifications: true });

    const handleGet = async () => {
        await getState.execute(() => api.get("/api/user/settings"));
    };

    const handleUpdate = async () => {
        await updateState.execute(() => api.put("/api/user/settings", settings));
    };

    return (
        <div className="space-y-6">
            {/* ── GET Settings ────────────────────────────────────────────── */}
            <ApiCard
                method="GET"
                endpoint="/api/user/settings"
                description="Fetches only the settings sub-document. Intentionally isolated from GET /profile to allow lightweight settings syncing (e.g., theme on page load) without fetching the full user payload."
                requiresAuth={true}
                state={getState.state}
            >
                <ActionButton
                    label="GET /api/user/settings"
                    loadingLabel="Fetching settings..."
                    loading={getState.state.loading}
                    onClick={handleGet}
                />
            </ApiCard>

            {/* ── PUT Settings ────────────────────────────────────────────── */}
            <ApiCard
                method="PUT"
                endpoint="/api/user/settings"
                description="Partially updates the settings sub-document using MongoDB $set. At least one of (theme, notifications) must be provided. Unspecified fields are not overwritten."
                requiresAuth={true}
                state={updateState.state}
                requestBody={updateState.state.data ? (settings as unknown as Record<string, unknown>) : undefined}
            >
                <div className="space-y-5">
                    {/* Theme Toggle */}
                    <div>
                        <p className="text-sm font-medium text-white/70 mb-3">Theme</p>
                        <div className="flex gap-3">
                            {["dark", "light", "system"].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setSettings((prev) => ({ ...prev, theme: t }))}
                                    className={`
                                        flex-1 py-2.5 rounded-lg text-sm border transition-all
                                        ${settings.theme === t
                                            ? "bg-violet-600/20 border-violet-500/50 text-violet-300"
                                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/8"
                                        }
                                    `}
                                >
                                    {t === "dark" ? "🌙" : t === "light" ? "☀️" : "💻"} {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications Toggle */}
                    <div>
                        <p className="text-sm font-medium text-white/70 mb-3">Notifications</p>
                        <label className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                            <div>
                                <p className="text-sm text-white/70">Email Notifications</p>
                                <p className="text-xs text-white/35 mt-0.5">Receive updates and alerts via email</p>
                            </div>
                            <div
                                onClick={() => setSettings((prev) => ({ ...prev, notifications: !prev.notifications }))}
                                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${settings.notifications ? "bg-violet-600" : "bg-white/15"}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.notifications ? "translate-x-5" : ""}`} />
                            </div>
                        </label>
                    </div>

                    {/* Current Payload Preview */}
                    <div className="bg-white/3 border border-white/8 rounded-lg p-3">
                        <p className="text-[10px] text-white/30 font-mono uppercase mb-2">Will Send</p>
                        <pre className="text-xs font-mono text-white/60">
                            {JSON.stringify(settings, null, 2)}
                        </pre>
                    </div>

                    <ActionButton
                        label="PUT /api/user/settings"
                        loadingLabel="Updating settings..."
                        loading={updateState.state.loading}
                        onClick={handleUpdate}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Settings Sub-Document & Partial Update Pattern"
                explanation="Settings are stored as a nested object inside the User document in MongoDB — called a sub-document. This is different from a separate collection: the settings data travels with the user document and requires no JOIN. The separation of GET /settings from GET /profile is a deliberate architectural decision: when a frontend page loads, it may need to apply the user's theme immediately but doesn't need their bio or avatar. Fetching only the settings sub-document is lightweight. The PUT uses MongoDB's $set operator internally: { $set: { 'settings.theme': 'dark' } }. This means updating theme doesn't touch notifications — true partial update semantics."
                flowSteps={[
                    { label: "GET Request → requireAuth", detail: "Cookie verified, req.user._id available" },
                    { label: "getUserSettings controller", detail: "const userId = req.user._id.toString()" },
                    { label: "getUserSettingsService(userId)", detail: "User.findById(userId).select('settings')" },
                    { label: "Returns only settings sub-document", detail: "{ theme: 'dark', notifications: true }" },
                    { label: "PUT: { theme, notifications } sent", detail: "At least one field required — 400 if both missing" },
                    { label: "updateUserSettingsService(userId, { theme, notifications })", detail: "" },
                    { label: "MongoDB: User.findByIdAndUpdate($set: { settings })", detail: "Only specified fields updated — others preserved" },
                    { label: "Returns updated settings", detail: "HTTP 200 → { success: true, data: { settings } }" },
                ]}
                securityNotes={[
                    "Settings are user-scoped via req.user._id — users cannot edit other users' settings",
                    "Partial update prevents accidental field overwrite — classic MongoDB $set pattern",
                    "Theme setting is display-only on the frontend — no security implications",
                    "notifications: false could be used server-side to skip email sending (business logic)",
                ]}
            />
        </div>
    );
}

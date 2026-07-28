"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/user/profile/page.tsx — GET + PUT /api/user/profile
// ─────────────────────────────────────────────────────────────────────────────
// Two panels in one page: fetch the profile and update it.
// GET returns the full profile (name, email, bio, phone, avatar, settings).
// PUT accepts partial updates (name, bio, phone only — email/password excluded).
// Both require requireAuth middleware to run first.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import ApiCard from "@/components/ui/ApiCard";
import FormField from "@/components/ui/FormField";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";
import { UpdateProfileInput } from "@/lib/types";

export default function ProfilePage() {
    const getState = useApiCall();
    const updateState = useApiCall();

    const [form, setForm] = useState<UpdateProfileInput>({ name: "", bio: "", phone: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleGet = async () => {
        await getState.execute(() => api.get("/api/user/profile"));
    };

    const handleUpdate = async () => {
        const payload: UpdateProfileInput = {};
        if (form.name) payload.name = form.name;
        if (form.bio) payload.bio = form.bio;
        if (form.phone) payload.phone = form.phone;
        await updateState.execute(() => api.put("/api/user/profile", payload));
    };

    return (
        <div className="space-y-6">
            {/* ── GET Profile ──────────────────────────────────────────────── */}
            <ApiCard
                method="GET"
                endpoint="/api/user/profile"
                description="Fetches the complete user profile. Identity comes from req.user (injected by requireAuth) — no request body needed. Returns name, email, bio, phone, avatar, settings, createdAt."
                requiresAuth={true}
                state={getState.state}
            >
                <ActionButton
                    label="GET /api/user/profile"
                    loadingLabel="Fetching profile..."
                    loading={getState.state.loading}
                    onClick={handleGet}
                />
            </ApiCard>

            {/* ── PUT Profile ──────────────────────────────────────────────── */}
            <ApiCard
                method="PUT"
                endpoint="/api/user/profile"
                description="Partially updates the user's profile. Only name, bio, and phone can be changed here. Email has a dedicated route (not yet implemented). Password has its own PUT /password route."
                requiresAuth={true}
                state={updateState.state}
                requestBody={updateState.state.data ? Object.fromEntries(
                    Object.entries(form).filter(([, v]) => v !== "")
                ) : undefined}
            >
                <div className="space-y-4">
                    <FormField
                        label="Name"
                        name="name"
                        type="text"
                        placeholder="Updated name (optional)"
                        value={form.name}
                        onChange={handleChange}
                    />
                    <FormField
                        label="Bio"
                        name="bio"
                        type="text"
                        placeholder="Short bio (optional)"
                        value={form.bio}
                        onChange={handleChange}
                        hint="Stored as-is. Frontend truncates display length."
                    />
                    <FormField
                        label="Phone"
                        name="phone"
                        type="text"
                        placeholder="+91 98765 43210 (optional)"
                        value={form.phone}
                        onChange={handleChange}
                    />
                    <ActionButton
                        label="PUT /api/user/profile"
                        loadingLabel="Updating profile..."
                        loading={updateState.state.loading}
                        onClick={handleUpdate}
                        disabled={!form.name && !form.bio && !form.phone}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="Profile Architecture — Partial Updates"
                explanation="GET /profile does NOT re-authenticate. requireAuth already ran and attached req.user to the request. The getUserProfile controller reads req.user._id and calls getUserProfileService(userId) which does User.findById(userId).select('-password -refreshToken'). This is a second DB query — but it returns the full profile including bio, phone, avatar, settings that are not in the JWT payload. PUT /profile uses MongoDB's $set operator internally so unspecified fields are not overwritten — this is partial update design. The controller validates that at least one of (name, bio, phone) is provided before calling the service."
                flowSteps={[
                    { label: "GET Request → requireAuth", detail: "Verifies cookie, attaches req.user" },
                    { label: "getUserProfile controller", detail: "const userId = req.user._id.toString()" },
                    { label: "getUserProfileService(userId)", detail: "User.findById(userId).select('-password -refreshToken')" },
                    { label: "MongoDB returns full user document", detail: "Including bio, phone, avatar, settings, createdAt" },
                    { label: "HTTP 200 → React state update", detail: "Profile data rendered in ResponseViewer" },
                    { label: "PUT Request → partial body", detail: "Only changed fields sent — undefined fields not overwritten" },
                    { label: "updateUserProfileService(userId, { name, bio, phone })", detail: "MongoDB: User.findByIdAndUpdate($set: { name, bio, phone })" },
                    { label: "Returns updated user document", detail: "Controller sends HTTP 200 with updated data" },
                ]}
                securityNotes={[
                    "Email change is intentionally excluded — requires separate verification flow",
                    "Password change is intentionally excluded — requires current password verification",
                    "userId comes from req.user._id (JWT) — users cannot update someone else's profile",
                    "Partial updates prevent overwriting fields the user didn't intend to change",
                ]}
            />
        </div>
    );
}

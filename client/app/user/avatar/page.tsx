"use client";

// ─────────────────────────────────────────────────────────────────────────────
// app/user/avatar/page.tsx — POST /api/user/avatar
// ─────────────────────────────────────────────────────────────────────────────
// Tests multipart/form-data file upload. This is fundamentally different
// from JSON requests — we must send FormData, not JSON.stringify().
// Axios automatically detects FormData and sets Content-Type: multipart/form-data
// with the correct boundary string. Express uses multer middleware to parse it.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import ApiCard from "@/components/ui/ApiCard";
import ActionButton from "@/components/ui/ActionButton";
import TheoryBox from "@/components/theory/TheoryBox";
import { useApiCall } from "@/hooks/useApiCall";
import api from "@/lib/axios";

export default function AvatarPage() {
    const { state, execute } = useApiCall();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(selected);
    };

    const handleUpload = async () => {
        if (!file) return;
        const formData = new FormData();
        // IMPORTANT: field name must match what multer expects: "avatar"
        formData.append("avatar", file);

        await execute(() =>
            api.post("/api/user/avatar", formData, {
                // Override Content-Type for multipart — Axios handles boundary automatically
                headers: { "Content-Type": "multipart/form-data" },
            })
        );
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-5 py-3 flex items-start gap-3">
                <span className="text-lg">📁</span>
                <div>
                    <p className="text-sm font-medium text-blue-300">multipart/form-data Upload</p>
                    <p className="text-xs text-white/40 mt-0.5">
                        This is NOT a JSON request. We use <code className="text-violet-300">FormData</code> and
                        Axios automatically sets the correct <code className="text-violet-300">Content-Type</code> with boundary.
                    </p>
                </div>
            </div>

            <ApiCard
                method="POST"
                endpoint="/api/user/avatar"
                description="Uploads a profile image as multipart/form-data. Multer middleware parses the file and populates req.file. The service stores it locally (or S3/Cloudinary in production) and saves the URL to MongoDB."
                requiresAuth={true}
                state={state}
            >
                <div className="space-y-4">
                    {/* File Picker */}
                    <div>
                        <p className="text-sm font-medium text-white/70 mb-2">Avatar Image</p>
                        <div
                            onClick={() => inputRef.current?.click()}
                            className="border-2 border-dashed border-white/15 hover:border-violet-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                        >
                            {preview ? (
                                <div className="flex flex-col items-center gap-3">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-violet-500/30" />
                                    <p className="text-xs text-white/40">{file?.name} ({(file!.size / 1024).toFixed(1)} KB)</p>
                                    <p className="text-xs text-violet-400">Click to change</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-4xl text-white/20 group-hover:text-white/40 transition-colors">📸</div>
                                    <p className="text-sm text-white/40">Click to select an image</p>
                                    <p className="text-xs text-white/25">JPG, PNG, WebP — max 5MB</p>
                                </div>
                            )}
                        </div>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="avatar-upload"
                        />
                    </div>

                    <ActionButton
                        label="POST /api/user/avatar (upload)"
                        loadingLabel="Uploading..."
                        loading={state.loading}
                        onClick={handleUpload}
                        disabled={!file}
                    />
                </div>
            </ApiCard>

            <TheoryBox
                title="multipart/form-data vs JSON — How File Upload Works"
                explanation="Regular API calls send data as JSON: { name: 'John' }. File uploads are fundamentally different — binary data cannot be encoded as JSON. Instead, browsers use multipart/form-data encoding: the request body is split into 'parts' separated by a unique boundary string. Each part has its own Content-Disposition header describing the field name and filename. Axios handles this automatically when you pass a FormData object — it sets Content-Type: multipart/form-data; boundary=<unique> and serializes the file correctly. On the Express side, multer middleware intercepts the request before the controller, reads the multipart parts, saves the file to disk (or memory), and populates req.file with file metadata. The controller then reads req.file and passes it to the service."
                flowSteps={[
                    { label: "User selects file", detail: "FileReader API creates a local preview URL (never sent to server)" },
                    { label: "FormData.append('avatar', file)", detail: "Field name 'avatar' must match multer's single('avatar') config" },
                    { label: "Axios POST with FormData", detail: "Auto-sets: Content-Type: multipart/form-data; boundary=----..." },
                    { label: "Express: multer middleware runs BEFORE controller", detail: "Parses multipart body, saves file to /uploads/avatars/" },
                    { label: "req.file populated", detail: "{ fieldname, originalname, mimetype, size, path, filename }" },
                    { label: "uploadUserAvatar controller", detail: "if (!req.file) → 400 error; else calls uploadUserAvatarService" },
                    { label: "Service: saves file URL to DB", detail: "user.avatar = '/uploads/avatars/filename.jpg'; user.save()" },
                    { label: "HTTP 200 → { avatarUrl: '/uploads/...' }", detail: "Frontend can now render the image from the backend URL" },
                ]}
                securityNotes={[
                    "multer validates MIME type — only image/* is accepted (configured in upload middleware)",
                    "File size limit enforced by multer (5MB max) — prevents denial-of-service",
                    "Original filename is not trusted — multer generates a unique disk filename",
                    "In production: files go to S3/Cloudinary, not local disk (prevents data loss on restart)",
                    "The field name 'avatar' in FormData.append() must exactly match multer.single('avatar')",
                ]}
            />
        </div>
    );
}

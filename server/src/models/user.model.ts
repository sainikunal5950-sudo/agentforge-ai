import mongoose, { Schema, Document } from "mongoose";

// ─── Module 2: User Settings Sub-document Interface ───────────────────────────
// Embedded directly in IUser — settings always travel with the user document.
// A separate collection would add an unnecessary DB round-trip on every request.
export interface IUserSettings {
    theme: string;
    notifications: boolean;
}

// ─── User Document Interface ───────────────────────────────────────────────────
export interface IUser extends Document {
    // ── Auth fields (Module 1 — DO NOT MODIFY) ──────────────────────────────
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    refreshToken?: string;

    // ── Profile fields (Module 2) ────────────────────────────────────────────
    avatar?: string;       // CDN / S3 URL — never store raw binary in MongoDB
    bio?: string;          // Short user description, max 200 chars enforced at DB level
    phone?: string;        // Optional; used for SMS MFA / billing contact
    settings: IUserSettings; // Always embedded — 1-to-1, always read with user
}

// ─── Mongoose Schema ───────────────────────────────────────────────────────────
const UserSchema = new Schema<IUser>(
    {
        // ── Auth fields (Module 1 — DO NOT MODIFY) ──────────────────────────
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifyCode: {
            type: String,
        },
        verifyCodeExpiry: {
            type: Date,
        },
        refreshToken: {
            type: String,
        },

        // ── Profile fields (Module 2) ────────────────────────────────────────

        // Stores a CDN/S3 URL. Raw image bytes should NEVER be stored in MongoDB.
        // An empty string lets the frontend render an avatar fallback gracefully.
        avatar: {
            type: String,
            default: "",
            trim: true,
        },

        // maxlength enforced at DB layer (not just API) — defense-in-depth.
        bio: {
            type: String,
            default: "",
            trim: true,
            maxlength: [200, "Bio must not exceed 200 characters"],
        },

        // Optional phone number. Not collected at registration; updated via
        // the profile management API in Module 2.
        phone: {
            type: String,
            default: "",
            trim: true,
        },

        // ── Embedded Settings Sub-document ───────────────────────────────────
        // Rationale for embedding (not referencing):
        //   1. Always read together with the user — no extra DB round-trip needed.
        //   2. 1-to-1 relationship — settings have no lifecycle outside the user.
        //   3. Fixed, small shape — will never grow unbounded like an array.
        //   4. Atomic updates — theme + other user fields update in one DB call.
        settings: {
            theme: {
                type: String,
                default: "system",        // "light" | "dark" | "system"
                trim: true,
            },
            notifications: {
                type: Boolean,
                default: true,
            },
        },
    },
    {
        // timestamps: true auto-manages createdAt and updatedAt on every document.
        // Already present from Module 1 — kept unchanged.
        timestamps: true,
    }
);

// ─── Model Export ──────────────────────────────────────────────────────────────
export const User = mongoose.model<IUser>("User", UserSchema);


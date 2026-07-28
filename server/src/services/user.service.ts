import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import { User, IUser, IUserSettings } from "../models/user.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT SERVICE
//
// This layer owns all business logic and database operations.
// Controllers call these functions; they know nothing about HTTP.
//
// Security Rules enforced at this layer:
//   ✅ Password is NEVER returned in any response object
//   ✅ Email is NOT updatable from the profile API (identity field)
//   ✅ User existence is validated before every operation
//   ✅ Current password verified before destructive/security operations
//   ✅ All DB field updates use explicit allowlists (no spread from req.body)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Input Type Definitions ───────────────────────────────────────────────────

export interface IUpdateProfileInput {
    name?: string;
    bio?: string;
    phone?: string;
}

export interface IChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface IUpdateSettingsInput {
    theme?: string;
    notifications?: boolean;
}

// Allowed theme values — validated here rather than in DB schema
// so the service stays flexible if new themes are added later.
const VALID_THEMES = ["light", "dark", "system"] as const;

// ─── 1. Get User Profile ──────────────────────────────────────────────────────

/**
 * Retrieves the authenticated user's profile.
 *
 * Security:
 *   - Sensitive fields (password, refreshToken, verifyCode, verifyCodeExpiry)
 *     are excluded at the QUERY level using .select().
 *   - Projection at query time means these fields never travel over the
 *     Node.js ↔ MongoDB wire at all — stronger than post-fetch filtering.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string
 * @returns The user document without sensitive fields
 * @throws Error if the user is not found
 */
export const getUserProfileService = async (userId: string): Promise<Partial<IUser>> => {
    const user = await User
        .findById(userId)
        .select("-password -refreshToken -verifyCode -verifyCodeExpiry");

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

// ─── 2. Update User Profile ───────────────────────────────────────────────────

/**
 * Updates editable profile fields: name, bio, phone.
 *
 * Security:
 *   - Email is EXPLICITLY excluded from this function's allowlist.
 *     Email changes require re-verification and belong in a dedicated
 *     security flow — allowing it here would silently bypass Module 1's
 *     OTP verification system.
 *   - Only fields present in the input are included in the $set object
 *     (no spread from raw request body) — prevents mass-assignment attacks.
 *
 * Why runValidators: true:
 *   - Mongoose skips schema validators (e.g. maxlength: 200 on bio) for
 *     findByIdAndUpdate by default. This flag enforces them explicitly.
 *
 * Why new: true:
 *   - Returns the post-update document in a single DB round-trip,
 *     avoiding a follow-up findById call.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string
 * @param data   - Allowed updatable fields only
 * @returns The updated user document without sensitive fields
 * @throws Error if the user is not found
 */
export const updateUserProfileService = async (
    userId: string,
    data: IUpdateProfileInput
): Promise<Partial<IUser>> => {
    // Build update payload from explicit allowlist — never spread req.body directly
    const updateFields: Partial<IUpdateProfileInput> = {};
    if (data.name !== undefined) updateFields.name = data.name.trim();
    if (data.bio !== undefined) updateFields.bio = data.bio.trim();
    if (data.phone !== undefined) updateFields.phone = data.phone.trim();

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        {
            new: true,            // Return post-update document
            runValidators: true,  // Enforce schema validators (maxlength, etc.)
        }
    ).select("-password -refreshToken -verifyCode -verifyCodeExpiry");

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser;
};

// ─── 3. Change User Password ──────────────────────────────────────────────────

/**
 * Changes the authenticated user's password after verifying the current one.
 *
 * Flow:
 *   1. Fetch user WITH password field (explicitly requested via .select("+password"))
 *   2. bcrypt.compare() the current password against the stored hash
 *   3. Validate new password strength (min 8 chars)
 *   4. Ensure new password is not identical to the current one
 *   5. Hash the new password (salt rounds = 10, matching Module 1 standard)
 *   6. Save using user.save() — triggers any pre-save Mongoose hooks
 *      (safer than findByIdAndUpdate for security-sensitive fields)
 *   7. Invalidate the refresh token to force re-login on all other sessions
 *
 * Why use user.save() instead of findByIdAndUpdate:
 *   - save() runs all pre-save middleware hooks. If a password hashing hook
 *     is ever added to the schema, save() will automatically benefit from it.
 *     findByIdAndUpdate bypasses hooks entirely.
 *
 * Why invalidate refreshToken after password change:
 *   - If an attacker obtained the old password and changed it, all existing
 *     sessions (other devices) must be invalidated. This is industry standard
 *     behavior (same as GitHub, Google, etc.).
 *
 * @param userId - The authenticated user's MongoDB ObjectId string
 * @param data   - { currentPassword, newPassword }
 * @throws "Current password is incorrect" — controller maps this to 401
 * @throws Error for validation failures (mapped to 400 by controller)
 */
export const changeUserPasswordService = async (
    userId: string,
    data: IChangePasswordInput
): Promise<void> => {
    const { currentPassword, newPassword } = data;

    // 1. Fetch user and explicitly include the password field
    //    (.select() in getUserProfileService excludes it by default)
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Verify current password against stored bcrypt hash
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
        // Exact string used by controller to return 401 vs generic 400
        throw new Error("Current password is incorrect");
    }

    // 3. Enforce minimum password strength
    if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
    }

    // 4. Prevent setting the same password — no-op guard for UX and security
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
        throw new Error("New password must be different from the current password");
    }

    // 5. Hash the new password with the same cost factor as Module 1 (10 rounds)
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update password and invalidate all sessions via refresh token revocation
    user.password = hashedNewPassword;
    user.refreshToken = undefined; // Force re-login on all devices
    await user.save();
};

// ─── 4. Delete User Account ───────────────────────────────────────────────────

/**
 * Permanently and irreversibly deletes the authenticated user's account.
 *
 * Flow:
 *   1. Fetch user with password field for verification
 *   2. bcrypt.compare() the confirmation password
 *   3. Hard-delete the document from MongoDB
 *
 * Why hard delete (not soft delete):
 *   - GDPR Article 17 "Right to Erasure" requires actual data deletion on request.
 *     Soft delete (isDeleted flag) retains PII in the database and is only
 *     appropriate as a business-level recycle bin, not a user-facing delete.
 *
 * Why password verification before delete:
 *   - Even if a session cookie is stolen, the attacker cannot delete the account
 *     without the raw password. This is the last defense before an irreversible op.
 *
 * @param userId   - The authenticated user's MongoDB ObjectId string
 * @param password - Raw password for confirmation
 * @throws "Incorrect password" — controller maps this to 401
 * @throws Error if user not found
 */
export const deleteUserAccountService = async (
    userId: string,
    password: string
): Promise<void> => {
    // 1. Fetch user including password for bcrypt comparison
    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Verify confirmation password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        // Exact string used by controller to return 401
        throw new Error("Incorrect password");
    }

    // 3. Hard delete — document is permanently removed from MongoDB
    await User.findByIdAndDelete(userId);
};

// ─── 5. Upload User Avatar ────────────────────────────────────────────────────

/**
 * Saves an uploaded avatar image and updates the user's avatar URL in MongoDB.
 *
 * Storage Strategy — Local disk (swap-ready for Cloudinary / S3):
 *   The actual upload logic is isolated in one place (the storage block below).
 *   To switch to Cloudinary: replace the fs.rename block with a
 *   cloudinary.uploader.upload() call and store the returned secure_url.
 *   The rest of the function (validation, DB update, old file cleanup) stays identical.
 *
 * Flow:
 *   1. Validate MIME type — only JPEG, PNG, WEBP allowed
 *   2. Validate file size  — max 2 MB
 *   3. Build a unique filename (userId + timestamp prevents collisions)
 *   4. Move the multer temp file to /uploads/avatars/ (permanent location)
 *   5. Build the public URL the client will use
 *   6. Delete the old avatar file if one existed (prevents disk bloat)
 *   7. Update user.avatar in MongoDB with the new URL
 *   8. Return the new avatar URL to the controller
 *
 * Why not store raw binary in MongoDB:
 *   Storing image bytes in MongoDB bloats documents, degrades query performance,
 *   and makes it impossible to serve images via CDN. The DB stores only a URL pointer.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string
 * @param file   - Multer Express.Multer.File object (populated by upload middleware)
 * @returns The public URL of the newly saved avatar
 * @throws Error for invalid file type, oversized file, or user not found
 */


// Allowed MIME types — strictly whitelist, never blacklist
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Max file size: 2 MB in bytes
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

// Absolute path to the local avatar storage directory
const AVATAR_UPLOAD_DIR = path.join(process.cwd(), "uploads", "avatars");

export const uploadUserAvatarService = async (
    userId: string,
    file: Express.Multer.File
): Promise<string> => {

    // ── 1. Validate MIME type ─────────────────────────────────────────────────
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        // Remove the rejected temp file immediately — don't leave it on disk
        fs.unlink(file.path, () => {});
        throw new Error(
            `Invalid file type: ${file.mimetype}. Only JPEG, PNG, and WEBP are allowed.`
        );
    }

    // ── 2. Validate file size ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
        fs.unlink(file.path, () => {});
        throw new Error(
            `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB. Maximum allowed size is 2 MB.`
        );
    }

    // ── 3. Build unique filename ──────────────────────────────────────────────
    // Format: avatar-<userId>-<timestamp>.<ext>
    // Using userId makes it easy to find and clean up old files.
    // Timestamp prevents browser cache serving stale images after update.
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const fileName = `avatar-${userId}-${Date.now()}${ext}`;
    const destPath = path.join(AVATAR_UPLOAD_DIR, fileName);

    // ── 4. Ensure upload directory exists, then move temp file ───────────────
    // multer writes to a temp location; we move it to the permanent directory.
    fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
    fs.renameSync(file.path, destPath);
    // ↑ SWAP POINT: Replace these two lines with your Cloudinary/S3 upload call:
    //   const result = await cloudinary.uploader.upload(file.path, { folder: "avatars" });
    //   const newAvatarUrl = result.secure_url;

    // ── 5. Build the public URL ───────────────────────────────────────────────
    // The Express static middleware must serve /uploads at this path (set in app.ts)
    const newAvatarUrl = `/uploads/avatars/${fileName}`;

    // ── 6. Fetch the current user to read (and later delete) the old avatar ──
    const user = await User.findById(userId).select("avatar");

    if (!user) {
        // If user not found, roll back: remove the file we just saved
        fs.unlink(destPath, () => {});
        throw new Error("User not found");
    }

    // ── 7. Delete old avatar file (prevents disk bloat) ──────────────────────
    // Only delete if it is a local file (starts with /uploads/) — don't try
    // to delete external URLs (Gravatar, Google OAuth avatars, CDN links, etc.)
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldFilePath = path.join(process.cwd(), user.avatar);
        fs.unlink(oldFilePath, () => {
            // Silent — old file not existing is not an error
        });
    }

    // ── 8. Persist the new URL in MongoDB ────────────────────────────────────
    await User.findByIdAndUpdate(
        userId,
        { $set: { avatar: newAvatarUrl } },
        { new: true }
    );

    return newAvatarUrl;
};

// ─── 6. Get User Settings ─────────────────────────────────────────────────────

/**
 * Returns only the settings sub-document for the authenticated user.
 *
 * Why an isolated endpoint (not just use getUserProfile):
 *   - Frontend apps often poll settings frequently (theme sync on page load,
 *     notification preference checks). Fetching only the settings field keeps
 *     the payload minimal and the response fast.
 *   - .select("settings") means only the settings sub-document is transmitted
 *     over the DB wire — no other fields are fetched or processed.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string
 * @returns The user's settings sub-document { theme, notifications }
 * @throws Error if user not found
 */
export const getUserSettingsService = async (
    userId: string
): Promise<IUserSettings> => {
    const user = await User.findById(userId).select("settings");

    if (!user) {
        throw new Error("User not found");
    }

    return user.settings;
};

// ─── 6. Update User Settings ──────────────────────────────────────────────────

/**
 * Updates one or more fields within the user's embedded settings sub-document.
 *
 * Why MongoDB dot-notation in $set:
 *   Using $set: { settings: { theme: "dark" } } would REPLACE the entire
 *   settings object, wiping out the notifications field entirely.
 *
 *   Using $set: { "settings.theme": "dark" } targets ONLY that field,
 *   leaving all other settings fields untouched. This is a critical
 *   MongoDB behavioral distinction for embedded sub-documents.
 *
 * Why validate theme here and not in the schema:
 *   The schema uses plain String for flexibility (easy to add new themes).
 *   Business rules about valid values belong in the service layer — they
 *   apply uniformly regardless of whether the caller is HTTP, CLI, or a test.
 *
 * @param userId - The authenticated user's MongoDB ObjectId string
 * @param data   - { theme?, notifications? } — both fields are optional
 * @returns The updated settings sub-document
 * @throws Error for invalid values or if user not found
 */
export const updateUserSettingsService = async (
    userId: string,
    data: IUpdateSettingsInput
): Promise<IUserSettings> => {
    const { theme, notifications } = data;

    // 1. Validate theme value against the allowlist
    if (theme !== undefined && !VALID_THEMES.includes(theme as any)) {
        throw new Error(
            `Invalid theme value. Must be one of: ${VALID_THEMES.join(", ")}`
        );
    }

    // 2. Validate notifications is a boolean (guards against "true"/"false" strings)
    if (notifications !== undefined && typeof notifications !== "boolean") {
        throw new Error("notifications must be a boolean value");
    }

    // 3. Build targeted $set payload using dot-notation
    //    This is CRITICAL — avoids overwriting the entire settings sub-document
    const updateFields: Record<string, any> = {};
    if (theme !== undefined) updateFields["settings.theme"] = theme;
    if (notifications !== undefined) updateFields["settings.notifications"] = notifications;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateFields },
        {
            new: true,           // Return post-update document
            runValidators: true,
        }
    ).select("settings");

    if (!updatedUser) {
        throw new Error("User not found");
    }

    return updatedUser.settings;
};

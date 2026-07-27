import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { uploadAvatar, handleUploadError } from "../middleware/upload.middleware";
import {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    uploadUserAvatar,
    deleteUserAccount,
    getUserSettings,
    updateUserSettings,
} from "../controllers/user.controller";

const router = Router();

// ─── All User Management Routes Are Protected ────────────────────────────────
//
// Every route below gates on requireAuth, which:
//   1. Extracts the accessToken from cookies or the Authorization header.
//   2. Verifies the JWT signature and expiry (throws 401 on failure).
//   3. Fetches the user from DB and confirms isVerified === true.
//   4. Attaches the user document to req.user for downstream use.
//
// There is no public surface in the user management module.
// ─────────────────────────────────────────────────────────────────────────────

// ── Profile Routes ────────────────────────────────────────────────────────────

/**
 * GET /api/user/profile
 *
 * Responsibility: Return the authenticated user's full profile.
 * The controller reads req.user._id (set by requireAuth) and fetches
 * the profile from the database, excluding sensitive fields.
 *
 * Request:  No body required.
 * Response: { success, data: { name, email, avatar, bio, phone, settings, createdAt } }
 */
router.get("/profile", requireAuth, getUserProfile);

/**
 * PUT /api/user/profile
 *
 * Responsibility: Update editable profile fields.
 * Only allows changes to: name, bio, phone.
 * Email and password are intentionally excluded — they have dedicated routes.
 *
 * Request Body: { name?, bio?, phone? }
 * Response:     { success, message, data: updatedUser }
 */
router.put("/profile", requireAuth, updateUserProfile);

// ── Security Routes ───────────────────────────────────────────────────────────

/**
 * PUT /api/user/password
 *
 * Responsibility: Change the authenticated user's password.
 * The service layer must verify the current password before allowing the update.
 * This prevents account takeover if a session token is stolen.
 *
 * Request Body: { currentPassword, newPassword }
 * Response:     { success, message }
 */
router.put("/password", requireAuth, updateUserPassword);

// ── Avatar Route ──────────────────────────────────────────────────────────────

/**
 * POST /api/user/avatar
 *
 * Responsibility: Upload or replace the user's avatar image.
 * Uses POST (not PUT) because the server determines the final resource URI
 * (e.g., S3 key / CDN URL) after processing the uploaded binary/multipart data.
 * The controller receives the file, delegates upload to a storage service,
 * and stores the returned URL in user.avatar.
 *
 * Request:  multipart/form-data with field "avatar"
 * Response: { success, message, data: { avatarUrl } }
 */
// uploadAvatar (multer.single) parses multipart/form-data and populates req.file.
// handleUploadError catches multer-specific errors (size, type) cleanly.
router.post("/avatar", requireAuth, uploadAvatar, uploadUserAvatar, handleUploadError);

// ── Account Route ─────────────────────────────────────────────────────────────

/**
 * DELETE /api/user/account
 *
 * Responsibility: Permanently delete the authenticated user's account.
 * The service layer must:
 *   1. Validate the request (e.g., confirm password or intent).
 *   2. Delete the user document from MongoDB.
 *   3. Clear auth cookies and invalidate tokens.
 * This is a destructive, irreversible operation.
 *
 * Request Body: { password } (confirmation required)
 * Response:     { success, message }
 */
router.delete("/account", requireAuth, deleteUserAccount);

// ── Settings Routes ───────────────────────────────────────────────────────────

/**
 * GET /api/user/settings
 *
 * Responsibility: Return the authenticated user's settings sub-document.
 * Isolated from GET /profile to allow lightweight polling from the frontend
 * (e.g., theme sync on page load) without fetching the full profile payload.
 *
 * Request:  No body required.
 * Response: { success, data: { theme, notifications } }
 */
router.get("/settings", requireAuth, getUserSettings);

/**
 * PUT /api/user/settings
 *
 * Responsibility: Update one or more settings fields.
 * Supports partial updates — the service performs a targeted $set on the
 * settings sub-document so unspecified fields are not overwritten.
 *
 * Request Body: { theme?, notifications? }
 * Response:     { success, message, data: { theme, notifications } }
 */
router.put("/settings", requireAuth, updateUserSettings);

export default router;

import { Response } from "express";
import { IAuthenticatedRequest } from "../types/auth.types";
import {
    getUserProfileService,
    updateUserProfileService,
    changeUserPasswordService,
    uploadUserAvatarService,
    deleteUserAccountService,
    getUserSettingsService,
    updateUserSettingsService,
} from "../services/user.service";

// ─────────────────────────────────────────────────────────────────────────────
// USER MANAGEMENT CONTROLLER
//
// Architectural Rule — Controllers must stay thin:
//   ✅ Extract data from req (body, params, req.user)
//   ✅ Validate basic input presence (is a required field missing?)
//   ✅ Call the appropriate service method
//   ✅ Map the result to an HTTP response (status + JSON)
//   ✅ Catch errors and return the correct status code
//
//   ❌ Never query the database directly
//   ❌ Never contain business logic (password hashing, token generation, etc.)
//   ❌ Never import Mongoose models
//
// This keeps controllers scannable, testable, and replaceable without
// touching any business logic.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/user/profile
 *
 * Returns the authenticated user's full profile.
 * req.user is guaranteed to exist — set by requireAuth middleware.
 * No body parsing needed; the identity comes from the JWT.
 */
export const getUserProfile = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        // req.user._id is injected by requireAuth — no need to read from body
        const userId = req.user!._id!.toString();

        const profile = await getUserProfileService(userId);

        return res.status(200).json({
            success: true,
            data: { user: profile },
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * PUT /api/user/profile
 *
 * Updates editable profile fields: name, bio, phone.
 * Email and password are excluded — they have dedicated routes.
 * Passes the raw body to the service; field-level validation lives there.
 */
export const updateUserProfile = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!._id!.toString();

        // Basic presence check — body must not be completely empty
        const { name, bio, phone } = req.body;
        if (!name && !bio && !phone) {
            return res.status(400).json({
                success: false,
                message: "At least one field (name, bio, phone) is required to update",
            });
        }

        // Deep validation (length, format, allowed characters) lives in the service
        const updatedUser = await updateUserProfileService(userId, { name, bio, phone });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: { user: updatedUser },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * PUT /api/user/password
 *
 * Changes the authenticated user's password.
 * Requires the current password for verification — prevents unauthorized
 * changes if a session token is ever stolen.
 * Password hashing logic lives entirely in the service.
 */
export const updateUserPassword = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!._id!.toString();
        const { currentPassword, newPassword } = req.body;

        // Presence validation only — strength policy lives in the service
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Both currentPassword and newPassword are required",
            });
        }

        await changeUserPasswordService(userId, { currentPassword, newPassword });

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    } catch (error: any) {
        // 401 for wrong current password, 400 for validation errors
        const statusCode = error.message === "Current password is incorrect" ? 401 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * POST /api/user/avatar
 *
 * Handles avatar image upload.
 * The file arrives as multipart/form-data via a future multer middleware.
 * This controller extracts the file reference and passes it to the service,
 * which handles the upload to S3/Cloudinary and stores the returned URL.
 *
 * Note: File parsing middleware (multer) will be added when implementing
 * the full upload flow. req.file is the standard multer attachment point.
 */
export const uploadUserAvatar = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!._id!.toString();

        // req.file is populated by multer middleware (to be added)
        const file = (req as any).file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided. Please upload a valid image.",
            });
        }

        // Service handles upload to storage (S3/Cloudinary) and DB update
        const avatarUrl = await uploadUserAvatarService(userId, file);

        return res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully",
            data: { avatarUrl },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * DELETE /api/user/account
 *
 * Permanently deletes the authenticated user's account.
 * Requires password confirmation to prevent accidental or
 * unauthorized deletions. This operation is irreversible.
 *
 * The service is responsible for:
 *   - Verifying the password
 *   - Deleting the user document
 *   - Revoking tokens
 *
 * The controller clears cookies after service confirms deletion.
 */
export const deleteUserAccount = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!._id!.toString();
        const { password } = req.body;

        // Password confirmation is mandatory for destructive operations
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password confirmation is required to delete your account",
            });
        }

        // Service verifies password and performs deletion
        await deleteUserAccountService(userId, password);

        // Clear session cookies after account deletion
        const isProduction = process.env.NODE_ENV === "production";
        res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });
        res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });

        return res.status(200).json({
            success: true,
            message: "Account deleted successfully",
        });
    } catch (error: any) {
        const statusCode = error.message === "Incorrect password" ? 401 : 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * GET /api/user/settings
 *
 * Returns only the settings sub-document.
 * Isolated from GET /profile for lightweight polling —
 * the frontend can sync theme/notification preferences without
 * fetching the entire profile payload on every page load.
 */
export const getUserSettings = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!._id!.toString();

        const settings = await getUserSettingsService(userId);

        return res.status(200).json({
            success: true,
            data: { settings },
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * PUT /api/user/settings
 *
 * Updates one or more fields of the user's settings sub-document.
 * Supports partial updates — unspecified fields are not overwritten.
 * The service performs a targeted MongoDB $set on the settings object.
 */
export const updateUserSettings = async (
    req: IAuthenticatedRequest,
    res: Response
): Promise<any> => {
    try {
        const userId = req.user!._id!.toString();
        const { theme, notifications } = req.body;

        // At least one setting must be provided
        if (theme === undefined && notifications === undefined) {
            return res.status(400).json({
                success: false,
                message: "At least one setting (theme, notifications) must be provided",
            });
        }

        // Type coercion and value validation live in the service
        const updatedSettings = await updateUserSettingsService(userId, { theme, notifications });

        return res.status(200).json({
            success: true,
            message: "Settings updated successfully",
            data: { settings: updatedSettings },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

import { Request, Response } from "express";
import {
    registerUserService,
    verifyUserService,
    loginUserService,
    refreshAccessTokenService,
    logoutUserService
} from "../services/auth.service.js";
import { IAuthenticatedRequest } from "../types/auth.types.js";

// Determine environment to enable HTTPS-only cookies in production
const isProduction = process.env.NODE_ENV === "production";

// Standard production cookie parameters
const accessTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 15 * 60 * 1000, // 15 Minutes
};

const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
};

/**
 * Controller to handle new user registration.
 */
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const user = await registerUserService(req.body);

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please verify your email.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Controller to handle user email verification via OTP.
 */
export const verifyUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await verifyUserService(req.body);

        return res.status(200).json({
            success: true,
            message: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Controller to handle user login.
 * Signs tokens and sets secure HTTP-Only cookies.
 */
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { user, accessToken, refreshToken } = await loginUserService(req.body);

        // Attach tokens to HTTP-Only cookies for browser client protection
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified,
                },
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Controller to handle token refresh requests.
 * Uses Refresh Token Rotation, generating new pairs of cookies.
 */
export const refreshAccessToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Refresh token is missing",
            });
        }

        const { accessToken, refreshToken } = await refreshAccessTokenService(incomingRefreshToken);

        // Set rotated access and refresh cookies
        res.cookie("accessToken", accessToken, accessTokenCookieOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);

        return res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
        });
    } catch (error: any) {
        // Clear cookies on validation failure to clean up invalid sessions
        res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });
        res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });

        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * Controller to handle user logout.
 * Clears access and refresh tokens from DB and client cookies.
 */
export const logoutUser = async (req: IAuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const userId = req.user?._id?.toString() || "";
        if (userId) {
            await logoutUserService(userId);
        }

        // Clear HTTP-Only cookies on the client side
        res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });
        res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to logout",
            error: error.message,
        });
    }
};

/**
 * Controller to get the currently authenticated user profile.
 */
export const getMe = async (req: IAuthenticatedRequest, res: Response): Promise<any> => {
    try {
        return res.status(200).json({
            success: true,
            data: {
                user: req.user,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve user profile",
            error: error.message,
        });
    }
};

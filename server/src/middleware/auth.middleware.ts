import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { IAuthenticatedRequest, IJwtPayload } from "../types/auth.types";

/**
 * Middleware to enforce authentication on routes.
 * It extracts the access token from the cookies or the Authorization header,
 * verifies it using the JWT library, and fetches the associated user from the database.
 * The user document is attached to the request object (excluding password and refresh token).
 */
export const requireAuth = async (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        // 1. Extract token from cookies or Authorization header
        let token = req.cookies?.accessToken;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // If no token is provided, return 401 Unauthorized
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Access token is missing",
            });
        }

        // 2. Verify token signature and expiration
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET as string
        ) as IJwtPayload;

        // 3. Retrieve user from database (excluding sensitive fields)
        const user = await User.findById(decoded.id).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Invalid session or user not found",
            });
        }

        // 4. Ensure the user's email is verified
        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: Please verify your email first",
            });
        }

        // 5. Attach the user to request object and proceed
        req.user = user;
        next();
    } catch (error: any) {
        // Handle token expiration or signature mismatch
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired access token",
            error: error.message,
        });
    }
};

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model.js";
import { sendVerificationEmail } from "./email.service.js";
import {
    IRegisterInput,
    ILoginInput,
    IVerifyCodeInput,
    IJwtPayload
} from "../types/auth.types.js";

/**
 * Helper to generate a short-lived cryptographically signed access token.
 * Access token is used for authorizing subsequent HTTP requests.
 */
export const generateAccessToken = (userId: string, email: string): string => {
    return jwt.sign(
        { id: userId, email } as IJwtPayload,
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "15m") as any,
        }
    );
};

/**
 * Helper to generate a long-lived cryptographically signed refresh token.
 * Refresh token is used to request new access tokens when they expire.
 */
export const generateRefreshToken = (userId: string, email: string): string => {
    return jwt.sign(
        { id: userId, email } as IJwtPayload,
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as any,
        }
    );
};

/**
 * Registers a new user in the database, generates a 6-digit OTP,
 * hashes the password, and sends a verification email.
 */
export const registerUserService = async (data: IRegisterInput): Promise<IUser> => {
    const { name, email, password } = data;

    if (!name || !email || !password) {
        throw new Error("All fields (name, email, password) are required");
    }

    // 1. Check if the user already exists in the system
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("User already exists with this email");
    }

    // 2. Hash the user's password using bcrypt with salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Generate a 6-digit verification OTP code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 4. Set the verification code expiry to 10 minutes from now
    const verifyCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // 5. Create user document in the database
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false
    });

    // 6. Dispatch verification email in background using email service
    await sendVerificationEmail(email, name, verifyCode);

    return user;
};

/**
 * Verifies a user's account using the registration email and the 6-digit OTP.
 */
export const verifyUserService = async (data: IVerifyCodeInput): Promise<string> => {
    const { email, verifyCode } = data;

    if (!email || !verifyCode) {
        throw new Error("Email and verification code are required");
    }

    // 1. Find user by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Check if already verified
    if (user.isVerified) {
        throw new Error("User already verified");
    }

    // 3. Match verifyCode OTP
    if (user.verifyCode !== verifyCode) {
        throw new Error("Invalid verification code");
    }

    // 4. Verify code is not expired
    if (!user.verifyCodeExpiry || user.verifyCodeExpiry < new Date()) {
        throw new Error("Verification code has expired");
    }

    // 5. Update verification status and clear the OTP values
    user.isVerified = true;
    user.verifyCode = "";
    user.verifyCodeExpiry = undefined;

    await user.save();

    return "Email verified successfully";
};

/**
 * Validates login credentials, ensures user email is verified,
 * generates a fresh pair of Access/Refresh tokens, and stores
 * the refresh token in the database.
 */
export const loginUserService = async (
    data: ILoginInput
): Promise<{ user: IUser; accessToken: string; refreshToken: string }> => {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    // 1. Retrieve the user by email
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // 2. Ensure user has verified their email address
    if (!user.isVerified) {
        throw new Error("Please verify your email before logging in");
    }

    // 3. Compare input password with hashed database password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
        throw new Error("Invalid email or password");
    }

    // 4. Generate JWT tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // 5. Persist the refresh token in MongoDB to track session
    user.refreshToken = refreshToken;
    await user.save();

    return {
        user,
        accessToken,
        refreshToken,
    };
};

/**
 * Handles Refresh Token Rotation. Checks the validity of the incoming
 * refresh token against DB, generates a new token pair, and rotates the stored token.
 */
export const refreshAccessTokenService = async (
    incomingRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
    if (!incomingRefreshToken) {
        throw new Error("Refresh token is missing");
    }

    // 1. Verify token signature and claims
    const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
    ) as IJwtPayload;

    // 2. Find user in the database
    const user = await User.findById(decoded.id);

    if (!user) {
        throw new Error("Invalid refresh token: User not found");
    }

    // 3. Detect reuse or mismatch of refresh token
    if (!user.refreshToken || user.refreshToken !== incomingRefreshToken) {
        // If they do not match, the token might be stolen or revoked.
        // We clear the active session to force complete re-authentication.
        user.refreshToken = undefined;
        await user.save();
        throw new Error("Refresh token is invalid or has already been used");
    }

    // 4. Rotate tokens: Generate new access & refresh tokens
    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);

    // 5. Save rotated refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
        accessToken,
        refreshToken,
    };
};

/**
 * Revokes user session by deleting the active refresh token from the database.
 */
export const logoutUserService = async (userId: string): Promise<void> => {
    const user = await User.findById(userId);
    if (user) {
        user.refreshToken = undefined;
        await user.save();
    }
};
import { Request } from "express";
import { IUser } from "../models/user.model";

/**
 * Interface representing input data for user registration.
 */
export interface IRegisterInput {
    name?: string;
    email?: string;
    password?: string;
}

/**
 * Interface representing input data for user login.
 */
export interface ILoginInput {
    email?: string;
    password?: string;
}

/**
 * Interface representing input data for user verification via OTP.
 */
export interface IVerifyCodeInput {
    email?: string;
    verifyCode?: string;
}

/**
 * Interface representing the payload stored in a signed JWT.
 */
export interface IJwtPayload {
    id: string;
    email: string;
}

/**
 * Extended Express Request interface that includes the authenticated user object.
 * Used in controllers and routes protected by authentication middleware.
 */
export interface IAuthenticatedRequest extends Request {
    user?: IUser;
}

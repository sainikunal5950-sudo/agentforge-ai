import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    verifyCode?: string;
    verifyCodeExpiry?: Date;
    refreshToken?: string;
}
const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        password: {
            type: String,
            required: true
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        verifyCode: {
            type: String
        },
        verifyCodeExpiry: {
            type: Date
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
);

export const User = mongoose.model<IUser>(
    "User",
    UserSchema
)

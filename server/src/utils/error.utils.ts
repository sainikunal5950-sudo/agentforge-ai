import { Response } from "express";

/**
 * Maps varying errors (Mongoose Validation, DB Conflict, Service Thrown Errors) to 
 * standardized HTTP Status Codes and clear error messages.
 */
export const handleErrorResponse = (res: Response, error: any, defaultMessage: string = "Internal server error"): void => {
    // 1. Service Layer Errors (Explicitly thrown with .statusCode like 403, 404, 501)
    if (error.statusCode) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
    }
    
    // 2. Mongoose Validation Errors (400)
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err: any) => err.message).join(", ");
        res.status(400).json({ success: false, message: `Validation Error: ${messages}` });
        return;
    }
    
    // 3. Mongoose Cast Errors (Invalid ObjectId format thrown by Mongoose directly) (400)
    if (error.name === "CastError") {
        res.status(400).json({ success: false, message: `Invalid format for ${error.path}` });
        return;
    }

    // 4. MongoDB Duplicate Key Conflict (409)
    if (error.code === 11000) {
        res.status(409).json({ success: false, message: "Conflict: A resource with this unique property already exists." });
        return;
    }

    // 5. Unhandled Exceptions (500)
    console.error(`[API Error]:`, error);
    res.status(500).json({ success: false, message: defaultMessage });
};

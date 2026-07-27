import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// ─────────────────────────────────────────────────────────────────────────────
// MULTER UPLOAD MIDDLEWARE
//
// Multer is an Express middleware that parses multipart/form-data requests —
// the only correct HTTP transport for binary file uploads.
//
// Why JSON cannot handle files:
//   JSON is a text format with no binary type. Base64-encoding a file into
//   a JSON string inflates its size by ~33%, blocks streaming, and exhausts
//   memory for large uploads. multipart/form-data streams each file part
//   independently and is natively supported by every browser's <input type="file">.
//
// How multer works:
//   1. Reads Content-Type: multipart/form-data; boundary=<...>
//   2. Splits the body on the boundary string
//   3. For each part: runs fileFilter → if accepted, writes to disk
//   4. Attaches file metadata to req.file (single) or req.files (multiple)
//   5. Next middleware/controller can read req.file immediately
// ─────────────────────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

// 2 MB maximum — large enough for a high-quality profile photo,
// small enough to prevent storage abuse and slow uploads.
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

// Strict MIME type allowlist — whitelist approach, never blacklist.
// Checking MIME type here AND in the service provides defense-in-depth.
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Temporary directory where multer writes incoming files before the service
// processes them. Using /tmp or a dedicated temp folder keeps the upload
// dir clean until we know the file is valid.
const TEMP_UPLOAD_DIR = path.join(process.cwd(), "uploads", "temp");

// ─── Storage Engine ───────────────────────────────────────────────────────────
//
// multer.diskStorage() gives fine-grained control over WHERE and HOW the file
// is saved on disk.
//
// Alternative: multer.memoryStorage() keeps the file in RAM as a Buffer —
// useful for streaming directly to S3/Cloudinary without a temp file.
// diskStorage is better here because it doesn't exhaust Node.js heap memory
// on concurrent uploads.
//
const storage = multer.diskStorage({
    /**
     * destination: decides which directory multer writes the temp file to.
     * We create the directory if it doesn't exist (recursive: true is safe to
     * call multiple times — it's a no-op if the dir already exists).
     */
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
        fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
        cb(null, TEMP_UPLOAD_DIR);
    },

    /**
     * filename: determines the name of the temp file on disk.
     * Using Date.now() + original extension prevents naming collisions
     * between concurrent uploads from different users.
     * The service will rename it to the final avatar-<userId>-<timestamp>.ext
     * when moving it to the permanent /uploads/avatars/ directory.
     */
    filename: (_req: Request, file: Express.Multer.File, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const tempName = `tmp-${Date.now()}${ext}`;
        cb(null, tempName);
    },
});

// ─── File Filter ──────────────────────────────────────────────────────────────
//
// fileFilter runs BEFORE the file is written to disk.
// If we reject here, multer discards the bytes immediately — no disk I/O wasted.
//
// Why check MIME type here if the service also checks it?
//   This is defense-in-depth. The middleware stops obviously bad files before
//   they even reach the service layer. The service re-checks because MIME
//   types can be spoofed in the Content-Type header of the multipart part —
//   a more thorough check (e.g., file signature/magic bytes) can be added in
//   the service without touching this middleware.
//
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        // Accept the file — null = no error, true = accept
        cb(null, true);
    } else {
        // Reject the file — pass an Error to signal the problem.
        // multer will NOT write this file to disk and will expose
        // the error via the standard Express error handling chain.
        cb(
            new Error(
                `Invalid file type: "${file.mimetype}". Only JPEG, PNG, and WEBP images are allowed.`
            )
        );
    }
};

// ─── Multer Instance ──────────────────────────────────────────────────────────

const upload = multer({
    storage,                           // diskStorage engine defined above
    fileFilter,                        // MIME type validation
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES, // Hard size limit (2 MB)
        files: 1,                      // Never accept more than 1 file per request
    },
});

// ─── Exported Middleware ──────────────────────────────────────────────────────
//
// uploadAvatar is an Express middleware created by multer.single("avatar").
//
// multer.single("avatar") means:
//   - Parse exactly ONE file from the multipart field named "avatar"
//   - After parsing, attach the file metadata to req.file
//   - If no file is provided, req.file will be undefined (controller handles this)
//   - If the file exceeds limits or fails fileFilter, multer calls next(error)
//     which Express routes to the global error handler
//
// Usage in routes:
//   router.post("/avatar", requireAuth, uploadAvatar, uploadUserAvatar);
//                                           ↑ this middleware
//   The middleware runs BETWEEN requireAuth and the controller.
//   By the time the controller runs, req.file is already populated.
//
export const uploadAvatar = upload.single("avatar");

// ─── Multer Error Handler ─────────────────────────────────────────────────────
//
// Multer errors (file too large, wrong type) are instances of multer.MulterError
// or plain Error (from fileFilter). They must be caught by a dedicated error-
// handling middleware (4-argument signature) placed AFTER the route in Express.
//
// Import and use this in app.ts after all routes if needed.
// Alternatively, wrap uploadAvatar in the route handler directly (see below).
//
import { NextFunction, Response } from "express";

export const handleUploadError = (
    error: any,
    _req: Request,
    res: Response,
    next: NextFunction
): any => {
    // multer's own errors (e.g. LIMIT_FILE_SIZE)
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`,
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${error.message}`,
        });
    }

    // Errors thrown by our fileFilter (wrong MIME type)
    if (error instanceof Error) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }

    // Unknown error — pass to Express default handler
    next(error);
};

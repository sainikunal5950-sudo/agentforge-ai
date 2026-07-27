import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";

const app = express();

// Middlewares
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Serve uploaded files (avatars, etc.) as static assets
// Avatar URLs stored in DB as /uploads/avatars/<filename> resolve here
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Health Check Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AgentForge API is running 🚀",
    });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

export default app;
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import agentRouter from "./routes/agent.routes.js";
import aiRouter from "./routes/ai.routes.js";

const app = express();

// Middlewares
// ─── CORS Configuration ───────────────────────────────────────────────────────
// origin: must exactly match the frontend URL — wildcards (*) are forbidden
//         when credentials (cookies) are involved.
// credentials: true — instructs Express to set the
//         "Access-Control-Allow-Credentials: true" header so the browser
//         forwards HTTP-only cookies on cross-origin requests.
// Without this, withCredentials: true on the Axios side is silently ignored.
// ─────────────────────────────────────────────────────────────────────────────
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);

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
app.use("/api/agents", agentRouter);
app.use("/api", aiRouter);

export default app;
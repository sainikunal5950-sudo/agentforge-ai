import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth.routes";

const app = express();

// Middlewares
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Health Check Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AgentForge API is running 🚀",
    });
});

// Routes
app.use("/api/auth", authRouter);

export default app;
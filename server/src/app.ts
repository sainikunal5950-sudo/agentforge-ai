import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/auth.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use(cookieParser());


app.use(
    "/api/auth",
    router
);

export default app;



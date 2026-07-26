/*
========================================================

File: db.ts

Purpose:
- Establish MongoDB connection.
- Export a reusable database connection function.
- Stop the server if the database connection fails.

Flow:

server.ts
     |
     v
connectDB()
     |
     v
MongoDB Atlas
     |
     v
Connection Success
     |
     v
Express Server Starts

========================================================
*/

import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    try {
        const connection = await mongoose.connect(
            process.env.MONGODB_URI as string
        );

        console.log(
            `✅ MongoDB Connected: ${connection.connection.host}`
        );
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);

        process.exit(1);
    }
};
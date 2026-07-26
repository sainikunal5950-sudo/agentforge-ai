import { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        return res.status(200).json({
            message: "Register route Working"
        });
    } catch (error) {
        return res.status(500).json({
            message: "server error"
        })
    }
}
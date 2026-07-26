import { Request, Response } from "express";
import {
    registerUserService,
    verifyUserService,
} from "../services/auth.service";

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

export const verifyUser = async (
    req: Request,
    res: Response
) => {
    try {
        const result = await verifyUserService(req.body);

        res.status(200).json({
            success: true,
            message: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// eska kam api key connect krna
// resend client create krna

// flow hai
// enviornmental variable -resend api key-resned client 
import dotenv from "dotenv";
dotenv.config();
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
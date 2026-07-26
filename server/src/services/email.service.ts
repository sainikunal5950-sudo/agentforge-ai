import { resend } from "../config/resend";
import VerificationEmail from "../email/sendVerifcationEmail";


/*
========================================================
Email Service Flow

auth.service.ts
      |
      | sendVerificationEmail()
      v
email.service.ts
      |
      | Generate HTML using React Email Template
      v
sendVerificationEmail.tsx
      |
      | resend.emails.send()
      v
Resend API
      |
      v
User Inbox
========================================================
*/

/*
==========================================
File: email.service.ts

Purpose:
- Send verification email
- Handle Resend integration
- Keep email logic separate from auth logic

Reason:
If email provider changes
(Resend → SendGrid → AWS SES),
only this file needs modification.
==========================================
*/

export const sendVerificationEmail = async (
    email: string,
    name: string,
    verifyCode: string
) => {
    try {
        await resend.emails.send({
            from: process.env.EMAIL_FROM!,
            to: email,
            subject: "Verify your email",
            react: VerificationEmail({
                name,
                verifyCode,
            }),
        });
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send verification email");
    }
};



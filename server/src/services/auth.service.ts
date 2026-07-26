import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import VerificationEmail from "../email/sendVerifcationEmail";
import { sendVerificationEmail } from "./email.service";

// why seprate file of service if 
// if you change the resend to sendgrid then you only touch esmail.service.ts

export const registerUserService = async (data: any) => {
    const {
        name,
        email,
        password
    } = data;
    // first step existing user hn ki nhi 
    const existingUser = await User.findOne({
        email
    })

    if (existingUser) {
        throw new Error(
            "User already exists"
        )
    }
    // fr hmne hash password 
    const hashedPassword = await bcrypt.hash(
        password,
        10
    );
    // genrate verfication code 
    const verifyCode =
        Math.floor(
            100000 + Math.random() * 900000
        ).toString();

    // crete user
    const user = await User.create(
        {
            name,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry:
                new Date(
                    Date.now() + 10 * 60 * 1000
                )

        }
    )
    await VerificationEmail(
        email,
        verifyCode
    );

    return user;

}


// eska main flow hn register - crete user - genrate otp -save db -send email 

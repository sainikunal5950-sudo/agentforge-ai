import "dotenv/config";
import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import {
    registerUserService,
    verifyUserService,
    loginUserService,
    refreshAccessTokenService,
    logoutUserService
} from "./services/auth.service.js";

const TEST_EMAIL = "test_auth_flow_engineer@example.com";
const TEST_PASSWORD = "Password123#";
const TEST_NAME = "Backend Test Engineer";

async function runTests() {
    console.log("🚀 Starting Authentication Integration Tests...");
    
    // 1. Establish database connection
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set in environment variables");
    }
    
    console.log("🔌 Connecting to Database...");
    await mongoose.connect(mongoUri);
    console.log("✅ Database Connected.");

    try {
        // Clean up any existing test user from previous runs
        await User.deleteOne({ email: TEST_EMAIL });
        console.log("🧹 Cleaned up old test accounts.");

        // TEST 1: Register User Service
        console.log("\n🧪 Test 1: Register User Service...");
        const registeredUser = await registerUserService({
            name: TEST_NAME,
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        
        console.log("🟢 User created with ID:", registeredUser._id);
        console.log("🟢 Is Verified?:", registeredUser.isVerified);
        console.log("🟢 OTP Code (from DB):", registeredUser.verifyCode);
        
        if (registeredUser.isVerified !== false) {
            throw new Error("Expected newly registered user to be unverified.");
        }
        if (!registeredUser.verifyCode) {
            throw new Error("Expected OTP verification code to be generated.");
        }
        console.log("✅ Test 1 Passed!");

        // Fetch OTP from database to bypass Resend email delivery latency
        const dbUserForVerification = await User.findOne({ email: TEST_EMAIL });
        const verifyCode = dbUserForVerification?.verifyCode;
        if (!verifyCode) throw new Error("Could not fetch OTP verifyCode from MongoDB");

        // TEST 2: Attempt Login on Unverified Account (Should Fail)
        console.log("\n🧪 Test 2: Attempt Login on Unverified Account...");
        try {
            await loginUserService({ email: TEST_EMAIL, password: TEST_PASSWORD });
            throw new Error("Login should have failed for unverified user");
        } catch (err: any) {
            console.log("🟢 Login failed as expected. Reason:", err.message);
            if (err.message !== "Please verify your email before logging in") {
                throw new Error(`Unexpected error message during unverified login: ${err.message}`);
            }
        }
        console.log("✅ Test 2 Passed!");

        // TEST 3: Verify User Account (OTP Verification)
        console.log("\n🧪 Test 3: Verify User Account via OTP...");
        const verificationResult = await verifyUserService({
            email: TEST_EMAIL,
            verifyCode: verifyCode
        });
        console.log("🟢 Verification Result message:", verificationResult);
        
        const dbUserAfterVerification = await User.findOne({ email: TEST_EMAIL });
        console.log("🟢 User post-verification: isVerified =", dbUserAfterVerification?.isVerified);
        console.log("🟢 OTP post-verification: verifyCode =", dbUserAfterVerification?.verifyCode === "" ? "cleared (empty string)" : "not cleared");
        
        if (!dbUserAfterVerification?.isVerified) {
            throw new Error("User was not successfully set as verified in database.");
        }
        if (dbUserAfterVerification.verifyCode !== "") {
            throw new Error("Expected verifyCode OTP to be cleared out after verification.");
        }
        console.log("✅ Test 3 Passed!");

        // TEST 4: Login Verified Account (Should succeed and return tokens)
        console.log("\n🧪 Test 4: Login Verified User Account...");
        const loginData = await loginUserService({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        console.log("🟢 Access Token generated:", loginData.accessToken.substring(0, 30) + "...");
        console.log("🟢 Refresh Token generated:", loginData.refreshToken.substring(0, 30) + "...");
        
        const dbUserAfterLogin = await User.findOne({ email: TEST_EMAIL });
        console.log("🟢 Saved Refresh Token in DB:", dbUserAfterLogin?.refreshToken?.substring(0, 30) + "...");
        
        if (!loginData.accessToken || !loginData.refreshToken) {
            throw new Error("Failed to return access or refresh tokens upon login.");
        }
        if (dbUserAfterLogin?.refreshToken !== loginData.refreshToken) {
            throw new Error("Saved DB refresh token does not match returned token.");
        }
        console.log("✅ Test 4 Passed!");

        // TEST 5: Rotate Access & Refresh Tokens
        console.log("\n🧪 Test 5: Rotate Tokens using Refresh Token...");
        const rotatedData = await refreshAccessTokenService(loginData.refreshToken);
        console.log("🟢 New Access Token:", rotatedData.accessToken.substring(0, 30) + "...");
        console.log("🟢 New Refresh Token:", rotatedData.refreshToken.substring(0, 30) + "...");
        
        const dbUserAfterRotation = await User.findOne({ email: TEST_EMAIL });
        console.log("🟢 Rotated DB Refresh Token:", dbUserAfterRotation?.refreshToken?.substring(0, 30) + "...");
        
        if (rotatedData.refreshToken === loginData.refreshToken) {
            throw new Error("Refresh token was not rotated (remained identical).");
        }
        if (dbUserAfterRotation?.refreshToken !== rotatedData.refreshToken) {
            throw new Error("Rotated DB token does not match returned rotated token.");
        }
        console.log("✅ Test 5 Passed!");

        // TEST 6: Prevent Refresh Token Reuse (Replay Attack Protection)
        console.log("\n🧪 Test 6: Attempt Refresh Token Reuse (Should Fail & Invalidate Session)...");
        try {
            // Attempting to reuse the first refresh token which was already rotated
            await refreshAccessTokenService(loginData.refreshToken);
            throw new Error("Reuse of old refresh token should have thrown error.");
        } catch (err: any) {
            console.log("🟢 Reuse blocked as expected. Reason:", err.message);
            const dbUserAfterReplayBlock = await User.findOne({ email: TEST_EMAIL });
            console.log("🟢 Active Refresh Token in DB:", dbUserAfterReplayBlock?.refreshToken || "NULL (revoked active session)");
            
            if (dbUserAfterReplayBlock?.refreshToken) {
                throw new Error("Expected active session (refreshToken) to be wiped from DB after replay detection.");
            }
        }
        console.log("✅ Test 6 Passed!");

        // Log in again since the previous reuse check wiped the active session
        console.log("\n🔑 Re-logging in for logout test...");
        const loginData2 = await loginUserService({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });

        // TEST 7: Logout (Revocation)
        console.log("\n🧪 Test 7: Logout User Account...");
        await logoutUserService(loginData2.user._id.toString());
        
        const dbUserAfterLogout = await User.findOne({ email: TEST_EMAIL });
        console.log("🟢 Post-Logout DB Refresh Token:", dbUserAfterLogout?.refreshToken || "NULL (successfully revoked)");
        
        if (dbUserAfterLogout?.refreshToken) {
            throw new Error("Refresh token was not removed from DB on logout.");
        }
        console.log("✅ Test 7 Passed!");

        console.log("\n🎉 ALL SERVICE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n");
    } catch (error) {
        console.error("❌ Test Suite failed:", error);
    } finally {
        // Clean up test database records and disconnect Mongoose connection
        await User.deleteOne({ email: TEST_EMAIL });
        await mongoose.disconnect();
        console.log("🔌 Database Disconnected. Cleaned up database.");
    }
}

runTests();

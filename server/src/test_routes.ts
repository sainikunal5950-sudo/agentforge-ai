import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { User } from "./models/user.model";

const TEST_EMAIL = "route_test_engineer@example.com";
const TEST_PASSWORD = "Password123#";
const TEST_NAME = "Route Test User";
const PORT = 5001;

async function runRouteTests() {
    console.log("🚀 Starting Auth Router HTTP Integration Tests...");
    
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("MONGODB_URI is not set in environment variables");
    }
    
    console.log("🔌 Connecting to Database...");
    await mongoose.connect(mongoUri);
    console.log("✅ Database Connected.");
    
    // Clear old test data
    await User.deleteOne({ email: TEST_EMAIL });
    console.log("🧹 Cleaned up old test accounts.");

    // Start Express Server programmatically on a separate test port
    const server = app.listen(PORT);
    console.log(`📡 Live test server started on http://localhost:${PORT}`);

    try {
        // 1. Test POST /api/auth/register
        console.log("\n🧪 Test 1: Registering User (POST /api/auth/register)...");
        const registerRes = await fetch(`http://localhost:${PORT}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: TEST_NAME,
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });
        const registerData = await registerRes.json();
        console.log("🟢 Response Status:", registerRes.status);
        console.log("🟢 Response Body:", registerData);
        if (registerRes.status !== 201) throw new Error("User registration failed");

        // Fetch OTP from database to bypass email delays
        const dbUser = await User.findOne({ email: TEST_EMAIL });
        const verifyCode = dbUser?.verifyCode;
        if (!verifyCode) throw new Error("OTP verifyCode not found in MongoDB");
        console.log("🟢 Extracted Verification OTP:", verifyCode);

        // 2. Test POST /api/auth/verify-code
        console.log("\n🧪 Test 2: Verifying User Account (POST /api/auth/verify-code)...");
        const verifyRes = await fetch(`http://localhost:${PORT}/api/auth/verify-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: TEST_EMAIL,
                verifyCode
            })
        });
        const verifyData = await verifyRes.json();
        console.log("🟢 Response Status:", verifyRes.status);
        console.log("🟢 Response Body:", verifyData);
        if (verifyRes.status !== 200) throw new Error("Account verification failed");

        // 3. Test POST /api/auth/login
        console.log("\n🧪 Test 3: Logging In User (POST /api/auth/login)...");
        const loginRes = await fetch(`http://localhost:${PORT}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });
        const loginData = await loginRes.json();
        console.log("🟢 Response Status:", loginRes.status);
        console.log("🟢 Response Body:", loginData);
        if (loginRes.status !== 200) throw new Error("Login failed");

        // Extract cookie headers
        const setCookies = loginRes.headers.getSetCookie();
        console.log("🟢 Cookies set by server:", setCookies);
        const cookieString = setCookies.map(cookie => cookie.split(";")[0]).join("; ");
        console.log("🟢 Combined cookies for next requests:", cookieString);

        // 4. Test GET /api/auth/me (Protected route check)
        console.log("\n🧪 Test 4: Access Protected Profile (GET /api/auth/me)...");
        const profileRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
            method: "GET",
            headers: {
                "Cookie": cookieString
            }
        });
        const profileData = await profileRes.json();
        console.log("🟢 Response Status:", profileRes.status);
        console.log("🟢 Response Body:", profileData);
        if (profileRes.status !== 200) throw new Error("Profile fetching failed");

        // 5. Test POST /api/auth/refresh (Token rotation check)
        console.log("\n🧪 Test 5: Rotate Access & Refresh Tokens (POST /api/auth/refresh)...");
        const refreshRes = await fetch(`http://localhost:${PORT}/api/auth/refresh`, {
            method: "POST",
            headers: {
                "Cookie": cookieString // contains refresh token cookie
            }
        });
        const refreshData = await refreshRes.json();
        console.log("🟢 Response Status:", refreshRes.status);
        console.log("🟢 Response Body:", refreshData);
        if (refreshRes.status !== 200) throw new Error("Tokens refresh rotation failed");

        // Parse rotated token cookies
        const rotatedCookies = refreshRes.headers.getSetCookie();
        console.log("🟢 Rotated cookies set by server:", rotatedCookies);
        const rotatedCookieString = rotatedCookies.map(cookie => cookie.split(";")[0]).join("; ");

        // 6. Access profile with rotated cookies
        console.log("\n🧪 Test 6: Access Profile with rotated cookies (GET /api/auth/me)...");
        const rotatedProfileRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
            method: "GET",
            headers: {
                "Cookie": rotatedCookieString
            }
        });
        const rotatedProfileData = await rotatedProfileRes.json();
        console.log("🟢 Response Status:", rotatedProfileRes.status);
        console.log("🟢 Response Body:", rotatedProfileData);
        if (rotatedProfileRes.status !== 200) throw new Error("Fetching profile with rotated tokens failed");

        // 7. Test POST /api/auth/logout (Session cleanup check)
        console.log("\n🧪 Test 7: Logging Out User (POST /api/auth/logout)...");
        const logoutRes = await fetch(`http://localhost:${PORT}/api/auth/logout`, {
            method: "POST",
            headers: {
                "Cookie": rotatedCookieString
            }
        });
        const logoutData = await logoutRes.json();
        console.log("🟢 Response Status:", logoutRes.status);
        console.log("🟢 Response Body:", logoutData);
        if (logoutRes.status !== 200) throw new Error("Logout request failed");

        // 8. Ensure access is now rejected
        console.log("\n🧪 Test 8: Fetching profile after logout (Should fail with 401)...");
        const postLogoutRes = await fetch(`http://localhost:${PORT}/api/auth/me`, {
            method: "GET",
            headers: {
                "Cookie": rotatedCookieString
            }
        });
        const postLogoutData = await postLogoutRes.json();
        console.log("🟢 Response Status:", postLogoutRes.status);
        console.log("🟢 Response Body:", postLogoutData);
        if (postLogoutRes.status !== 401) {
            throw new Error("Endpoint remained accessible after session cleanup");
        }
        console.log("🟢 Unauthorized check passed: access blocked successfully!");

        console.log("\n🎉 ALL ROUTE HTTP INTEGRATION TESTS COMPLETED SUCCESSFULLY! 🎉\n");
    } catch (err) {
        console.error("❌ Route testing failed with error:", err);
    } finally {
        // Shutdown server, clean DB record and disconnect mongoose
        server.close();
        await User.deleteOne({ email: TEST_EMAIL });
        await mongoose.disconnect();
        console.log("🔌 Closed test server and disconnected database.");
    }
}

runRouteTests();

// ─────────────────────────────────────────────────────────────────────────────
// lib/axios.ts — Reusable Axios Instance
// ─────────────────────────────────────────────────────────────────────────────
//
// PURPOSE:
//   Create a single, pre-configured Axios instance shared across the entire
//   dashboard. This avoids repeating baseURL and withCredentials on every call.
//
// WHY withCredentials: true?
// ─────────────────────────────────────────────────────────────────────────────
//   By default, browsers follow the "same-origin policy":
//   cross-origin requests (port 3000 → port 5000) do NOT include cookies.
//
//   Setting withCredentials: true tells the browser:
//     "Include cookies, TLS certificates, and Authorization headers
//      even on cross-origin requests."
//
//   The browser will then automatically attach the HTTP-only cookies
//   (accessToken, refreshToken) on every request — we never read them in JS.
//
// HOW BROWSER HANDLES HTTP-ONLY COOKIES:
// ─────────────────────────────────────────────────────────────────────────────
//   1. Login → Express calls res.cookie("accessToken", token, { httpOnly: true })
//   2. Browser receives Set-Cookie header, stores cookie in its internal store
//   3. Cookie is marked HttpOnly → JavaScript CANNOT read it (document.cookie)
//   4. On next request to the same origin, browser AUTOMATICALLY includes it
//   5. Express reads it via req.cookies.accessToken (cookie-parser middleware)
//   6. Frontend never sees, stores, or manages the token — the browser does it
//
// WHY NOT localStorage?
// ─────────────────────────────────────────────────────────────────────────────
//   localStorage is accessible via JavaScript → XSS attacks can steal tokens.
//   HTTP-only cookies are invisible to JavaScript → XSS cannot access them.
//
// REQUEST FLOW:
// ─────────────────────────────────────────────────────────────────────────────
//   React Component
//       ↓ calls api.get("/api/auth/me")
//   Axios Instance (this file)
//       ↓ sets baseURL → http://localhost:5000/api/auth/me
//       ↓ withCredentials:true → browser attaches cookies automatically
//   Browser
//       ↓ sends: GET http://localhost:5000/api/auth/me
//       ↓ Cookie: accessToken=<httponly_value>; refreshToken=<httponly_value>
//   Express
//       ↓ cookie-parser reads cookies from request headers
//       ↓ requireAuth middleware verifies JWT
//       ↓ controller returns user data
//   Browser
//       ↓ receives JSON response
//   Axios
//       ↓ resolves promise with response.data
//   React State
//       ↓ updates UI
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

const api = axios.create({
    // Base URL from environment variable — all paths are appended to this
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",

    // CRITICAL: Must be true for HTTP-only cookies to be sent cross-origin.
    // The Express backend must respond with:
    //   Access-Control-Allow-Origin: http://localhost:3000
    //   Access-Control-Allow-Credentials: true
    // Both sides must agree — this is the handshake that enables cookie auth.
    withCredentials: true,

    headers: {
        "Content-Type": "application/json",
    },
});

export default api;

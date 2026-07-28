# 🔐 Production Authentication System

A full authentication system built to learn **backend security, JWT authentication, HTTP-only cookies, and Next.js architecture**.

It shows how real apps handle login, sessions, and protected routes — the same way production systems do it, not a toy example.

---

## 📌 What This Project Does

Instead of storing login state in the browser (which is insecure), this system uses **secure, server-managed sessions**.

```
User → Next.js Client → Express API → Auth Middleware → Services → MongoDB
```

**Core areas covered:**
- User identity & registration
- Secure login (JWT-based)
- Token management (access + refresh tokens)
- Session security (HTTP-only cookies)
- Protected routes
- Profile & account management

---

## ✨ Features

### 🔑 Authentication
- User signup with input validation
- Passwords hashed with **bcrypt**
- Email verification via **OTP (6-digit code)**
- Login with email + password
- JWT-based session handling

### 🍪 Secure Cookies
- Tokens stored in **httpOnly cookies** (JavaScript can't read them → protects against XSS attacks)
- `SameSite` protection against CSRF
- Secure cookie flags for production

### 🔄 Token System
| Token | Purpose | Expiry |
|---|---|---|
| **Access Token** | Authorizes API requests | 15 minutes |
| **Refresh Token** | Issues new access tokens | 7 days |

**Refresh Token Rotation:** every time a refresh token is used, it's replaced with a new one. This stops attackers from reusing a stolen token.

### 🛡️ Protected Routes
A custom middleware checks the access token on every request:

```
Request → Read Cookie → Verify JWT → Find User → Attach to req.user → Allow Access
```

### 👤 User Management
- View & update profile
- Change password
- Upload avatar
- Delete account
- Manage account settings

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, bcrypt, Resend (email API)

**Frontend (testing dashboard):** Next.js, TypeScript, Tailwind CSS, Axios

---

## 📂 Project Structure

```
production-authentication-system/
├── server/
│   └── src/
│       ├── config/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       └── types/
└── client-testing-dashboard/
```

**Request flow:** `Route → Controller → Service → Database → Response`

---

## 🔥 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/verify-code
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### User
```
GET    /api/user/profile
PUT    /api/user/profile
PUT    /api/user/password
POST   /api/user/avatar
DELETE /api/user/account
GET    /api/user/settings
PUT    /api/user/settings
```

---

## 🧪 How Authentication Was Tested

```
Register → Verify OTP → Login → Get Cookies →
Access Protected Route → Refresh Token → Logout → 401 (route now blocked)
```

---

## 🧠 What I Learned

**Backend:** REST API design, MVC pattern, service-layer architecture, MongoDB modeling

**Security:** password hashing, JWT, access/refresh tokens, cookie security, token rotation, authorization

**Frontend:** Next.js App Router, Axios setup, API integration, handling auth state on the client

---

## 🎯 Planned Improvements

- Google OAuth login
- Role-based access control (RBAC)
- Redis for session storage
- Rate limiting
- Password reset flow
- Two-factor authentication (2FA)

---

## 📚 Why I Built This

To understand, hands-on, **how real applications securely identify users, manage sessions, and protect private data** — not just in theory, but by building it.

---

*Built while learning backend engineering and Next.js 🚀*

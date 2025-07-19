# Auth Module Documentation

## Overview

The Auth module provides authentication and session management for the FundFlow application. It handles user registration, login, logout, token refresh, and session persistence using JWTs and refresh tokens.

## Key Features

- **User Registration & Login**: Secure authentication endpoints
- **JWT & Refresh Token Management**: Access and refresh tokens for secure sessions
- **Automatic Token Injection**: Axios interceptors add tokens to all requests
- **Token Refresh Logic**: Automatic refresh on 401 errors, with retry queue
- **Session Persistence**: User stays logged in across page reloads
- **Centralized Auth State**: Provided via React Context (`AuthContext`)
- **Logout on Expiry/Failure**: User is logged out if refresh fails or tokens expire


## Session Management & Token Refresh

### How It Works
- On login, the backend returns a JWT access token and a refresh token.
- Both tokens are stored in `localStorage` and in React state.
- On every page load, the app checks if the JWT is valid (not expired) and restores the session if so.
- All API requests automatically include the JWT in the `Authorization` header.
- If a request fails with a 401 (expired token), the app automatically attempts to refresh the token using the refresh token.
- If refresh succeeds, the original request is retried with the new token.
- If refresh fails (e.g., refresh token expired), the user is logged out and redirected to the login page.

### Token Refresh Queue
- If multiple requests fail with 401 at the same time, only one refresh is performed.
- All failed requests are queued and retried after the refresh completes.

### Session Persistence
- User, token, and refreshToken are stored in `localStorage`.
- On app load, the session is restored if the JWT is still valid.
- If the JWT is expired, the session is cleared and the user must log in again.


## Error Handling & Troubleshooting

- **401 Unauthorized**: Triggers automatic token refresh. If refresh fails, user is logged out.
- **Token Expiry**: Session is cleared and user is redirected to login.
- **Network Errors**: Shown to user and handled gracefully.
- **Manual Logout**: Clears all session data and redirects to login.

## Security Notes

- **Tokens are stored in localStorage** for persistence. Consider using httpOnly cookies for higher security in production.
- **Refresh tokens are rotated** on every refresh for improved security.
- **Sensitive actions** (like password change) should require re-authentication.


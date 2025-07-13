# Authentication Module

## Overview
The Authentication Module handles user registration, login, email verification, and password reset functionality for the FundFlow application.

## Key Features
- User registration with comprehensive profile data collection
- Secure login with JWT token authentication
- Email verification workflow
- Password reset functionality with rate limiting
- Form validation using Joi schemas
- Responsive design with theme support

## Authentication Flow
1. **Registration**: Users sign up with email, password, and profile information
2. **Email Verification**: Users verify their email address to activate their account
3. **Login**: Authenticated users can log in and receive JWT tokens
4. **Password Reset**: Users can request password reset via email

## API Integration
- Communicates with backend API endpoints at `/api/v1/auth`
- Automatic token injection for authenticated requests
- Centralized error handling and response processing
- Support for refresh token rotation

## Security Features
- Strong password requirements (8-128 characters, mixed case, numbers, special characters)
- Rate limiting protection for login and password reset attempts
- Secure token storage in localStorage
- Input validation and sanitization
- XSS protection through React's built-in security

## User Experience
- Real-time form validation with immediate feedback
- Loading states and disabled controls during API calls
- Success/error message display
- Automatic redirects after successful operations
- Responsive design for mobile and desktop

## Dependencies
- React Router for navigation
- Axios for HTTP requests
- Joi for form validation
- Tailwind CSS for styling

## Notes for Developers
- All authentication pages are standalone (no sidebar/header)
- Token management is handled automatically via interceptors
- Form validation schemas are centralized in `authValidation.js`
- Error handling follows consistent patterns across all components 
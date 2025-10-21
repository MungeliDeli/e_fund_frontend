# FundFlow Frontend

A modern React-based frontend application for the FundFlow fundraising platform. Built with React 19, Vite, and Tailwind CSS, this application provides a comprehensive interface for managing fundraising campaigns, donations, and user interactions.

## 🚀 Features

### Core Functionality

- **User Authentication**: Complete auth flow with JWT tokens, email verification, and password reset
- **Campaign Management**: Create, edit, and manage fundraising campaigns with customizable templates
- **Donation System**: Secure donation processing with real-time payment integration
- **User Profiles**: Comprehensive profile management for individuals and organizations
- **Social Feed**: Interactive feed for sharing updates and engaging with campaigns
- **Real-time Notifications**: WebSocket-based real-time notifications and updates
- **Analytics Dashboard**: Detailed analytics and reporting for campaigns and donations

### User Roles & Permissions

- **Individual Users**: Personal profiles, donation tracking, and social engagement
- **Organization Users**: Campaign creation, donor management, and analytics
- **Admin Users**: System administration, user management, and oversight
- **Role-based Access Control**: Secure route protection and feature access

### Advanced Features

- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Socket.IO integration for live updates
- **File Upload**: AWS S3 integration for media management
- **State Management**: Context API with React Query for efficient data management
- **Theme Support**: Dark/light theme switching
- **PWA Ready**: Progressive Web App capabilities

## 🛠️ Tech Stack

- **Framework**: React 19 with functional components and hooks
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS 4.x with custom design system
- **Routing**: React Router DOM v7 with protected routes
- **State Management**: React Context API + TanStack Query
- **Real-time**: Socket.IO client for live updates
- **HTTP Client**: Axios with interceptors
- **Validation**: Joi for form validation
- **Icons**: React Icons with Feather icons
- **Charts**: React Minimal Pie Chart for analytics

## 📁 Project Structure

```
e_fund_frontend/
├── src/
│   ├── App.jsx                    # Main app component with routing
│   ├── main.jsx                   # Application entry point
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.jsx        # Authentication state
│   │   ├── ThemeContext.jsx       # Theme management
│   │   ├── SocketContext.jsx      # WebSocket connections
│   │   └── NotificationContext.jsx # Notifications
│   ├── components/                # Reusable UI components
│   │   ├── Buttons.jsx           # Button components
│   │   ├── ProtectedRoute.jsx    # Route protection
│   │   └── ...
│   ├── features/                  # Feature-based modules
│   │   ├── auth/                 # Authentication
│   │   ├── campaigns/            # Campaign management
│   │   ├── donations/            # Donation handling
│   │   ├── users/                # User management
│   │   ├── feed/                 # Social feed
│   │   ├── notifications/        # Notifications
│   │   └── Outreach/             # Outreach campaigns
│   ├── layout/                   # Layout components
│   │   ├── MainLayout.jsx        # Main app layout
│   │   └── Sidebar/              # Navigation sidebar
│   ├── services/                 # API services
│   ├── utils/                    # Utility functions
│   └── styles/                   # Global styles
├── public/                       # Static assets
├── dist/                         # Build output
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd e_fund_frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000/api/v1
   VITE_SOCKET_URL=http://localhost:3000

   # AWS S3 Configuration (for file uploads)
   VITE_AWS_ACCESS_KEY_ID=your_aws_access_key
   VITE_AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   VITE_AWS_S3_BUCKET=your_s3_bucket
   VITE_AWS_REGION=your_aws_region

   # App Configuration
   VITE_APP_NAME=FundFlow
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 📱 Key Features

### Authentication System

- **Sign Up/Login**: Email-based registration with verification
- **Password Reset**: Secure password reset flow
- **JWT Tokens**: Automatic token refresh and session management
- **Role-based Access**: Different interfaces for different user types

### Campaign Management

- **Template System**: Pre-designed campaign templates
- **Live Builder**: Real-time campaign customization
- **Media Upload**: Image and video upload with AWS S3
- **Campaign Analytics**: Detailed performance metrics

### Donation Processing

- **Payment Modal**: Secure donation interface
- **Mobile Money Integration**: ZynlePay payment gateway
- **Donation Tracking**: Real-time donation updates
- **Thank You Messages**: Customizable donor acknowledgments

### User Profiles

- **Individual Profiles**: Personal user profiles with donation history
- **Organization Profiles**: Business profiles with campaign management
- **Profile Editing**: Comprehensive profile customization
- **Privacy Controls**: Granular privacy settings

### Admin Dashboard

- **User Management**: Admin panel for user oversight
- **Campaign Oversight**: Campaign approval and management
- **Financial Management**: Transaction and withdrawal oversight
- **Audit Logs**: Comprehensive system activity tracking

## 🎨 Design System

### Tailwind CSS Configuration

- **Custom Colors**: Brand-specific color palette
- **Typography**: Consistent font sizing and spacing
- **Components**: Reusable component classes
- **Responsive**: Mobile-first responsive design

### Theme Support

- **Light/Dark Mode**: Automatic theme switching
- **Custom Themes**: Organization-specific branding
- **Accessibility**: WCAG compliant design patterns

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Testing (if configured)
npm run test            # Run tests
npm run test:coverage   # Run tests with coverage
```

### Code Organization

The application follows a feature-based architecture:

- **Features**: Self-contained modules with pages, components, and services
- **Components**: Reusable UI components with consistent props
- **Services**: API communication and data management
- **Contexts**: Global state management with React Context
- **Utils**: Helper functions and utilities

### State Management

- **Authentication**: AuthContext for user state and authentication
- **Theme**: ThemeContext for theme switching
- **Notifications**: NotificationContext for toast notifications
- **Real-time**: SocketContext for WebSocket connections
- **Data Fetching**: TanStack Query for server state management

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication with automatic refresh
- Protected routes with role-based access control
- Secure token storage in localStorage
- Automatic logout on token expiration

### Data Protection

- Input validation with Joi schemas
- XSS protection with proper sanitization
- CSRF protection with token validation
- Secure API communication with HTTPS

### Privacy

- Granular privacy controls for user data
- Secure file upload with presigned URLs
- Data encryption for sensitive information
- GDPR-compliant data handling

## 📊 Performance

### Optimization Features

- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: Compressed images with lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Efficient caching strategies

### Monitoring

- **Error Boundaries**: Graceful error handling
- **Performance Metrics**: Core Web Vitals tracking
- **User Analytics**: User interaction tracking
- **Real-time Monitoring**: WebSocket connection monitoring

## 🚀 Deployment

### Build Process

```bash
# Production build
npm run build

# The build artifacts will be stored in the `dist/` directory
```

### Environment Variables

Ensure all required environment variables are set:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
VITE_SOCKET_URL=https://your-api-domain.com
# ... other production configs
```

### Deployment Options

- **Static Hosting**: Deploy to Vercel, Netlify, or AWS S3
- **CDN**: Use CloudFront or similar for global distribution
- **Docker**: Containerized deployment with Nginx


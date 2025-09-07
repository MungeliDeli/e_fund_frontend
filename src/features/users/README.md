# Users Module Documentation

## Overview

The Users module provides comprehensive user profile management functionality for the FundFlow application. It handles both public and private profile views, image management, and account settings.


## Key Features

### 🖼️ Image Management
- **Profile & Cover Images**: Upload, edit, and remove profile/cover photos
- **S3 Integration**: Secure file storage with signed URLs
- **Caching**: Reduces API calls and improves performance
- **Loading States**: Smooth user experience during image operations

### 👤 Profile Management
- **Dual View Modes**: Public (visitors) and Private (owner) views
- **Privacy Controls**: Different data visibility based on ownership
- **Tab Navigation**: Organized information display with deep linking
- **Responsive Design**: Mobile-optimized interface

### 🔧 Account Settings
- **Image Editing**: Comprehensive image upload interface
- **Profile Updates**: Information editing capabilities
- **Error Handling**: Robust error management and user feedback

## Components

### Core Components

#### ProfileImage
Displays user profile images with intelligent caching and fallback handling.

```jsx
<ProfileImage 
  mediaId={profile.profilePictureMediaId}
  size="xl"
  alt="User Profile"
/>
```

**Props:**
- `mediaId`: Database media record ID
- `size`: Size variant (sm, md, lg, xl, 2xl)
- `alt`: Alt text for accessibility
- `className`: Additional CSS classes
- `fallbackIcon`: Icon component for fallback state
- `onLoad`: Callback when image loads
- `onError`: Callback when image fails

#### CoverImage
Displays cover images with flexible height options.

```jsx
<CoverImage 
  mediaId={profile.coverPictureMediaId}
  height="h-60"
  alt="Cover Photo"
/>
```

**Props:**
- `mediaId`: Database media record ID
- `height`: Height class (h-20, h-32, h-60, etc.)
- `alt`: Alt text for accessibility
- `className`: Additional CSS classes
- `fallbackIcon`: Icon component for fallback state
- `onLoad`: Callback when image loads
- `onError`: Callback when image fails

#### ProfileImageEditor
Comprehensive interface for uploading and editing profile images.

```jsx
<ProfileImageEditor
  profile={profile}
  onSave={handleImageUpload}
  onCancel={handleCancel}
  loading={loading}
/>
```

**Props:**
- `profile`: Current user profile data
- `onSave`: Callback with image data for upload
- `onCancel`: Callback when editing is cancelled
- `loading`: Loading state from parent

#### SectionCard
Reusable card container with optional edit functionality.

```jsx
<SectionCard 
  title="Personal Information"
  isOwner={isOwner}
  editable={true}
  onEdit={handleEdit}
>
  {/* Card content */}
</SectionCard>
```

**Props:**
- `title`: Section title
- `isOwner`: Whether current user owns the profile
- `editable`: Whether section can be edited
- `onEdit`: Edit button callback
- `children`: Card content

### Page Components

#### UserProfilePage
Main profile page component handling both public and private views.

**Route Behavior:**
- `/profile-view` - Current user's private profile
- `/users/:userId` - Public profile of specified user

**Key Features:**
- Tab-based navigation with URL synchronization
- Optimized rendering to prevent flicker
- Deep linking support
- Responsive design

#### Tab Components

##### OverviewTab
Displays profile information in structured sections.

**Features:**
- Conditional public/private data display
- Privacy-aware information showing
- Edit navigation to account settings

##### AccountSettingsTab
Provides account management functionality.

**Features:**
- Image editing interface
- Loading and error state management
- Automatic navigation after updates

##### DonationsTab, CampaignsTab, MessagesTab
Placeholder components for future functionality.

## Services

### usersApi.js
Centralized API service for user-related operations.

**Available Functions:**
- `fetchPublicProfile(userId)` - Get public profile data
- `fetchPrivateProfile()` - Get private profile data
- `getMediaUrl(mediaId)` - Get signed S3 URL for media
- `uploadProfileImages({ profileFile, coverFile })` - Upload images

## Utilities

### imageCache.js
In-memory caching system for S3 signed URLs.

**Features:**
- Automatic cache expiry based on S3 URL expiration
- Memory-efficient storage with cleanup
- Prevents redundant API calls

## Performance Optimizations

### 1. Image Caching
- URLs cached with expiration times
- Automatic cleanup every 5 minutes
- Prevents repeated API calls for same images

### 2. Component Memoization
- `ProfileImage` and `CoverImage` components memoized
- Prevents unnecessary re-renders
- Optimized tab rendering with `useMemo`

### 3. Tab Navigation
- URL updates without triggering navigation
- Stable tab configuration
- Reduced component re-renders

## Error Handling

### Image Loading
- Graceful fallback to icons when images fail
- Loading states with skeleton animations
- Error callbacks for custom handling

### API Operations
- Comprehensive error messages
- Loading states during operations
- Success feedback with automatic navigation

## Security Features

### Privacy Controls
- Public vs private data separation
- Owner-only access to sensitive information
- Conditional rendering based on ownership


## Future Enhancements

### Planned Features
- [ ] Profile information editing
- [ ] Password change functionality
- [ ] Privacy settings management
- [ ] Notification preferences
- [ ] Account deletion
- [ ] Donation history implementation
- [ ] Campaign management
- [ ] Messaging system

### Technical Improvements
- [ ] Image optimization and compression
- [ ] Advanced caching strategies

# Changelog

All notable changes to FoodRescue will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-03

### Added
- Initial release of FoodRescue platform
- Multi-role authentication system (vendors, NGOs, admins)
- User registration with document verification
- Admin dashboard with user verification management
- Vendor dashboard for food listing management
- NGO dashboard for browsing and requesting food
- Food listings with quantity and pickup time management
- Pickup request system
- Document upload and verification system
- Gallery feature for community impact photos
- Mobile-responsive design
- Real-time activity feeds
- Database initialization and migration system

### Features
- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control
  - Document verification for account approval

- **Vendor Features**
  - Create and manage food listings
  - Set pickup times and quantities
  - View pickup requests
  - Business profile management

- **NGO Features**
  - Browse available food listings
  - Request pickups for needed quantities
  - Organization profile management
  - Upload verification documents

- **Admin Features**
  - User verification management
  - Platform oversight and moderation
  - Activity monitoring
  - Gallery photo management

- **Technical Features**
  - Next.js 14 with App Router
  - TypeScript for type safety
  - MySQL database with connection pooling
  - Image compression and optimization
  - Responsive Tailwind CSS design
  - Error handling and validation

### Security
- Environment variable configuration
- Password hashing with bcrypt
- SQL injection prevention
- Input validation and sanitization
- Secure file upload handling

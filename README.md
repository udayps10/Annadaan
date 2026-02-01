# 🍽️ Annadaan - Complete System Documentation

**Version:** 2.0 | **Last Updated:** February 2026 | **Status:** Production

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Database Schema](#3-database-schema)
4. [Complete API Reference](#4-complete-api-reference)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [User Workflows](#6-user-workflows)
7. [Configuration](#7-configuration)
8. [Deployment Guide](#8-deployment-guide)
9. [Development Guidelines](#9-development-guidelines)

---

## 1. Project Overview

### What is Annadaan?

Annadaan is a dual-purpose social impact platform with two core systems:

**System A: FoodRescue**
- Connects food vendors with NGOs to redistribute surplus food
- Vendors list available food → NGOs request pickup → Food is saved from waste

**System B: Donation Drive**
- Individual donors contribute money (UPI) or food items to campaigns
- Campaign-based (e.g., Republic Day 2026, Independence Day)
- Admin approval workflow for transparency

### User Roles

| Role | Access | Capabilities |
|------|--------|-------------|
| **Vendor** | Dashboard, Listings | Create food listings, manage requests |
| **NGO** | Dashboard, Browse | Request food pickups, view available listings |
| **Donor** | Donation forms | Submit UPI/item donations (no dashboard) |
| **Admin** | Full system access | Approve users, donations, verify documents |

---

## 2. System Architecture

### Tech Stack

```
Frontend:  Next.js 14+ (App Router), TypeScript, Tailwind CSS
Backend:   Next.js API Routes (Server-Side)
Database:  MySQL 8.0+ (InnoDB)
Auth:      JWT (jsonwebtoken)
Email:     Nodemailer (SMTP)
PDF:       PDFKit
```

### Directory Structure

```
/home/newer/code/Annadaan/
├── app/
│   ├── api/                      # Backend API Routes
│   │   ├── auth/                 # ✅ Modern (Login, Register)
│   │   ├── donation-drive/       # ✅ Modern (UPI, Items, Donor management)
│   │   ├── admin/                # ✅ Modern (Verifications, Approvals)
│   │   ├── listings/             # ⚠️  Legacy (Food listings)
│   │   ├── pickup-requests/      # ⚠️  Legacy (Pickup management)
│   │   ├── public/               # ✅ Modern (Public APIs)
│   │   └── ...
│   ├── dashboard/                # Protected UI pages
│   ├── donation-drive/           # Public donation pages
│   ├── events/                   # Campaign pages
│   └── page.tsx                  # Homepage
├── lib/                          # Core utilities (THE BRAIN)
│   ├── config.ts                 # Environment & constants
│   ├── errors.ts                 # Error handling system
│   ├── validation.ts             # Input validation
│   ├── middleware.ts             # JWT auth & RBAC
│   ├── database.ts               # DB connection & queries
│   ├── auth.ts                   # Password hashing
│   └── email.ts                  # Email sending
├── components/                   # React components
├── types/                        # TypeScript types
└── public/                       # Static assets
```

### Code Architecture Pattern

**Modern APIs** (auth, donation-drive, admin):
```typescript
import { handleError, handleSuccess } from '@/lib/errors'
import { createAuthContext } from '@/lib/middleware'
import { validateFields } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const auth = createAuthContext(request) // Authentication
    auth.requireAdmin() // Authorization
    
    validateFields([...]) // Validation
    const data = await executeQuery<Type>(...) // Typed query
    
    return handleSuccess(data, message) // Standard response
  } catch (error) {
    return handleError(error as Error) // Standard error handling
  }
}
```

**Legacy APIs** (listings, pickup-requests):
```typescript
// Direct auth parsing, console.error, custom responses
const token = authHeader.split(' ')[1]
const decoded = verifyToken(token)
console.error('Error:', error)
return NextResponse.json({ message: 'Error' }, { status: 500 })
```

---

## 3. Database Schema

### Core Tables

#### users
```sql
id, email (UNIQUE), password (hashed), role (vendor|ngo|admin), 
status (pending|approved|rejected|suspended), full_name, phone, address, 
latitude, longitude, created_at, updated_at
```

#### vendor_profiles
```sql
id, user_id (FK), business_name, business_type (restaurant|hotel|bakery|...), 
address, phone, description, website, average_daily_available
```

#### ngo_profiles
```sql
id, user_id (FK), organization_name, registration_number, 
focus_area (homeless|children|elderly|animals|general), 
capacity, address, phone, description, service_area_radius
```

#### individual_donors
```sql
id, full_name, phone, email (UNIQUE), aadhaar_number (UNIQUE), 
registration_date, created_at
```

### Food Rescue Tables

#### food_listings
```sql
id, vendor_id (FK→users), title, description, food_type, quantity, 
expiry_date, pickup_location, contact_info, 
status (available|reserved|picked_up|expired), created_at
```

#### pickup_requests
```sql
id, ngo_id (FK→users), listing_id (FK→food_listings), 
requested_quantity, requested_pickup_time, message, 
status (pending|approved|rejected|completed|cancelled), 
vendor_response, pickup_photo_url, created_at
```

### Donation Tables

#### upi_donations
```sql
id, donor_id (FK→individual_donors), campaign (republic-day-2026|general), 
amount, payment_screenshot (LONGTEXT base64), transaction_id, 
status (pending|approved|rejected), admin_notes, reviewed_by (FK→users), 
reviewed_at, receipt_sent, created_at
```

#### item_donations
```sql
id, donor_id (FK), campaign, transaction_id, item_title, quantity, 
expiry_date, pickup_datetime, pickup_address, description, 
status (pending|approved|rejected|collected), approval_photo, 
admin_notes, reviewed_by (FK), collected_at, created_at
```

### Verification Tables

#### verification_documents
```sql
id, user_id (FK), document_type (business_license|registration_certificate|...), 
document_url (LONGTEXT), document_filename, document_number, expiry_date, 
status (pending|approved|rejected), admin_notes, reviewed_by (FK), reviewed_at
```

#### verification_profiles
```sql
id, user_id (FK, UNIQUE), verification_status (pending|approved|rejected), 
verification_notes, submitted_at, reviewed_by (FK), reviewed_at, 
approved_at, rejection_reason
```

---

## 4. Complete API Reference

### 🔐 Authentication (Modern, Standard Pattern)

#### POST `/api/auth/register`
**Public** | Create new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "phone": "9876543210",
  "role": "vendor|ngo",
  "address": "123 Street Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 123,
    "email": "user@example.com",
    "role": "vendor"
  },
  "message": "Registration successful. Please upload verification documents."
}
```

**Validation Rules:**
- Email: Valid format, max 255 chars
- Phone: 10 digits, starts with 6-9
- Password: 8-128 chars, uppercase + lowercase + digit
- Role: Must be 'vendor' or 'ngo'

---

#### POST `/api/auth/login`
**Public** | Authenticate user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 123,
      "email": "user@example.com",
      "role": "vendor",
      "status": "approved"
    },
    "requiresVerification": false
  },
  "message": "Login successful"
}
```

**Status Codes:**
- 200: Success
- 401: Invalid credentials
- 403: Account rejected/suspended

---

### 💰 Donation Drive (Modern, Standard Pattern)

#### POST `/api/donation-drive/register`
**Public** | Register as individual donor

**Request:**
```json
{
  "full_name": "Jane Doe",
  "phone": "9876543210",
  "email": "jane@example.com",
  "aadhaar_number": "123456789012"
}
```

---

#### POST `/api/donation-drive/upi`
**Authentication Required** (Donor) | Submit UPI donation

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "donorId": 123,
  "amount": 500,
  "paymentScreenshot": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donationId": 456,
    "transactionId": "UPI-20260201-143025-A7C9F2"
  },
  "message": "UPI donation submitted successfully. Pending admin approval."
}
```

**Auto-Generated:**
- Transaction ID: `UPI-YYYYMMDD-HHMMSS-RANDOM`
- Status: Always starts as 'pending'

---

#### POST `/api/donation-drive/items`
**Authentication Required** (Donor) | Submit item donation

**Request:**
```json
{
  "donorId": 123,
  "item_title": "Rice",
  "quantity": "10 kg",
  "pickup_datetime": "2026-01-26T10:00:00",
  "pickup_address": "123 Main St",
  "description": "Premium quality rice"
}
```

---

#### GET `/api/public/approved-donations`
**Public** | Fetch approved donations for public display

**Query Parameters:**
- `upiIds` (optional): Comma-separated IDs (e.g., "1,5,12")
- `itemIds` (optional): Comma-separated IDs
- `type` (optional): "upi" | "item" | "all" (default: all)

**Example:**
```
GET /api/public/approved-donations?type=upi
GET /api/public/approved-donations?upiIds=1,5,12
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalUPIDonations": 15000,
    "upiDonationCount": 45,
    "itemDonationCount": 23
  },
  "donations": {
    "upi": [
      {
        "id": 1,
        "donor_name": "John Doe",
        "amount": 500,
        "transaction_id": "UPI-20260201-...",
        "approved_at": "2026-01-26T10:30:00Z",
        "receipt_id": "UPI-000001"
      }
    ],
    "items": [...]
  }
}
```

---

### 🛡️ Admin APIs (Modern, Standard Pattern)

#### GET `/api/admin/verification`
**Admin Only** | Fetch pending user verifications

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 123,
        "email": "vendor@example.com",
        "role": "vendor",
        "status": "pending",
        "business_name": "Food Corner",
        "documents": [
          {
            "id": 1,
            "document_type": "business_license",
            "status": "pending",
            "document_filename": "license.pdf"
          }
        ]
      }
    ]
  }
}
```

---

#### POST `/api/admin/verification`
**Admin Only** | Approve/reject user verification

**Request:**
```json
{
  "userId": 123,
  "action": "approve|reject",
  "notes": "Documents verified",
  "rejectionReason": "Invalid documents" // if rejecting
}
```

**Effect:**
- Updates `users.status` to 'approved' or 'rejected'
- Updates `verification_profiles.verification_status`
- Updates all user's `verification_documents.status`
- Sets `reviewed_by` and `reviewed_at` timestamps

---

#### POST `/api/admin/donations/upi/[id]/approve`
**Admin Only** | Approve UPI donation

**Effect:**
- Sets `upi_donations.status = 'approved'`
- Sets `reviewed_by = admin_id`, `reviewed_at = now()`
- Donation becomes visible on public donor wall

---

#### POST `/api/admin/donations/upi/[id]/reject`
**Admin Only** | Reject UPI donation

**Request:**
```json
{
  "admin_notes": "Screenshot unclear, please resubmit"
}
```

---

### 🍱 Food Listings (Legacy Pattern)

#### GET `/api/listings`
**Authentication Optional** | Fetch food listings

**Behavior by Role:**
- **No Auth**: Returns available listings only
- **Vendor**: Returns own listings (all statuses)
- **NGO**: Returns available listings (all vendors)
- **Admin**: Returns all listings

**Response:**
```json
{
  "listings": [
    {
      "id": 1,
      "vendor_id": 123,
      "title": "Fresh Bread",
      "quantity": "50 loaves",
      "status": "available",
      "vendor_name": "John's Bakery",
      "business_name": "John's Bakery Corp"
    }
  ]
}
```

---

#### POST `/api/listings`
**Vendor Only** | Create food listing

**Request:**
```json
{
  "title": "Fresh Bread",
  "description": "Whole wheat bread from today's batch",
  "food_type": "Bakery",
  "quantity": "50 loaves",
  "expiry_date": "2026-02-02",
  "pickup_location": "123 Main St",
  "contact_info": "9876543210"
}
```

---

### 📦 Pickup Requests (Legacy Pattern)

#### GET `/api/pickup-requests`
**Authentication Required** | Fetch pickup requests

**Behavior by Role:**
- **NGO**: Own requests only
- **Vendor**: Requests for own listings only
- **Admin**: All requests

---

#### POST `/api/pickup-requests`
**NGO Only** | Request food pickup

**Request:**
```json
{
  "listing_id": 1,
  "message": "We can collect today at 5 PM",
  "requested_pickup_time": "2026-02-01T17:00:00"
}
```

---

### 🔧 Utility APIs

#### POST `/api/generate-upi-qr`
**Public** | Generate UPI QR code

**Request:**
```json
{
  "amount": 500,
  "includeAmount": true // false for flexible amount
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAAN...",
    "upiUrl": "upi://pay?pa=singhraunak1107@oksbi&pn=Donation%20Drive&am=500&cu=INR",
    "bankLimitGuidance": "If you see 'Bank limit exceeded'..."
  }
}
```

**UPI Configuration:**
- UPI ID: `singhraunak1107@oksbi`
- Payee Name: "Donation Drive"
- Currency: INR

---

#### GET `/api/health`
**Public** | System health check

**Response:**
```json
{
  "status": "ok",
  "database": {
    "healthy": true,
    "timestamp": "2026-02-01T15:57:00Z"
  }
}
```

---

## 5. Authentication & Authorization

### JWT Token Structure

```typescript
{
  userId: number,
  email: string,
  role: 'vendor' | 'ngo' | 'admin' | 'donor',
  iat: number, // Issued at
  exp: number  // Expires at (7 days from issue)
}
```

### Token Usage

**In API Requests:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Modern Pattern (Recommended):**
```typescript
const auth = createAuthContext(request)
auth.requireAdmin() // Throws if not admin
auth.requireRole([UserRole.VENDOR, UserRole.NGO]) // Multiple roles
auth.requireOwner(resourceOwnerId) // Admin or owner only
```

**Legacy Pattern:**
```typescript
const token = request.headers.get('authorization')?.split(' ')[1]
const decoded = verifyToken(token)
if (!decoded || decoded.role !== 'vendor') {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}
```

### Access Control Matrix

| Endpoint | Public | Donor | Vendor | NGO | Admin |
|----------|--------|-------|--------|-----|-------|
| `/api/auth/*` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/donation-drive/register` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/donation-drive/upi` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `/api/listings` (GET) | ✅ | ❌ | ✅ | ✅ | ✅ |
| `/api/listings` (POST) | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/api/pickup-requests` (POST) | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/api/admin/*` | ❌ | ❌ | ❌ | ❌ | ✅ |
| `/api/public/*` | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 6. User Workflows

### System Flow Diagram

```mermaid
flowchart TD

%% ========================
%% VENDOR FLOW
%% ========================

subgraph Vendor_Flow
    V1["Register as Vendor<br/>POST /api/auth/register<br/>role: vendor"]
    V2["Status: Pending"]
    V3["Upload Documents<br/>POST /api/verification/documents/upload"]
    V4["Admin Reviews Vendor"]
    V5{"Admin Decision"}
    V6["Approve Vendor<br/>POST /api/admin/verification"]
    V7["Status: Approved"]
    V8["Create Food Listings"]
    V9["Vendor Rejected"]
end

V1 --> V2 --> V3 --> V4 --> V5
V5 -->|Approve| V6 --> V7 --> V8
V5 -->|Reject| V9

%% ========================
%% NGO FLOW
%% ========================

subgraph NGO_Flow
    N1["Browse Listings<br/>GET /api/listings"]
    N2["Request Pickup<br/>POST /api/pickup-requests"]
    N3["Vendor Reviews Request"]
    N4{"Vendor Decision"}
    N5["Approve Request<br/>PATCH /api/pickup-requests/:id"]
    N6["NGO Picks Up Food"]
    N7["Both Mark Completed"]
    N8["Optional: Upload Photo Proof"]
    N9["Pickup Rejected"]
end

V8 --> N1
N1 --> N2 --> N3 --> N4
N4 -->|Approve| N5 --> N6 --> N7 --> N8
N4 -->|Reject| N9

%% ========================
%% DONOR FLOW
%% ========================

subgraph Donor_UPI_Flow
    D1["Register as Donor<br/>POST /api/donation-drive/register"]
    D2["Visit Event Page"]
    D3["Click Donate UPI"]
    D4["Generate QR<br/>POST /api/generate-upi-qr"]
    D5["Pay via UPI App"]
    D6["Upload Screenshot<br/>POST /api/donation-drive/upi"]
    D7["Admin Reviews Donation"]
    D8{"Admin Decision"}
    D9["Approve Donation<br/>POST /api/admin/donations/upi/:id/approve"]
    D10["Public Donation Display<br/>GET /api/public/approved-donations"]
    D11["Donor Name Appears on Event Page"]
    D12["Donation Rejected"]
end

D1 --> D2 --> D3 --> D4 --> D5 --> D6 --> D7 --> D8
D8 -->|Approve| D9 --> D10 --> D11
D8 -->|Reject| D12

%% ========================
%% ADMIN FLOW
%% ========================

subgraph Admin_Daily_Workflow
    A1["Admin Login<br/>POST /api/auth/login"]
    A2["Review Pending Vendors<br/>GET /api/admin/verification"]
    A3["Review Donations<br/>GET /api/admin/donations"]
    A4["Monitor System Health<br/>GET /api/health"]
end

A1 --> A2 --> V4
A1 --> A3 --> D7
A1 --> A4
```

---

### A. Vendor Registration & Verification

1. **Register**: POST `/api/auth/register` with `role: 'vendor'`
   - Status set to 'pending'
2. **Upload Documents**: POST `/api/verification/documents/upload`
   - Business license, tax certificates
3. **Wait for Review**: Admin reviews in dashboard
4. **Admin Approves**: POST `/api/admin/verification` with `action: 'approve'`
   - Status → 'approved'
5. **Access Granted**: Vendor can now create food listings

### B. NGO Food Pickup Flow

1. **Browse Listings**: GET `/api/listings`
   - See available food from all vendors
2. **Request Pickup**: POST `/api/pickup-requests`
   - Select listing, provide message
3. **Vendor Approves**: PATCH `/api/pickup-requests/[id]`
   - Vendor sets status to 'approved'
4. **Pick Up Food**: NGO collects food
5. **Mark Complete**: Both parties mark as 'completed'
6. **Optional**: Upload photo proof

### C. Donor UPI Contribution Flow

1. **Register as Donor**: POST `/api/donation-drive/register`
2. **Navigate to Event**: Visit `/events/republic-day-2026`
3. **Click Donate UPI**: Redirected to `/donation-drive/donate/upi?campaign=republic-day-2026`
4. **Generate QR**: POST `/api/generate-upi-qr`
   - Choose flexible or fixed amount mode
5. **Pay via UPI**: Scan QR, complete payment in UPI app
6. **Upload Screenshot**: POST `/api/donation-drive/upi`
   - Submit proof of payment
7. **Admin Reviews**: Admin checks screenshot against bank records
8. **Admin Approves**: POST `/api/admin/donations/upi/[id]/approve`
9. **Public Display**: Donation appears on `/api/public/approved-donations`
10. **Donor Wall**: Name visible on event page

### D. Admin Daily Workflow

1. **Login**: POST `/api/auth/login` with admin credentials
2. **Review Pending Users**: GET `/api/admin/verification`
   - Check documents, business details
3. **Approve/Reject Users**: POST `/api/admin/verification`
4. **Review Donations**: GET `/api/admin/donations`
   - Verify UPI screenshots, item details
5. **Approve Donations**: POST `/api/admin/donations/upi/[id]/approve`
6. **Monitor System**: Check `/api/health` for issues

---

## 7. Configuration

### Environment Variables (.env)

```bash
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=foodrescue
DB_PORT=3306
DB_CONNECTION_LIMIT=50

# Authentication
JWT_SECRET=your_randomly_generated_secret_min_32_chars  # CRITICAL
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_specific_password  # Not regular password!
EMAIL_FROM_NAME=Annadaan

# Application
NODE_ENV=production|development
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Uploads
MAX_FILE_SIZE=5242880  # 5MB
IMAGE_QUALITY=0.8

# Donations
UPI_ID=singhraunak1107@oksbi
UPI_NAME=Donation Drive
MIN_DONATION_AMOUNT=1
MAX_DONATION_AMOUNT=100000
```

### Critical Security Requirements

**JWT_SECRET:**
- MUST be ≥32 characters
- MUST be randomly generated
- MUST NOT be 'dev-secret-change-in-production'
- Generation: `openssl rand -base64 64`

**SMTP_PASS:**
- MUST be Gmail App Password (not regular password)
- Enable 2FA on Gmail first
- Generate at: https://myaccount.google.com/apppasswords

**Database Password:**
- Production: ≥16 characters, mixed case, numbers, symbols
- Development: Can be simpler

---

## 8. Deployment Guide

### Quick Start (Development)

```bash
# 1. Clone repository
git clone <repo-url>
cd Annadaan

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your values

# 4. Create database
mysql -u root -p
CREATE DATABASE foodrescue CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# 5. Initialize tables
mysql -u root -p foodrescue < db.sql

# 6. Start development server
npm run dev
# Visit http://localhost:3000
```

### Production Deployment with PM2

```bash
# 1. Build application
npm run build

# 2. Install PM2 globally
npm install -g pm2

# 3. Start with PM2
pm2 start npm --name "annadaan" -- start

# 4. Save PM2 config
pm2 save

# 5. Setup auto-restart
pm2 startup
# Follow the command it outputs

# 6. Monitor
pm2 monit
pm2 logs annadaan
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Backups

```bash
#!/bin/bash
# Save as /usr/local/bin/backup-annadaan.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mysql"
mkdir -p $BACKUP_DIR

mysqldump -u annadaan_user -p$DB_PASSWORD foodrescue | \
  gzip > $BACKUP_DIR/foodrescue_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

**Add to crontab:**
```bash
0 2 * * * /usr/local/bin/backup-annadaan.sh
```

---

## 9. Development Guidelines

### For New API Routes (Use Modern Pattern)

```typescript
import { NextRequest } from 'next/server'
import { executeQuery } from '@/lib/database'
import { handleError, handleSuccess } from '@/lib/errors'
import { createAuthContext } from '@/lib/middleware'
import { validateFields, validateRequired } from '@/lib/validation'
import { HTTP_STATUS } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const auth = createAuthContext(request)
    auth.requireAdmin()

    // 2. Parse & Validate
    const body = await request.json()
    validateFields([
      { result: validateRequired(body.field, 'Field'), field: 'field' }
    ])

    // 3. Execute query (typed)
    interface Result { id: number }
    const data = await executeQuery<Result[]>('SELECT ...', [params])

    // 4. Return success
    return handleSuccess(data, 'Success message', HTTP_STATUS.OK)

  } catch (error) {
    return handleError(error as Error)
  }
}
```

### Input Validation Examples

```typescript
// Email
validateFields([
  { result: validateEmail(email), field: 'email' }
])
const cleanEmail = sanitizeEmail(email)

// Phone (Indian)
validateFields([
  { result: validatePhone(phone), field: 'phone' }
])

// Amount
validateFields([
  { result: validateDonationAmount(amount), field: 'amount' }
])

// Enum
validateFields([
  { result: validateEnum(status, ['pending', 'approved']), field: 'status' }
])
```

### Database Transactions

```typescript
import { executeInTransaction } from '@/lib/database'

await executeInTransaction(async (connection) => {
  // Insert user
  const [result] = await connection.execute(
    'INSERT INTO users (...) VALUES (?)',
    [userData]
  )
  const userId = (result as any).insertId

  // Insert profile
  await connection.execute(
    'INSERT INTO profiles (...) VALUES (?)',
    [userId, profileData]
  )

  return { userId }
})
// Auto-commits on success, auto-rolls back on error
```

### Error Handling

```typescript
// Throw specific errors
throw new ValidationError('Invalid email format')
throw new AuthenticationError('Invalid token')
throw new NotFoundError('User not found')
throw new AuthorizationError('Admin access required')

// All caught by handleError()
```

---

## 📊 System Status

**Modern APIs (Production-Ready):**
- ✅ `/api/auth/*` (Login, Register)
- ✅ `/api/donation-drive/*` (UPI, Items, Donor management)
- ✅ `/api/admin/verification` (User approvals)
- ✅ `/api/admin/donations/*` (Donation approvals)
- ✅ `/api/public/approved-donations` (Public feed)

**Legacy APIs (Functional, Needs Refactoring):**
- ⚠️ `/api/listings/*` (Food listings)
- ⚠️ `/api/pickup-requests/*` (Pickup management)
- ⚠️ `/api/gallery/*` (Impact photos)

**Known Limitations:**
- Images stored as Base64 in DB (not scalable beyond ~10K images)
- No real-time notifications (manual page refresh required)
- No payment gateway integration (UPI screenshot verification only)
- Campaign system uses manual ID mapping in config (not DB-driven)

---

## 🆘 Troubleshooting

### Application won't start
- Check JWT_SECRET is set and ≥32 chars
- Verify all required env vars in `.env`
- Check MySQL is running: `systemctl status mysql`

### Login fails
- Verify user status is 'approved' in database
- Check JWT_SECRET matches between requests
- Clear browser localStorage and retry

### Donations not appearing
- Check donation status is 'approved' in database
- Verify admin has approved the donation
- Check browser console for API errors

### Email not sending
- Verify SMTP credentials are correct
- Ensure using Gmail App Password, not regular password
- Check firewall allows port 587 outbound

---

**Documentation Version:** 2.0  
**Maintained By:** Annadaan Development Team  
**Support:** Check GitHub Issues or contact admin

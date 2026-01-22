---
agent: agent
---
# 🏛️ ANNADAAN PROJECT BLUEPRINT & CANONICAL RULES

**Version:** 1.0  
**Last Updated:** January 22, 2026  
**Status:** Production-Ready MVP  

This document serves as the authoritative source of truth for the Annadaan project's architecture, rules, invariants, and development guidelines. All contributors—human and AI—must follow these rules without exception.

---

## 📖 TABLE OF CONTENTS

1. [Project Understanding](#1-project-understanding)
2. [Architectural Rules](#2-architectural-rules)
3. [Data Rules](#3-data-rules)
4. [Coding Rules](#4-coding-rules)
5. [Interface Rules (API Contracts)](#5-interface-rules-api-contracts)
6. [Behavioral Rules](#6-behavioral-rules)
7. [Security and Safety Rules](#7-security-and-safety-rules)
8. [Performance and Scalability Rules](#8-performance-and-scalability-rules)
9. [Error Handling and Logging Rules](#9-error-handling-and-logging-rules)
10. [Project Invariants](#10-project-invariants)
11. [Development Guidelines](#11-development-guidelines)
12. [Ambiguities & Risks](#12-ambiguities--risks)

---

## 1. PROJECT UNDERSTANDING

### 1.1 Core Purpose

Annadaan (Sanskrit: "अन्नदान" meaning "food donation") is a dual-purpose social impact platform:

**System A: FoodRescue** - Connects food vendors with NGOs/shelters to share surplus food
**System B: Donation Drive** - Enables individual donors to contribute money (UPI) or food items to campaigns

### 1.2 Problems Solved

1. **Food Waste Reduction**: Redirects surplus food from vendors to those in need
2. **NGO Food Access**: Streamlines food acquisition for shelters, orphanages, and animal welfare
3. **Donation Transparency**: Provides public verification of approved donations by campaign
4. **Trust Building**: Multi-layer verification (documents, admin approval) ensures legitimacy
5. **Payment Friction**: Flexible UPI QR codes bypass bank limit errors

### 1.3 Intended Users

**Primary Users:**
- **Food Vendors** (restaurants, hotels, bakeries, caterers): List surplus food
- **NGOs** (shelters, orphanages, animal welfare): Request and collect food
- **Individual Donors**: Contribute via UPI or item donations
- **Administrators**: Verify users, approve donations, moderate content

**Secondary Users:**
- **Volunteers**: (Future) Facilitate food pickup/delivery
- **Public Visitors**: View impact gallery and approved donations

### 1.4 Current Development State

**Status:** MVP in Production (Functional but requires scaling improvements)

**Completed Features:**
- ✅ Multi-role authentication (JWT-based)
- ✅ Vendor food listing management
- ✅ NGO pickup request system
- ✅ Document verification workflow
- ✅ UPI donation with QR code generation
- ✅ Item donation with pickup scheduling
- ✅ Event-based donation campaigns
- ✅ Admin dashboard for approval workflows
- ✅ Impact gallery with photo uploads
- ✅ Email notifications (SMTP)
- ✅ PDF receipt generation

**Known Limitations:**
- ⚠️ Base64 image storage in database (not scalable beyond ~10K images)
- ⚠️ No real-time notifications (polling-based refresh)
- ⚠️ Limited geographic search (lat/long stored but not indexed)
- ⚠️ No payment gateway integration (UPI screenshot verification only)
- ⚠️ No rate limiting implementation (configured but not enforced)
- ⚠️ Campaign system uses manual ID mapping (not database-driven)

---

## 2. ARCHITECTURAL RULES

### 2.1 Technology Stack Constraints

**RULE 2.1.1: Frontend Framework**
- **Rule:** The application MUST use Next.js 14+ with App Router architecture
- **Why:** Enables server-side rendering, file-based routing, and API routes in one framework
- **Breaks if violated:** Routing, data fetching, and SSR patterns become incompatible

**RULE 2.1.2: Database System**
- **Rule:** The database MUST be MySQL 8.0+ with InnoDB engine
- **Why:** Chosen for transaction support, foreign key constraints, and hosting availability
- **Breaks if violated:** SQL syntax incompatibilities, loss of ACID guarantees

**RULE 2.1.3: Language and Type Safety**
- **Rule:** All code MUST be written in TypeScript (no plain JavaScript files except configs)
- **Why:** Type safety prevents runtime errors and enables better IDE support
- **Breaks if violated:** Loss of type checking, increased runtime errors

### 2.2 Layer Separation

**RULE 2.2.1: Presentation Layer Isolation**
- **Rule:** React components (pages, components) MUST NOT contain database queries
- **Why:** Separation of concerns, enables API reuse, prevents SQL injection exposure
- **Breaks if violated:** Security vulnerabilities, tight coupling, untestable code

**RULE 2.2.2: API Route Structure**
- **Rule:** All API endpoints MUST reside in `/app/api/*` with Next.js route handler pattern
- **Why:** Consistent routing, automatic API generation, middleware support
- **Breaks if violated:** Routing conflicts, middleware bypasses

**RULE 2.2.3: Business Logic Location**
- **Rule:** Reusable business logic MUST reside in `/lib/*` utilities, NOT in API routes
- **Why:** Code reuse, testability, consistency across endpoints
- **Breaks if violated:** Code duplication, inconsistent validation

### 2.3 Module Organization

**RULE 2.3.1: Core Utilities (lib/)**
```
lib/
├── config.ts          # Environment variables, constants (REQUIRED FIRST)
├── errors.ts          # Error classes and handlers
├── validation.ts      # Input validation functions
├── middleware.ts      # Authentication and authorization
├── database.ts        # Database connection and queries
├── auth.ts            # JWT generation and verification
├── email.ts           # Email sending utilities
├── logger.ts          # Structured logging
├── sanitization.ts    # Input sanitization
├── imageCompression.ts
└── pdfReceipt.ts
```

**RULE 2.3.2: Import Order Hierarchy**
- **Rule:** Imports MUST follow this order to prevent circular dependencies:
  1. config.ts (no internal imports allowed)
  2. errors.ts (only imports config)
  3. validation.ts, database.ts, auth.ts (import config, errors)
  4. middleware.ts (imports config, errors, auth)
  5. API routes (import all lib/* as needed)
- **Why:** Prevents circular dependency deadlocks
- **Breaks if violated:** Module resolution errors, undefined exports

### 2.4 File System Conventions

**RULE 2.4.1: API Route Naming**
- **Rule:** API routes MUST use `/route.ts` filename pattern (Next.js convention)
- **Why:** Framework requirement for route handlers
- **Breaks if violated:** Routes won't be recognized by Next.js

**RULE 2.4.2: Component Naming**
- **Rule:** React components MUST use PascalCase with `.tsx` extension
- **Why:** Convention for React components, JSX syntax support
- **Breaks if violated:** Naming confusion, JSX compilation issues

---

## 3. DATA RULES

### 3.1 Database Schema Integrity

**RULE 3.1.1: Foreign Key Enforcement**
- **Rule:** All relational tables MUST use foreign key constraints with appropriate ON DELETE actions
- **Why:** Maintains referential integrity, prevents orphaned records
- **Breaks if violated:** Data corruption, orphaned records, inconsistent state

**RULE 3.1.2: Enum Consistency**
- **Rule:** Database ENUMs MUST match TypeScript type definitions exactly
- **Why:** Type safety between database and application layer
- **Breaks if violated:** Runtime errors, type mismatches

**Example:**
```sql
-- Database
role ENUM('vendor', 'ngo', 'volunteer', 'admin')

-- TypeScript
export enum UserRole {
  VENDOR = 'vendor',
  NGO = 'ngo',
  ADMIN = 'admin',
  DONOR = 'donor',  // ❌ VIOLATION - not in database
}
```

**RULE 3.1.3: Status Field Pattern**
- **Rule:** All workflow entities (users, donations, requests) MUST have a `status` field
- **Why:** Enables state-based access control and workflow tracking
- **Breaks if violated:** Cannot implement approval workflows, access control fails

**Required Status Values:**
- Users: `pending`, `approved`, `rejected`, `suspended`
- Donations (UPI/Item): `pending`, `approved`, `rejected`, `collected` (items only)
- Pickup Requests: `pending`, `approved`, `rejected`, `completed`, `cancelled`
- Documents: `pending`, `approved`, `rejected`

### 3.2 Data Validation Rules

**RULE 3.2.1: Email Validation**
- **Rule:** Email MUST match regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` and be ≤255 chars
- **Why:** Prevents invalid emails, database field limit
- **Breaks if violated:** Database constraint errors, undeliverable emails

**RULE 3.2.2: Phone Validation (Indian Format)**
- **Rule:** Phone MUST be exactly 10 digits, starting with 6-9 (regex: `/^[6-9]\d{9}$/`)
- **Why:** Indian mobile number format compliance
- **Breaks if violated:** SMS delivery failures, validation errors

**RULE 3.2.3: Password Requirements**
- **Rule:** Password MUST be 8-128 chars with uppercase, lowercase, and digit
- **Why:** Security baseline, prevents weak passwords
- **Breaks if violated:** Account compromise risk

**RULE 3.2.4: Donation Amount Constraints**
- **Rule:** UPI donation amount MUST be ₹1 - ₹100,000 (configurable in DONATION_CONFIG)
- **Why:** Prevents accidental large donations, financial risk mitigation
- **Breaks if violated:** Financial losses, UPI limit errors

### 3.3 Data Flow Rules

**RULE 3.3.1: Campaign Association Pattern**
- **Rule:** Donation-to-campaign mapping MUST use config file (`config/event-donations.ts`), NOT database field
- **Why:** Design decision after campaign field was reverted (see CAMPAIGN_REVERSION_COMPLETE.md)
- **Breaks if violated:** Campaign filtering breaks, database schema mismatch

**Correct Pattern:**
```typescript
// config/event-donations.ts
export const eventDonations = {
  'republic-day-2026': {
    upiDonationIds: [1, 5, 12, 34],
    itemDonationIds: [3, 7, 19]
  }
}

// Query donations by ID instead of campaign field
SELECT * FROM upi_donations WHERE id IN (1, 5, 12, 34) AND status = 'approved'
```

**RULE 3.3.2: Transaction ID Generation**
- **Rule:** Transaction IDs MUST be generated server-side with format: `{TYPE}-{YYYYMMDD}-{HHMMSS}-{RANDOM}`
- **Why:** Prevents client-side manipulation, ensures uniqueness
- **Breaks if violated:** Duplicate transaction IDs, security risk

### 3.4 File Storage Rules

**RULE 3.4.1: Image Storage Format**
- **Rule:** Images MUST be stored as Base64 in LONGTEXT fields (current implementation)
- **Why:** Simplifies deployment, no external file storage dependency
- **Breaks if violated:** NULL pointer errors in image display
- **⚠️ Known Limitation:** Not scalable beyond ~10K images due to database size

**RULE 3.4.2: File Size Limits**
- **Rule:** Uploaded files MUST be ≤5MB (configurable via MAX_FILE_SIZE)
- **Why:** Prevents database bloat, reasonable upload times
- **Breaks if violated:** Database insert failures, upload timeouts

**RULE 3.4.3: Allowed File Types**
- **Images:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Documents:** `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`
- **Why:** Security (prevent executable uploads), compatibility
- **Breaks if violated:** Malware upload risk, rendering failures

---

## 4. CODING RULES

### 4.1 Code Style and Patterns

**RULE 4.1.1: Error Handling Pattern**
- **Rule:** ALL API routes MUST wrap logic in try-catch with `handleError(error as Error)`
- **Why:** Standardized error responses, consistent logging
- **Breaks if violated:** Inconsistent error formats, missing error logs

**Mandatory Pattern:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // Logic here
    return handleSuccess(data, 'Success message')
  } catch (error) {
    return handleError(error as Error)
  }
}
```

**RULE 4.1.2: Input Validation Pattern**
- **Rule:** ALL user inputs MUST be validated using `validateFields()` before use
- **Why:** Prevents SQL injection, XSS, data corruption
- **Breaks if violated:** Security vulnerabilities, data integrity issues

**Mandatory Pattern:**
```typescript
validateFields([
  { result: validateRequired(body.email, 'Email'), field: 'email' },
  { result: validateEmail(body.email), field: 'email' },
])
const cleanEmail = sanitizeEmail(body.email)
```

**RULE 4.1.3: Success Response Pattern**
- **Rule:** Successful operations MUST use `handleSuccess(data, message, statusCode?)`
- **Why:** Consistent API response structure for frontend parsing
- **Breaks if violated:** Frontend cannot reliably parse responses

**RULE 4.1.4: No Console Logging in Production**
- **Rule:** NEVER use `console.log`, `console.error`, `console.warn` directly
- **Why:** Unstructured logs, no timestamps, missing context
- **Use instead:** `logInfo()`, `logError()`, `logDebug()` from errors.ts

### 4.2 Authentication Patterns

**RULE 4.2.1: Protected Endpoint Pattern**
- **Rule:** Endpoints requiring authentication MUST use `createAuthContext(request)`
- **Why:** Standardized auth extraction, role checking, ownership validation
- **Breaks if violated:** Inconsistent auth checks, security bypasses

**Example:**
```typescript
const auth = createAuthContext(request)  // Throws if no token
auth.requireAdmin()  // Throws if not admin
auth.requireOwner(resourceOwnerId)  // Throws if not admin or owner
```

**RULE 4.2.2: JWT Token Extraction**
- **Rule:** Tokens MUST be read from `Authorization: Bearer {token}` header (NOT query params)
- **Why:** Security best practice, prevents token leakage in logs
- **Breaks if violated:** Token exposure in server logs, browser history

**RULE 4.2.3: Token Expiration**
- **Rule:** JWT tokens MUST expire in 7 days (configurable via JWT_EXPIRES_IN)
- **Why:** Security vs UX balance
- **Breaks if violated:** Longer = security risk, shorter = poor UX

### 4.3 Database Query Patterns

**RULE 4.3.1: Parameterized Queries**
- **Rule:** NEVER use string concatenation for SQL queries - ALWAYS use placeholders
- **Why:** Prevents SQL injection
- **Breaks if violated:** Critical security vulnerability

**❌ NEVER DO THIS:**
```typescript
const query = `SELECT * FROM users WHERE email = '${email}'`  // SQL INJECTION RISK
```

**✅ ALWAYS DO THIS:**
```typescript
const query = 'SELECT * FROM users WHERE email = ?'
const users = await executeQuery(query, [email])
```

**RULE 4.3.2: Transaction Usage**
- **Rule:** Multi-table operations MUST use `executeInTransaction()` for atomicity
- **Why:** Prevents partial updates, maintains data consistency
- **Breaks if violated:** Data corruption, orphaned records

**RULE 4.3.3: Type-Safe Queries**
- **Rule:** Query results MUST be typed with interface, not `any`
- **Why:** Type safety, IDE autocomplete, prevents runtime errors

**Example:**
```typescript
interface User { id: number; email: string; }
const users = await executeQuery<User[]>(query, params)
```

### 4.4 File Organization Rules

**RULE 4.4.1: One Concern Per File**
- **Rule:** Each API route file MUST handle only one HTTP method per resource
- **Why:** Code clarity, easier testing, predictable file structure
- **Breaks if violated:** Bloated files, testing difficulty

**RULE 4.4.2: Component File Structure**
- **Rule:** Complex components MUST follow this structure:
  1. Imports
  2. TypeScript interfaces
  3. Component definition
  4. Helper functions (if any)
  5. Exports
- **Why:** Readability, predictable structure
- **Breaks if violated:** Code navigation difficulty

---

## 5. INTERFACE RULES (API CONTRACTS)

### 5.1 Request/Response Format

**RULE 5.1.1: Success Response Structure**
- **Rule:** ALL successful responses MUST follow this structure:
```typescript
{
  success: true,
  data: <actual data>,
  message?: string,
  meta?: {
    timestamp: string,
    ...additional fields
  }
}
```
- **Why:** Consistent parsing logic in frontend
- **Breaks if violated:** Frontend cannot reliably detect success

**RULE 5.1.2: Error Response Structure**
- **Rule:** ALL error responses MUST follow this structure:
```typescript
{
  success: false,
  error: {
    message: string,
    statusCode: number,
    code: string,
    details?: any,
    stack?: string  // Only in development
  }
}
```
- **Why:** Standardized error handling, debugging support
- **Breaks if violated:** Unpredictable error handling

**RULE 5.1.3: HTTP Status Codes**
- **Rule:** Status codes MUST follow REST conventions:
  - 200 OK: Successful GET/PUT
  - 201 Created: Successful POST
  - 204 No Content: Successful DELETE
  - 400 Bad Request: Validation errors
  - 401 Unauthorized: Missing/invalid token
  - 403 Forbidden: Insufficient permissions
  - 404 Not Found: Resource doesn't exist
  - 409 Conflict: Duplicate entry
  - 500 Internal Server Error: Unhandled errors
- **Why:** Standard HTTP semantics, proper caching
- **Breaks if violated:** Client-side caching issues, confusing error messages

### 5.2 API Endpoint Contracts

**RULE 5.2.1: Public vs Protected Endpoints**

**Public Endpoints (No Auth Required):**
- `/api/auth/login` - User login
- `/api/auth/register` - User registration
- `/api/public/approved-donations` - View approved donations
- `/api/generate-upi-qr` - Generate UPI QR code

**Protected Endpoints (Auth Required):**
- `/api/donation-drive/upi` - Submit UPI donation (requires donorId)
- `/api/donation-drive/items` - Submit item donation
- `/api/pickup-requests` - Create/view pickup requests
- `/api/verification/*` - Verification workflows

**Admin-Only Endpoints:**
- `/api/admin/donations/*` - Approve/reject donations
- `/api/admin/verification/*` - Approve/reject user accounts

**RULE 5.2.2: Query Parameter Patterns**
- **Rule:** Optional filters MUST use query params (not path params)
- **Rule:** Resource IDs MUST use path params

**Examples:**
```
✅ GET /api/public/approved-donations?upiIds=1,5,12&type=upi
✅ GET /api/admin/donations/upi/123/approve
❌ GET /api/public/approved-donations/upi/1,5,12  // Wrong
```

### 5.3 Data Contracts

**RULE 5.3.1: Date/Time Format**
- **Rule:** All dates MUST be in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)
- **Why:** Timezone awareness, standard parsing
- **Breaks if violated:** Timezone bugs, parsing errors

**RULE 5.3.2: Currency Handling**
- **Rule:** All monetary amounts MUST be DECIMAL(10,2) in database, number in JSON
- **Why:** Precision (no floating-point errors)
- **Breaks if violated:** Currency calculation errors

**RULE 5.3.3: Phone Number Format**
- **Rule:** Phone numbers MUST be stored without country code (10 digits only)
- **Why:** Consistency, simpler validation
- **Breaks if violated:** Validation failures, duplicate entries

---

## 6. BEHAVIORAL RULES

### 6.1 User Registration and Verification Flow

**RULE 6.1.1: Registration State Machine**
- **Rule:** User accounts MUST follow this state transition:
  1. User registers → status = 'pending'
  2. User uploads documents → verification_profiles created
  3. Admin reviews → status = 'approved' OR 'rejected'
  4. Rejected users CANNOT access dashboards
- **Why:** Security, trust building, fraud prevention
- **Breaks if violated:** Unverified users access platform, fraud risk

**RULE 6.1.2: Dashboard Access Control**
- **Rule:** Dashboard routes MUST check user status:
  - `pending` → redirect to `/verification/status`
  - `rejected`/`suspended` → show error message
  - `approved` → allow access
- **Why:** Prevents unauthorized access
- **Breaks if violated:** Unverified users can list food, request pickups

### 6.2 Donation Workflow

**RULE 6.2.1: UPI Donation Flow**
```
1. Donor registers (individual_donors table)
2. Donor generates UPI QR (flexible or pre-filled)
3. Donor pays via UPI app
4. Donor uploads screenshot + amount
5. Backend creates upi_donations record (status='pending')
6. Admin reviews screenshot
7. Admin approves → status='approved' → appears on public page
   OR Admin rejects → status='rejected' → does not appear
```
- **Rule:** Step 7 MUST occur before donation is publicly visible
- **Why:** Prevents fraudulent donation claims
- **Breaks if violated:** Fake donations appear on public pages

**RULE 6.2.2: Item Donation Flow**
```
1. Donor submits item details + pickup datetime
2. Backend creates item_donations (status='pending')
3. Admin approves → status='approved' → schedules pickup
4. Team collects item → status='collected' → appears on public page
```
- **Rule:** Items MUST reach status='collected' to appear in donor wall
- **Why:** Only completed donations count toward impact
- **Breaks if violated:** Uncommitted donations counted

### 6.3 Food Listing and Pickup Flow

**RULE 6.3.1: Listing Lifecycle**
```
1. Vendor creates listing (status='available')
2. NGO requests pickup → listing status='reserved'
3. Vendor approves request → request status='approved'
4. Pickup completed → listing status='picked_up', request status='completed'
```
- **Rule:** Only ONE active request allowed per listing
- **Why:** Prevents double-booking
- **Breaks if violated:** Multiple NGOs claim same food

**RULE 6.3.2: Expiry Handling**
- **Rule:** Listings MUST have `expires_at` or `pickup_end_time`
- **Rule:** Expired listings MUST NOT appear in "available" listings
- **Why:** Food safety, prevents pickup of spoiled food
- **Breaks if violated:** Health and safety risk

### 6.4 File Upload Behavior

**RULE 6.4.1: Image Compression**
- **Rule:** Images MUST be compressed client-side before upload (max width: 1920px)
- **Why:** Reduces database size, faster uploads
- **Breaks if violated:** Database bloat, slow page loads

**RULE 6.4.2: File Naming**
- **Rule:** Original filenames MUST be sanitized (remove special characters, spaces)
- **Why:** Security, file system compatibility
- **Breaks if violated:** Path traversal vulnerabilities

---

## 7. SECURITY AND SAFETY RULES

### 7.1 Authentication Security

**RULE 7.1.1: JWT Secret Strength**
- **Rule:** JWT_SECRET MUST be ≥32 characters, randomly generated, NEVER default value
- **Why:** Prevents token forgery
- **Breaks if violated:** CRITICAL - All tokens can be forged
- **Enforced by:** config.ts validation on startup

**RULE 7.1.2: Password Hashing**
- **Rule:** Passwords MUST be hashed with bcrypt (10 rounds minimum)
- **Why:** Prevents plaintext password leakage
- **Breaks if violated:** Database breach exposes all passwords

**RULE 7.1.3: Token Storage**
- **Rule:** Tokens MUST be stored in localStorage (current) or httpOnly cookies (recommended)
- **Why:** XSS protection
- **Breaks if violated:** Token theft via XSS

### 7.2 Input Sanitization

**RULE 7.2.1: String Sanitization**
- **Rule:** ALL user-provided strings MUST be sanitized via `sanitizeString()`
- **Why:** Prevents XSS, SQL injection
- **Breaks if violated:** Malicious script execution

**RULE 7.2.2: Email Sanitization**
- **Rule:** Emails MUST be lowercased and trimmed via `sanitizeEmail()`
- **Why:** Prevents duplicate accounts (John@Example.com vs john@example.com)
- **Breaks if violated:** Duplicate user accounts

**RULE 7.2.3: HTML Encoding**
- **Rule:** User-generated content displayed in HTML MUST be React-rendered (auto-escaped)
- **Why:** XSS prevention
- **Breaks if violated:** XSS vulnerability

### 7.3 Access Control

**RULE 7.3.1: Role-Based Access Control**
- **Rule:** Endpoints MUST enforce role requirements:
  - Admin-only: `/api/admin/*`
  - Vendor-only: `/api/listings/*` (create, edit)
  - NGO-only: `/api/pickup-requests/*` (create)
- **Why:** Prevents privilege escalation
- **Breaks if violated:** NGOs can delete vendor listings, etc.

**RULE 7.3.2: Ownership Validation**
- **Rule:** Users MUST only modify resources they own (unless admin)
- **Rule:** Use `auth.requireOwner(resourceOwnerId)` pattern
- **Why:** Prevents unauthorized modifications
- **Breaks if violated:** Users can edit others' data

### 7.4 Environment Variable Security

**RULE 7.4.1: Secret Management**
- **Rule:** NEVER commit `.env` file to version control
- **Rule:** Use `.env.example` with placeholder values
- **Why:** Prevents credential leakage
- **Breaks if violated:** Database credentials exposed publicly

**RULE 7.4.2: Production Secrets**
- **Rule:** Production JWT_SECRET MUST differ from development
- **Rule:** Production DB password MUST be strong (16+ characters)
- **Why:** Limits blast radius of credential leak
- **Breaks if violated:** Dev credential leak compromises production

### 7.5 SQL Injection Prevention

**RULE 7.5.1: No String Concatenation**
- **Rule:** SQL queries MUST use parameterized statements (never template literals)
- **Why:** Prevents SQL injection
- **Breaks if violated:** CRITICAL - Full database compromise

**RULE 7.5.2: Query Whitelisting**
- **Rule:** Dynamic ORDER BY, LIMIT values MUST be whitelisted
- **Why:** Prevents injection through non-parameterizable clauses
- **Breaks if violated:** SQL injection bypass

---

## 8. PERFORMANCE AND SCALABILITY RULES

### 8.1 Database Performance

**RULE 8.1.1: Index Requirements**
- **Rule:** Foreign keys MUST have indexes
- **Rule:** Frequently queried columns MUST have indexes:
  - users.email (UNIQUE)
  - users.role
  - users.status
  - upi_donations.status
  - upi_donations.donor_id
  - food_listings.status
  - pickup_requests.status
- **Why:** Query performance, prevents full table scans
- **Breaks if violated:** Slow queries as data grows

**RULE 8.1.2: Connection Pool Sizing**
- **Rule:** DB_CONNECTION_LIMIT MUST be set based on server specs:
  - Small VPS (2GB RAM): 20 connections
  - Medium server (8GB RAM): 50 connections
  - Large server (16GB+ RAM): 100 connections
- **Why:** Prevents connection exhaustion
- **Breaks if violated:** "Too many connections" errors

**RULE 8.1.3: Query Result Limits**
- **Rule:** Large result sets MUST use LIMIT and pagination
- **Rule:** Never SELECT * without LIMIT for tables >1000 rows
- **Why:** Prevents memory exhaustion
- **Breaks if violated:** Server crashes on large datasets

### 8.2 Frontend Performance

**RULE 8.2.1: Image Optimization**
- **Rule:** Images MUST be compressed before display (max width: 1920px, quality: 80%)
- **Why:** Page load speed
- **Breaks if violated:** Slow page loads, poor mobile experience

**RULE 8.2.2: Component Lazy Loading**
- **Rule:** Heavy components (galleries, maps) MUST use dynamic imports
- **Why:** Reduces initial bundle size
- **Breaks if violated:** Slow first page load

**RULE 8.2.3: Auto-Refresh Intervals**
- **Rule:** Auto-refresh intervals MUST be ≥30 seconds
- **Why:** Prevents server overload
- **Breaks if violated:** Excessive database queries

### 8.3 File Storage Scalability

**RULE 8.3.1: Base64 Storage Limitation**
- **Rule:** Base64 image storage MUST be replaced with cloud storage (S3, Cloudinary) if:
  - Image count exceeds 10,000 OR
  - Database size exceeds 5GB
- **Why:** Database performance degradation
- **Breaks if violated:** Slow queries, backup failures

**RULE 8.3.2: File Size Enforcement**
- **Rule:** MAX_FILE_SIZE MUST be enforced both client and server-side
- **Why:** Prevents database bloat from single large file
- **Breaks if violated:** Database growth spike, upload failures

---

## 9. ERROR HANDLING AND LOGGING RULES

### 9.1 Error Classification

**RULE 9.1.1: Operational vs Non-Operational Errors**
- **Operational** (expected, recoverable):
  - ValidationError
  - AuthenticationError
  - NotFoundError
  - ConflictError
- **Non-Operational** (unexpected, requires investigation):
  - DatabaseError
  - Unhandled exceptions
- **Why:** Determines logging level and alerting
- **Breaks if violated:** Alert fatigue, missed critical errors

**RULE 9.1.2: Error Response Safety**
- **Rule:** NEVER expose stack traces in production
- **Rule:** NEVER expose SQL queries or database errors to users
- **Why:** Security (prevents information leakage)
- **Breaks if violated:** Attackers learn database structure

### 9.2 Logging Standards

**RULE 9.2.1: Structured Logging Format**
- **Rule:** All logs MUST be JSON with timestamp, level, message, context
- **Why:** Enables log aggregation, searchability
- **Breaks if violated:** Difficult troubleshooting

**Example:**
```json
{
  "timestamp": "2026-01-22T10:30:00.000Z",
  "level": "error",
  "message": "UPI donation submission failed",
  "context": {
    "donorId": 123,
    "amount": 500,
    "error": "Invalid transaction ID"
  }
}
```

**RULE 9.2.2: Log Levels**
- **debug**: Detailed diagnostic info (development only)
- **info**: Normal operational events
- **warn**: Recoverable errors (operational errors)
- **error**: Unhandled exceptions (non-operational)
- **Why:** Proper alerting and filtering
- **Breaks if violated:** Missed critical errors in noise

**RULE 9.2.3: Sensitive Data Redaction**
- **Rule:** NEVER log passwords, tokens, full credit card numbers
- **Rule:** Log only last 4 digits of phone/Aadhaar
- **Why:** Compliance, security
- **Breaks if violated:** Data breach, compliance violation

### 9.3 Error Recovery

**RULE 9.3.1: Database Retry Logic**
- **Rule:** Connection errors MUST be retried up to 3 times with exponential backoff
- **Why:** Handles transient network issues
- **Breaks if violated:** Failures on temporary connection issues
- **Implemented in:** database.ts executeQuery()

**RULE 9.3.2: Transaction Rollback**
- **Rule:** Failed transactions MUST rollback completely (no partial commits)
- **Why:** Data consistency
- **Breaks if violated:** Corrupt database state
- **Implemented in:** database.ts executeInTransaction()

---

## 10. PROJECT INVARIANTS

**Invariants are conditions that MUST ALWAYS be true. Violating these breaks core assumptions.**

### 10.1 Data Integrity Invariants

**INVARIANT 10.1.1: User Uniqueness**
- **Rule:** No two users can have the same email address
- **Enforced by:** Database UNIQUE constraint on users.email
- **Why:** Email is the primary identifier
- **Breaks if violated:** Login conflicts, duplicate accounts

**INVARIANT 10.1.2: Referential Integrity**
- **Rule:** All foreign keys MUST reference existing records
- **Enforced by:** Database FOREIGN KEY constraints
- **Why:** Prevents orphaned records
- **Breaks if violated:** Cannot join tables, data corruption

**INVARIANT 10.1.3: Status Consistency**
- **Rule:** Only 'approved' donations appear on public pages
- **Enforced by:** WHERE status = 'approved' clauses
- **Why:** Trust, fraud prevention
- **Breaks if violated:** Unverified donations shown publicly

### 10.2 Security Invariants

**INVARIANT 10.2.1: Authentication Gate**
- **Rule:** Protected routes MUST validate JWT before execution
- **Enforced by:** createAuthContext() throws if invalid
- **Why:** Authorization cannot occur without authentication
- **Breaks if violated:** Unauthenticated access to protected data

**INVARIANT 10.2.2: Admin Approval Required**
- **Rule:** User status='pending' CANNOT access role-specific dashboards
- **Enforced by:** Dashboard middleware checks
- **Why:** Prevents unverified users from platform actions
- **Breaks if violated:** Fake vendors list food, fraudulent donations

**INVARIANT 10.2.3: Password Storage**
- **Rule:** Passwords MUST NEVER be stored in plaintext
- **Enforced by:** bcrypt hashing in registration
- **Why:** Security baseline
- **Breaks if violated:** Catastrophic security breach

### 10.3 Business Logic Invariants

**INVARIANT 10.3.1: Transaction ID Uniqueness**
- **Rule:** Every UPI/item donation has a unique transaction_id
- **Enforced by:** Server-side generation with timestamp + random
- **Why:** Enables tracking, prevents duplicates
- **Breaks if violated:** Cannot distinguish donations

**INVARIANT 10.3.2: Food Safety Timeline**
- **Rule:** pickup_end_time MUST be before expires_at (if both exist)
- **Enforced by:** Application validation (not database constraint)
- **Why:** Food safety, prevents pickup of expired food
- **Breaks if violated:** Health risk

**INVARIANT 10.3.3: Donation Amount Range**
- **Rule:** UPI donations MUST be ₹1 - ₹100,000
- **Enforced by:** validateDonationAmount() validation
- **Why:** Prevents errors, fraud detection
- **Breaks if violated:** Financial losses, UPI payment failures

### 10.4 Architectural Invariants

**INVARIANT 10.4.1: Single Database Connection Pool**
- **Rule:** Only ONE database connection pool exists per process
- **Enforced by:** Singleton pattern in database.ts
- **Why:** Connection management, prevents exhaustion
- **Breaks if violated:** Connection pool exhaustion

**INVARIANT 10.4.2: Configuration Load Order**
- **Rule:** config.ts MUST be imported before any module that uses environment variables
- **Enforced by:** ESLint rules, code review
- **Why:** Environment validation occurs before use
- **Breaks if violated:** Runtime errors, invalid configuration

**INVARIANT 10.4.3: Error Response Structure**
- **Rule:** All API errors return `{ success: false, error: {...} }`
- **Enforced by:** handleError() utility
- **Why:** Frontend expects consistent structure
- **Breaks if violated:** Frontend cannot parse errors

---

## 11. DEVELOPMENT GUIDELINES

### 11.1 Allowed Changes

**Changes that DO NOT require architecture review:**
1. Adding new validation rules to existing validators
2. Adding new error messages to config.ts
3. Creating new UI components
4. Adding database indexes for performance
5. Modifying email templates
6. Adding new admin dashboard features
7. UI styling and layout improvements
8. Adding unit tests

**Why:** These changes maintain existing patterns and don't alter core architecture.

### 11.2 Changes Requiring Refactoring

**Changes that REQUIRE architectural discussion:**
1. Changing database schema (adding/removing tables or columns)
2. Modifying authentication mechanism (JWT → OAuth, etc.)
3. Changing file storage approach (Base64 → S3)
4. Altering campaign association pattern
5. Adding new user roles
6. Changing status workflows
7. Modifying error handling patterns
8. Adding real-time features (WebSockets)

**Why:** These changes affect multiple components and may break invariants.

### 11.3 Forbidden Changes

**Changes that are STRICTLY FORBIDDEN:**
1. ❌ Removing input validation from any endpoint
2. ❌ Storing passwords in plaintext
3. ❌ Removing JWT authentication
4. ❌ Using string concatenation for SQL queries
5. ❌ Exposing admin endpoints without auth
6. ❌ Removing foreign key constraints
7. ❌ Committing environment variables
8. ❌ Using `any` type instead of proper interfaces
9. ❌ Removing status checks from public donation endpoints

**Why:** These violate security invariants and will introduce critical vulnerabilities.

### 11.4 Adding New Features Safely

**Process for adding a new feature:**

1. **Design Phase**
   - Document data schema changes
   - Define API contracts (request/response)
   - Identify affected invariants
   - Plan migration strategy (if needed)

2. **Implementation Phase**
   - Create database migration SQL
   - Update TypeScript interfaces in types/
   - Implement validation functions
   - Create API routes with error handling
   - Build frontend components
   - Add to event configuration (if event-related)

3. **Testing Phase**
   - Test all validation rules
   - Test authentication/authorization
   - Test error scenarios
   - Test data integrity (foreign keys)
   - Test with realistic data volumes

4. **Deployment Phase**
   - Run database migration
   - Deploy backend changes
   - Deploy frontend changes
   - Monitor error logs

### 11.5 Technical Debt Management

**Current Known Technical Debt:**

1. **Base64 Image Storage**
   - **Issue:** Not scalable beyond ~10K images
   - **Resolution:** Migrate to cloud storage (S3, Cloudinary)
   - **Priority:** Medium (address before 10K images)

2. **Campaign ID Mapping**
   - **Issue:** Manual ID assignment in config file
   - **Resolution:** Add campaign database table or use tags
   - **Priority:** Low (current solution works)

3. **Rate Limiting**
   - **Issue:** Configuration exists but not enforced
   - **Resolution:** Implement middleware with Redis
   - **Priority:** High (before production scaling)

4. **Email Verification**
   - **Issue:** Not implemented (emailVerified field unused)
   - **Resolution:** Add verification link workflow
   - **Priority:** Medium (fraud prevention)

5. **Real-Time Updates**
   - **Issue:** Uses polling (30s intervals)
   - **Resolution:** Implement WebSocket or Server-Sent Events
   - **Priority:** Low (polling acceptable for MVP)

**Debt Reduction Rule:**
- **RULE:** For every 3 features added, 1 technical debt item must be addressed
- **Why:** Prevents debt accumulation
- **Breaks if violated:** Maintenance becomes unsustainable

---

## 12. AMBIGUITIES & RISKS

### 12.1 Unclear or Under-Documented Areas

**AMBIGUITY 12.1.1: Volunteer Role**
- **Issue:** Volunteer role exists in database but no associated workflows
- **Impact:** Unclear if volunteers facilitate pickups or are dormant users
- **Recommendation:** Either implement volunteer pickup assignment or remove role

**AMBIGUITY 12.1.2: Geographic Search**
- **Issue:** latitude/longitude stored but no proximity search implemented
- **Impact:** NGOs cannot filter vendors by distance
- **Recommendation:** Add PostGIS extension or haversine formula search

**AMBIGUITY 12.1.3: Payment Gateway Integration**
- **Issue:** UPI QR code shown but no automated payment verification
- **Impact:** Relies on screenshot uploads, fraud risk
- **Recommendation:** Integrate UPI intent APIs or payment gateway

### 12.2 Implicit Rules Enforced by Code

**IMPLICIT RULE 12.2.1: Single Active Request**
- **Where:** Pickup request creation logic
- **Rule:** One listing cannot have multiple pending requests
- **Not documented in:** Database constraints
- **Risk:** Application logic bypass could allow double-booking

**IMPLICIT RULE 12.2.2: Donor Registration Required**
- **Where:** UPI donation endpoint validates donorId
- **Rule:** Cannot donate without registering as donor first
- **Not documented in:** API documentation
- **Risk:** Confusing user flow if not communicated

**IMPLICIT RULE 12.2.3: Campaign Config Precedence**
- **Where:** Event pages read from config/event-donations.ts
- **Rule:** Database campaign field (if exists) is ignored
- **Not documented in:** Database schema
- **Risk:** Schema confusion, accidental use of deprecated field

### 12.3 Architectural Risks

**RISK 12.3.1: Database Size Growth**
- **Threat:** Base64 images grow database to 100GB+
- **Impact:** Backup failures, slow queries, hosting costs
- **Mitigation:** Migrate to cloud storage before 10K images
- **Current Status:** ~500 images (safe zone)

**RISK 12.3.2: Connection Pool Exhaustion**
- **Threat:** Traffic spike exceeds DB_CONNECTION_LIMIT
- **Impact:** "Too many connections" errors, service outage
- **Mitigation:** Implement connection queue, horizontal scaling
- **Current Status:** No load testing performed

**RISK 12.3.3: Email Delivery Failures**
- **Threat:** Gmail blocks account due to spam reports
- **Impact:** No email notifications, verification broken
- **Mitigation:** Use dedicated email service (SendGrid, AWS SES)
- **Current Status:** Gmail SMTP (acceptable for <100 emails/day)

### 12.4 Security Risks

**RISK 12.4.1: Token Theft via XSS**
- **Threat:** Malicious script steals JWT from localStorage
- **Impact:** Account takeover
- **Mitigation:** Use httpOnly cookies instead of localStorage
- **Current Status:** localStorage used (common but less secure)

**RISK 12.4.2: CSRF Attacks**
- **Threat:** State-changing requests via forged links
- **Impact:** Unauthorized actions
- **Mitigation:** Add CSRF tokens, SameSite cookie attribute
- **Current Status:** Not implemented

**RISK 12.4.3: Unvalidated Redirects**
- **Threat:** Open redirect via query parameters
- **Impact:** Phishing attacks
- **Mitigation:** Whitelist allowed redirect URLs
- **Current Status:** Not fully audited

### 12.5 Areas Where Contributors May Make Mistakes

**MISTAKE-PRONE AREA 12.5.1: Adding New API Routes**
- **Common Error:** Forgetting error handling try-catch
- **Prevention:** Template pattern in API_REFACTORING_GUIDE.md
- **Detection:** Code review checklist

**MISTAKE-PRONE AREA 12.5.2: Database Queries**
- **Common Error:** Using string concatenation instead of parameterized queries
- **Prevention:** ESLint rules, code review
- **Detection:** Static analysis tools

**MISTAKE-PRONE AREA 12.5.3: Status Field Updates**
- **Common Error:** Updating status without checking current state
- **Prevention:** State machine validation functions
- **Detection:** Integration tests

**MISTAKE-PRONE AREA 12.5.4: Campaign Association**
- **Common Error:** Querying by campaign field instead of config IDs
- **Prevention:** Document campaign reversion in onboarding
- **Detection:** API tests will fail (no campaign field in schema)

**MISTAKE-PRONE AREA 12.5.5: Role Confusion**
- **Common Error:** Confusing user.role vs userType (inconsistent naming)
- **Prevention:** Standardize to `role` everywhere
- **Detection:** TypeScript type errors

---

## 13. FUTURE EVOLUTION GUIDELINES

### 13.1 Scaling Considerations

**When daily active users exceed 1,000:**
1. Implement Redis caching for frequent queries
2. Add database read replicas
3. Migrate images to CDN
4. Implement API rate limiting
5. Add monitoring (Sentry, DataDog)

**When donor count exceeds 10,000:**
1. Migrate to cloud file storage (S3)
2. Implement database sharding
3. Add search service (Elasticsearch)
4. Implement job queue (Bull, AWS SQS)

### 13.2 Feature Roadmap Alignment

**All future features MUST:**
1. Maintain status-based approval workflows
2. Follow validation → sanitization → query pattern
3. Use handleError/handleSuccess responses
4. Support all existing user roles
5. Maintain backward API compatibility

**Breaking changes REQUIRE:**
1. API versioning (v1 → v2)
2. Migration guide
3. Deprecation notice period (30 days minimum)
4. Database migration scripts

---

## 14. ENFORCEMENT AND COMPLIANCE

### 14.1 Code Review Checklist

**Every pull request MUST verify:**
- [ ] All API routes use try-catch with handleError
- [ ] All inputs validated with validateFields
- [ ] All SQL queries use parameterized statements
- [ ] Authentication enforced on protected routes
- [ ] No console.log statements
- [ ] TypeScript interfaces defined (no `any`)
- [ ] No environment variables in code
- [ ] Success responses use handleSuccess
- [ ] Error classes used instead of generic Error

### 14.2 Automated Checks

**Pre-commit hooks MUST check:**
- TypeScript compilation (`tsc --noEmit`)
- ESLint rules
- No .env file staged
- No console.log in production code

**CI/CD pipeline MUST verify:**
- All tests pass
- No security vulnerabilities (`npm audit`)
- Database migration runs successfully
- API contract tests pass

### 14.3 Documentation Updates

**When changing:**
- Database schema → Update db.sql + migration SQL
- API contract → Update API_REFACTORING_GUIDE.md
- Environment variables → Update .env.example
- Deployment process → Update DEPLOYMENT.md
- Testing flows → Update TESTING_CHECKLIST.md
- **This blueprint** → If violating a rule, document exception and reasoning

---

## APPENDIX A: Quick Reference

### Environment Variables (Required)
```bash
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
JWT_SECRET (32+ chars)
SMTP_USER, SMTP_PASS
```

### Key File Locations
- **Configuration:** lib/config.ts
- **Error Handling:** lib/errors.ts
- **Validation:** lib/validation.ts
- **Authentication:** lib/middleware.ts
- **Database:** lib/database.ts
- **Event Donations:** config/event-donations.ts

### Common Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Check code quality
npm run type-check   # TypeScript validation
```

### Database Tables
- users, vendor_profiles, ngo_profiles
- food_listings, pickup_requests
- individual_donors, upi_donations, item_donations
- verification_documents, verification_profiles
- impact_photos

---

## APPENDIX B: Decision Log

**Decision:** Campaign field reverted from database to config  
**Date:** January 2025  
**Rationale:** Avoid schema changes, simplify deployment  
**Documented in:** CAMPAIGN_REVERSION_COMPLETE.md

**Decision:** Base64 image storage in database  
**Date:** Project inception  
**Rationale:** Simplicity, no external dependencies  
**Limitation:** Not scalable beyond 10K images  
**Future:** Migrate to S3 when needed

**Decision:** JWT in localStorage (not httpOnly cookies)  
**Date:** Project inception  
**Rationale:** Simplicity, client-side routing  
**Risk:** XSS vulnerability  
**Future:** Consider httpOnly cookies for production

---

## DOCUMENT MAINTENANCE

**This blueprint MUST be updated when:**
- New architectural patterns are introduced
- Invariants change (requires team discussion)
- Major refactoring occurs
- Security vulnerabilities are discovered
- Ambiguities are resolved

**Version History:**
- v1.0 (2026-01-22): Initial blueprint created from codebase analysis

**Next Review:** 2026-04-01 or when database exceeds 5GB

---

**END OF BLUEPRINT**

This document represents the complete ruleset for Annadaan project development. All contributors must treat this as the single source of truth. When in doubt, refer to this blueprint. When the blueprint is unclear, update it—don't work around it.
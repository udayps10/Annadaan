# Authentication Flow Diagrams

## New User Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW USER REGISTRATION                         │
└─────────────────────────────────────────────────────────────────┘

    User                    Frontend                Backend              Database
     │                         │                      │                    │
     │   Visit /register       │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Fill Form:            │                      │                    │
     │   - Full Name           │                      │                    │
     │   - Phone               │                      │                    │
     │   - Email               │                      │                    │
     │   - Password ✨         │                      │                    │
     │   - Confirm Password ✨ │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Submit                │                      │                    │
     ├────────────────────────►│  POST /api/register  │                    │
     │                         ├─────────────────────►│                    │
     │                         │                      │                    │
     │                         │                      │  Validate data     │
     │                         │                      │  Hash password     │
     │                         │                      │  (bcryptjs)        │
     │                         │                      ├───────────────────►│
     │                         │                      │  INSERT INTO       │
     │                         │                      │  individual_donors │
     │                         │                      │  (password_hash,   │
     │                         │                      │   requires_update=0)│
     │                         │                      │◄───────────────────┤
     │                         │                      │  Success           │
     │                         │◄─────────────────────┤                    │
     │                         │  { donorId, ... }    │                    │
     │◄────────────────────────┤                      │                    │
     │   Success!              │                      │                    │
     │                         │                      │                    │
     │   Redirect to           │                      │                    │
     │   /donate               │                      │                    │
     └─────────────────────────┴──────────────────────┴────────────────────┘

```

## New User Login Flow (Password-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│              NEW USER LOGIN (PASSWORD METHOD)                    │
└─────────────────────────────────────────────────────────────────┘

    User                    Frontend                Backend              Database
     │                         │                      │                    │
     │   Visit /login          │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Select "Password" Tab │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Enter:                │                      │                    │
     │   - Phone               │                      │                    │
     │   - Password            │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Submit                │                      │                    │
     ├────────────────────────►│  POST /api/login     │                    │
     │                         ├─────────────────────►│                    │
     │                         │  { phone, password } │                    │
     │                         │                      │                    │
     │                         │                      │  Query donor       │
     │                         │                      │  by phone          │
     │                         │                      ├───────────────────►│
     │                         │                      │  SELECT * WHERE    │
     │                         │                      │  phone = ?         │
     │                         │                      │◄───────────────────┤
     │                         │                      │  donor data +      │
     │                         │                      │  password_hash     │
     │                         │                      │                    │
     │                         │                      │  Verify password   │
     │                         │                      │  bcrypt.compare()  │
     │                         │                      │                    │
     │                         │                      │  ✓ Match!          │
     │                         │                      │                    │
     │                         │◄─────────────────────┤                    │
     │                         │  { donorId,          │                    │
     │                         │    requiresUpdate:   │                    │
     │                         │    false }           │                    │
     │◄────────────────────────┤                      │                    │
     │   Success!              │                      │                    │
     │                         │                      │                    │
     │   Redirect to           │                      │                    │
     │   /donate               │                      │                    │
     └─────────────────────────┴──────────────────────┴────────────────────┘

```

## Existing User Migration Flow (Aadhaar → Password)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│         EXISTING USER LOGIN & PASSWORD MIGRATION (ONE-TIME FLOW)                │
└─────────────────────────────────────────────────────────────────────────────────┘

    User                    Frontend                Backend              Database
     │                         │                      │                    │
     │   Visit /login          │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Select "Aadhaar" Tab  │                      │                    │
     ├────────────────────────►│                      │                    │
     │   (Legacy)              │                      │                    │
     │                         │                      │                    │
     │   Enter:                │                      │                    │
     │   - Phone               │                      │                    │
     │   - Last 4 Aadhaar      │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Submit                │                      │                    │
     ├────────────────────────►│  POST /api/login     │                    │
     │                         ├─────────────────────►│                    │
     │                         │  { phone,            │                    │
     │                         │    aadhaarLast4 }    │                    │
     │                         │                      │                    │
     │                         │                      │  Query donor       │
     │                         │                      ├───────────────────►│
     │                         │                      │  SELECT * WHERE    │
     │                         │                      │  phone = ? AND     │
     │                         │                      │  RIGHT(aadhaar,4)=?│
     │                         │                      │◄───────────────────┤
     │                         │                      │  donor data        │
     │                         │                      │  password_hash: NULL│
     │                         │                      │                    │
     │                         │                      │  Check: no password│
     │                         │                      │  Set flag          │
     │                         │                      ├───────────────────►│
     │                         │                      │  UPDATE SET        │
     │                         │                      │  requires_update=1 │
     │                         │                      │◄───────────────────┤
     │                         │◄─────────────────────┤                    │
     │                         │  { donorId,          │                    │
     │                         │    requiresUpdate:   │                    │
     │                         │    true } ⚠️         │                    │
     │◄────────────────────────┤                      │                    │
     │   "Please setup         │                      │                    │
     │    password"            │                      │                    │
     │                         │                      │                    │
     │   Redirect to           │                      │                    │
     │   /setup-password       │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   ┌────────────────────────────────────────┐   │                    │
     │   │    PASSWORD SETUP PAGE                 │   │                    │
     │   └────────────────────────────────────────┘   │                    │
     │                         │                      │                    │
     │   Enter:                │                      │                    │
     │   - New Password        │                      │                    │
     │   - Confirm Password    │                      │                    │
     ├────────────────────────►│                      │                    │
     │                         │                      │                    │
     │   Submit                │                      │                    │
     ├────────────────────────►│  POST /api/          │                    │
     │                         │  setup-password      │                    │
     │                         ├─────────────────────►│                    │
     │                         │  { donorId,          │                    │
     │                         │    password,         │                    │
     │                         │    confirmPassword } │                    │
     │                         │                      │                    │
     │                         │                      │  Hash password     │
     │                         │                      │  (bcryptjs)        │
     │                         │                      │                    │
     │                         │                      │  Update donor      │
     │                         │                      ├───────────────────►│
     │                         │                      │  UPDATE SET        │
     │                         │                      │  password_hash=?,  │
     │                         │                      │  requires_update=0 │
     │                         │                      │◄───────────────────┤
     │                         │                      │  Success           │
     │                         │◄─────────────────────┤                    │
     │◄────────────────────────┤  Success!            │                    │
     │   "Password set!"       │                      │                    │
     │                         │                      │                    │
     │   Redirect to           │                      │                    │
     │   /donate               │                      │                    │
     │                         │                      │                    │
     │   ┌────────────────────────────────────────┐   │                    │
     │   │  NEXT LOGIN: Must use PASSWORD tab!    │   │                    │
     │   │  (Aadhaar no longer works)            │   │                    │
     │   └────────────────────────────────────────┘   │                    │
     └─────────────────────────┴──────────────────────┴────────────────────┘

```

## Database State Transitions

```
┌────────────────────────────────────────────────────────────────┐
│                  DATABASE STATE FLOW                            │
└────────────────────────────────────────────────────────────────┘

EXISTING USER (Before Migration)
┌──────────────────────────────────────────┐
│ individual_donors                         │
├──────────────────────────────────────────┤
│ id: 123                                   │
│ full_name: "John Doe"                     │
│ phone: "9876543210"                       │
│ email: "john@example.com"                 │
│ aadhaar_number: "123456789012"            │
│ password_hash: NULL                       │◄── No password yet
│ requires_password_update: 0               │
└──────────────────────────────────────────┘
                    │
                    │ First login with Aadhaar after update
                    ▼
┌──────────────────────────────────────────┐
│ individual_donors                         │
├──────────────────────────────────────────┤
│ id: 123                                   │
│ full_name: "John Doe"                     │
│ phone: "9876543210"                       │
│ email: "john@example.com"                 │
│ aadhaar_number: "123456789012"            │
│ password_hash: NULL                       │◄── Still no password
│ requires_password_update: 1               │◄── Flag set!
└──────────────────────────────────────────┘
                    │
                    │ User sets password
                    ▼
┌──────────────────────────────────────────┐
│ individual_donors                         │
├──────────────────────────────────────────┤
│ id: 123                                   │
│ full_name: "John Doe"                     │
│ phone: "9876543210"                       │
│ email: "john@example.com"                 │
│ aadhaar_number: "123456789012"            │◄── Kept for records
│ password_hash: "$2a$10$..."              │◄── Password saved!
│ requires_password_update: 0               │◄── Flag cleared
└──────────────────────────────────────────┘


NEW USER (After Migration)
┌──────────────────────────────────────────┐
│ individual_donors                         │
├──────────────────────────────────────────┤
│ id: 456                                   │
│ full_name: "Jane Smith"                   │
│ phone: "9123456789"                       │
│ email: "jane@example.com"                 │
│ aadhaar_number: NULL                      │◄── Not required!
│ password_hash: "$2a$10$..."              │◄── Password from start
│ requires_password_update: 0               │◄── No migration needed
└──────────────────────────────────────────┘

```

## Login Page UI Flow

```
┌────────────────────────────────────────────────────────────────┐
│                      LOGIN PAGE UI                              │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  ┌─────────────┬──────────────────────┐ │
│  │ 🔐 Password │ 🆔 Aadhaar (Legacy)  │ │  ◄── Toggle Tabs
│  └─────────────┴──────────────────────┘ │
│                                          │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃ PASSWORD TAB (Active by default)  ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                          │
│  Phone Number *                          │
│  ┌────────────────────────────────────┐ │
│  │ 9876543210                         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Password *                              │
│  ┌────────────────────────────────┬──┐ │
│  │ ••••••••••                     │👁️│ │
│  └────────────────────────────────┴──┘ │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         Login 🚀                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘

                    VS

┌─────────────────────────────────────────┐
│  ┌──────────────┬─────────────────────┐ │
│  │   Password   │ 🆔 Aadhaar (Legacy) │ │  ◄── Toggle Tabs
│  └──────────────┴─────────────────────┘ │
│                                          │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│  ┃ AADHAAR TAB (Legacy - Existing)   ┃ │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                          │
│  ⚠️ Existing users only: After login,   │
│     you'll be prompted to set password  │
│                                          │
│  Phone Number *                          │
│  ┌────────────────────────────────────┐ │
│  │ 9876543210                         │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Last 4 Digits of Aadhaar *              │
│  ┌────────────────────────────────────┐ │
│  │ 9012                               │ │
│  └────────────────────────────────────┘ │
│  For security, only last 4 digits       │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │         Login 🚀                   │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘

```

---

## Summary

✅ **New Users:** Simple registration with password, login with password  
✅ **Existing Users:** One-time Aadhaar login → forced password setup → future logins use password  
✅ **Security:** bcrypt hashing, strong password requirements, clear UI  
✅ **UX:** Smooth transitions, helpful messages, intuitive flows

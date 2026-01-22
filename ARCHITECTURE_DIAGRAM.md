# 🏗️ Republic Day 2026 System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                            │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │   Homepage   │  │ Event Page   │  │  Donate UPI  │
        │   page.tsx   │  │republic-day  │  │   page.tsx   │
        │              │  │  -2026/      │  │              │
        │ [Modal Pop]  │  │  page.tsx    │  │ [QR + Link]  │
        └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
               │                 │                 │
               │                 │                 │
               └────────┬────────┴─────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION COMPONENTS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐      ┌────────────────────────────┐     │
│  │EventAnnouncementModal│      │ApprovedDonationsDisplay    │     │
│  │ • Shows once/session │      │ • Fetches approved donors  │     │
│  │ • Drives traffic     │      │ • Auto-refreshes (30s)     │     │
│  │ • Session storage    │      │ • Displays donor wall      │     │
│  └──────────────────────┘      └────────────────────────────┘     │
│                                                                      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │/api/generate-   │  │/api/donation-│  │/api/public/approved- │  │
│  │    upi-qr       │  │   drive/upi  │  │      donations       │  │
│  │                 │  │              │  │                      │  │
│  │• includeAmount  │  │• Accepts     │  │• Public endpoint     │  │
│  │• QR generation  │  │  campaign    │  │• WHERE approved only │  │
│  │• Deep link URL  │  │• Saves to DB │  │• Receipt ID gen      │  │
│  │• Bank guidance  │  │• Trans ID    │  │• Campaign filter     │  │
│  └────────┬────────┘  └──────┬───────┘  └────────┬─────────────┘  │
│           │                  │                   │                  │
└───────────┼──────────────────┼───────────────────┼──────────────────┘
            │                  │                   │
            └──────────────────┼───────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  upi_donations                                                 │ │
│  │  ┌────┬─────────┬────────┬──────────────┬──────────┬────────┐ │ │
│  │  │ id │donor_id │ amount │transaction_id│ campaign │ status │ │ │
│  │  ├────┼─────────┼────────┼──────────────┼──────────┼────────┤ │ │
│  │  │ 1  │   101   │  500   │ UPI-20260... │republic- │approved│ │ │
│  │  │    │         │        │              │day-2026  │        │ │ │
│  │  │ 2  │   102   │  1000  │ UPI-20260... │republic- │pending │ │ │
│  │  │    │         │        │              │day-2026  │        │ │ │
│  │  │ 3  │   103   │  750   │ UPI-20260... │ general  │approved│ │ │
│  │  └────┴─────────┴────────┴──────────────┴──────────┴────────┘ │ │
│  │                                     [INDEX on campaign]         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  item_donations                                                │ │
│  │  ┌────┬─────────┬──────────┬──────────┬──────────┬─────────┐ │ │
│  │  │ id │donor_id │item_title│ quantity │ campaign │  status │ │ │
│  │  ├────┼─────────┼──────────┼──────────┼──────────┼─────────┤ │ │
│  │  │ 1  │   101   │Rice      │  10 kg   │republic- │collected│ │ │
│  │  │    │         │          │          │day-2026  │         │ │ │
│  │  │ 2  │   104   │Dal       │  5 kg    │republic- │approved │ │ │
│  │  │    │         │          │          │day-2026  │         │ │ │
│  │  └────┴─────────┴──────────┴──────────┴──────────┴─────────┘ │ │
│  │                                     [INDEX on campaign]         │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

### UPI Donation Flow (With Flexible Amount)

```
User                Browser              Backend              Database
  │                    │                    │                    │
  │  Visit Event Page  │                    │                    │
  │───────────────────>│                    │                    │
  │                    │                    │                    │
  │  Click Donate UPI  │                    │                    │
  │───────────────────>│  Navigate with     │                    │
  │                    │  ?campaign=...     │                    │
  │                    │                    │                    │
  │  Toggle to         │                    │                    │
  │  "Enter in App"    │                    │                    │
  │───────────────────>│                    │                    │
  │                    │                    │                    │
  │  Generate QR       │                    │                    │
  │───────────────────>│ POST /api/        │                    │
  │                    │ generate-upi-qr   │                    │
  │                    │ {includeAmount:   │                    │
  │                    │  false}           │                    │
  │                    │──────────────────>│                    │
  │                    │                   │                    │
  │                    │<──────────────────│                    │
  │                    │ {qrCode, upiUrl,  │                    │
  │                    │  bankGuidance}    │                    │
  │<───────────────────│                   │                    │
  │                    │                   │                    │
  │  Scan QR & Pay     │                   │                    │
  │  (enters amount    │                   │                    │
  │   in UPI app)      │                   │                    │
  │───────────────────>│                   │                    │
  │                    │                   │                    │
  │  Upload Screenshot │                   │                    │
  │───────────────────>│                   │                    │
  │                    │                   │                    │
  │  Submit Donation   │                   │                    │
  │───────────────────>│ POST /api/        │                    │
  │                    │ donation-drive/   │                    │
  │                    │ upi               │                    │
  │                    │ {donorId, amount, │                    │
  │                    │  screenshot,      │                    │
  │                    │  campaign}        │                    │
  │                    │──────────────────>│ INSERT INTO       │
  │                    │                   │ upi_donations     │
  │                    │                   │ (campaign=...,    │
  │                    │                   │  status='pending')│
  │                    │                   │──────────────────>│
  │                    │                   │                   │
  │                    │                   │<──────────────────│
  │                    │<──────────────────│ Success           │
  │<───────────────────│                   │                   │
  │                    │                   │                   │
  
  [ADMIN APPROVES]
  
Admin                Browser              Backend              Database
  │                    │                    │                    │
  │  Review Donation   │                    │                    │
  │───────────────────>│                    │                    │
  │                    │                    │                    │
  │  Click Approve     │                    │                    │
  │───────────────────>│ PUT /api/admin/   │                    │
  │                    │ donations/X/      │                    │
  │                    │ approve           │                    │
  │                    │──────────────────>│ UPDATE            │
  │                    │                   │ upi_donations     │
  │                    │                   │ SET status=       │
  │                    │                   │ 'approved'        │
  │                    │                   │ WHERE id=X        │
  │                    │                   │──────────────────>│
  │                    │                   │                   │
  │                    │<──────────────────│                   │
  │<───────────────────│                   │                   │

  [PUBLIC DISPLAY]
  
User                Browser              Backend              Database
  │                    │                    │                    │
  │  Visit Event Page  │                    │                    │
  │───────────────────>│ GET /api/public/  │                    │
  │                    │ approved-donations│                    │
  │                    │ ?campaign=        │                    │
  │                    │  republic-day-2026│                    │
  │                    │──────────────────>│ SELECT * FROM     │
  │                    │                   │ upi_donations     │
  │                    │                   │ WHERE status=     │
  │                    │                   │ 'approved' AND    │
  │                    │                   │ campaign=?        │
  │                    │                   │──────────────────>│
  │                    │                   │                   │
  │                    │                   │<──────────────────│
  │                    │                   │ [Approved rows]   │
  │                    │<──────────────────│ {donations: [...],│
  │                    │                   │  summary: {...}}  │
  │<───────────────────│                   │                   │
  │  See donor wall    │                   │                   │
  │  with approved     │                   │                   │
  │  donations only    │                   │                   │
```

## Component Interaction Map

```
┌─────────────────────────────────────────────────────────────────┐
│                         Homepage (/)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Navbar                                                 │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │  Donations Dropdown (Hover)                     │   │    │
│  │  │  ┌────────────────────────────────────────────┐ │   │    │
│  │  │  │  🇮🇳 Republic Day                          │ │   │    │
│  │  │  │    → 2026 → /events/republic-day-2026     │ │   │    │
│  │  │  │  🎆 Independence Day                       │ │   │    │
│  │  │  │    → 2026 → /events/independence-day-2026 │ │   │    │
│  │  │  └────────────────────────────────────────────┘ │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  EventAnnouncementModal (Popup after 1.5s)             │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  🇮🇳 Republic Day Donation Drive 2026            │  │    │
│  │  │  📅 January 26, 2026                             │  │    │
│  │  │  [Description]                                   │  │    │
│  │  │  ┌──────────────┐  ┌─────────────┐              │  │    │
│  │  │  │ Donate Now   │  │ Maybe Later │              │  │    │
│  │  │  └──────┬───────┘  └─────────────┘              │  │    │
│  │  │         │                                        │  │    │
│  │  │         └──> Routes to /events/republic-day-2026│  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│            Event Page (/events/republic-day-2026)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────┬──────────┬──────────┐  Tab Navigation                 │
│  │About │ Donate   │ Donors   │                                 │
│  └──┬───┴──────────┴──────────┘                                 │
│     │                                                            │
│     └─> About Tab: Mission, How It Works, Impact               │
│     └─> Donate Tab:                                             │
│         ┌───────────────────┐  ┌────────────────────┐          │
│         │  💰 UPI Donation  │  │ 🍱 Item Donation   │          │
│         │  [Button]         │  │ [Button]           │          │
│         └────────┬──────────┘  └─────────┬──────────┘          │
│                  │                       │                      │
│                  │ Routes to:            │ Routes to:           │
│                  │ /donate/upi?          │ /donate/item?        │
│                  │ campaign=republic-    │ campaign=republic-   │
│                  │ day-2026              │ day-2026             │
│                  │                       │                      │
│     └─> Donors Tab:                                             │
│         ┌────────────────────────────────────────────────────┐ │
│         │  ApprovedDonationsDisplay                          │ │
│         │  • Fetches: /api/public/approved-donations?        │ │
│         │             campaign=republic-day-2026&type=all    │ │
│         │  • Shows: Total raised, donor count                │ │
│         │  • Lists: UPI donors, Item donors                  │ │
│         │  • Auto-refresh: Every 30 seconds                  │ │
│         └────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│     UPI Donation Page (/donate/upi?campaign=republic-day-2026)  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Payment Mode Toggle                                   │    │
│  │  ┌─────────────────────────────────────────────────┐   │    │
│  │  │  Pre-fill Amount  ◄──► Enter in App             │   │    │
│  │  │  [────────●]         [●────────]                 │   │    │
│  │  └─────────────────────────────────────────────────┘   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  If Pre-fill Mode:                                              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Amount Input: [___500___]                             │    │
│  │  [Generate QR Code]                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  If Enter in App Mode:                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ℹ️ You can enter amount in your UPI app               │    │
│  │  [Generate Flexible QR Code]                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  After Generation (BOTH modes):                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ┌──────────┐                                          │    │
│  │  │   QR     │  Always visible                          │    │
│  │  │  Code    │                                          │    │
│  │  └──────────┘                                          │    │
│  │  ₹ 500 (or "Enter amount in app")                     │    │
│  │                                                         │    │
│  │  [📱 Open in UPI App]  ← Always visible                │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ⚠️ Bank Limit Guidance (if shown):                             │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  💡 If you see "Bank limit exceeded":                  │    │
│  │     • Try a smaller amount                             │    │
│  │     • Use QR code instead of deep link                 │    │
│  │     • Toggle to "Enter in App" mode                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLIC ACCESS                               │
│              (No authentication required)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ /events/republic-day-2026          (Event landing page)     │
│  ✅ /api/public/approved-donations     (Approved data only)     │
│                                                                  │
│  Security:                                                       │
│  • SQL: WHERE status = 'approved'                               │
│  • Only returns confirmed, verified donations                   │
│  • Receipt IDs generated server-side                            │
│  • No sensitive data exposed                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATED ACCESS                          │
│              (Requires donor registration)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔐 /donation-drive/donate/upi         (Submit UPI donation)    │
│  🔐 /donation-drive/donate/item        (Submit item donation)   │
│  🔐 /donation-drive/my-donations       (View own donations)     │
│                                                                  │
│  Security:                                                       │
│  • Requires donorId in sessionStorage                           │
│  • Validates donor exists in database                           │
│  • All submissions go to 'pending' status                       │
│  • Screenshots/uploads validated                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN ONLY ACCESS                           │
│              (Requires admin authentication)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔒 /dashboard/admin                   (Admin control panel)    │
│  🔒 /api/admin/donations/approve       (Approve donations)      │
│  🔒 /api/admin/donations/reject        (Reject donations)       │
│                                                                  │
│  Security:                                                       │
│  • JWT token authentication                                     │
│  • Role-based access control                                    │
│  • Can change status: pending → approved/rejected               │
│  • Generates email notifications                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Approval Flow:
───────────────
User Submit → pending (private) → Admin Review → approved (public)
                                                → rejected (private)
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE OPTIMIZATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Indexed Fields:                                             │
│     • campaign (for fast filtering by event)                    │
│     • status (for approved-only queries)                        │
│     • donor_id (existing, for joins)                            │
│                                                                  │
│  2. Query Optimization:                                         │
│     SELECT * FROM upi_donations                                 │
│     WHERE status = 'approved' AND campaign = 'republic-day-2026'│
│     → Uses index(campaign) + index(status)                      │
│     → Fast even with 100K+ rows                                 │
│                                                                  │
│  3. Default Values:                                             │
│     • campaign DEFAULT 'general' (no NULL checks needed)        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND OPTIMIZATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Auto-Refresh:                                               │
│     • 30-second interval (not too aggressive)                   │
│     • Only when component mounted                               │
│     • Cleanup on unmount                                        │
│                                                                  │
│  2. Image Optimization:                                         │
│     • QR codes: Base64 (small, embedded)                        │
│     • Screenshots: Compressed before upload                     │
│                                                                  │
│  3. Animations:                                                 │
│     • Framer Motion (optimized library)                         │
│     • GPU-accelerated transforms                                │
│     • Lazy mounting with AnimatePresence                        │
│                                                                  │
│  4. Session Storage:                                            │
│     • Modal state (no backend calls)                            │
│     • Donor ID (reduces auth requests)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

**Diagram Version:** 1.0
**Last Updated:** January 2025
**Maintained By:** Annadaan Development Team

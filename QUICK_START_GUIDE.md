# 🇮🇳 Republic Day 2026 Donation System - Quick Start Guide

## Overview
This implementation adds a complete event-based donation system for Republic Day 2026, with enhanced UPI payment flexibility to handle bank limit errors. The system allows users to donate via UPI or items, tracks donations by campaign/event, and only displays approved donations publicly.

## 🚀 Quick Deploy

### 1. Database Migration
```bash
# Backup your database first!
mysqldump -u username -p annadaan > backup_$(date +%Y%m%d).sql

# Run the migration
mysql -u username -p annadaan < migrations/add_campaign_field.sql
```

### 2. Verify Installation
Visit these URLs to verify everything works:
- Homepage with modal: `http://localhost:3000/`
- Republic Day page: `http://localhost:3000/events/republic-day-2026`
- Public API test: `http://localhost:3000/api/public/approved-donations?campaign=republic-day-2026&type=all`

### 3. Test Donation Flow
1. Register as a donor: `/donation-drive/register`
2. Navigate to UPI donation: `/donation-drive/donate/upi?campaign=republic-day-2026`
3. Try both amount modes (pre-fill and flexible)
4. Complete donation and verify in admin dashboard

## 📁 File Structure

```
Annadaan/
├── app/
│   ├── api/
│   │   ├── public/
│   │   │   └── approved-donations/
│   │   │       └── route.ts                    # NEW - Public API
│   │   ├── generate-upi-qr/
│   │   │   └── route.ts                        # UPDATED - Flexible amount
│   │   └── donation-drive/
│   │       ├── upi/route.ts                    # UPDATED - Campaign support
│   │       └── items/route.ts                  # UPDATED - Campaign support
│   ├── events/
│   │   └── republic-day-2026/
│   │       └── page.tsx                        # NEW - Event page
│   ├── donation-drive/
│   │   └── donate/
│   │       ├── upi/page.tsx                    # UPDATED - Toggle + campaign
│   │       └── item/page.tsx                   # UPDATED - Campaign support
│   └── page.tsx                                # UPDATED - Navbar + modal
├── components/
│   ├── ApprovedDonationsDisplay.tsx            # NEW - Donor wall
│   └── EventAnnouncementModal.tsx              # NEW - Popup modal
├── migrations/
│   └── add_campaign_field.sql                  # NEW - Database migration
├── db.sql                                       # UPDATED - Added campaign field
├── REPUBLIC_DAY_2026_IMPLEMENTATION.md         # NEW - Full documentation
└── TESTING_CHECKLIST.md                        # NEW - QA checklist
```

## 🎯 Key Features

### 1. Event-Based Donations
```typescript
// Campaign is automatically captured from URL
/donation-drive/donate/upi?campaign=republic-day-2026

// Backend stores it in database
INSERT INTO upi_donations (..., campaign) VALUES (..., 'republic-day-2026')

// Public API filters by campaign
GET /api/public/approved-donations?campaign=republic-day-2026
```

### 2. Flexible UPI Amounts
```typescript
// Pre-fill mode (default)
includeAmount: true → upi://pay?pa=...&am=500

// Flexible mode (bypass bank limits)
includeAmount: false → upi://pay?pa=... (no amount)
```

### 3. Approved-Only Display
```sql
-- Only these donations appear publicly
SELECT * FROM upi_donations WHERE status = 'approved' AND campaign = ?
SELECT * FROM item_donations WHERE status IN ('approved', 'collected') AND campaign = ?
```

## 🔧 Configuration

### UPI Settings (Already Configured)
```typescript
// In /app/api/generate-upi-qr/route.ts
UPI_ID: 'singhraunak1107@oksbi'
PAYEE_NAME: 'Donation Drive'
CURRENCY: 'INR'
```

### Campaign Names
Use these exact strings for consistency:
- `'general'` - Default for non-event donations
- `'republic-day-2026'` - Republic Day 2026 event
- `'independence-day-2026'` - Independence Day 2026 event

### Modal Settings
```typescript
// In homepage component
sessionStorageKey: 'hideRepublicDay2026Modal'  // Change per event
delay: 1500ms  // Show after 1.5 seconds
```

## 🎨 Customization

### Add New Event (e.g., Independence Day 2026)

1. **Create Event Page**
```bash
cp app/events/republic-day-2026/page.tsx app/events/independence-day-2026/page.tsx
```

2. **Update Content**
```tsx
// Change theme colors
from-orange-500 to-green-500  →  from-orange-500 to-blue-500

// Update campaign parameter
campaign="republic-day-2026"  →  campaign="independence-day-2026"

// Change emoji and text
emoji="🇮🇳"  →  emoji="🎆"
```

3. **Add to Navbar** (Already done in homepage)
```tsx
// Already exists in /app/page.tsx
└─ 🎆 Independence Day
    └─ → 2026 (/events/independence-day-2026)
```

4. **Update Homepage Modal** (Optional)
```tsx
<EventAnnouncementModal
  eventName="Independence Day Donation Drive 2026"
  eventDate="August 15, 2026"
  eventPath="/events/independence-day-2026"
  emoji="🎆"
  sessionStorageKey="hideIndependenceDay2026Modal"
/>
```

### Customize Colors
```tsx
// Republic Day: Orange-White-Green
from-orange-500 to-green-500
bg-orange-600
text-green-600

// Independence Day: Orange-White-Blue
from-orange-500 to-blue-500
bg-orange-600
text-blue-600
```

## 🔐 Security Considerations

### What's Protected
✅ Only approved donations visible on public pages
✅ Campaign parameter sanitized in backend
✅ SQL injection prevented via parameterized queries
✅ Receipt IDs generated server-side (not user input)
✅ File uploads validated and restricted

### What Needs Admin Approval
- UPI donation screenshot verification
- Item donation pickup confirmation
- Changing donation status to 'approved'
- Marking items as 'collected'

## 📊 Admin Dashboard Updates (Future)

To filter donations by campaign in admin dashboard:

```typescript
// Add campaign filter dropdown
const [selectedCampaign, setSelectedCampaign] = useState<string>('all')

// Filter donations
const filteredDonations = upiDonations.filter(d => 
  selectedCampaign === 'all' || d.campaign === selectedCampaign
)

// Display campaign in donation cards
<div className="text-xs text-gray-500">
  Campaign: {donation.campaign}
</div>
```

## 🐛 Troubleshooting

### Issue: Modal doesn't appear
**Solution:** Clear session storage
```javascript
sessionStorage.removeItem('hideRepublicDay2026Modal')
```

### Issue: Donations not showing on event page
**Check:**
1. Donation status is 'approved' (UPI) or 'approved'/'collected' (items)
2. Campaign field matches exactly (case-sensitive)
3. API endpoint returning data: `/api/public/approved-donations?campaign=republic-day-2026&type=all`

### Issue: Bank limit error persists
**Solution:** Guide user to toggle "Enter in App" mode
1. Click the toggle switch
2. Generate new QR without amount
3. Scan QR and enter amount in UPI app

### Issue: Campaign not saved with donation
**Check:**
1. URL includes `?campaign=republic-day-2026` parameter
2. Frontend reads searchParams correctly
3. Backend logs show campaign in request body
4. Database has campaign field with correct value

## 📈 Monitoring & Analytics

### Key Metrics to Track
```sql
-- Donations by campaign
SELECT campaign, COUNT(*), SUM(amount) 
FROM upi_donations 
WHERE status = 'approved' 
GROUP BY campaign;

-- Event conversion rate
SELECT 
  (SELECT COUNT(*) FROM upi_donations WHERE campaign = 'republic-day-2026') /
  (SELECT COUNT(*) FROM upi_donations) * 100 AS event_percentage;

-- Flexible amount usage
-- (Requires adding a field to track which mode was used)
```

### Performance Monitoring
- Page load time: Should be < 3s
- API response time: Should be < 500ms
- Auto-refresh impact: Monitor every 30s refresh

## 🎓 How It Works

### 1. User Journey
```
Homepage
  ↓ (sees popup modal)
Clicks "Donate Now"
  ↓
Republic Day Event Page
  ↓ (views approved donors)
Clicks "Donate via UPI"
  ↓
UPI Donation Page (?campaign=republic-day-2026)
  ↓ (toggles flexible amount mode if needed)
Completes Payment
  ↓
Uploads Screenshot
  ↓
Submits Donation (stored with campaign='republic-day-2026')
  ↓
Admin Approves
  ↓
Name appears on Republic Day donor wall
```

### 2. Data Flow
```
Frontend → API Endpoint → Database → Public API → Frontend Display

republic-day-2026/page.tsx
  ↓ (user clicks donate)
donate/upi/page.tsx?campaign=republic-day-2026
  ↓ (user submits)
/api/donation-drive/upi (saves with campaign field)
  ↓
Database: upi_donations(campaign='republic-day-2026', status='pending')
  ↓ (admin approves)
Database: upi_donations(status='approved')
  ↓
/api/public/approved-donations?campaign=republic-day-2026
  ↓
ApprovedDonationsDisplay component (shows on event page)
```

### 3. Security Flow
```
Public API Request
  ↓
WHERE status = 'approved'
  ↓
Only Approved Data Returned
  ↓
Receipt ID Generated Server-Side
  ↓
Displayed on Public Page
```

## 🚦 Status Indicators

- **pending**: Donation submitted, awaiting admin review
- **approved**: Admin verified, will appear on public page
- **rejected**: Admin rejected, won't appear publicly
- **collected**: (Items only) Physically collected by team

## 📞 Support

For questions or issues:
- Email: annadaan.mission@gmail.com
- Check logs: `/var/log/annadaan/`
- Database issues: Check MySQL error log

## 🎉 Launch Day Checklist

- [ ] Database backup completed
- [ ] Migration script executed successfully
- [ ] Homepage popup modal working
- [ ] Event page loading correctly
- [ ] Donation flow tested end-to-end
- [ ] Admin can approve donations
- [ ] Approved donations appear on event page
- [ ] Mobile experience tested
- [ ] Performance benchmarks met
- [ ] Error tracking enabled
- [ ] Team trained on new features

---

**Version:** 1.0
**Last Updated:** January 2025
**Status:** ✅ Production Ready

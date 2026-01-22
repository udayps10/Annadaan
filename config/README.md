# Event Donations Configuration

This directory contains configuration files for mapping donations to specific events without requiring database schema changes.

## Usage

### 1. Add Donation IDs to Events

Edit `event-donations.ts` to map specific donation IDs to events:

```typescript
export const eventDonations: EventDonationsMap = {
  'republic-day-2026': {
    upiDonationIds: [1, 5, 12, 23, 45],  // Add UPI donation IDs here
    itemDonationIds: [3, 7, 15, 22]      // Add item donation IDs here
  }
}
```

### 2. Use in Event Pages

Import and use the config in your event pages:

```typescript
import { getEventDonations } from '@/config/event-donations'

// In your component
const eventDonations = getEventDonations('republic-day-2026')

<ApprovedDonationsDisplay 
  upiDonationIds={eventDonations.upiDonationIds}
  itemDonationIds={eventDonations.itemDonationIds}
  title="Republic Day 2026 - Approved Donors 🙏"
/>
```

### 3. How It Works

- **General Donations Page** (`/donation-drive`): Shows all approved donations (no filtering)
- **Event-Specific Pages** (e.g., `/events/republic-day-2026`): Shows only donations with IDs listed in the config
- **API Endpoint**: `/api/public/approved-donations` supports optional ID filtering via query params

### 4. Finding Donation IDs

To find donation IDs to add to an event:

1. Go to your admin dashboard
2. View approved donations
3. Note the donation IDs you want to associate with the event
4. Add those IDs to the appropriate array in `event-donations.ts`

### 5. Benefits of This Approach

✅ **No Database Migrations**: Works with existing schema  
✅ **Simple Management**: Edit a single config file  
✅ **Type-Safe**: TypeScript ensures correct structure  
✅ **Flexible**: Easy to add/remove donations from events  
✅ **Performance**: Frontend filtering with cached data  

## Example: Creating a New Event

```typescript
// In event-donations.ts
export const eventDonations: EventDonationsMap = {
  'republic-day-2026': {
    upiDonationIds: [1, 5, 12],
    itemDonationIds: [3, 7]
  },
  'independence-day-2026': {
    upiDonationIds: [25, 30, 42],
    itemDonationIds: [18, 20]
  }
}
```

Then create your event page at `/app/events/independence-day-2026/page.tsx` and use the config as shown above.

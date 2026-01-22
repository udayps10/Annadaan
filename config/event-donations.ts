/**
 * Event-to-Donation Mapping Configuration
 * 
 * This file maps specific donation IDs to events without requiring database schema changes.
 * To add a donation to an event, simply add its ID to the appropriate array below.
 * 
 * Usage:
 * - Import this config in event pages
 * - Pass the donation IDs to ApprovedDonationsDisplay component
 * - Component will filter donations client-side
 */

export interface EventDonationConfig {
  upiDonationIds: number[]
  itemDonationIds: number[]
}

export interface EventDonationsMap {
  [eventSlug: string]: EventDonationConfig
}

export const eventDonations: EventDonationsMap = {
  'republic-day-2026': {
    upiDonationIds: [],
    itemDonationIds: []
  }
}

/**
 * Get donation IDs for a specific event
 */
export function getEventDonations(eventSlug: string): EventDonationConfig {
  return eventDonations[eventSlug] || { upiDonationIds: [], itemDonationIds: [] }
}

/**
 * Check if a donation is part of an event
 */
export function isDonationInEvent(
  eventSlug: string,
  donationId: number,
  type: 'upi' | 'item'
): boolean {
  const event = eventDonations[eventSlug]
  if (!event) return false
  
  const ids = type === 'upi' ? event.upiDonationIds : event.itemDonationIds
  return ids.includes(donationId)
}

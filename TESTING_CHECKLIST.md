# 🎯 Republic Day 2026 & UPI Enhancement - Testing Checklist

## ✅ Pre-Deployment Checklist

### Database Migration
- [ ] Run SQL migration to add `campaign` field to `upi_donations` table
- [ ] Run SQL migration to add `campaign` field to `item_donations` table  
- [ ] Verify indexes created successfully
- [ ] Test query performance on campaign field
- [ ] Backup production database before migration

### API Endpoints Testing

#### `/api/public/approved-donations`
- [ ] Test with `?campaign=republic-day-2026&type=upi`
- [ ] Test with `?campaign=republic-day-2026&type=item`
- [ ] Test with `?campaign=republic-day-2026&type=all`
- [ ] Test with `?campaign=general`
- [ ] Verify only approved donations returned
- [ ] Verify receipt ID format (UPI-000001, ITEM-000001)
- [ ] Check performance with large dataset

#### `/api/generate-upi-qr`
- [ ] Test with `includeAmount=true` + valid amount
- [ ] Test with `includeAmount=false` (no amount)
- [ ] Test with amount > 100000 (should fail)
- [ ] Test with invalid amount format
- [ ] Verify QR code generates correctly
- [ ] Verify UPI URL format in both modes
- [ ] Check bankLimitGuidance message returned

#### `/api/donation-drive/upi`
- [ ] Test submission with campaign='republic-day-2026'
- [ ] Test submission with campaign='general'
- [ ] Test submission without campaign parameter (defaults to 'general')
- [ ] Verify donation created in database with correct campaign
- [ ] Check transaction ID generation

#### `/api/donation-drive/items`
- [ ] Test submission with campaign='republic-day-2026'
- [ ] Test submission with campaign='general'
- [ ] Test submission without campaign parameter
- [ ] Verify item donation created with correct campaign
- [ ] Check pickup scheduling

### Frontend Pages Testing

#### `/events/republic-day-2026`
- [ ] Page loads without errors
- [ ] All tabs work (About, Donate, Donors)
- [ ] Donor wall displays approved donations
- [ ] Summary statistics calculate correctly
- [ ] UPI donation link includes ?campaign=republic-day-2026
- [ ] Item donation link includes ?campaign=republic-day-2026
- [ ] Mobile responsive layout works
- [ ] Animations smooth and performant

#### Homepage (`/`)
- [ ] Event popup modal appears after 1.5s
- [ ] Modal dismisses on "Maybe Later" click
- [ ] Modal doesn't reappear in same session after dismiss
- [ ] "Donate Now" button routes to event page
- [ ] Navbar dropdown opens on hover
- [ ] Republic Day 2026 link works
- [ ] Independence Day 2026 link works (even if page doesn't exist yet)
- [ ] Dropdown closes when mouse leaves
- [ ] Mobile navbar works correctly

#### `/donation-drive/donate/upi?campaign=republic-day-2026`
- [ ] Campaign parameter read from URL
- [ ] Flexible amount toggle works
- [ ] Toggle switches between "Pre-fill Amount" and "Enter in App" modes
- [ ] Amount input visible when includeAmount=true
- [ ] Amount input hidden when includeAmount=false
- [ ] QR code generates in both modes
- [ ] Deep link button always visible
- [ ] Bank limit guidance message displays
- [ ] Screenshot upload works
- [ ] Submission includes campaign parameter
- [ ] Success redirect to my-donations

#### `/donation-drive/donate/item?campaign=republic-day-2026`
- [ ] Campaign parameter read from URL
- [ ] Form validation works
- [ ] Item submission includes campaign
- [ ] Pickup scheduling works
- [ ] Success redirect to my-donations

### Component Testing

#### `ApprovedDonationsDisplay`
- [ ] Component renders with campaign='republic-day-2026'
- [ ] Shows UPI donations when showUPI=true
- [ ] Shows item donations when showItems=true
- [ ] Auto-refreshes every 30 seconds
- [ ] Loading state displays correctly
- [ ] Empty state shows when no donations
- [ ] Statistics calculate correctly
- [ ] Donor cards display all info (name, amount, receipt ID, date)

#### `EventAnnouncementModal`
- [ ] Modal appears after delay
- [ ] Modal doesn't appear if dismissed in session
- [ ] Close button works
- [ ] Backdrop click dismisses modal
- [ ] "Donate Now" routes correctly
- [ ] "Maybe Later" dismisses and sets session storage
- [ ] Animations smooth
- [ ] Mobile responsive

### User Flow Testing

#### Complete Republic Day Donation Flow (UPI)
1. [ ] Visit homepage → see popup modal
2. [ ] Click "Donate Now" → taken to event page
3. [ ] View donor wall → see existing approved donations
4. [ ] Click "Donate via UPI" → taken to UPI page with campaign param
5. [ ] Toggle to "Enter in App" mode
6. [ ] Generate QR code
7. [ ] Click "Open in UPI App" button
8. [ ] Complete payment in UPI app
9. [ ] Upload screenshot
10. [ ] Submit donation
11. [ ] Admin approves (manual step)
12. [ ] Check event page donor wall → donation appears

#### Complete Republic Day Donation Flow (Items)
1. [ ] Visit event page
2. [ ] Click "Donate Food Items"
3. [ ] Fill form with item details
4. [ ] Schedule pickup
5. [ ] Submit donation
6. [ ] Admin approves + marks collected
7. [ ] Check event page donor wall → donation appears

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile (414x896)

### Performance
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] QR generation < 1s
- [ ] Image uploads < 5s
- [ ] No console errors
- [ ] No memory leaks

### Security
- [ ] Public API only returns approved donations
- [ ] Campaign parameter sanitized in backend
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection working
- [ ] File upload validation working

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast sufficient (WCAG AA)
- [ ] Alt text on images
- [ ] ARIA labels on interactive elements

## 🐛 Bug Tracking

### Critical Bugs (Block Deployment)
- None found

### Major Bugs (Fix Before Launch)
- None found

### Minor Bugs (Fix After Launch)
- None found

## 📝 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Monitor server logs for errors
- [ ] Check database for successful campaign tracking
- [ ] Verify approved donations appearing on event page
- [ ] Test complete donation flow in production
- [ ] Check email notifications working

### Week 1
- [ ] Monitor event page traffic
- [ ] Track popup modal engagement rate
- [ ] Measure UPI flexible amount toggle usage
- [ ] Collect user feedback on UPI flow
- [ ] Check for any reported bugs

### Month 1
- [ ] Analyze donation metrics by campaign
- [ ] Compare Republic Day vs general donations
- [ ] Review bank limit error reports (should decrease)
- [ ] Plan Independence Day 2026 launch
- [ ] Iterate based on learnings

## 🚀 Deployment Steps

1. **Code Deployment**
   - [ ] Merge feature branch to main
   - [ ] Run tests in staging environment
   - [ ] Deploy to production
   - [ ] Verify deployment successful

2. **Database Migration**
   - [ ] Backup production database
   - [ ] Run campaign field migrations
   - [ ] Verify migrations successful
   - [ ] Check existing data integrity

3. **Smoke Tests**
   - [ ] Homepage loads
   - [ ] Event page loads
   - [ ] Donation flows work
   - [ ] Admin dashboard works
   - [ ] API endpoints respond correctly

4. **Monitoring Setup**
   - [ ] Enable error tracking
   - [ ] Set up performance monitoring
   - [ ] Configure uptime alerts
   - [ ] Enable analytics tracking

## ✅ Sign-Off

- [ ] Developer Testing Complete
- [ ] QA Testing Complete
- [ ] Security Review Complete
- [ ] Performance Review Complete
- [ ] Documentation Updated
- [ ] Stakeholder Approval

**Ready for Production:** ⬜ YES / ⬜ NO

---

**Tested By:** _________________
**Date:** _________________
**Production Deploy Date:** _________________

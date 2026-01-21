# PDF Donation Receipt System

## Overview
Professional PDF receipt generation system for Annadaan donation drive with invoice-style formatting and automated email delivery.

## Features

### 1. **Professional PDF Layout**
- A4 size with clean margins
- Invoice-style structure with proper hierarchy
- Monochrome design (black/grey)
- Table-based alignment
- Right-aligned numeric values
- System-generated receipts (no signature required)

### 2. **Receipt Components**
- **Header**: Organization branding and title
- **Metadata**: Receipt number, date, payment mode, status
- **Donor Details**: Name and email
- **Donation Table**: Description, quantity, amount with proper columns
- **Totals Section**: Subtotal, taxes (₹0.00), total amount
- **Amount in Words**: Indian numbering system (Crores, Lakhs, Thousands)
- **Declaration**: Legal statement about voluntary donation
- **Footer**: Contact details and system-generated notice

### 3. **Development Preview Mode**
- Test endpoint with mock data
- SAMPLE watermark on preview receipts
- No database writes
- No payment required
- Accessible via: `/api/admin/donations/preview-receipt`

### 4. **Production Receipt Generation**
- Auto-generated for UPI donations when approved
- Auto-generated for Item donations when collected
- Attached to confirmation emails
- Manual download available in admin dashboard

## API Endpoints

### Preview Receipt (Development Only)
```
GET /api/admin/donations/preview-receipt
```
Returns a sample PDF with watermark using mock data:
- Donor: Test User (test@example.com)
- Amount: ₹500
- Receipt Number: DEV-0001
- Shows inline in browser

### Generate Production Receipt
```
GET /api/admin/donations/generate-receipt/[id]?type=upi|item
```
Parameters:
- `id`: Donation ID
- `type`: 'upi' or 'item' (default: 'item')

Returns PDF as downloadable file with proper receipt number.

## Receipt Numbering

### Format
- UPI Donations: `RCP-UPI-######`
- Item Donations: `RCP-ITM-######`
- Preview/Dev: `DEV-0001`

Example: `RCP-UPI-000042` (UPI donation #42)

## Automated Email Integration

### UPI Donations
When admin approves a UPI donation:
1. ✅ PDF receipt generated automatically
2. 📧 Email sent with PDF attachment
3. ✅ Database updated (receipt_sent = 1)

Email includes:
- Approval confirmation
- Donation details (amount, date, receipt number)
- PDF receipt attachment

### Item Donations
When admin marks item donation as collected:
1. 📸 Collection photo captured
2. 📄 PDF receipt generated automatically
3. 📧 Email sent with both photo and PDF receipt
4. ✅ Database updated

Email includes:
- Collection confirmation
- Item details (title, quantity, date)
- Embedded collection photo (CID attachment)
- PDF receipt attachment

## Admin Dashboard Features

### Preview Button
Located in dashboard header:
- **"📄 Preview Receipt"** button
- Opens sample receipt in new tab
- No data required
- Shows SAMPLE watermark

### Download Receipt Buttons

**UPI Donations Tab:**
- Shows approved donations list
- Each has "📄 Download Receipt" button
- Receipt status indicator (Sent/Not Sent)

**Item Donations Tab:**
- Shows recently collected items
- Each has "📄 Download Receipt" button
- Shows collection photo thumbnail

## Technical Implementation

### Library
- **pdfkit**: Professional PDF generation
- **@types/pdfkit**: TypeScript support

### Core Module
`lib/pdfReceipt.ts`

Key functions:
```typescript
generateDonationReceipt(data: DonationReceiptData): Promise<Buffer>
numberToWords(num: number): string
pdfBufferToBase64(buffer: Buffer): string
```

### Email Attachments
```typescript
attachments: [
  {
    filename: 'donation-receipt-RCP-UPI-000042.pdf',
    content: base64String,
    encoding: 'base64',
    contentType: 'application/pdf'
  }
]
```

### Photo Attachments (Item Donations)
```typescript
attachments: [
  {
    filename: 'collection-photo.jpg',
    content: base64String,
    encoding: 'base64',
    cid: 'collectionPhoto' // Referenced in email HTML as cid:collectionPhoto
  }
]
```

## Amount to Words Conversion

Supports Indian numbering system:
- Paise (decimal)
- Rupees
- Thousands
- Lakhs
- Crores

Examples:
- `500` → "Five Hundred Rupees Only"
- `1500.50` → "One Thousand Five Hundred Rupees and Fifty Paise Only"
- `2500000` → "Twenty Five Lakh Rupees Only"

## Styling Guidelines

### Colors
- Black: `#000000` - Main text
- Grey: `#666666` - Secondary text
- Light Grey: `#f3f4f6` - Table header background
- Green: `#059669` - Status (Approved/Collected)

### Typography
- Title: 16pt Helvetica-Bold
- Headers: 12pt Helvetica-Bold
- Body: 10pt Helvetica
- Footer: 8-9pt Helvetica

### Layout
- Margins: 50pt (all sides)
- Line spacing: Consistent 18-25pt between sections
- Table borders: 1pt stroke
- Images: Max width 500px

## Testing Workflow

1. **Preview Receipt**
   - Click "📄 Preview Receipt" in admin dashboard
   - Verify layout, fonts, alignment
   - Check watermark appears
   - Test in different browsers

2. **UPI Donation Flow**
   - Donor submits UPI donation
   - Admin approves
   - Check email with PDF attachment
   - Verify PDF downloads from dashboard
   - Confirm receipt_sent flag updated

3. **Item Donation Flow**
   - Donor submits item donation
   - Admin approves (schedule notification sent)
   - Admin collects and uploads photo
   - Check email with photo + PDF
   - Download receipt from dashboard
   - Verify collection photo displays

## Environment Variables

No additional environment variables required beyond existing email setup:
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `EMAIL_FROM_NAME`

## File Structure

```
lib/
  └── pdfReceipt.ts                                    # Core PDF generator

app/api/admin/donations/
  ├── preview-receipt/route.ts                        # Dev preview endpoint
  ├── generate-receipt/[id]/route.ts                  # Production receipt endpoint
  ├── upi/[id]/[action]/route.ts                      # UPI approval with auto-receipt
  └── item/[id]/[action]/route.ts                     # Item collection with auto-receipt

app/dashboard/admin/page.tsx                          # Preview & download buttons
```

## Future Enhancements

### Potential Additions
- [ ] Add organization logo to header
- [ ] QR code for receipt verification
- [ ] Receipt history for donors (donor portal)
- [ ] Bulk receipt generation
- [ ] Custom receipt templates per donation type
- [ ] Receipt analytics (generated count, download count)
- [ ] Receipt regeneration option
- [ ] Multi-language support

### Customization Options
- Configurable footer text
- Custom color schemes
- Variable tax rates
- Custom declaration text
- Logo upload interface

## Troubleshooting

### PDF Not Generating
- Check pdfkit installation: `npm list pdfkit`
- Verify sufficient memory for PDF generation
- Check error logs in terminal

### Email Attachments Not Showing
- Verify base64 encoding is correct
- Check attachment size limits (typically 10MB)
- Ensure contentType is 'application/pdf'

### Amount in Words Incorrect
- Test with various amounts including decimals
- Verify Indian numbering system logic
- Check for edge cases (0, negative, very large numbers)

### Preview Receipt Not Opening
- Check browser popup blocker
- Verify endpoint is accessible
- Check browser console for errors

## Support
For issues or questions, refer to the main project documentation or contact the development team.

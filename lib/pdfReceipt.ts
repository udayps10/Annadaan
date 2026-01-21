import { jsPDF } from 'jspdf'

export interface DonationReceiptData {
  receiptNumber: string
  transactionId?: string
  dateOfIssue: string
  donorName: string
  donorEmail: string
  amount: number
  paymentMode: string
  donationStatus: string
  donationType: string
  itemDescription?: string
  quantity?: number
  isPreview?: boolean
}

// Convert number to words (Indian Rupees)
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  
  if (num === 0) return 'Zero Rupees Only'
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 > 0 ? ' ' + convertLessThanThousand(n % 100) : '')
  }
  
  function convertToWords(n: number): string {
    if (n === 0) return ''
    
    // Indian numbering system: Crores, Lakhs, Thousands, Hundreds
    const crore = Math.floor(n / 10000000)
    const lakh = Math.floor((n % 10000000) / 100000)
    const thousand = Math.floor((n % 100000) / 1000)
    const remainder = n % 1000
    
    let result = ''
    
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore '
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh '
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand '
    if (remainder > 0) result += convertLessThanThousand(remainder)
    
    return result.trim()
  }
  
  const rupees = Math.floor(num)
  const paise = Math.round((num - rupees) * 100)
  
  let result = convertToWords(rupees) + ' Rupees'
  if (paise > 0) {
    result += ' and ' + convertToWords(paise) + ' Paise'
  }
  result += ' Only'
  
  return result
}

// Generate professional PDF receipt
export async function generateDonationReceipt(data: DonationReceiptData): Promise<Buffer> {
  // Validate and ensure amount is a number
  const amount = parseFloat(String(data.amount || 0))
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  const contentWidth = pageWidth - (margin * 2)
  let yPos = 20

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, options?: any) => {
    doc.text(text, x, y, options)
  }

  // WATERMARK for preview receipts
  if (data.isPreview) {
    doc.setFontSize(60)
    doc.setTextColor(240, 240, 240)
    doc.text('SAMPLE', pageWidth / 2, 150, { align: 'center', angle: 45 })
    doc.setTextColor(0, 0, 0)
  }

  // HEADER - Organization Name
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  addText('ANNADAAN', pageWidth / 2, yPos, { align: 'center' })
  
  yPos += 8
  doc.setFontSize(10)
  doc.setTextColor(102, 102, 102)
  doc.setFont('helvetica', 'normal')
  addText('Saving Food, Serving Humanity', pageWidth / 2, yPos, { align: 'center' })
  
  yPos += 10
  
  // TITLE - DONATION RECEIPT
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  addText('DONATION RECEIPT', pageWidth / 2, yPos, { align: 'center' })
  
  yPos += 8
  doc.setDrawColor(0, 0, 0)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // RECEIPT METADATA - Two Column Layout
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  
  const leftColX = margin
  const rightColX = pageWidth / 2 + 10
  
  // Left Column
  addText('Receipt Number:', leftColX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(data.receiptNumber, leftColX + 40, yPos)
  
  // Right Column
  doc.setFont('helvetica', 'bold')
  addText('Payment Mode:', rightColX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(data.paymentMode, rightColX + 35, yPos)
  
  yPos += 6
  
  // Transaction ID (if available)
  if (data.transactionId) {
    doc.setFont('helvetica', 'bold')
    addText('Transaction ID:', leftColX, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    addText(data.transactionId, leftColX + 40, yPos)
    doc.setFontSize(10)
    yPos += 6
  }
  
  // Left Column
  doc.setFont('helvetica', 'bold')
  addText('Date of Issue:', leftColX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(data.dateOfIssue, leftColX + 40, yPos)
  
  // Right Column
  doc.setFont('helvetica', 'bold')
  addText('Status:', rightColX, yPos)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(5, 150, 105)
  addText(data.donationStatus, rightColX + 35, yPos)
  doc.setTextColor(0, 0, 0)
  
  yPos += 10
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // DONOR DETAILS SECTION
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  addText('DONOR DETAILS', leftColX, yPos)
  
  yPos += 8
  doc.setFontSize(10)
  
  doc.setFont('helvetica', 'bold')
  addText('Name:', leftColX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(data.donorName, leftColX + 20, yPos)
  
  yPos += 6
  
  doc.setFont('helvetica', 'bold')
  addText('Email:', leftColX, yPos)
  doc.setFont('helvetica', 'normal')
  addText(data.donorEmail, leftColX + 20, yPos)
  
  yPos += 10
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // DONATION DETAILS TABLE
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  addText('DONATION DETAILS', leftColX, yPos)
  
  yPos += 8
  
  // Table Header
  const tableStartY = yPos
  const descColX = margin
  const descWidth = contentWidth * 0.55
  const qtyColX = margin + descWidth
  const qtyWidth = contentWidth * 0.15
  const amtColX = qtyColX + qtyWidth
  const amtWidth = contentWidth * 0.3
  
  // Header background
  doc.setFillColor(243, 244, 246)
  doc.rect(margin, tableStartY, contentWidth, 8, 'F')
  
  // Header borders
  doc.setDrawColor(0, 0, 0)
  doc.rect(margin, tableStartY, contentWidth, 8)
  
  // Header text
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  addText('DESCRIPTION', descColX + 2, tableStartY + 6)
  addText('QTY', qtyColX + 2, tableStartY + 6)
  addText('AMOUNT (Rs.)', amtColX + 2, tableStartY + 6)
  
  yPos = tableStartY + 8
  
  // Table Row
  const description = data.itemDescription || `${data.donationType} Donation – General Fund`
  const quantity = data.quantity || 1
  const donationAmount = amount // Use the validated amount from top of function
  
  doc.setFont('helvetica', 'normal')
  const splitDesc = doc.splitTextToSize(description, descWidth - 4)
  const rowHeight = Math.max(10, splitDesc.length * 5 + 2)
  
  doc.rect(margin, yPos, contentWidth, rowHeight)
  addText(splitDesc, descColX + 2, yPos + 5)
  addText(String(quantity), qtyColX + (qtyWidth / 2), yPos + 5, { align: 'center' })
  
  // Right-align amount in its column
  const amountText = donationAmount.toFixed(2)
  addText(amountText, amtColX + amtWidth - 2, yPos + 5, { align: 'right' })
  
  // Vertical lines
  doc.line(qtyColX, tableStartY, qtyColX, yPos + rowHeight)
  doc.line(amtColX, tableStartY, amtColX, yPos + rowHeight)
  
  yPos += rowHeight + 5

  // TOTALS SECTION (Right Aligned)
  const totalsLabelX = amtColX + 2
  const totalsValueX = amtColX + amtWidth - 2
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  addText('Subtotal:', totalsLabelX, yPos)
  addText(donationAmount.toFixed(2), totalsValueX, yPos, { align: 'right' })
  
  yPos += 6
  addText('Taxes:', totalsLabelX, yPos)
  addText('0.00', totalsValueX, yPos, { align: 'right' })
  
  yPos += 8
  doc.line(amtColX, yPos - 2, pageWidth - margin, yPos - 2)
  yPos += 3
  
  // Total (Bold)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  addText('TOTAL AMOUNT:', totalsLabelX, yPos)
  addText(donationAmount.toFixed(2), totalsValueX, yPos, { align: 'right' })
  
  yPos += 10

  // Amount in Words
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  addText('Amount in Words:', leftColX, yPos)
  
  yPos += 6
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(51, 51, 51)
  const amountWords = doc.splitTextToSize(numberToWords(donationAmount), contentWidth)
  addText(amountWords, leftColX, yPos)
  
  yPos += amountWords.length * 5 + 8
  doc.setTextColor(0, 0, 0)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // DECLARATION
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const declaration = 'This receipt confirms the successful receipt of a voluntary donation. Annadaan is committed to utilizing all donations for humanitarian relief and food rescue initiatives.'
  const splitDeclaration = doc.splitTextToSize(declaration, contentWidth)
  addText(splitDeclaration, leftColX, yPos)
  
  yPos += splitDeclaration.length * 5 + 10

  // FOOTER
  const footerY = 270
  doc.line(margin, footerY, pageWidth - margin, footerY)
  
  doc.setFontSize(9)
  doc.setTextColor(102, 102, 102)
  addText('Annadaan - Donation receipt', pageWidth / 2, footerY + 5, { align: 'center' })
  
  doc.setFontSize(8)
  addText('Email: annadaan.mission@gmail.com | Phone: +91-9326160266', pageWidth / 2, footerY + 10, { align: 'center' })
  
  doc.setFontSize(7)
  doc.setTextColor(153, 153, 153)
  addText('This is a system-generated receipt and does not require a physical signature.', pageWidth / 2, footerY + 15, { align: 'center' })

  // Convert to Buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

// Convert PDF Buffer to base64 for email attachment
export function pdfBufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64')
}

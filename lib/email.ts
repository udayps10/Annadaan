import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content?: string
    encoding?: string
    cid?: string
  }>
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })
}

export async function sendEmail({ to, subject, html, attachments }: EmailOptions) {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Annadaan'} <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

export async function sendDonationReceipt(donorEmail: string, donorName: string, donationId: number, submittedDate: string) {
  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: white;
          padding: 30px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .receipt-box {
          background: #f9fafb;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .receipt-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .receipt-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #6b7280;
        }
        .value {
          color: #111827;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
        .badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          margin: 20px 0;
        }
        .icon {
          font-size: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🍽️</div>
          <h1 style="margin: 10px 0;">Annadaan</h1>
          <p style="margin: 5px 0; font-size: 18px;">Republic Day Donation Drive 2026</p>
        </div>
        
        <div class="content">
          <h2 style="color: #f97316;">Thank You for Your Generous Donation! 🙏</h2>
          
          <p>Dear ${donorName},</p>
          
          <p>
            We are incredibly grateful for your contribution to our Republic Day Donation Drive on January 26, 2026. 
            Your generosity will help us make a real difference in the lives of those in need.
          </p>
          
          <div style="text-align: center;">
            <span class="badge">✅ DONATION APPROVED</span>
          </div>
          
          <div class="receipt-box">
            <h3 style="margin-top: 0; color: #f97316;">📧 Donation Receipt</h3>
            
            <div class="receipt-row">
              <span class="label">Receipt Number:</span>
              <span class="value">#DN${donationId.toString().padStart(6, '0')}</span>
            </div>
            
            <div class="receipt-row">
              <span class="label">Donor Name:</span>
              <span class="value">${donorName}</span>
            </div>
            
            <div class="receipt-row">
              <span class="label">Donor Email:</span>
              <span class="value">${donorEmail}</span>
            </div>
            
            <div class="receipt-row">
              <span class="label">Donation Type:</span>
              <span class="value">💰 UPI Payment</span>
            </div>
            
            <div class="receipt-row">
              <span class="label">Submitted Date:</span>
              <span class="value">${new Date(submittedDate).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            
            <div class="receipt-row">
              <span class="label">Approval Date:</span>
              <span class="value">${new Date().toLocaleString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            
            <div class="receipt-row">
              <span class="label">Event:</span>
              <span class="value">Republic Day Donation Drive 2026</span>
            </div>
          </div>
          
          <p>
            <strong>What happens next?</strong><br>
            Your donation will be used to support underprivileged families in our community. 
            We will keep you updated on the impact of your contribution.
          </p>
          
          <p>
            You can track your donation and view all your contributions anytime by visiting your dashboard at:
            <br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/donation-drive/my-donations" 
               style="color: #f97316; text-decoration: none; font-weight: bold;">
              View My Donations →
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p>
            <strong>🌟 Share the Joy!</strong><br>
            Inspire others to contribute by sharing this initiative with your friends and family.
          </p>
          
          <p style="margin-top: 30px;">
            With heartfelt gratitude,<br>
            <strong>Team Annadaan</strong><br>
            <em>"Feeding Hope, One Meal at a Time"</em>
          </p>
        </div>
        
        <div class="footer">
          <p>
            This is an automated receipt for your donation to Annadaan.<br>
            Please save this email for your records.
          </p>
          <p>
            © 2026 Annadaan. All rights reserved.<br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="color: #f97316;">www.annadaan.org</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: donorEmail,
    subject: '🎉 Your Donation Receipt - Annadaan Republic Day Drive 2026',
    html: receiptHtml
  })
}

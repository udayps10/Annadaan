import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { sendEmail } from '@/lib/email'
import { generateDonationReceipt } from '@/lib/pdfReceipt'

interface RouteParams {
  params: {
    id: string
    action: string
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id, action } = params
    const body = await request.json()
    const { adminId, approvalPhoto } = body

    if (!['approve', 'reject', 'collected'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    let status = action
    let updateFields = 'status = ?'
    let updateValues: any[] = []

    if (action === 'approve') {
      status = 'approved'
      updateFields += ', reviewed_by = ?, reviewed_at = NOW()'
      updateValues = [status, adminId || null]
    } else if (action === 'reject') {
      status = 'rejected'
      updateFields += ', reviewed_by = ?, reviewed_at = NOW()'
      updateValues = [status, adminId || null]
    } else if (action === 'collected') {
      updateFields += ', collected_at = NOW(), approval_photo = ?'
      updateValues = [status, approvalPhoto || null]
    }

    updateValues.push(id)

    // Get donor and donation details for email
    const donationDetails = await query(
      `SELECT 
        i.id, i.item_title, i.quantity, i.pickup_datetime, i.pickup_address, i.status,
        d.full_name, d.email, d.phone
       FROM item_donations i
       JOIN individual_donors d ON i.donor_id = d.id
       WHERE i.id = ?`,
      [id]
    )

    if (!donationDetails || donationDetails.length === 0) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    const donation = donationDetails[0]
    const donorId = await query('SELECT donor_id FROM item_donations WHERE id = ?', [id])
      .then(rows => rows[0]?.donor_id)

    // Update item donation status
    await query(
      `UPDATE item_donations 
       SET ${updateFields}
       WHERE id = ?`,
      updateValues
    )

    // Log the action
    await query(
      `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action, action_by) 
       VALUES (?, 'item', ?, ?, ?)`,
      [donorId, id, action, adminId || null]
    )

    // Send email notifications
    if (action === 'approve') {
      // Email on approval - inform about collection schedule
      const pickupDate = new Date(donation.pickup_datetime)
      await sendEmail({
        to: donation.email,
        subject: 'Item Donation Approved - Collection Scheduled',
        html: `
        <h2>🎉 Your Item Donation Has Been Approved!</h2>
        
        <p>Dear ${donation.full_name},</p>
        
        <p>Great news! Your item donation has been approved by our admin team.</p>
        
        <h3>Donation Details:</h3>
        <ul>
          <li><strong>Items:</strong> ${donation.item_title}</li>
          <li><strong>Quantity:</strong> ${donation.quantity}</li>
          <li><strong>Collection Date:</strong> ${pickupDate.toLocaleDateString('en-IN', { dateStyle: 'full' })}</li>
          <li><strong>Collection Time:</strong> ${pickupDate.toLocaleTimeString('en-IN', { timeStyle: 'short' })}</li>
          <li><strong>Address:</strong> ${donation.pickup_address}</li>
        </ul>
        
        <h3>What Happens Next?</h3>
        <p>Our collection team will arrive at your location on the scheduled date and time. They will:</p>
        <ol>
          <li>Verify and collect the donated items</li>
          <li>Take a photo for documentation</li>
          <li>Provide you with a final confirmation receipt</li>
        </ol>
        
        <p><strong>Please ensure someone is available at the collection address during the scheduled time.</strong></p>
        
        <p>Thank you for your generosity and support for our Republic Day 2026 Donation Drive!</p>
        
        <p>Best regards,<br>
        <strong>Annadaan Team</strong><br>
        Republic Day 2026 Donation Drive</p>
        `
      })
    } else if (action === 'reject') {
      // Email on rejection
      await sendEmail({
        to: donation.email,
        subject: 'Item Donation Status Update',
        html: `
        <h2>Item Donation Status Update</h2>
        
        <p>Dear ${donation.full_name},</p>
        
        <p>Thank you for your interest in donating to our Republic Day 2026 Donation Drive.</p>
        
        <p>Unfortunately, we are unable to accept the following donation at this time:</p>
        <ul>
          <li><strong>Items:</strong> ${donation.item_title}</li>
          <li><strong>Quantity:</strong> ${donation.quantity}</li>
        </ul>
        
        <p>This may be due to capacity constraints or item suitability. We appreciate your willingness to contribute.</p>
        
        <p>Please feel free to submit other donations or contribute through UPI if you'd like to support our cause.</p>
        
        <p>Thank you for your understanding.</p>
        
        <p>Best regards,<br>
        <strong>Annadaan Team</strong></p>
        `
      })
    } else if (action === 'collected') {
      // Generate PDF receipt
      const receiptNumber = `RCP-ITM-${String(donation.id).padStart(6, '0')}`
      const receiptData = {
        receiptNumber,
        dateOfIssue: new Date().toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        donorName: donation.full_name,
        donorEmail: donation.email,
        amount: 0, // Item donations don't have monetary value
        paymentMode: 'Item Donation',
        donationStatus: 'Collected',
        donationType: 'Item',
        itemDescription: donation.item_title,
        quantity: donation.quantity,
        isPreview: false
      }

      const pdfBuffer = await generateDonationReceipt(receiptData)
      const pdfBase64 = pdfBuffer.toString('base64')

      // Email after collection with photo and PDF receipt
      const emailAttachments: any[] = [
        {
          filename: `donation-receipt-${receiptNumber}.pdf`,
          content: pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf'
        }
      ]

      // Add photo if available
      if (approvalPhoto) {
        emailAttachments.push({
          filename: 'collection-photo.jpg',
          content: approvalPhoto.split('base64,')[1],
          encoding: 'base64',
          cid: 'collectionPhoto'
        })
      }

      await sendEmail({
        to: donation.email,
        subject: 'Item Donation Collected - Thank You! [Receipt Attached]',
        html: `
        <h2>✅ Items Successfully Collected!</h2>
        
        <p>Dear ${donation.full_name},</p>
        
        <p>We have successfully collected your donated items. Thank you so much for your generous contribution!</p>
        
        <h3>Collection Summary:</h3>
        <ul>
          <li><strong>Items:</strong> ${donation.item_title}</li>
          <li><strong>Quantity:</strong> ${donation.quantity}</li>
          <li><strong>Collection Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</li>
          <li><strong>Donation ID:</strong> #ITM${String(donation.id).padStart(6, '0')}</li>
          <li><strong>Receipt Number:</strong> ${receiptNumber}</li>
        </ul>
        
        ${approvalPhoto ? `
        <h3>Collection Photo:</h3>
        <p>Our team has documented the collection:</p>
        <img src="cid:collectionPhoto" alt="Collection photo" style="max-width: 500px; border-radius: 8px; margin: 20px 0; display: block;" />
        ` : ''}
        
        <p><strong>📄 Your official donation receipt is attached to this email as a PDF.</strong></p>
        
        <p>Your donation will directly help those in need during our Republic Day 2026 initiative.</p>
        
        <p>Thank you for making a difference!</p>
        
        <p>With gratitude,<br>
        <strong>Annadaan Team</strong><br>
        Republic Day 2026 Donation Drive</p>
        `,
        attachments: emailAttachments
      })
    }

    return NextResponse.json({
      message: `Item donation ${action}d successfully`,
      emailSent: true
    })

  } catch (error) {
    console.error('Item donation action error:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}

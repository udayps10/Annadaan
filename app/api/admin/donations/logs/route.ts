import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { handleError, handleSuccess } from '@/lib/errors'
import { createAuthContext } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    const auth = createAuthContext(request)
    auth.requireAdmin()

    const logs = await query(
      `SELECT 
        dl.*,
        d.full_name as donor_name,
        d.email as donor_email,
        u.name as admin_name,
        CASE 
          WHEN dl.donation_type = 'upi' THEN 'UPI Payment'
          WHEN dl.donation_type = 'item' THEN 'Item Donation'
        END as type_label
       FROM donation_logs dl
       JOIN individual_donors d ON dl.donor_id = d.id
       LEFT JOIN users u ON dl.action_by = u.id
       ORDER BY dl.created_at DESC
       LIMIT 100`
    )

    return handleSuccess({ logs })
  } catch (error) {
    console.error('Failed to fetch donation logs:', error)
    return handleError(error as Error)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

interface ApprovedDonation {
  id: number
  donor_name: string
  amount?: number
  item_title?: string
  quantity?: string
  transaction_id: string
  approved_at: string
  receipt_id: string
}

/**
 * PUBLIC API endpoint to fetch approved donations for display
 * No authentication required - this is for public donor walls
 * 
 * Query Parameters:
 * - upiIds: Comma-separated UPI donation IDs to filter (optional)
 * - itemIds: Comma-separated item donation IDs to filter (optional)
 * - type: 'upi', 'item', or 'all' (default: 'all')
 * 
 * If no IDs provided, returns ALL approved donations
 * If IDs provided, returns only those specific donations
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const upiIdsParam = searchParams.get('upiIds')
    const itemIdsParam = searchParams.get('itemIds')
    const type = searchParams.get('type') || 'all'

    // Parse donation IDs if provided
    const upiIds = upiIdsParam 
      ? upiIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : null
    
    const itemIds = itemIdsParam
      ? itemIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : null

    let upiDonations: ApprovedDonation[] = []
    let itemDonations: ApprovedDonation[] = []
    let upiTotal = 0
    let itemCount = 0

    // Fetch approved UPI donations if requested
    if (type === 'upi' || type === 'all') {
      let upiQuery = `
        SELECT 
          ud.id,
          id.full_name as donor_name,
          ud.amount,
          ud.transaction_id,
          ud.reviewed_at as approved_at,
          CONCAT('UPI-', LPAD(ud.id, 6, '0')) as receipt_id
        FROM upi_donations ud
        JOIN individual_donors id ON ud.donor_id = id.id
        WHERE ud.status = 'approved'`
      
      if (upiIds && upiIds.length > 0) {
        const placeholders = upiIds.map(() => '?').join(',')
        upiQuery += ` AND ud.id IN (${placeholders})`
      }
      
      upiQuery += ` ORDER BY ud.reviewed_at DESC`

      upiDonations = await executeQuery<ApprovedDonation[]>(
        upiQuery,
        upiIds || []
      )

      upiTotal = upiDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    }

    // Fetch approved item donations if requested
    if (type === 'item' || type === 'all') {
      let itemQuery = `
        SELECT 
          itd.id,
          id.full_name as donor_name,
          itd.item_title,
          itd.quantity,
          itd.transaction_id,
          itd.reviewed_at as approved_at,
          CONCAT('ITEM-', LPAD(itd.id, 6, '0')) as receipt_id
        FROM item_donations itd
        JOIN individual_donors id ON itd.donor_id = id.id
        WHERE itd.status IN ('approved', 'collected')`
      
      if (itemIds && itemIds.length > 0) {
        const placeholders = itemIds.map(() => '?').join(',')
        itemQuery += ` AND itd.id IN (${placeholders})`
      }
      
      itemQuery += ` ORDER BY itd.reviewed_at DESC`

      itemDonations = await executeQuery<ApprovedDonation[]>(
        itemQuery,
        itemIds || []
      )

      itemCount = itemDonations.length
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalUPIDonations: upiTotal,
        upiDonationCount: upiDonations.length,
        itemDonationCount: itemCount
      },
      donations: {
        upi: upiDonations,
        items: itemDonations
      }
    })

  } catch (error) {
    console.error('Error fetching approved donations:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch approved donations' 
      },
      { status: 500 }
    )
  }
}

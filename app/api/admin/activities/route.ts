import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { createAuthContext } from '@/lib/middleware'
import { handleError, handleSuccess } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = createAuthContext(request)
    auth.requireAdmin()

    // Get recent activities (last 30 days)
    const activities = await executeQuery(`
      SELECT 
        'listing_created' as activity_type,
        fl.id as item_id,
        fl.title as title,
        u.name as user_name,
        u.role as user_role,
        vp.business_name as business_name,
        fl.created_at as timestamp,
        'Food listing created' as description,
        fl.status as status
      FROM food_listings fl
      JOIN users u ON fl.vendor_id = u.id
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      WHERE fl.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      UNION ALL
      
      SELECT 
        'pickup_requested' as activity_type,
        pr.id as item_id,
        fl.title as title,
        u.name as user_name,
        u.role as user_role,
        np.organization_name as business_name,
        pr.created_at as timestamp,
        'Pickup request submitted' as description,
        pr.status as status
      FROM pickup_requests pr
      JOIN users u ON pr.ngo_id = u.id
      JOIN food_listings fl ON pr.listing_id = fl.id
      LEFT JOIN ngo_profiles np ON u.id = np.user_id
      WHERE pr.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      
      UNION ALL
      
      SELECT 
        'pickup_status_change' as activity_type,
        pr.id as item_id,
        fl.title as title,
        u.name as user_name,
        'system' as user_role,
        CASE 
          WHEN pr.status = 'approved' THEN 'Pickup approved'
          WHEN pr.status = 'rejected' THEN 'Pickup rejected'
          WHEN pr.status = 'completed' THEN 'Pickup completed'
          ELSE 'Status updated'
        END as business_name,
        pr.updated_at as timestamp,
        CASE 
          WHEN pr.status = 'approved' THEN 'Pickup request approved by vendor'
          WHEN pr.status = 'rejected' THEN 'Pickup request rejected by vendor'
          WHEN pr.status = 'completed' THEN 'Pickup completed with photo verification'
          ELSE 'Pickup status updated'
        END as description,
        pr.status as status
      FROM pickup_requests pr
      JOIN food_listings fl ON pr.listing_id = fl.id
      JOIN users u ON pr.ngo_id = u.id
      WHERE pr.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      AND pr.updated_at != pr.created_at
      
      ORDER BY timestamp DESC
    `) as any[]

    // Get completed deliveries with details
    const deliveries = await executeQuery(`
      SELECT 
        pr.id,
        fl.title as food_title,
        fl.description as food_description,
        fl.quantity,
        pr.pickup_photo_url,
        pr.pickup_photo_filename,
        pr.pickup_notes,
        pr.created_at as requested_at,
        pr.updated_at as completed_at,
        vu.name as vendor_name,
        vp.business_name,
        nu.name as ngo_name,
        np.organization_name,
        pr.vendor_response
      FROM pickup_requests pr
      JOIN food_listings fl ON pr.listing_id = fl.id
      JOIN users vu ON fl.vendor_id = vu.id
      JOIN users nu ON pr.ngo_id = nu.id
      LEFT JOIN vendor_profiles vp ON vu.id = vp.user_id
      LEFT JOIN ngo_profiles np ON nu.id = np.user_id
      WHERE pr.status = 'completed'
      ORDER BY pr.updated_at DESC
    `) as any[]

    // Get user statistics
    const userStatsResult = await executeQuery(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'vendor' THEN 1 ELSE 0 END) as total_vendors,
        SUM(CASE WHEN role = 'ngo' THEN 1 ELSE 0 END) as total_ngos,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_users_this_month
      FROM users
      WHERE role != 'admin'
    `) as any[]

    // Get food rescue statistics
    const rescueStatsResult = await executeQuery(`
      SELECT 
        COUNT(DISTINCT fl.id) as total_listings,
        COUNT(DISTINCT CASE WHEN pr.status = 'completed' THEN pr.id END) as completed_pickups,
        COUNT(DISTINCT CASE WHEN fl.status = 'available' THEN fl.id END) as available_listings,
        COUNT(DISTINCT CASE WHEN pr.status = 'pending' THEN pr.id END) as pending_requests
      FROM food_listings fl
      LEFT JOIN pickup_requests pr ON fl.id = pr.listing_id
    `) as any[]

    // Get recent user registrations
    const recentUsers = await executeQuery(`
      SELECT 
        user.id,
        user.name,
        user.email,
        user.role,
        user.created_at,
        COALESCE(vp.business_name, np.organization_name) as organization_name
      FROM users user
      LEFT JOIN vendor_profiles vp ON user.id = vp.user_id
      LEFT JOIN ngo_profiles np ON user.id = np.user_id
      WHERE user.role != 'admin'
      ORDER BY user.created_at DESC
    `) as any[]

    return handleSuccess({
      activities,
      deliveries,
      userStats: userStatsResult[0] || {},
      rescueStats: rescueStatsResult[0] || {},
      recentUsers
    })

  } catch (error) {
    return handleError(error as Error)
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    await initializeDatabase();
    
    // Insert sample admin user
    const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwLhXVMXCrLWKoG'; // password: admin123
    
    await executeQuery(
      `INSERT IGNORE INTO users (email, password, full_name, user_type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['admin@foodrescue.com', hashedPassword, 'Admin User', 'admin', 'approved']
    );

    // Insert sample vendor
    const vendorResult = await executeQuery(
      `INSERT IGNORE INTO users (email, password, full_name, user_type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['vendor@demo.com', hashedPassword, 'Demo Restaurant', 'vendor', 'approved']
    ) as any;

    if (vendorResult.insertId) {
      await executeQuery(
        `INSERT INTO vendor_profiles (user_id, business_name, business_type) 
         VALUES (?, ?, ?)`,
        [vendorResult.insertId, 'Demo Restaurant', 'restaurant']
      );
    }

    // Insert sample NGO
    const ngoResult = await executeQuery(
      `INSERT IGNORE INTO users (email, password, full_name, user_type, status) 
       VALUES (?, ?, ?, ?, ?)`,
      ['ngo@demo.com', hashedPassword, 'Hope Shelter', 'ngo', 'approved']
    ) as any;

    if (ngoResult.insertId) {
      await executeQuery(
        `INSERT INTO ngo_profiles (user_id, organization_name, focus_area, capacity) 
         VALUES (?, ?, ?, ?)`,
        [ngoResult.insertId, 'Hope Shelter', 'homeless', 100]
      );
    }

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      sampleUsers: {
        admin: 'admin@foodrescue.com / admin123',
        vendor: 'vendor@demo.com / admin123',
        ngo: 'ngo@demo.com / admin123'
      }
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ error: 'Database setup failed' }, { status: 500 });
  }
}

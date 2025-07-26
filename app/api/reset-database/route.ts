import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // WARNING: This endpoint clears ALL data - use with caution!
    // You might want to add additional security checks here
    
    const { confirm } = await request.json();
    
    if (confirm !== 'CLEAR_ALL_DATA') {
      return NextResponse.json({ 
        message: 'Confirmation required. Send {"confirm": "CLEAR_ALL_DATA"} to proceed.' 
      }, { status: 400 });
    }

    // Disable foreign key checks
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

    // Clear all data from tables
    await executeQuery('TRUNCATE TABLE pickup_requests');
    await executeQuery('TRUNCATE TABLE food_listings');
    await executeQuery('TRUNCATE TABLE ngo_profiles');
    await executeQuery('TRUNCATE TABLE vendor_profiles');
    await executeQuery('TRUNCATE TABLE users');

    // Re-enable foreign key checks
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

    // Reset auto-increment counters
    await executeQuery('ALTER TABLE pickup_requests AUTO_INCREMENT = 1');
    await executeQuery('ALTER TABLE food_listings AUTO_INCREMENT = 1');
    await executeQuery('ALTER TABLE ngo_profiles AUTO_INCREMENT = 1');
    await executeQuery('ALTER TABLE vendor_profiles AUTO_INCREMENT = 1');
    await executeQuery('ALTER TABLE users AUTO_INCREMENT = 1');

    // Create fresh sample users
    const adminPassword = await hashPassword('admin123');
    const vendorPassword = await hashPassword('vendor123');
    const ngoPassword = await hashPassword('ngo123');

    await executeQuery(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@foodrescue.com', adminPassword, 'admin']
    );

    await executeQuery(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Fresh Market', 'vendor@foodrescue.com', vendorPassword, 'vendor']
    );

    await executeQuery(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Helping Hands NGO', 'ngo@foodrescue.com', ngoPassword, 'ngo']
    );

    return NextResponse.json({
      message: 'Database cleared successfully!',
      sampleUsers: [
        { email: 'admin@foodrescue.com', password: 'admin123', role: 'admin' },
        { email: 'vendor@foodrescue.com', password: 'vendor123', role: 'vendor' },
        { email: 'ngo@foodrescue.com', password: 'ngo123', role: 'ngo' }
      ]
    });

  } catch (error) {
    console.error('Database reset error:', error);
    return NextResponse.json({ message: 'Failed to reset database' }, { status: 500 });
  }
}

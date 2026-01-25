import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, initializeDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Setup endpoint is disabled' 
  }, { status: 403 });
  
  /* DISABLED - Uncomment only for initial setup
  try {
    await initializeDatabase();
    
        // Insert sample admin user
    const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewwLhXVMXCrLWKoG'; // password: admin123
    
    await executeQuery(
      `INSERT IGNORE INTO users (email, password, name, full_name, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@foodrescue.com', hashedPassword, 'Admin User', 'Admin User', 'admin', 'approved']
    );

    // Insert sample vendor
    const vendorResult = await executeQuery(
      `INSERT IGNORE INTO users (email, password, name, full_name, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['vendor@demo.com', hashedPassword, 'Demo Restaurant', 'Demo Restaurant', 'vendor', 'approved']
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
      `INSERT IGNORE INTO users (email, password, name, full_name, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['ngo@demo.com', hashedPassword, 'Hope Shelter', 'Hope Shelter', 'ngo', 'approved']
    ) as any;

    if (ngoResult.insertId) {
      await executeQuery(
        `INSERT INTO ngo_profiles (user_id, organization_name, area_of_operation) 
         VALUES (?, ?, ?)`,
        [ngoResult.insertId, 'Hope Shelter', 'homeless support']
      );
    }

    // Insert sample gallery photos
    const samplePhotos = [
      {
        userId: ngoResult.insertId || 2,
        title: 'Community Lunch at Hope Shelter',
        description: 'Served warm meals to 45 families at our downtown shelter. The donated food from local restaurants helped provide nutritious meals for children and adults.',
        location: 'Downtown Community Center',
        peopleHelped: 45,
        tags: JSON.stringify(['Community Lunch', 'Homeless Shelter', 'Family Support']),
        photoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbW11bml0eSBMdW5jaDwvdGV4dD48L3N2Zz4=',
        isApproved: true
      },
      {
        userId: vendorResult.insertId || 3,
        title: 'Holiday Meal Distribution',
        description: 'Our restaurant partnered with local NGOs to distribute special holiday meals to 80 seniors in the community. Everyone deserves a warm meal during the holidays.',
        location: 'Senior Community Center',
        peopleHelped: 80,
        tags: JSON.stringify(['Holiday Meal', 'Senior Center', 'Community Partnership']),
        photoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhvbGlkYXkgTWVhbDwvdGV4dD48L3N2Zz4=',
        isApproved: true
      }
    ];

    for (const photo of samplePhotos) {
      await executeQuery(
        `INSERT IGNORE INTO impact_photos 
         (user_id, title, description, location, people_helped, tags, photo_url, is_approved, is_public) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          photo.userId,
          photo.title,
          photo.description,
          photo.location,
          photo.peopleHelped,
          photo.tags,
          photo.photoUrl,
          photo.isApproved,
          true
        ]
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
  */
}

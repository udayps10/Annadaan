import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const migrations = [];

    // Update the photo_url column in impact_photos to LONGTEXT
    try {
      await executeQuery(`
        ALTER TABLE impact_photos 
        MODIFY COLUMN photo_url LONGTEXT NOT NULL
      `);
      migrations.push('impact_photos.photo_url updated to LONGTEXT');
    } catch (error: any) {
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
        migrations.push('impact_photos table does not exist yet - will be created correctly');
      } else {
        migrations.push('impact_photos.photo_url update failed: ' + error.message);
      }
    }

    // Update pickup_photo_url column in pickup_requests to LONGTEXT
    try {
      await executeQuery(`
        ALTER TABLE pickup_requests 
        MODIFY COLUMN pickup_photo_url LONGTEXT
      `);
      migrations.push('pickup_requests.pickup_photo_url updated to LONGTEXT');
    } catch (error: any) {
      if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE') {
        migrations.push('pickup_requests.pickup_photo_url does not exist yet - will be created correctly');
      } else {
        migrations.push('pickup_requests.pickup_photo_url update failed: ' + error.message);
      }
    }

    return NextResponse.json({ 
      message: 'Database migration completed',
      migrations: migrations
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: 'Migration failed: ' + error.message 
    }, { status: 500 });
  }
}

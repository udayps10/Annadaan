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

    // Add transaction_id column to item_donations table
    try {
      await executeQuery(`
        ALTER TABLE item_donations 
        ADD COLUMN transaction_id VARCHAR(255) NULL AFTER donor_id
      `);
      migrations.push('item_donations.transaction_id column added');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        migrations.push('item_donations.transaction_id already exists');
      } else if (error.code === 'ER_NO_SUCH_TABLE') {
        migrations.push('item_donations table does not exist yet - will be created correctly');
      } else {
        migrations.push('item_donations.transaction_id add failed: ' + error.message);
      }
    }

    // Generate transaction IDs for existing item donations without one
    try {
      const result = await executeQuery(`
        UPDATE item_donations 
        SET transaction_id = CONCAT('ITEM-', DATE_FORMAT(created_at, '%Y%m%d-%H%i%s'), '-', UPPER(SUBSTRING(MD5(RAND()), 1, 6)))
        WHERE transaction_id IS NULL
      `);
      migrations.push(`Generated transaction IDs for ${(result as any).affectedRows} existing item donations`);
    } catch (error: any) {
      migrations.push('item_donations transaction ID generation skipped: ' + error.message);
    }

    // Generate transaction IDs for existing UPI donations without one
    try {
      const result = await executeQuery(`
        UPDATE upi_donations 
        SET transaction_id = CONCAT('UPI-', DATE_FORMAT(created_at, '%Y%m%d-%H%i%s'), '-', UPPER(SUBSTRING(MD5(RAND()), 1, 6)))
        WHERE transaction_id IS NULL
      `);
      migrations.push(`Generated transaction IDs for ${(result as any).affectedRows} existing UPI donations`);
    } catch (error: any) {
      migrations.push('upi_donations transaction ID generation skipped: ' + error.message);
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

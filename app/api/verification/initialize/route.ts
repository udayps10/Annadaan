import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Check if verification profile already exists
    const existingProfile = await executeQuery(
      'SELECT id FROM verification_profiles WHERE user_id = ?',
      [userId]
    ) as any[];

    if (existingProfile.length > 0) {
      // Update existing profile
      await executeQuery(
        'UPDATE verification_profiles SET verification_status = ?, submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
        ['pending', userId]
      );
    } else {
      // Create new verification profile
      await executeQuery(
        'INSERT INTO verification_profiles (user_id, verification_status, submitted_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [userId, 'pending']
      );
    }

    return NextResponse.json({
      message: 'Verification profile initialized successfully',
      status: 'pending'
    });

  } catch (error) {
    console.error('Verification initialization error:', error);
    return NextResponse.json({ message: 'Failed to initialize verification' }, { status: 500 });
  }
}

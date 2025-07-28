import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

    const data = await request.formData();
    const file: File | null = data.get('photo') as unknown as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB for gallery photos)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        message: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '_'); // Replace spaces with underscores
    const filename = `gallery_${timestamp}_${decoded.userId}_${originalName}`;

    // Convert buffer to base64 for database storage (production-compatible)
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Return the data URL for immediate use
    return NextResponse.json({
      message: 'Gallery photo uploaded successfully',
      filename,
      url: dataUrl, // Return data URL for immediate use
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Gallery photo upload error:', error);
    return NextResponse.json({ message: 'Failed to upload gallery photo' }, { status: 500 });
  }
}

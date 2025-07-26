import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Join the path segments
    const imagePath = params.path.join('/');
    
    // Construct the full file path
    const fullPath = join(process.cwd(), 'public', 'uploads', imagePath);
    
    // Security check: ensure the path doesn't contain directory traversal
    if (imagePath.includes('..') || !imagePath.startsWith('pickup-photos/')) {
      return NextResponse.json({ message: 'Invalid path' }, { status: 400 });
    }
    
    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json({ message: 'Image not found' }, { status: 404 });
    }
    
    // Read the file
    const fileBuffer = await readFile(fullPath);
    
    // Determine content type based on file extension
    const extension = imagePath.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (extension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'svg':
        contentType = 'image/svg+xml';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        contentType = 'image/jpeg';
        break;
    }
    
    // Return the image with proper headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': fileBuffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

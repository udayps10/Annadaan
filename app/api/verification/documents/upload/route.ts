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

    const data = await request.formData();
    const file: File | null = data.get('document') as unknown as File;
    const documentType = data.get('documentType') as string;
    const userId = data.get('userId') as string;

    if (!file) {
      return NextResponse.json({ message: 'No document uploaded' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ message: 'Document type is required' }, { status: 400 });
    }

    // Validate file type (PDF, JPG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
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
    const filename = `${userId}_${documentType}_${timestamp}.${originalName.split('.').pop()}`;

    // Convert buffer to base64 for database storage (production-compatible)
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64Data}`;

    // Check if document already exists for this user and type
    const existingDoc = await executeQuery(
      'SELECT id FROM verification_documents WHERE user_id = ? AND document_type = ?',
      [userId, documentType]
    ) as any[];

    if (existingDoc.length > 0) {
      // Update existing document
      await executeQuery(
        'UPDATE verification_documents SET document_url = ?, document_filename = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND document_type = ?',
        [dataUrl, filename, 'pending', userId, documentType]
      );
    } else {
      // Insert new document
      await executeQuery(
        'INSERT INTO verification_documents (user_id, document_type, document_url, document_filename, status) VALUES (?, ?, ?, ?, ?)',
        [userId, documentType, dataUrl, filename, 'pending']
      );
    }

    return NextResponse.json({
      message: 'Document uploaded successfully',
      filename,
      documentType,
      status: 'pending'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ message: 'Failed to upload document' }, { status: 500 });
  }
}

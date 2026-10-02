import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const subfolder = (formData.get('folder') as string) || 'services';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/avif', 'image/jpg'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a JPG, PNG, WebP or SVG image.' }, { status: 400 });
    }

    // Limit size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size exceeds 10MB limit.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', subfolder);
    await mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const cleanOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(cleanOriginal) || '.jpg';
    const base = path.basename(cleanOriginal, ext);
    const uniqueFileName = `${base}_${Date.now()}${ext}`;

    const filePath = path.join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${subfolder}/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
      size: file.size,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';

// Detect if running on Vercel (serverless) where filesystem is read-only
const isVercel = !!process.env.VERCEL;

function getUploadsDir(subfolder: string): string {
  if (isVercel) {
    // On Vercel, /tmp is the only writable directory
    return path.join('/tmp', 'uploads', subfolder);
  }
  // Local dev: write to public/uploads
  return path.join(process.cwd(), 'public', 'uploads', subfolder);
}

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
    const uploadsDir = getUploadsDir(subfolder);
    await mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const cleanOriginal = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(cleanOriginal) || '.jpg';
    const base = path.basename(cleanOriginal, ext);
    const uniqueFileName = `${base}_${Date.now()}${ext}`;

    const filePath = path.join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer);

    // On Vercel, serve via the API route since /tmp isn't publicly accessible
    // On local dev, serve directly from /public
    const publicUrl = isVercel
      ? `/api/upload?file=${subfolder}/${uniqueFileName}`
      : `/uploads/${subfolder}/${uniqueFileName}`;

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

// GET handler to serve uploaded files from /tmp on Vercel
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('file');

    if (!filePath) {
      return NextResponse.json({ error: 'No file specified' }, { status: 400 });
    }

    // Sanitize path to prevent directory traversal
    const sanitized = filePath.replace(/\.\./g, '').replace(/^\//, '');
    const fullPath = isVercel
      ? path.join('/tmp', 'uploads', sanitized)
      : path.join(process.cwd(), 'public', 'uploads', sanitized);

    const fileBuffer = await readFile(fullPath);

    // Determine content type from extension
    const ext = path.extname(sanitized).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.avif': 'image/avif',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}

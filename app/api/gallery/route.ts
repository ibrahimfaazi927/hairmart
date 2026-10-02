import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const images = await prisma.galleryImage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(images);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, image } = body;

    if (!image) {
      return NextResponse.json({ error: 'Image URL/Path is required' }, { status: 400 });
    }

    const newImage = await prisma.galleryImage.create({
      data: {
        title,
        category: category || 'general',
        image,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    await prisma.galleryImage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

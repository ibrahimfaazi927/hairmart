import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const activeOnly = searchParams.get('active') === 'true';

    const where: any = {};
    if (section) {
      where.section = section.toLowerCase();
    }
    if (activeOnly) {
      where.active = true;
    }

    const chairs = await prisma.chair.findMany({
      where,
      include: {
        assignedStaff: {
          select: {
            id: true,
            name: true,
            role: true,
            phone: true,
            status: true,
            gender: true,
          },
        },
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(chairs);
  } catch (error: any) {
    console.error('Failed to fetch chairs:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch chairs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, section, sortOrder, active } = body;

    if (!name || !section) {
      return NextResponse.json({ error: 'Name and section (men/women) are required' }, { status: 400 });
    }

    const chair = await prisma.chair.create({
      data: {
        name: name.trim(),
        section: section.toLowerCase().trim(),
        sortOrder: sortOrder ? Number(sortOrder) : 0,
        active: active !== undefined ? Boolean(active) : true,
      },
      include: {
        assignedStaff: true,
      },
    });

    return NextResponse.json(chair, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create chair:', error);
    return NextResponse.json({ error: error.message || 'Failed to create chair' }, { status: 500 });
  }
}

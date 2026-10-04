import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const section = searchParams.get('section');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (section && section !== 'all') {
      where.section = section.toLowerCase();
    }

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        chair: true,
        attendances: {
          orderBy: { date: 'desc' },
          take: 31,
        },
        leaves: {
          orderBy: { startDate: 'desc' },
          take: 10,
        },
      },
      orderBy: [{ section: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(staffList);
  } catch (error: any) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      phone,
      gender,
      section,
      chairId,
      joiningDate,
      status,
      notes,
      avatar,
      specialties,
    } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const parsedJoiningDate = joiningDate ? new Date(joiningDate) : new Date();

    // If chairId provided, disconnect other staff assigned to that chair
    if (chairId) {
      await prisma.staff.updateMany({
        where: { chairId },
        data: { chairId: null },
      });
    }

    const newStaff = await prisma.staff.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        phone: phone ? phone.trim() : null,
        gender: gender || 'male',
        section: section ? section.toLowerCase() : 'men',
        chairId: chairId || null,
        joiningDate: parsedJoiningDate,
        status: status || 'active',
        notes: notes || null,
        avatar: avatar || null,
        specialties: specialties || null,
      },
      include: {
        chair: true,
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to create staff' }, { status: 500 });
  }
}

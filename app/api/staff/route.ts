import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const staffList = await prisma.staff.findMany({
      where,
      include: {
        appointmentServices: {
          include: {
            service: true,
            appointment: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Compute basic totals for each staff member
    const enriched = staffList.map((s) => {
      const completedServices = s.appointmentServices || [];
      const totalServices = completedServices.reduce((sum, item) => sum + (item.quantity || 1), 0);
      const totalRevenue = completedServices.reduce((sum, item) => sum + ((item.quantity || 1) * item.price), 0);
      const uniqueAppointments = new Set(completedServices.map((item) => item.appointmentId)).size;

      return {
        id: s.id,
        name: s.name,
        role: s.role,
        phone: s.phone,
        avatar: s.avatar,
        status: s.status,
        joiningDate: s.joiningDate,
        specialties: s.specialties,
        totalServices,
        totalRevenue,
        uniqueAppointments,
      };
    });

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, phone, avatar, specialties, status } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const newStaff = await prisma.staff.create({
      data: {
        name,
        role,
        phone: phone || null,
        avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        specialties: specialties || null,
        status: status || 'active',
      },
    });

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to create staff' }, { status: 500 });
  }
}

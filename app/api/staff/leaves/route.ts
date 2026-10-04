import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');

    const where: any = {};
    if (staffId && staffId !== 'all') {
      where.staffId = staffId;
    }

    const leaves = await prisma.staffLeave.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            role: true,
            section: true,
            chair: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(leaves);
  } catch (error: any) {
    console.error('Failed to fetch leaves:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch leaves' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, startDate, endDate, leaveType, reason, status } = body;

    if (!staffId || !startDate) {
      return NextResponse.json({ error: 'Staff ID and start date are required' }, { status: 400 });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = endDate ? new Date(endDate) : new Date(startDate);
    const finalLeaveType = leaveType || 'Casual';
    const finalStatus = status || 'approved';

    const leave = await prisma.staffLeave.create({
      data: {
        staffId,
        startDate: parsedStart,
        endDate: parsedEnd,
        leaveType: finalLeaveType,
        reason: reason || null,
        status: finalStatus,
      },
      include: {
        staff: true,
      },
    });

    // Requirement: Leave records should correctly affect attendance calculations
    if (finalStatus === 'approved') {
      const cur = new Date(parsedStart);
      const end = new Date(parsedEnd);

      while (cur <= end) {
        const normalizedDate = new Date(Date.UTC(
          cur.getFullYear(),
          cur.getMonth(),
          cur.getDate(),
          0, 0, 0, 0
        ));

        await prisma.staffAttendance.upsert({
          where: {
            staffId_date: {
              staffId,
              date: normalizedDate,
            },
          },
          create: {
            staffId,
            date: normalizedDate,
            status: 'Leave',
            notes: `${finalLeaveType} Leave: ${reason || 'Approved leave'}`,
          },
          update: {
            status: 'Leave',
            notes: `${finalLeaveType} Leave: ${reason || 'Approved leave'}`,
          },
        });

        cur.setDate(cur.getDate() + 1);
      }
    }

    return NextResponse.json(leave, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create leave:', error);
    return NextResponse.json({ error: error.message || 'Failed to create leave' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStartOfTodayUTC, getSalonDateString } from '@/lib/attendanceSessions';

function parseTimeToMinutes(timeStr: string): number | null {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

function calculateWorkingDuration(checkInStr: string, checkOutStr: string): string {
  const inMins = parseTimeToMinutes(checkInStr);
  const outMins = parseTimeToMinutes(checkOutStr);

  if (inMins === null || outMins === null) return '—';

  let diff = outMins - inMins;
  if (diff < 0) diff += 24 * 60;

  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;

  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} hrs`;
  return `${hrs} hrs ${mins} mins`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date'); // YYYY-MM-DD
    const monthParam = searchParams.get('month'); // YYYY-MM
    const staffId = searchParams.get('staffId');
    const todayParam = searchParams.get('today');

    const where: any = {};
    if (staffId && staffId !== 'all') {
      where.staffId = staffId;
    }

    if (todayParam === 'true' || todayParam === '1') {
      const startOfDay = getStartOfTodayUTC();
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      where.date = { gte: startOfDay, lte: endOfDay };
    } else if (dateParam) {
      const startOfDay = getStartOfTodayUTC(dateParam);
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
      where.date = { gte: startOfDay, lte: endOfDay };
    } else if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
      where.date = { gte: startOfMonth, lte: endOfMonth };
    }

    const [rawAttendances, allStaff] = await Promise.all([
      prisma.staffAttendance.findMany({
        where,
        include: {
          staff: {
            select: {
              id: true,
              name: true,
              role: true,
              section: true,
              chair: true,
              status: true,
              avatar: true,
            },
          },
        },
        orderBy: [{ date: 'desc' }, { staff: { name: 'asc' } }],
      }),
      prisma.staff.findMany({
        where: { status: 'active' },
        include: { chair: true },
        orderBy: [{ section: 'asc' }, { name: 'asc' }],
      }),
    ]);

    // Ensure working duration is computed
    const attendances = rawAttendances.map((a) => {
      let duration = a.duration;
      if (!duration && a.checkIn && a.checkOut) {
        duration = calculateWorkingDuration(a.checkIn, a.checkOut);
      }
      return {
        ...a,
        duration: duration || (a.checkIn && !a.checkOut ? 'In Progress' : '—'),
      };
    });

    // Compute stats
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalHalfDay = 0;
    let totalLeave = 0;
    let totalHoliday = 0;

    attendances.forEach((a) => {
      const st = a.status.toLowerCase();
      if (st === 'present') totalPresent += 1;
      else if (st === 'absent') totalAbsent += 1;
      else if (st === 'half day') totalHalfDay += 1;
      else if (st === 'leave') totalLeave += 1;
      else if (st === 'holiday') totalHoliday += 1;
    });

    return NextResponse.json({
      attendances,
      allStaff,
      summary: {
        totalRecords: attendances.length,
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalLeave,
        totalHoliday,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch attendance:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch attendance' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId, date, checkIn, checkOut, status, notes } = body;

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const normalizedDate = getStartOfTodayUTC(date || undefined);

    const finalStatus = status || 'Present';
    let duration: string | null = null;
    if (checkIn && checkOut) {
      duration = calculateWorkingDuration(checkIn, checkOut);
    }

    const record = await prisma.staffAttendance.upsert({
      where: {
        staffId_date: {
          staffId,
          date: normalizedDate,
        },
      },
      create: {
        staffId,
        date: normalizedDate,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        duration,
        status: finalStatus,
        notes: notes || null,
      },
      update: {
        ...(checkIn !== undefined ? { checkIn } : {}),
        ...(checkOut !== undefined ? { checkOut } : {}),
        ...(duration !== null ? { duration } : {}),
        ...(status !== undefined ? { status: finalStatus } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        staff: {
          include: { chair: true },
        },
      },
    });

    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Failed to record attendance:', error);
    return NextResponse.json({ error: error.message || 'Failed to record attendance' }, { status: 500 });
  }
}

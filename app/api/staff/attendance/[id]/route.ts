import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { checkIn, checkOut, status, notes } = body;

    const existing = await prisma.staffAttendance.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    const updatedCheckIn = checkIn !== undefined ? checkIn : existing.checkIn;
    const updatedCheckOut = checkOut !== undefined ? checkOut : existing.checkOut;

    let duration = existing.duration;
    if (updatedCheckIn && updatedCheckOut) {
      duration = calculateWorkingDuration(updatedCheckIn, updatedCheckOut);
    } else if (!updatedCheckOut) {
      duration = null;
    }

    const updated = await prisma.staffAttendance.update({
      where: { id },
      data: {
        ...(checkIn !== undefined ? { checkIn } : {}),
        ...(checkOut !== undefined ? { checkOut } : {}),
        duration,
        ...(status !== undefined ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        staff: {
          include: { chair: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance corrected by admin',
      attendance: updated,
    });
  } catch (error: any) {
    console.error('Failed to correct attendance:', error);
    return NextResponse.json({ error: error.message || 'Failed to correct attendance' }, { status: 500 });
  }
}

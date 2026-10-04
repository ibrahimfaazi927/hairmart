import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  formatCurrentTime,
  getStartOfTodayUTC,
  calculateMinutesDiff,
  formatMinutesToDuration,
  parseSessionsFromRecord,
  serializeSessionsToNotes,
  calculateTotalMinutes,
} from '@/lib/attendanceSessions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { staffId } = body;

    if (!staffId) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const todayDate = getStartOfTodayUTC();

    const existing = await prisma.staffAttendance.findUnique({
      where: {
        staffId_date: {
          staffId,
          date: todayDate,
        },
      },
    });

    // Rule: Prevent Walk-Out before Walk-In
    if (!existing || !existing.checkIn) {
      return NextResponse.json(
        {
          error: 'Walk-out before walk-in is not allowed. You must first record Walk In when starting your shift.',
        },
        { status: 400 }
      );
    }

    const sessions = parseSessionsFromRecord(existing.notes, existing.checkIn, existing.checkOut);
    const activeSession = sessions.find((s) => s.out === null);

    // Rule: If already walked out and not clocked back in:
    if (!activeSession && existing.checkOut) {
      return NextResponse.json(
        {
          error: `You are already walked out for break/departure at ${existing.checkOut} (Total duration: ${existing.duration || 'completed'}). Click Walk In when returning from lunch.`,
          attendance: existing,
        },
        { status: 400 }
      );
    }

    // Automatically record current time (NO manual time typing!)
    const autoCheckOutTime = formatCurrentTime();

    if (activeSession) {
      activeSession.out = autoCheckOutTime;
      activeSession.durationMinutes = calculateMinutesDiff(activeSession.in, autoCheckOutTime);
    } else {
      // Fallback in case of raw record
      const inTime = existing.checkIn;
      const mins = calculateMinutesDiff(inTime, autoCheckOutTime);
      sessions.push({
        sessionNum: 1,
        in: inTime,
        out: autoCheckOutTime,
        durationMinutes: mins,
      });
    }

    const totalMinutes = calculateTotalMinutes(sessions);
    const totalDuration = formatMinutesToDuration(totalMinutes);
    const updatedNotes = serializeSessionsToNotes(sessions);

    const record = await prisma.staffAttendance.update({
      where: {
        staffId_date: {
          staffId,
          date: todayDate,
        },
      },
      data: {
        checkOut: autoCheckOutTime,
        duration: totalDuration,
        notes: updatedNotes,
        status: 'Present',
      },
      include: {
        staff: {
          include: { chair: true },
        },
      },
    });

    const isMiddayBreak = sessions.length === 1;
    const sessionLabel = `Session ${activeSession?.sessionNum || sessions.length}`;

    return NextResponse.json({
      success: true,
      message: `Walk Out recorded at ${autoCheckOutTime} (${sessionLabel} ended). Total working duration today: ${totalDuration}.`,
      attendance: record,
    });
  } catch (error: any) {
    console.error('Failed to process Walk Out:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Walk Out' }, { status: 500 });
  }
}

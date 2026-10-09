import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  formatCurrentTime,
  getStartOfTodayUTC,
  parseSessionsFromRecord,
  serializeSessionsToNotes,
  calculateTotalMinutes,
  formatMinutesToDuration,
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
      include: { chair: true },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    if (staff.status !== 'active') {
      return NextResponse.json({ error: 'Inactive staff cannot mark attendance' }, { status: 403 });
    }

    const todayDate = getStartOfTodayUTC();
    const autoCheckInTime = formatCurrentTime();

    // Check if attendance already recorded today
    const existing = await prisma.staffAttendance.findUnique({
      where: {
        staffId_date: {
          staffId,
          date: todayDate,
        },
      },
    });

    // ── CASE 1: Brand new day (First Walk-In) ──
    if (!existing || !existing.checkIn) {
      const initialSessions = [
        {
          sessionNum: 1,
          in: autoCheckInTime,
          out: null,
          durationMinutes: 0,
        },
      ];
      const notes = serializeSessionsToNotes(initialSessions);

      const record = await prisma.staffAttendance.upsert({
        where: {
          staffId_date: {
            staffId,
            date: todayDate,
          },
        },
        create: {
          staffId,
          date: todayDate,
          checkIn: autoCheckInTime,
          checkOut: null,
          status: 'Present',
          notes,
        },
        update: {
          checkIn: autoCheckInTime,
          checkOut: null,
          status: 'Present',
          notes,
        },
        include: {
          staff: {
            include: { chair: true },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: `Walk In recorded successfully at ${autoCheckInTime}`,
        attendance: record,
      });
    }

    // ── CASE 2: Staff already has attendance today ──
    const sessions = parseSessionsFromRecord(existing.notes, existing.checkIn, existing.checkOut);
    const activeSession = sessions.find((s) => s.out === null);

    // Rule: Prevent double walk-ins without walking out first!
    if (activeSession || !existing.checkOut) {
      const currentIn = activeSession ? activeSession.in : existing.checkIn;
      return NextResponse.json(
        {
          error: `You are already clocked in on duty (Walked in at ${currentIn}). You must Walk Out (e.g. for lunch or end of shift) before walking in again.`,
          attendance: existing,
        },
        { status: 400 }
      );
    }

    // ── CASE 3: Staff walked out earlier (e.g. Lunch break) and is now Walking In again! ──
    const nextSessionNum = sessions.length + 1;
    sessions.push({
      sessionNum: nextSessionNum,
      in: autoCheckInTime,
      out: null,
      durationMinutes: 0,
    });

    const updatedNotes = serializeSessionsToNotes(sessions);
    const completedMinutes = calculateTotalMinutes(sessions);
    const durationSoFar = completedMinutes > 0 ? formatMinutesToDuration(completedMinutes) : null;

    const record = await prisma.staffAttendance.update({
      where: {
        staffId_date: {
          staffId,
          date: todayDate,
        },
      },
      data: {
        // Keep original checkIn (first walk-in of the day) — never overwrite it
        checkOut: null, // Clear checkOut because they are now actively back on duty!
        status: 'Present',
        duration: durationSoFar,
        notes: updatedNotes,
      },
      include: {
        staff: {
          include: { chair: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Welcome back! Walk In recorded at ${autoCheckInTime} (Session ${nextSessionNum} resumed after break).`,
      attendance: record,
    });
  } catch (error: any) {
    console.error('Failed to process Walk In:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Walk In' }, { status: 500 });
  }
}

/**
 * Helper utility for multi-session salon staff attendance (supports lunch breaks, tea breaks, and multi-session shifts).
 */

export interface AttendanceSession {
  sessionNum: number;
  in: string; // e.g. "09:00 AM"
  out: string | null; // e.g. "02:00 PM" or null if in progress
  durationMinutes: number; // calculated working minutes
}

export function formatCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getStartOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
}

export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([APap][Mm]))?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function calculateMinutesDiff(inStr: string, outStr: string): number {
  const inMins = parseTimeToMinutes(inStr);
  const outMins = parseTimeToMinutes(outStr);
  if (inMins === null || outMins === null) return 0;
  let diff = outMins - inMins;
  if (diff < 0) diff += 24 * 60; // in case shift passed midnight
  return diff;
}

export function formatMinutesToDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 mins';
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hrs === 0) return `${mins} mins`;
  if (mins === 0) return `${hrs} hrs`;
  return `${hrs} hrs ${mins} mins`;
}

/**
 * Parses sessions from the attendance record's notes string.
 * Falls back to checkIn/checkOut if notes don't contain session info.
 */
export function parseSessionsFromRecord(
  notes: string | null | undefined,
  fallbackCheckIn: string | null | undefined,
  fallbackCheckOut: string | null | undefined
): AttendanceSession[] {
  const sessions: AttendanceSession[] = [];

  if (notes && notes.includes('Session')) {
    // Expected format: "Session 1: 09:00 AM - 02:00 PM (5 hrs) | Session 2: 02:45 PM - In Progress"
    const parts = notes.split('|').map((p) => p.trim());
    parts.forEach((part, idx) => {
      const match = part.match(/Session\s*(\d+)?\s*:\s*([0-9:APMapm\s]+)\s*[-–]\s*([^(|]+)/);
      if (match) {
        const num = match[1] ? parseInt(match[1], 10) : idx + 1;
        const inTime = match[2].trim();
        const rawOut = match[3].trim();
        const isInProgress = rawOut.toLowerCase().includes('in progress');
        const outTime = isInProgress ? null : rawOut;
        const mins = outTime ? calculateMinutesDiff(inTime, outTime) : 0;
        sessions.push({
          sessionNum: num,
          in: inTime,
          out: outTime,
          durationMinutes: mins,
        });
      }
    });
  }

  // If no sessions were successfully parsed from notes, use fallback checkIn/checkOut
  if (sessions.length === 0 && fallbackCheckIn) {
    const mins = fallbackCheckOut ? calculateMinutesDiff(fallbackCheckIn, fallbackCheckOut) : 0;
    sessions.push({
      sessionNum: 1,
      in: fallbackCheckIn,
      out: fallbackCheckOut || null,
      durationMinutes: mins,
    });
  }

  return sessions;
}

/**
 * Serializes the sessions list into a clean, human-readable notes string.
 */
export function serializeSessionsToNotes(sessions: AttendanceSession[]): string {
  if (sessions.length === 0) return '';
  return sessions
    .map((s) => {
      if (!s.out) {
        return `Session ${s.sessionNum}: ${s.in} - In Progress`;
      }
      const durStr = formatMinutesToDuration(s.durationMinutes);
      return `Session ${s.sessionNum}: ${s.in} - ${s.out} (${durStr})`;
    })
    .join(' | ');
}

/**
 * Sums up duration minutes across all completed sessions.
 */
export function calculateTotalMinutes(sessions: AttendanceSession[]): number {
  return sessions.reduce((acc, s) => acc + (s.out ? s.durationMinutes : 0), 0);
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  OWNER_WHATSAPP_PHONE,
  createEndOfDayReportMessage,
  generateWhatsAppWebUrl,
  sendWhatsAppMessage,
} from '@/lib/whatsapp';

function getDateBounds(customStartDate?: string | null, customEndDate?: string | null) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const todayIst = formatter.format(new Date()); // YYYY-MM-DD

  const rawStart = customStartDate?.trim() || customEndDate?.trim() || todayIst;
  const rawEnd = customEndDate?.trim() || customStartDate?.trim() || todayIst;

  const [actualStart, actualEnd] = rawStart <= rawEnd ? [rawStart, rawEnd] : [rawEnd, rawStart];

  const startOfDay = new Date(`${actualStart}T00:00:00.000+05:30`);
  const endOfDay = new Date(`${actualEnd}T23:59:59.999+05:30`);

  const formatDateDisplay = (isoStr: string) => {
    try {
      const d = new Date(`${isoStr}T12:00:00.000+05:30`);
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      return isoStr;
    }
  };

  const isMultiDay = actualStart !== actualEnd;
  const displayDateStr = isMultiDay
    ? `${formatDateDisplay(actualStart)} – ${formatDateDisplay(actualEnd)}`
    : formatDateDisplay(actualStart);

  return {
    todayIst,
    actualStart,
    actualEnd,
    isMultiDay,
    displayDateStr,
    startOfDay,
    endOfDay,
  };
}

async function compileEndOfDayData(options?: {
  closingNotes?: string;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const { closingNotes, startDate, endDate } = options || {};
  const { displayDateStr, actualStart, actualEnd, isMultiDay, startOfDay, endOfDay } = getDateBounds(startDate, endDate);

  // 1. Fetch all appointments & payments within bounds
  const appointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      customer: true,
      chair: true,
      services: { include: { service: true } },
      package: true,
      payment: true,
      invoice: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  // 2. Also fetch invoices created today that might be direct walk-ins/POS
  const invoices = await prisma.invoice.findMany({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      customer: true,
      appointment: {
        include: {
          chair: true,
          services: { include: { service: true } },
          payment: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 3. Fetch today's staff attendance & walk-in sessions
  const attendanceRecords = await prisma.staffAttendance.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Aggregate bills
  const billMap = new Map<string, {
    billNo: string;
    time: string;
    customerName: string;
    services: string;
    amount: number;
    paymentMethod: string;
    chairName?: string;
    section?: string;
  }>();

  // Populate from invoices first
  invoices.forEach((inv) => {
    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      ...(isMultiDay ? { day: 'numeric', month: 'short' } : {}),
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const time = timeFormatter.format(new Date(inv.createdAt));
    const customerName = inv.customer?.name || inv.appointment?.customerName || 'Walk-in Guest';
    const services = inv.appointment?.services
      ? inv.appointment.services.map((s) => s.service?.name).filter(Boolean).join(', ')
      : 'Salon Service';
    const chairName = inv.chairName || inv.appointment?.chairName || inv.appointment?.chair?.name;
    const section = inv.section || inv.appointment?.section || inv.appointment?.chair?.section || '';
    const paymentMethod = inv.paymentMethod || inv.appointment?.payment?.method || 'cash';

    billMap.set(inv.invoiceNumber, {
      billNo: inv.invoiceNumber,
      time,
      customerName,
      services: services || 'Salon Service',
      amount: Number(inv.total) || 0,
      paymentMethod,
      chairName: chairName ? `${section ? section.toUpperCase() + ' ' : ''}${chairName}` : undefined,
      section,
    });
  });

  // Also include appointments with payments that may not have an invoice record yet
  appointments.forEach((apt, idx) => {
    const invNo = apt.invoice?.invoiceNumber || `HM-${apt.createdAt.getFullYear()}-${String(1000 + idx)}`;
    if (!billMap.has(invNo) && (apt.status === 'completed' || apt.payment?.status === 'completed' || apt.totalAmount > 0)) {
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        ...(isMultiDay ? { day: 'numeric', month: 'short' } : {}),
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const time = timeFormatter.format(new Date(apt.createdAt));
      const customerName = apt.customerName || apt.customer?.name || 'Walk-in Guest';
      const services = apt.services.map((s) => s.service?.name).filter(Boolean).join(', ') || 'Salon Service';
      const chairName = apt.chairName || apt.chair?.name;
      const section = apt.section || apt.chair?.section || '';
      const amount = apt.payment?.amount || apt.totalAmount || 0;
      const paymentMethod = apt.payment?.method || 'cash';

      billMap.set(invNo, {
        billNo: invNo,
        time,
        customerName,
        services,
        amount: Number(amount) || 0,
        paymentMethod,
        chairName: chairName ? `${section ? section.toUpperCase() + ' ' : ''}${chairName}` : undefined,
        section,
      });
    }
  });

  const billsList = Array.from(billMap.values());

  let totalRevenue = 0;
  let cashTotal = 0;
  let cashCount = 0;
  let upiTotal = 0;
  let upiCount = 0;
  let cardTotal = 0;
  let cardCount = 0;
  let menTotal = 0;
  let menCount = 0;
  let womenTotal = 0;
  let womenCount = 0;

  billsList.forEach((b) => {
    totalRevenue += b.amount;
    const m = (b.paymentMethod || '').toLowerCase();
    if (m === 'upi') {
      upiTotal += b.amount;
      upiCount += 1;
    } else if (m === 'card') {
      cardTotal += b.amount;
      cardCount += 1;
    } else {
      cashTotal += b.amount;
      cashCount += 1;
    }

    const sec = (b.section || '').toLowerCase();
    if (sec === 'men') {
      menTotal += b.amount;
      menCount += 1;
    } else if (sec === 'women') {
      womenTotal += b.amount;
      womenCount += 1;
    }
  });

  // Staff on duty
  const staffAttendance = attendanceRecords.map((a) => {
    const timeFormatted = a.checkIn ? ` at ${a.checkIn}` : '';
    return `${a.staff.name} (${a.staff.role || 'Stylist'}) - ${a.status.toUpperCase()}${timeFormatted}`;
  });

  const reportMessage = createEndOfDayReportMessage({
    dateStr: displayDateStr,
    totalRevenue,
    totalBills: billsList.length,
    cashTotal,
    cashCount,
    upiTotal,
    upiCount,
    cardTotal,
    cardCount,
    menTotal,
    menCount,
    womenTotal,
    womenCount,
    staffAttendance,
    billsList,
    closingNotes,
  });

  const whatsappUrl = generateWhatsAppWebUrl(OWNER_WHATSAPP_PHONE, reportMessage);

  return {
    dateStr: displayDateStr,
    startDate: actualStart,
    endDate: actualEnd,
    isMultiDay,
    totalRevenue,
    totalBills: billsList.length,
    cashTotal,
    cashCount,
    upiTotal,
    upiCount,
    cardTotal,
    cardCount,
    menTotal,
    menCount,
    womenTotal,
    womenCount,
    staffAttendance,
    billsList,
    reportMessage,
    whatsappUrl,
    ownerPhone: OWNER_WHATSAPP_PHONE,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const date = searchParams.get('date');

    const data = await compileEndOfDayData({
      startDate: startDate || date,
      endDate: endDate || date,
    });
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error('End of Day report error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate EOD report' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const closingNotes = body.closingNotes || undefined;
    const startDate = body.startDate || body.date || undefined;
    const endDate = body.endDate || body.date || undefined;
    const sendCloudApi = !!body.sendCloudApi;

    const data = await compileEndOfDayData({
      closingNotes,
      startDate,
      endDate,
    });

    let cloudApiResult = null;
    if (sendCloudApi) {
      cloudApiResult = await sendWhatsAppMessage({
        phone: OWNER_WHATSAPP_PHONE,
        type: 'general',
        content: data.reportMessage,
      });
    }

    return NextResponse.json({
      success: true,
      ...data,
      cloudApiResult,
    });
  } catch (error: any) {
    console.error('Failed to dispatch EOD report:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch EOD report' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'this_month'; // today | yesterday | this_week | this_month | custom
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (range === 'yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
      endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    } else if (range === 'this_week' || range === '7d') {
      // Start from Monday or 7 days ago
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (range === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (range === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // 1. Fetch all chairs (ordered by section and sortOrder)
    const chairs = await prisma.chair.findMany({
      include: {
        assignedStaff: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    // 2. Fetch completed/paid bills in range
    // Must be completed payments or completed appointments
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        appointment: {
          include: {
            chair: true,
            services: { include: { service: true } },
            package: true,
            invoice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Also get all completed appointments in date range that have payments
    const appointmentsInRange = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        chair: true,
        services: { include: { service: true } },
        payment: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Calculate Chair-Wise Revenue
    // Map chair ID and chair name to revenue accumulator
    const chairRevenueMap = new Map<string, {
      id: string;
      name: string;
      section: string;
      assignedStaffName: string | null;
      revenue: number;
      billsCount: number;
    }>();

    // Initialize map with all active chairs so even $0 chairs are shown
    chairs.forEach((c) => {
      chairRevenueMap.set(c.id, {
        id: c.id,
        name: c.name,
        section: c.section,
        assignedStaffName: c.assignedStaff?.name || null,
        revenue: 0,
        billsCount: 0,
      });
    });

    let totalRevenue = 0;
    let unassignedChairRevenue = 0;
    let unassignedBillsCount = 0;

    const paymentMethods: Record<string, { count: number; total: number }> = {
      cash: { count: 0, total: 0 },
      upi: { count: 0, total: 0 },
      card: { count: 0, total: 0 },
      other: { count: 0, total: 0 },
    };

    completedPayments.forEach((p) => {
      const amount = p.amount || 0;
      totalRevenue += amount;

      // Payment method tally
      const m = (p.method || 'cash').toLowerCase();
      const methodKey = paymentMethods[m] ? m : 'other';
      paymentMethods[methodKey].count += 1;
      paymentMethods[methodKey].total += amount;

      // Chair attribution
      const apptChairId = p.appointment?.chairId;
      const apptChairName = p.appointment?.chairName || p.appointment?.chair?.name;
      const apptSection = p.appointment?.section || p.appointment?.chair?.section;

      if (apptChairId && chairRevenueMap.has(apptChairId)) {
        const item = chairRevenueMap.get(apptChairId)!;
        item.revenue += amount;
        item.billsCount += 1;
      } else if (apptChairName && apptSection) {
        // Try match by name and section
        const matchedChair = chairs.find(
          (c) => c.section.toLowerCase() === apptSection.toLowerCase() &&
                 c.name.toLowerCase() === apptChairName.toLowerCase()
        );
        if (matchedChair && chairRevenueMap.has(matchedChair.id)) {
          const item = chairRevenueMap.get(matchedChair.id)!;
          item.revenue += amount;
          item.billsCount += 1;
        } else {
          unassignedChairRevenue += amount;
          unassignedBillsCount += 1;
        }
      } else {
        unassignedChairRevenue += amount;
        unassignedBillsCount += 1;
      }
    });

    const chairRevenueList = Array.from(chairRevenueMap.values());
    const menChairsRevenue = chairRevenueList.filter((c) => c.section.toLowerCase() === 'men');
    const womenChairsRevenue = chairRevenueList.filter((c) => c.section.toLowerCase() === 'women');

    // 4. Also fetch Today's & Monthly total revenue metrics for comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [todayPayments, monthPayments, allCompletedPayments, attendanceSummary, leaveCount] = await Promise.all([
      prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.payment.findMany({
        where: {
          status: 'completed',
          createdAt: { gte: startOfThisMonth, lte: endOfThisMonth },
        },
      }),
      prisma.payment.findMany({
        where: { status: 'completed' },
      }),
      // Today's attendance
      prisma.staffAttendance.findMany({
        where: {
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      // Leaves in range
      prisma.staffLeave.count({
        where: {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      }),
    ]);

    const todayRevenue = todayPayments.reduce((s, p) => s + p.amount, 0);
    const monthlyRevenue = monthPayments.reduce((s, p) => s + p.amount, 0);
    const allTimeRevenue = allCompletedPayments.reduce((s, p) => s + p.amount, 0);
    const allTimeBills = allCompletedPayments.length;
    const totalBillsInRange = completedPayments.length;
    const avgBillValue = totalBillsInRange > 0 ? Math.round(totalRevenue / totalBillsInRange) : 0;

    // Attendance stats for today
    let presentCount = 0;
    let absentCount = 0;
    let leaveCountToday = 0;
    attendanceSummary.forEach((a) => {
      const st = a.status.toLowerCase();
      if (st === 'present') presentCount += 1;
      else if (st === 'absent') absentCount += 1;
      else if (st === 'leave') leaveCountToday += 1;
    });

    const activeStaffCount = await prisma.staff.count({ where: { status: 'active' } });

    // Recent audit bills in period
    const recentBills = appointmentsInRange.slice(0, 30).map((a, idx) => ({
      id: a.id,
      billNo: a.invoice?.invoiceNumber || `HM-${a.createdAt.getFullYear()}-${String(1000 + idx)}`,
      customerName: a.customerName || 'Walk-in Guest',
      phone: a.customerPhone || 'Not Provided',
      chair: a.chairName ? `${a.section ? a.section.toUpperCase() + ' ' : ''}${a.chairName}` : (a.chair?.name ? `${a.chair.section.toUpperCase()} ${a.chair.name}` : 'Not Assigned'),
      section: a.section || a.chair?.section || 'Not Assigned',
      services: a.services.map((s) => s.service?.name).join(', ') || 'Salon Service',
      amount: a.totalAmount || (a.payment?.amount || 0),
      paymentMethod: a.payment?.method || a.invoice?.paymentMethod || 'cash',
      status: a.payment?.status === 'completed' || a.status === 'completed' ? 'Paid' : a.status,
      date: a.createdAt.toISOString(),
      time: a.time || '12:00 PM',
    }));

    // Calculate real popular services from billed appointments
    const serviceTallyMap = new Map<string, { name: string; count: number; revenue: number }>();
    appointmentsInRange.forEach((a) => {
      a.services.forEach((s) => {
        const sName = s.service?.name || 'Salon Service';
        const qty = s.quantity || 1;
        const rev = qty * (s.price || 0);
        if (!serviceTallyMap.has(sName)) {
          serviceTallyMap.set(sName, { name: sName, count: 0, revenue: 0 });
        }
        const item = serviceTallyMap.get(sName)!;
        item.count += qty;
        item.revenue += rev;
      });
    });
    const popularServices = Array.from(serviceTallyMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      range,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      kpis: {
        totalRevenue,
        totalBills: totalBillsInRange,
        todayRevenue,
        monthlyRevenue,
        allTimeRevenue,
        allTimeBills,
        avgBillValue,
      },
      chairRevenue: {
        men: menChairsRevenue,
        women: womenChairsRevenue,
        unassigned: {
          name: 'Not Assigned / Historical',
          revenue: unassignedChairRevenue,
          billsCount: unassignedBillsCount,
        },
      },
      paymentMethods,
      attendanceSummary: {
        totalActiveStaff: activeStaffCount,
        presentToday: presentCount,
        absentToday: absentCount,
        leaveToday: leaveCountToday,
      },
      leaveCountInRange: leaveCount,
      recentBills,
      popularServices,
    });
  } catch (error: any) {
    console.error('Failed to generate reports:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate reports' }, { status: 500 });
  }
}

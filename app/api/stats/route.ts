import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Fetch completed payments
    const [allCompletedPayments, todayPayments, monthlyPayments, chairs, todayAttendance, staffList] = await Promise.all([
      prisma.payment.findMany({
        where: { status: 'completed' },
        include: {
          appointment: {
            include: { chair: true },
          },
        },
      }),
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
      prisma.chair.findMany({
        include: {
          assignedStaff: {
            select: { id: true, name: true, role: true },
          },
        },
        orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.staffAttendance.findMany({
        where: {
          date: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.staff.findMany({
        where: { status: 'active' },
        include: { chair: true },
      }),
    ]);

    const totalRevenue = allCompletedPayments.reduce((s, p) => s + p.amount, 0);
    const totalBills = allCompletedPayments.length;
    const todayRevenue = todayPayments.reduce((s, p) => s + p.amount, 0);
    const todayBills = todayPayments.length;
    const monthlyRevenue = monthlyPayments.reduce((s, p) => s + p.amount, 0);

    // 2. Chair-wise Revenue calculation
    const chairMap = new Map<string, { id: string; name: string; section: string; staffName: string | null; revenue: number; billsCount: number }>();
    chairs.forEach((c) => {
      chairMap.set(c.id, {
        id: c.id,
        name: c.name,
        section: c.section,
        staffName: c.assignedStaff?.name || null,
        revenue: 0,
        billsCount: 0,
      });
    });

    let unassignedRevenue = 0;
    let unassignedBills = 0;

    allCompletedPayments.forEach((p) => {
      const chairId = p.appointment?.chairId;
      const chairName = p.appointment?.chairName || p.appointment?.chair?.name;
      const section = p.appointment?.section || p.appointment?.chair?.section;

      if (chairId && chairMap.has(chairId)) {
        const item = chairMap.get(chairId)!;
        item.revenue += p.amount;
        item.billsCount += 1;
      } else if (chairName && section) {
        const match = chairs.find((c) => c.section.toLowerCase() === section.toLowerCase() && c.name.toLowerCase() === chairName.toLowerCase());
        if (match && chairMap.has(match.id)) {
          const item = chairMap.get(match.id)!;
          item.revenue += p.amount;
          item.billsCount += 1;
        } else {
          unassignedRevenue += p.amount;
          unassignedBills += 1;
        }
      } else {
        unassignedRevenue += p.amount;
        unassignedBills += 1;
      }
    });

    const chairList = Array.from(chairMap.values());
    const menChairs = chairList.filter((c) => c.section.toLowerCase() === 'men');
    const womenChairs = chairList.filter((c) => c.section.toLowerCase() === 'women');

    // 3. Attendance Summary
    let presentToday = 0;
    let absentToday = 0;
    let leaveToday = 0;
    todayAttendance.forEach((a) => {
      const st = a.status.toLowerCase();
      if (st === 'present') presentToday += 1;
      else if (st === 'absent') absentToday += 1;
      else if (st === 'leave') leaveToday += 1;
    });

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalBills,
        todayRevenue,
        todayBills,
        monthlyRevenue,
        avgBillValue: totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0,
      },
      chairWiseRevenue: {
        men: menChairs,
        women: womenChairs,
        unassigned: {
          name: 'Not Assigned',
          revenue: unassignedRevenue,
          billsCount: unassignedBills,
        },
      },
      attendanceSummary: {
        totalStaff: staffList.length,
        presentToday,
        absentToday,
        leaveToday,
      },
    });
  } catch (error: any) {
    console.error('Failed to get dashboard stats:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}

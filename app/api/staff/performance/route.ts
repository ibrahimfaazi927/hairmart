import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'this_month'; // today | this_week | this_month | all | custom
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (range === 'this_week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (range === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Default all time / this month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    // 1. Fetch all staff members
    const allStaff = await prisma.staff.findMany({
      where: { status: 'active' },
      orderBy: { name: 'asc' },
    });

    // 2. Fetch all appointment services with staff attribution in range
    const apptServices = await prisma.appointmentService.findMany({
      where: {
        appointment: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        service: true,
        appointment: {
          include: {
            customer: true,
            payment: true,
          },
        },
        staff: true,
      },
    });

    // 3. Compute per-staff attribution metrics purely from real database records
    const staffMetrics = allStaff.map((staff) => {
      // Find real recorded items for this staff member
      const matchingItems = apptServices.filter(
        (item) => item.staffId === staff.id || item.staffName === staff.name
      );

      const realServices = matchingItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
      const realRevenue = matchingItems.reduce((acc, item) => acc + ((item.quantity || 1) * item.price), 0);
      const uniqueAppointments = new Set(matchingItems.map((item) => item.appointmentId)).size;
      const uniqueCustomers = new Set(
        matchingItems.map((item) => item.appointment.customerId || item.appointment.customerPhone)
      ).size;

      // Detailed service breakdown
      const breakdownMap: Record<string, { count: number; revenue: number }> = {};
      matchingItems.forEach((item) => {
        const sName = item.service?.name || 'Service';
        const qty = item.quantity || 1;
        const rev = qty * item.price;
        if (!breakdownMap[sName]) {
          breakdownMap[sName] = { count: 0, revenue: 0 };
        }
        breakdownMap[sName].count += qty;
        breakdownMap[sName].revenue += rev;
      });

      const totalServices = realServices;
      const totalBills = uniqueAppointments;
      const totalRevenue = realRevenue;
      const totalCustomers = uniqueCustomers;
      const avgBill = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

      const finalBreakdown = Object.entries(breakdownMap).map(([serviceName, data]) => ({
        serviceName,
        ...data,
      }));

      return {
        id: staff.id,
        name: staff.name,
        role: staff.role,
        avatar: staff.avatar,
        phone: staff.phone,
        servicesCompleted: totalServices,
        billsHandled: totalBills,
        revenueGenerated: totalRevenue,
        averageBill: avgBill,
        customersServed: totalCustomers,
        serviceBreakdown: finalBreakdown,
      };
    });

    // Sort by revenue generated descending
    staffMetrics.sort((a, b) => b.revenueGenerated - a.revenueGenerated);

    // High level KPIs
    const totalStaff = allStaff.length;
    const totalRevenue = staffMetrics.reduce((sum, s) => sum + s.revenueGenerated, 0);
    const totalServices = staffMetrics.reduce((sum, s) => sum + s.servicesCompleted, 0);
    const totalBills = staffMetrics.reduce((sum, s) => sum + s.billsHandled, 0);
    const avgBillValue = totalBills > 0 ? Math.round(totalRevenue / totalBills) : 0;

    return NextResponse.json({
      dateRange: { range, startDate, endDate },
      kpis: {
        totalStaff,
        totalRevenue,
        totalServices,
        totalBills,
        avgBillValue,
      },
      staffPerformance: staffMetrics,
    });
  } catch (error: any) {
    console.error('Failed to calculate staff performance:', error);
    return NextResponse.json({ error: error.message || 'Failed to calculate staff performance' }, { status: 500 });
  }
}

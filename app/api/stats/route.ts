import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    // Today's appointments
    const todayAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    // Upcoming appointments
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        date: {
          gt: endOfToday,
        },
        status: { in: ['pending', 'confirmed'] },
      },
    });

    // Completed appointments count
    const completedAppointments = await prisma.appointment.count({
      where: { status: 'completed' },
    });

    // Pending appointments
    const pendingAppointments = await prisma.appointment.count({
      where: { status: 'pending' },
    });

    // Total and new customers
    const totalCustomers = await prisma.customer.count();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // Revenue from payments
    const payments = await prisma.payment.findMany({
      where: { status: 'completed' },
    });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Recent 5 appointments
    const recentAppointments = await prisma.appointment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        package: true,
        services: { include: { service: true } },
      },
    });

    // Recent 5 customers
    const recentCustomers = await prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Average rating
    const reviews = await prisma.review.findMany();
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    return NextResponse.json({
      todayAppointments,
      upcomingAppointments,
      completedAppointments,
      pendingAppointments,
      totalCustomers,
      newCustomers,
      totalRevenue,
      recentAppointments,
      recentCustomers,
      totalReviews: reviews.length,
      avgRating,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

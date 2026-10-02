import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getWhatsAppSettings, createRecurringReminderMessage, sendWhatsAppMessage } from '@/lib/whatsapp';

export async function GET(req: Request) {
  try {
    const settings = await getWhatsAppSettings();
    const minDays = 15;
    const maxDays = 25;

    const now = new Date();
    const minDate = new Date();
    minDate.setDate(now.getDate() - maxDays);

    const maxDate = new Date();
    maxDate.setDate(now.getDate() - minDays);

    // Find customers whose last visit was 15 to 25 days ago
    const dueCustomers = await prisma.customer.findMany({
      where: {
        lastVisit: {
          gte: minDate,
          lte: maxDate,
        },
        status: { in: ['active', 'vip'] },
      },
      include: {
        appointments: {
          orderBy: { date: 'desc' },
          take: 1,
          include: { services: { include: { service: true } } },
        },
      },
      orderBy: { lastVisit: 'asc' },
    });

    const formattedList = dueCustomers.map((c) => {
      const lastVisitDate = c.lastVisit ? new Date(c.lastVisit) : new Date();
      const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
      const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const lastServices = c.appointments[0]?.services.map((s) => s.service.name) || [];

      return {
        id: c.id,
        name: c.name,
        phone: c.whatsapp || c.phone,
        lastVisit: c.lastVisit,
        daysSinceLastVisit: daysSince,
        lastServices,
        reminderPreview: createRecurringReminderMessage({
          customerName: c.name,
          daysSinceLastVisit: daysSince,
          lastServices,
        }),
      };
    });

    return NextResponse.json({
      totalDue: formattedList.length,
      followupDaysConfig: settings.followupDays,
      dueCustomers: formattedList,
    });
  } catch (error: any) {
    console.error('Recurring reminder scanner error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scan reminders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerId } = body;

    const now = new Date();
    const settings = await getWhatsAppSettings();

    let targetCustomers = [];

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          appointments: {
            orderBy: { date: 'desc' },
            take: 1,
            include: { services: { include: { service: true } } },
          },
        },
      });
      if (customer) targetCustomers.push(customer);
    } else {
      // Scan all due customers (15 to 25 days)
      const minDate = new Date();
      minDate.setDate(now.getDate() - 25);
      const maxDate = new Date();
      maxDate.setDate(now.getDate() - 15);

      targetCustomers = await prisma.customer.findMany({
        where: {
          lastVisit: { gte: minDate, lte: maxDate },
          status: { in: ['active', 'vip'] },
        },
        include: {
          appointments: {
            orderBy: { date: 'desc' },
            take: 1,
            include: { services: { include: { service: true } } },
          },
        },
      });
    }

    const results = [];

    for (const c of targetCustomers) {
      const lastVisitDate = c.lastVisit ? new Date(c.lastVisit) : new Date();
      const diffTime = Math.abs(now.getTime() - lastVisitDate.getTime());
      const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 18;

      const lastServices = c.appointments[0]?.services.map((s) => s.service.name) || [];

      const reminderText = createRecurringReminderMessage({
        customerName: c.name,
        daysSinceLastVisit: daysSince,
        lastServices,
      });

      const sendResult = await sendWhatsAppMessage({
        phone: c.whatsapp || c.phone,
        type: 'followup_reminder',
        content: reminderText,
      });

      // Update nextFollowUp to 20 days in future
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 20);

      await prisma.customer.update({
        where: { id: c.id },
        data: { nextFollowUp: nextDate },
      });

      results.push({
        customerId: c.id,
        name: c.name,
        phone: c.whatsapp || c.phone,
        sent: sendResult.success,
        whatsappWebUrl: sendResult.whatsappWebUrl,
      });
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      results,
    });
  } catch (error: any) {
    console.error('Recurring reminder trigger error:', error);
    return NextResponse.json({ error: error.message || 'Failed to dispatch reminders' }, { status: 500 });
  }
}

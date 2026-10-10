import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const minimal = searchParams.get('minimal') === 'true';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    if (minimal) {
      const customers = await prisma.customer.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          whatsapp: true,
          status: true,
          notes: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      });
      return NextResponse.json(customers);
    }

    // CRM list mode: select lightweight appointment summary (no deep products or full relations)
    const customers = await prisma.customer.findMany({
      where,
      include: {
        appointments: {
          select: {
            id: true,
            totalAmount: true,
            date: true,
            status: true,
            payment: {
              select: {
                amount: true,
              },
            },
            services: {
              select: {
                service: {
                  select: {
                    name: true,
                  },
                },
              },
              take: 2,
            },
          },
          orderBy: { date: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });

    return NextResponse.json(customers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, whatsapp, email, notes, status } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Customer contact number is required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    // Default name if not provided: "Client <last 4 digits>" or formatted phone
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    const defaultName = digitsOnly.length >= 4 ? `Client ${digitsOnly.slice(-4)}` : `Client ${cleanPhone}`;
    const clientName = name && name.trim() ? name.trim() : defaultName;

    // Check if customer already exists by phone
    const existing = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      // Update if name or notes were provided
      const updated = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: name && name.trim() ? name.trim() : existing.name,
          whatsapp: whatsapp || existing.whatsapp,
          email: email !== undefined ? email : existing.email,
          notes: notes !== undefined ? notes : existing.notes,
          status: status || existing.status,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json(updated, { status: 200 });
    }

    const customer = await prisma.customer.create({
      data: {
        name: clientName,
        phone: cleanPhone,
        whatsapp: whatsapp || cleanPhone,
        email: email || null,
        notes: notes || null,
        status: status || 'active',
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to save customer' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        customer: true,
        chair: true,
        package: true,
        services: {
          include: {
            service: true,
          },
        },
        products: {
          include: {
            product: true,
          },
        },
        payment: true,
        invoice: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error: any) {
    console.error('Failed to fetch appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerWhatsapp,
      customerNote,
      chairId,
      date,
      time,
      services,
      items,
      packageId,
      status,
      isWalkIn,
    } = body;

    // Validate chair for billing
    let validChairId: string | null = null;
    let chairName: string | null = null;
    let chairSection: string | null = null;

    if (chairId) {
      const chair = await prisma.chair.findUnique({ where: { id: chairId } });
      if (chair) {
        validChairId = chair.id;
        chairName = chair.name;
        chairSection = chair.section;
      } else {
        return NextResponse.json({ error: 'Selected chair not found' }, { status: 400 });
      }
    } else if (items && items.length > 0) {
      // Chair is strictly required when generating a bill
      return NextResponse.json({ error: 'Chair selection is required for billing' }, { status: 400 });
    }

    const appointmentDate = date ? new Date(date) : new Date();
    const appointmentTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determine if this is an anonymous / walk-in bill without customer details
    const rawPhone = (customerPhone || '').trim();
    const isAnonymous =
      isWalkIn ||
      !rawPhone ||
      rawPhone === 'Not Provided' ||
      rawPhone.toLowerCase().includes('walk') ||
      rawPhone.toLowerCase().includes('anonymous');

    let customerId: string | null = null;
    let finalCustomerName = 'Walk-in Guest';
    let finalCustomerPhone = 'Not Provided';

    if (isAnonymous) {
      finalCustomerName = (customerName && customerName.trim()) || 'Walk-in Guest';
      finalCustomerPhone = rawPhone && rawPhone !== '' ? rawPhone : 'Not Provided';
      customerId = null;
    } else {
      finalCustomerPhone = rawPhone;
      // Auto-assign clean name if customer name was omitted (phone-only billing)
      if (customerName && customerName.trim()) {
        finalCustomerName = customerName.trim();
      } else {
        const digits = rawPhone.replace(/\D/g, '');
        finalCustomerName = digits.length >= 4 ? `Client ${digits.slice(-4)}` : `Client ${rawPhone}`;
      }

      // Upsert or find customer
      try {
        let customer = await prisma.customer.findUnique({
          where: { phone: finalCustomerPhone },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              name: finalCustomerName,
              phone: finalCustomerPhone,
              whatsapp: customerWhatsapp || finalCustomerPhone,
              lastVisit: appointmentDate,
              status: 'active',
            },
          });
        } else {
          customer = await prisma.customer.update({
            where: { id: customer.id },
            data: {
              name: customerName && customerName.trim() ? customerName.trim() : customer.name,
              whatsapp: customerWhatsapp || customer.whatsapp,
              lastVisit: appointmentDate,
            },
          });
        }
        customerId = customer.id;
      } catch (custErr) {
        console.warn('Customer upsert non-fatal fallback:', custErr);
        customerId = null;
      }
    }

    // Verify customerId exists in DB before linking
    let validCustomerId: string | null = null;
    if (customerId) {
      const custCheck = await prisma.customer.findUnique({ where: { id: customerId } });
      if (custCheck) {
        validCustomerId = custCheck.id;
      }
    }

    // Pre-load DB services to ensure valid foreign keys
    const allDbServices = await prisma.service.findMany();
    const serviceById = new Map(allDbServices.map((s) => [s.id, s]));
    const serviceByName = new Map(allDbServices.map((s) => [s.name.toLowerCase().trim(), s]));
    const fallbackService = allDbServices[0];

    let serviceCreateData: any[] = [];
    let totalAmount = 0;

    if (items && Array.isArray(items) && items.length > 0) {
      // Map and aggregate by serviceId to satisfy foreign keys and @@unique([appointmentId, serviceId])
      const aggregated = new Map<string, { serviceId: string; quantity: number; price: number; staffName: string | null }>();

      for (const it of items) {
        let matched = (it.serviceId && serviceById.get(it.serviceId)) || null;
        if (!matched && it.name) {
          const searchName = String(it.name).toLowerCase().trim();
          matched = serviceByName.get(searchName) ||
            allDbServices.find((s) => {
              const dbName = s.name.toLowerCase().trim();
              return dbName.includes(searchName) || searchName.includes(dbName);
            }) || null;
        }
        if (!matched) {
          matched = fallbackService;
        }

        if (matched) {
          const validServiceId = matched.id;
          const qty = Math.max(1, Number(it.quantity) || 1);
          const price = Number(it.price) >= 0 ? Number(it.price) : matched.price;

          if (aggregated.has(validServiceId)) {
            const existing = aggregated.get(validServiceId)!;
            existing.quantity += qty;
          } else {
            aggregated.set(validServiceId, {
              serviceId: validServiceId,
              quantity: qty,
              price: price,
              staffName: it.staffName || null,
            });
          }
        }
      }

      serviceCreateData = Array.from(aggregated.values()).map((entry) => ({
        serviceId: entry.serviceId,
        staffId: null, // Staff management removed
        staffName: entry.staffName,
        quantity: entry.quantity,
        price: entry.price,
      }));

      totalAmount = items.reduce(
        (sum: number, it: any) => sum + (Math.max(1, Number(it.quantity) || 1) * (Number(it.price) || 0)),
        0
      );
    } else if (services && services.length > 0) {
      // Look up service records
      const serviceRecords = await prisma.service.findMany({
        where: {
          name: { in: services },
        },
      });
      serviceCreateData = serviceRecords.map((s) => ({
        serviceId: s.id,
        quantity: 1,
        price: s.price,
      }));
      totalAmount = serviceRecords.reduce((sum, s) => sum + s.price, 0);
    }

    // Verify packageId exists
    let validPackageId: string | null = null;
    if (packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (pkg) {
        validPackageId = pkg.id;
        if (!totalAmount) totalAmount = pkg.price;
      }
    }

    // Create Appointment safely
    const appointment = await prisma.appointment.create({
      data: {
        customerId: validCustomerId,
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        customerWhatsapp: isAnonymous ? null : (customerWhatsapp || finalCustomerPhone),
        customerNote: customerNote || null,
        date: appointmentDate,
        time: appointmentTime,
        status: status || 'pending',
        packageId: validPackageId,
        totalAmount,
        chairId: validChairId,
        chairName: chairName,
        section: chairSection,
        ...(serviceCreateData.length > 0
          ? {
              services: {
                create: serviceCreateData,
              },
            }
          : {}),
      },
      include: {
        customer: true,
        chair: true,
        services: {
          include: {
            service: true,
          },
        },
        package: true,
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create appointment:', error);
    return NextResponse.json({ error: error.message || 'Failed to create appointment' }, { status: 500 });
  }
}

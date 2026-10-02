import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        package: {
          include: {
            services: {
              include: { service: true },
            },
          },
        },
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
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(appointment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { status, date, time, customerNote, productIds } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (date) updateData.date = new Date(date);
    if (time) updateData.time = time;
    if (customerNote !== undefined) updateData.customerNote = customerNote;

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        services: { include: { service: true } },
        package: true,
      },
    });

    if (productIds && Array.isArray(productIds)) {
      await prisma.appointmentProduct.deleteMany({
        where: { appointmentId: params.id },
      });

      for (const prodId of productIds) {
        await prisma.appointmentProduct.create({
          data: {
            appointmentId: params.id,
            productId: prodId,
          },
        });
      }
    }

    if (status === 'completed' && updated.customerId) {
      await prisma.customer.update({
        where: { id: updated.customerId },
        data: { lastVisit: new Date() },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    await prisma.appointment.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

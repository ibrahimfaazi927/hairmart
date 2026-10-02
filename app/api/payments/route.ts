import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateInvoiceNumber } from '@/lib/invoice';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            services: { include: { service: true } },
            package: true,
          },
        },
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      appointmentId,
      amount,
      subtotal,
      discount,
      method,
      status,
      printReceipt,
      whatsappStatus,
      notes,
      itemsJson,
    } = body;

    if (!appointmentId || amount === undefined) {
      return NextResponse.json({ error: 'Appointment ID and amount are required' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { customer: true, services: { include: { service: true, staff: true } } },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const finalAmount = parseFloat(amount) || 0;
    const finalSubtotal = subtotal !== undefined ? parseFloat(subtotal) : finalAmount;
    const finalDiscount = discount !== undefined ? parseFloat(discount) : 0;
    const finalMethod = method || 'cash';
    const finalStatus = status || 'completed';

    // Upsert payment record
    const payment = await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        customerId: appointment.customerId,
        amount: finalAmount,
        method: finalMethod,
        status: finalStatus,
        paidAt: finalStatus === 'completed' ? new Date() : null,
      },
      update: {
        amount: finalAmount,
        method: finalMethod,
        status: finalStatus,
        paidAt: finalStatus === 'completed' ? new Date() : null,
      },
    });

    // Automatically create or update invoice
    const invNumber = generateInvoiceNumber();
    const invoice = await prisma.invoice.upsert({
      where: { appointmentId },
      create: {
        invoiceNumber: invNumber,
        appointmentId,
        customerId: appointment.customerId,
        subtotal: finalSubtotal,
        discount: finalDiscount,
        total: finalAmount,
        paymentMethod: finalMethod,
        printReceipt: Boolean(printReceipt),
        whatsappStatus: whatsappStatus || 'not_requested',
        notes: notes || null,
        itemsJson: itemsJson || null,
        status: finalStatus === 'completed' ? 'paid' : 'draft',
      },
      update: {
        subtotal: finalSubtotal,
        discount: finalDiscount,
        total: finalAmount,
        paymentMethod: finalMethod,
        printReceipt: Boolean(printReceipt),
        whatsappStatus: whatsappStatus || 'not_requested',
        notes: notes || null,
        itemsJson: itemsJson || null,
        status: finalStatus === 'completed' ? 'paid' : 'draft',
      },
    });

    // Update appointment status to completed if payment is completed
    if (status === 'completed') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'completed' },
      });
      if (appointment.customerId) {
        await prisma.customer.update({
          where: { id: appointment.customerId },
          data: { lastVisit: new Date() },
        });
      }
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

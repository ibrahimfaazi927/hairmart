import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRazorpayOrder, createRazorpayPaymentLink } from '@/lib/razorpay';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, amount, type = 'order' } = body;

    if (!appointmentId || !amount) {
      return NextResponse.json({ error: 'Missing appointmentId or amount' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        customer: true,
        services: { include: { service: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const receiptId = `rcpt_${appointment.id.slice(-8)}`;

    if (type === 'payment_link') {
      // Create Razorpay Shareable Payment Link (for WhatsApp)
      const serviceNames = appointment.services.map((s) => s.service.name).join(', ') || 'Salon Services';
      const link = await createRazorpayPaymentLink({
        amount: Number(amount),
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        description: `Hair Mart Salon Services: ${serviceNames}`,
        referenceId: appointment.id,
      });

      // Update or create payment record with link
      await prisma.payment.upsert({
        where: { appointmentId: appointment.id },
        update: {
          amount: Number(amount),
          method: 'razorpay',
          paymentLinkUrl: link.shortUrl,
          paymentLinkStatus: link.status,
        },
        create: {
          appointmentId: appointment.id,
          customerId: appointment.customerId,
          amount: Number(amount),
          method: 'razorpay',
          paymentLinkUrl: link.shortUrl,
          paymentLinkStatus: link.status,
          status: 'pending',
        },
      });

      return NextResponse.json({
        type: 'payment_link',
        linkId: link.linkId,
        paymentLinkUrl: link.shortUrl,
        status: link.status,
      });
    }

    // Create Standard Razorpay Checkout Order
    const order = await createRazorpayOrder({
      amount: Number(amount),
      receipt: receiptId,
      notes: {
        appointmentId: appointment.id,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
      },
    });

    // Update payment record with order ID
    await prisma.payment.upsert({
      where: { appointmentId: appointment.id },
      update: {
        amount: Number(amount),
        method: 'razorpay',
        razorpayOrderId: order.orderId,
      },
      create: {
        appointmentId: appointment.id,
        customerId: appointment.customerId,
        amount: Number(amount),
        method: 'razorpay',
        razorpayOrderId: order.orderId,
        status: 'pending',
      },
    });

    return NextResponse.json({
      type: 'order',
      orderId: order.orderId,
      amount: order.amount,
      currency: order.currency,
      keyId: order.keyId,
      customer: {
        name: appointment.customerName,
        phone: appointment.customerPhone,
      },
    });
  } catch (error: any) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create Razorpay order' }, { status: 500 });
  }
}

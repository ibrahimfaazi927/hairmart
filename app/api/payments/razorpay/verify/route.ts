import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRazorpayCredentials, verifyRazorpaySignature } from '@/lib/razorpay';
import { sendWhatsAppMessage, createPaymentReceiptMessage } from '@/lib/whatsapp';
import { getBaseUrl } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!appointmentId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const { keySecret } = await getRazorpayCredentials();

    // Verify signature if order ID provided (or bypass if test sandbox)
    if (razorpayOrderId && razorpaySignature && keySecret !== 'rzp_test_placeholder_secret') {
      const isValid = verifyRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        secret: keySecret,
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }
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

    const now = new Date();

    // 1. Mark Payment Completed
    const payment = await prisma.payment.upsert({
      where: { appointmentId: appointment.id },
      update: {
        method: 'razorpay',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        paidAt: now,
      },
      create: {
        appointmentId: appointment.id,
        customerId: appointment.customerId,
        amount: appointment.totalAmount,
        method: 'razorpay',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        paidAt: now,
      },
    });

    // 2. Mark Appointment Completed
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'completed' },
    });

    // 3. Generate / Update Digital Invoice
    const invoiceNumber = `HM-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${appointment.id.slice(-4).toUpperCase()}`;
    const invoice = await prisma.invoice.upsert({
      where: { appointmentId: appointment.id },
      update: {
        status: 'paid',
        total: payment.amount,
      },
      create: {
        invoiceNumber,
        appointmentId: appointment.id,
        customerId: appointment.customerId,
        subtotal: payment.amount,
        total: payment.amount,
        status: 'paid',
      },
    });

    // 4. Update Customer's Last Visit & Schedule 18-Day Followup
    if (appointment.customerId) {
      const followupDate = new Date();
      followupDate.setDate(followupDate.getDate() + 18);

      await prisma.customer.update({
        where: { id: appointment.customerId },
        data: {
          lastVisit: now,
          nextFollowUp: followupDate,
        },
      });

      // Upsert Followup Record
      await prisma.followup.upsert({
        where: { appointmentId: appointment.id },
        update: {
          scheduledDate: followupDate,
          status: 'pending',
        },
        create: {
          appointmentId: appointment.id,
          scheduledDate: followupDate,
          status: 'pending',
          type: 'reminder',
        },
      });
    }

    // 5. Automated WhatsApp Receipt Dispatch
    const baseUrl = getBaseUrl();
    const digitalInvoiceUrl = `${baseUrl}/api/invoices?id=${invoice.id}&format=html`;
    const servicesList = appointment.services.map((s) => s.service.name);

    const receiptMessage = createPaymentReceiptMessage({
      customerName: appointment.customerName,
      invoiceNumber: invoice.invoiceNumber,
      amount: payment.amount,
      method: 'Razorpay / UPI',
      servicesList,
      invoiceUrl: digitalInvoiceUrl,
    });

    const whatsappResult = await sendWhatsAppMessage({
      phone: appointment.customerWhatsapp || appointment.customerPhone,
      type: 'payment_confirmation',
      content: receiptMessage,
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      digitalInvoiceUrl,
      whatsappSent: whatsappResult.success,
      whatsappWebUrl: whatsappResult.whatsappWebUrl,
    });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: error.message || 'Payment verification failed' }, { status: 500 });
  }
}

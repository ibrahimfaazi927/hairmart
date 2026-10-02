import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getRazorpayCredentials } from '@/lib/razorpay';
import crypto from 'crypto';
import { sendWhatsAppMessage, createPaymentReceiptMessage } from '@/lib/whatsapp';
import { getBaseUrl } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    const { webhookSecret } = await getRazorpayCredentials();

    // Verify webhook signature if secret configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === 'payment.captured' || eventType === 'payment_link.paid') {
      const entity = event.payload.payment?.entity || event.payload.payment_link?.entity;
      const appointmentId = entity.notes?.appointmentId || entity.notes?.referenceId || entity.reference_id;

      if (appointmentId) {
        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            customer: true,
            services: { include: { service: true } },
          },
        });

        if (appointment) {
          const now = new Date();
          const amountInRupees = entity.amount ? entity.amount / 100 : appointment.totalAmount;

          // 1. Update Payment Record
          await prisma.payment.upsert({
            where: { appointmentId: appointment.id },
            update: {
              status: 'completed',
              method: 'razorpay',
              razorpayPaymentId: entity.id,
              paidAt: now,
            },
            create: {
              appointmentId: appointment.id,
              customerId: appointment.customerId,
              amount: amountInRupees,
              method: 'razorpay',
              razorpayPaymentId: entity.id,
              status: 'completed',
              paidAt: now,
            },
          });

          // 2. Mark Invoice Paid
          const invoiceNumber = `HM-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${appointment.id.slice(-4).toUpperCase()}`;
          const invoice = await prisma.invoice.upsert({
            where: { appointmentId: appointment.id },
            update: { status: 'paid', total: amountInRupees },
            create: {
              invoiceNumber,
              appointmentId: appointment.id,
              customerId: appointment.customerId,
              subtotal: amountInRupees,
              total: amountInRupees,
              status: 'paid',
            },
          });

          // 3. Update Followup Schedule
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
          }

          // 4. Send Automated WhatsApp Receipt
          const baseUrl = getBaseUrl();
          const digitalInvoiceUrl = `${baseUrl}/api/invoices?id=${invoice.id}&format=html`;
          const servicesList = appointment.services.map((s) => s.service.name);

          const receiptMessage = createPaymentReceiptMessage({
            customerName: appointment.customerName,
            invoiceNumber: invoice.invoiceNumber,
            amount: amountInRupees,
            method: 'Razorpay Online',
            servicesList,
            invoiceUrl: digitalInvoiceUrl,
          });

          await sendWhatsAppMessage({
            phone: appointment.customerWhatsapp || appointment.customerPhone,
            type: 'payment_confirmation',
            content: receiptMessage,
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Razorpay webhook handler error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

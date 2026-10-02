import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateInvoiceHTML } from '@/lib/invoice';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const format = searchParams.get('format');

    if (id) {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          customer: true,
          appointment: {
            include: {
              services: { include: { service: true } },
              package: true,
              products: { include: { product: true } },
              payment: true,
            },
          },
        },
      });

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      if (format === 'html') {
        const html = generateInvoiceHTML({
          invoiceNumber: invoice.invoiceNumber,
          salonName: 'Hair Mart Unisex Salon',
          salonPhone: '+91 [Salon Phone]',
          salonAddress: '[Salon Address Line, City]',
          customerName: invoice.customer?.name || invoice.appointment.customerName,
          customerPhone: invoice.customer?.phone || invoice.appointment.customerPhone,
          customerEmail: invoice.customer?.email || undefined,
          appointmentDate: invoice.appointment.date.toISOString().split('T')[0],
          services: invoice.appointment.services.map((s) => ({
            name: s.service.name,
            price: s.price,
          })),
          packageName: invoice.appointment.package?.name,
          productsUsed: invoice.appointment.products.map((p) => p.product.name),
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          discount: invoice.discount,
          total: invoice.total,
          paymentStatus: invoice.status,
          paymentMethod: invoice.appointment.payment?.method,
          createdAt: invoice.createdAt.toISOString().split('T')[0],
        });

        return new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return NextResponse.json(invoice);
    }

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        appointment: {
          include: {
            services: { include: { service: true } },
            package: true,
            payment: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

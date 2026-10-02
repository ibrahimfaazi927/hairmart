import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        appointments: {
          include: {
            services: { include: { service: true, staff: true } },
            package: true,
            products: { include: { product: true } },
            payment: true,
            invoice: true,
          },
          orderBy: { date: 'desc' },
        },
        reviews: true,
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
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
    const { name, phone, whatsapp, email, notes, status, nextFollowUp } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (email !== undefined) updateData.email = email;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;
    if (nextFollowUp !== undefined) updateData.nextFollowUp = nextFollowUp ? new Date(nextFollowUp) : null;

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: updateData,
    });

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
    await prisma.customer.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const approvedOnly = searchParams.get('approved');

    const where: any = {};
    if (approvedOnly === 'true') {
      where.approved = true;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerName, serviceName, rating, comment, customerId } = body;

    if (!customerName || !rating) {
      return NextResponse.json({ error: 'Customer name and rating are required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        customerName,
        serviceName,
        rating: parseInt(rating),
        comment,
        customerId: customerId || null,
        approved: false, // Must be approved by admin before displaying publicly
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, approved } = body;

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { approved: !!approved },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    await prisma.review.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

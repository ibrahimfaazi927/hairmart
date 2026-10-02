import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, description, image, serviceIds } = body;

    if (!name || !brand) {
      return NextResponse.json({ error: 'Product name and brand are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        image,
        professional: true,
      },
    });

    if (serviceIds && Array.isArray(serviceIds)) {
      for (const serviceId of serviceIds) {
        await prisma.serviceProduct.create({
          data: {
            serviceId,
            productId: product.id,
          },
        });
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

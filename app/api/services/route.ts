import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const categoryId = searchParams.get('categoryId');

    const where: any = { active: true };
    if (gender) {
      where.category = { gender };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const categories = await prisma.serviceCategory.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ services, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      duration,
      price,
      priceVisible,
      categoryId,
      image,
      productIds,
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Service name and category are required' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration: duration ? parseInt(duration) : null,
        price: price ? parseFloat(price) : 0,
        priceVisible: !!priceVisible,
        categoryId,
        image: image || null,
      },
    });

    if (productIds && Array.isArray(productIds)) {
      for (const prodId of productIds) {
        await prisma.serviceProduct.create({
          data: {
            serviceId: service.id,
            productId: prodId,
          },
        });
      }
    }

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

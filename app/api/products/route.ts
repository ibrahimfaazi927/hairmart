import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

let productsCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 1000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeServices = searchParams.get('includeServices') === 'true';

    const now = Date.now();
    if (!includeServices && productsCache && now - productsCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(productsCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }

    const products = await prisma.product.findMany({
      where: { active: true },
      ...(includeServices
        ? {
            include: {
              services: {
                include: {
                  service: true,
                },
              },
            },
          }
        : {}),
      orderBy: { sortOrder: 'asc' },
    });

    if (!includeServices) {
      productsCache = { data: products, timestamp: now };
    }

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, description, image, price, stock, category, active, professional, serviceIds } = body;

    if (!name || !brand) {
      return NextResponse.json({ error: 'Product name and brand are required' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        image,
        price: price ? parseFloat(price) : 0,
        stock: stock ? parseInt(stock) : 0,
        category: category || 'Hair Care',
        active: active !== undefined ? !!active : true,
        professional: professional !== undefined ? !!professional : true,
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

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// In-memory cache to guarantee sub-millisecond responses on reload/refresh
let servicesCache: {
  key: string;
  data: { services: any[]; categories: any[] };
  timestamp: number;
} | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function invalidateServicesCache() {
  servicesCache = null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const categoryId = searchParams.get('categoryId');
    const includeProducts = searchParams.get('includeProducts') === 'true';

    const cacheKey = `${gender || 'all'}_${categoryId || 'all'}_${includeProducts}`;
    const now = Date.now();

    if (servicesCache && servicesCache.key === cacheKey && now - servicesCache.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(servicesCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }

    const where: any = { active: true };
    if (gender) {
      where.category = { gender };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [services, categories] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          category: true,
          ...(includeProducts
            ? {
                products: {
                  include: {
                    product: true,
                  },
                },
              }
            : {}),
        },
        orderBy: {
          sortOrder: 'asc',
        },
      }),
      prisma.serviceCategory.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    const result = { services, categories };
    servicesCache = {
      key: cacheKey,
      data: result,
      timestamp: now,
    };

    return NextResponse.json(result, {
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

    invalidateServicesCache();
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

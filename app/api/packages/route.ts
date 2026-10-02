import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
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
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, price, priceVisible, serviceIds } = body;

    if (!name) {
      return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        description,
        price: price ? parseFloat(price) : 0,
        priceVisible: !!priceVisible,
      },
    });

    if (serviceIds && Array.isArray(serviceIds)) {
      for (const serviceId of serviceIds) {
        await prisma.packageService.create({
          data: {
            packageId: pkg.id,
            serviceId,
          },
        });
      }
    }

    return NextResponse.json(pkg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

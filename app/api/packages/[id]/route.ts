import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { name, description, price, priceVisible, active, serviceIds } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (priceVisible !== undefined) updateData.priceVisible = !!priceVisible;
    if (active !== undefined) updateData.active = !!active;

    const updated = await prisma.package.update({
      where: { id: params.id },
      data: updateData,
    });

    if (serviceIds && Array.isArray(serviceIds)) {
      await prisma.packageService.deleteMany({
        where: { packageId: params.id },
      });
      for (const serviceId of serviceIds) {
        await prisma.packageService.create({
          data: {
            packageId: params.id,
            serviceId,
          },
        });
      }
    }

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
    await prisma.package.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

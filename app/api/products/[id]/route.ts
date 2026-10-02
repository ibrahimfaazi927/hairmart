import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { name, brand, description, image, active, serviceIds } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (brand !== undefined) updateData.brand = brand;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (active !== undefined) updateData.active = !!active;

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    });

    if (serviceIds && Array.isArray(serviceIds)) {
      await prisma.serviceProduct.deleteMany({
        where: { productId: params.id },
      });
      for (const serviceId of serviceIds) {
        await prisma.serviceProduct.create({
          data: {
            serviceId,
            productId: params.id,
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
    await prisma.product.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

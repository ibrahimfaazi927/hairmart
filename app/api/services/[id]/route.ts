import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { name, description, duration, price, priceVisible, categoryId, active, image, productIds } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (priceVisible !== undefined) updateData.priceVisible = !!priceVisible;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (image !== undefined) updateData.image = image;
    if (active !== undefined) updateData.active = !!active;

    const updated = await prisma.service.update({
      where: { id: params.id },
      data: updateData,
    });

    if (productIds && Array.isArray(productIds)) {
      await prisma.serviceProduct.deleteMany({
        where: { serviceId: params.id },
      });
      for (const prodId of productIds) {
        await prisma.serviceProduct.create({
          data: {
            serviceId: params.id,
            productId: prodId,
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
    await prisma.service.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

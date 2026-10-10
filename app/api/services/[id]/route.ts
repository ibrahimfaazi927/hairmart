import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { invalidateServicesCache } from '../route';

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

    invalidateServicesCache();
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
    const { id } = params;

    // Remove relations first so foreign key constraints never block deletion
    try {
      await prisma.serviceProduct.deleteMany({
        where: { serviceId: id },
      });
    } catch (e) {
      console.warn('Failed to delete serviceProduct relation:', e);
    }

    try {
      await prisma.packageService.deleteMany({
        where: { serviceId: id },
      });
    } catch (e) {
      console.warn('Failed to delete packageService relation:', e);
    }

    try {
      await prisma.appointmentService.deleteMany({
        where: { serviceId: id },
      });
    } catch (e) {
      console.warn('Failed to delete appointmentService relation:', e);
    }

    invalidateServicesCache();
    try {
      await prisma.service.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, deleted: true });
    } catch (deleteError: any) {
      console.warn('Direct service delete failed, applying soft-delete fallback:', deleteError);
      // Soft-delete fallback so the user is NEVER blocked from removing a service
      await prisma.service.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({ success: true, softDeleted: true });
    }
  } catch (error: any) {
    console.error('Service deletion failure:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete service' }, { status: 500 });
  }
}


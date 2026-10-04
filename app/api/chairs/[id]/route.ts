import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, section, active, sortOrder, staffId } = body;

    const existingChair = await prisma.chair.findUnique({
      where: { id },
      include: { assignedStaff: true },
    });

    if (!existingChair) {
      return NextResponse.json({ error: 'Chair not found' }, { status: 404 });
    }

    // 1. Handle staff assignment changes if specified
    if (staffId !== undefined) {
      if (staffId === null || staffId === '') {
        // Unassign current staff
        await prisma.staff.updateMany({
          where: { chairId: id },
          data: { chairId: null },
        });
      } else {
        // Disconnect any staff currently on this chair
        await prisma.staff.updateMany({
          where: { chairId: id },
          data: { chairId: null },
        });

        // Assign the new staff member
        await prisma.staff.update({
          where: { id: staffId },
          data: {
            chairId: id,
            section: section ? section.toLowerCase() : existingChair.section,
          },
        });
      }
    }

    // 2. Update chair properties
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (section !== undefined) updateData.section = section.toLowerCase().trim();
    if (active !== undefined) updateData.active = Boolean(active);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

    const updatedChair = await prisma.chair.update({
      where: { id },
      data: updateData,
      include: {
        assignedStaff: true,
      },
    });

    return NextResponse.json(updatedChair);
  } catch (error: any) {
    console.error('Failed to update chair:', error);
    return NextResponse.json({ error: error.message || 'Failed to update chair' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if chair has existing appointments
    const appointmentCount = await prisma.appointment.count({
      where: { chairId: id },
    });

    if (appointmentCount > 0) {
      // Rather than deleting and risking foreign key or audit integrity, deactivate it
      const deactivated = await prisma.chair.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        message: 'Chair has historical bills associated; deactivated instead of deleting.',
        chair: deactivated,
      });
    }

    // Unlink staff before deleting
    await prisma.staff.updateMany({
      where: { chairId: id },
      data: { chairId: null },
    });

    await prisma.chair.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Chair deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete chair:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete chair' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await prisma.staff.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Failed to update staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Disconnect foreign key references in AppointmentService so historical bills keep staffName
    await prisma.appointmentService.updateMany({
      where: { staffId: id },
      data: { staffId: null },
    });

    // Delete staff member from database
    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete staff' }, { status: 500 });
  }
}

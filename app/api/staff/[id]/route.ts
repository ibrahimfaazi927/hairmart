import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        chair: true,
        attendances: {
          orderBy: { date: 'desc' },
          take: 60,
        },
        leaves: {
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error: any) {
    console.error('Failed to get staff member:', error);
    return NextResponse.json({ error: error.message || 'Failed to get staff member' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      role,
      phone,
      gender,
      section,
      chairId,
      joiningDate,
      status,
      notes,
      avatar,
      specialties,
    } = body;

    const existingStaff = await prisma.staff.findUnique({
      where: { id },
    });

    if (!existingStaff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Handle chair reassignment
    if (chairId !== undefined) {
      if (chairId === null || chairId === '') {
        // Unassign chair
      } else if (chairId !== existingStaff.chairId) {
        // Disconnect other staff on target chair
        await prisma.staff.updateMany({
          where: { chairId },
          data: { chairId: null },
        });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (role !== undefined) updateData.role = role.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (gender !== undefined) updateData.gender = gender;
    if (section !== undefined) updateData.section = section ? section.toLowerCase() : null;
    if (chairId !== undefined) updateData.chairId = chairId || null;
    if (joiningDate !== undefined) updateData.joiningDate = new Date(joiningDate);
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (specialties !== undefined) updateData.specialties = specialties;

    const updated = await prisma.staff.update({
      where: { id },
      data: updateData,
      include: {
        chair: true,
      },
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

    // Check historical records
    const [attendanceCount, apptServiceCount] = await Promise.all([
      prisma.staffAttendance.count({ where: { staffId: id } }),
      prisma.appointmentService.count({ where: { staffId: id } }),
    ]);

    const hasHistoricalRecords = attendanceCount > 0 || apptServiceCount > 0;

    if (hasHistoricalRecords) {
      const deactivated = await prisma.staff.update({
        where: { id },
        data: {
          status: 'inactive',
          chairId: null, // Release chair so another staff can use it
        },
      });

      return NextResponse.json({
        success: true,
        deactivated: true,
        message: 'Staff member has historical attendance records; deactivated and unassigned from chair.',
        staff: deactivated,
      });
    }

    await prisma.staff.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error: any) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete staff' }, { status: 500 });
  }
}

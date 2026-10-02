import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword, newEmail, newName } = body;

    // Find the primary admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    // If user wants to set a new password, require current password
    if (newPassword && newPassword.trim() && !currentPassword) {
      return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
    }

    // Verify current password if provided
    if (currentPassword) {
      const isValid = await bcrypt.compare(currentPassword, adminUser.password);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (newName && newName.trim()) {
      updateData.name = newName.trim();
    }
    if (newEmail && newEmail.trim()) {
      updateData.email = newEmail.trim();
    }
    if (newPassword && newPassword.trim().length >= 6) {
      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id: adminUser.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error: any) {
    console.error('Update credentials error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update credentials' }, { status: 500 });
  }
}

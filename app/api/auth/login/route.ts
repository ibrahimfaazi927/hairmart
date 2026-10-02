import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const loginId = (body.loginId || body.email || body.id || '').trim();
    const password = body.password || '';

    if (!loginId || !password) {
      return NextResponse.json({ error: 'Admin ID / Email and password are required' }, { status: 400 });
    }

    // Try finding by email/ID/username
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { email: loginId.toLowerCase() },
          { name: loginId },
          { id: loginId },
        ],
      },
    });

    // If "Sameer" or "admin" was entered, also fallback to checking primary admin account
    if (!user && (loginId.toLowerCase() === 'sameer' || loginId.toLowerCase() === 'admin' || loginId.toLowerCase() === 'manager')) {
      user = await prisma.user.findFirst({
        where: { role: 'admin' },
      });
    }

    // If still no user exists at all in the database (e.g. empty dev database), create default admin
    if (!user) {
      const allUsersCount = await prisma.user.count();
      if (allUsersCount === 0) {
        const hashedPassword = await bcrypt.hash('Sameer@123', 10);
        user = await prisma.user.create({
          data: {
            name: 'Sameer',
            email: 'Sameer',
            password: hashedPassword,
            role: 'admin',
            active: true,
          },
        });
      }
    }

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid Admin ID or Password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Admin ID or Password' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set auth cookie
    response.cookies.set('hairmart_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

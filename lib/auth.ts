import prisma from './prisma';
import bcrypt from 'bcryptjs';

/**
 * Returns the base URL for the application.
 * Priority:
 * 1. NEXTAUTH_URL (custom domain or explicit config)
 * 2. NEXT_PUBLIC_APP_URL
 * 3. VERCEL_URL (automatically provided by Vercel deployment)
 * 4. Localhost fallback (http://localhost:3000)
 */
export function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

/**
 * Returns the auth secret used for authentication session security
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    console.warn('CRITICAL WARNING: NEXTAUTH_SECRET is not set in production environment variables.');
  }
  return secret || 'dev-hairmart-secret-replace-in-production';
}

export async function verifyUser(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.active) return null;

  const isValid = await bcrypt.compare(passwordPlain, user.password);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
}


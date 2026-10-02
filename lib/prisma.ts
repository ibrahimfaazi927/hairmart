import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure dev server refreshes client if new models were pushed
if (globalForPrisma.prisma && !(globalForPrisma.prisma as any).staff) {
  globalForPrisma.prisma = new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;

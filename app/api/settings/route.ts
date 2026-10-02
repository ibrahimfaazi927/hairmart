import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.salonSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    return NextResponse.json(settingsMap);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json(); // key-value object
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        await prisma.salonSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        });
      }
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
